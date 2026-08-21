from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


FILL_COLORS = np.array(
    [
        (220, 100, 162),  # floor / special
        (142, 142, 142),  # stage / FOH
        (178, 125, 181),  # level 3 light purple
        (69, 130, 174),   # blue
        (141, 58, 146),   # level 3 dark purple
        (210, 99, 105),   # red
        (185, 82, 155),   # level 3 outer band
        (125, 100, 103),  # boxes
        (35, 177, 177),   # teal
        (240, 170, 0),    # single-side level 2 / 3 yellow
        (196, 144, 4),    # single-side 800 band
        (59, 177, 83),    # single-side floor
        (140, 34, 219),   # single-side purple
        (234, 62, 49),    # single-side red
        (196, 194, 198),  # single-side stage
        (137, 133, 141),  # single-side FOH
    ],
    dtype=np.int16,
)


def rdp(points: list[tuple[float, float]], epsilon: float) -> list[tuple[float, float]]:
    if len(points) < 3:
        return points
    start = np.array(points[0], dtype=float)
    end = np.array(points[-1], dtype=float)
    line = end - start
    length = np.linalg.norm(line)
    if length == 0:
        distances = [np.linalg.norm(np.array(point) - start) for point in points]
    else:
        distances = [
            abs(np.cross(line, np.array(point, dtype=float) - start)) / length
            for point in points
        ]
    index = int(np.argmax(distances))
    maximum = distances[index]
    if maximum > epsilon:
        left = rdp(points[: index + 1], epsilon)
        right = rdp(points[index:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


def polygon_area(points: list[tuple[int, int]]) -> float:
    return abs(
        sum(
            points[index][0] * points[(index + 1) % len(points)][1]
            - points[(index + 1) % len(points)][0] * points[index][1]
            for index in range(len(points))
        )
        / 2
    )


def component_pixels(mask: np.ndarray) -> list[list[tuple[int, int]]]:
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            pixels: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                pixels.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((nx, ny))
            components.append(pixels)
    return components


def fill_enclosed_holes(mask: np.ndarray) -> np.ndarray:
    """Fill white islands enclosed by a colored component (mostly source labels)."""
    height, width = mask.shape
    exterior = np.zeros_like(mask, dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            if not mask[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if not mask[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if (
                0 <= nx < width
                and 0 <= ny < height
                and not mask[ny, nx]
                and not exterior[ny, nx]
            ):
                exterior[ny, nx] = True
                queue.append((nx, ny))
    return mask | (~mask & ~exterior)


def outer_loop(pixels: list[tuple[int, int]]) -> list[tuple[int, int]]:
    pixel_set = set(pixels)
    outgoing: dict[tuple[int, int], list[tuple[int, int]]] = defaultdict(list)
    for x, y in pixels:
        if (x, y - 1) not in pixel_set:
            outgoing[(x, y)].append((x + 1, y))
        if (x + 1, y) not in pixel_set:
            outgoing[(x + 1, y)].append((x + 1, y + 1))
        if (x, y + 1) not in pixel_set:
            outgoing[(x + 1, y + 1)].append((x, y + 1))
        if (x - 1, y) not in pixel_set:
            outgoing[(x, y + 1)].append((x, y))

    unused = {(start, end) for start, ends in outgoing.items() for end in ends}
    loops: list[list[tuple[int, int]]] = []
    while unused:
        start_edge = next(iter(unused))
        start, current = start_edge
        loop = [start, current]
        unused.remove(start_edge)
        while current != start:
            candidates = [end for end in outgoing.get(current, []) if (current, end) in unused]
            if not candidates:
                break
            previous = loop[-2]
            incoming = (current[0] - previous[0], current[1] - previous[1])
            directions = ((1, 0), (0, 1), (-1, 0), (0, -1))
            incoming_index = directions.index(incoming)

            def turn_priority(candidate: tuple[int, int]) -> int:
                direction = (candidate[0] - current[0], candidate[1] - current[1])
                candidate_index = directions.index(direction)
                turn = (candidate_index - incoming_index) % 4
                # Stay on the current envelope at ambiguous pixel corners.
                return {0: 0, 1: 1, 3: 2, 2: 3}[turn]

            end = min(candidates, key=turn_priority)
            unused.remove((current, end))
            current = end
            loop.append(current)
        if len(loop) > 3 and loop[-1] == loop[0]:
            loops.append(loop[:-1])
    return max(loops, key=polygon_area) if loops else []


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--output", type=Path, default=Path("non/trace-source/generated"))
    parser.add_argument("--target-height", type=int, default=1500)
    parser.add_argument(
        "--simplify",
        type=float,
        default=4.0,
        help="Maximum source-pixel deviation used to clean raster stair-steps.",
    )
    parser.add_argument("--global-name", default="taipeiArenaTrace")
    parser.add_argument("--palette-index", type=int)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    image = Image.open(args.image).convert("RGB")
    rgb = np.asarray(image, dtype=np.int32)
    palette = FILL_COLORS.astype(np.int32)
    distances = np.sqrt(((rgb[:, :, None, :] - palette[None, None, :, :]) ** 2).sum(axis=3))
    selected_distances = (
        distances[:, :, args.palette_index]
        if args.palette_index is not None
        else distances.min(axis=2)
    )
    mask = fill_enclosed_holes(selected_distances <= 18)

    bw = Image.fromarray(np.where(mask, 0, 255).astype(np.uint8), mode="L")
    bw.save(args.output / "seat-map-bw.png")

    source_width, source_height = image.size
    scale = args.target_height / source_height
    target_width = round(source_width * scale)
    records = []
    for pixels in component_pixels(mask):
        if len(pixels) < 120:
            continue
        contour = outer_loop(pixels)
        if len(contour) < 4:
            continue
        closed = contour + [contour[0]]
        simplified = rdp(closed, args.simplify)
        if simplified[-1] == simplified[0]:
            simplified = simplified[:-1]
        xs = [point[0] for point in pixels]
        ys = [point[1] for point in pixels]
        sampled = rgb[ys, xs]
        palette_index = int(np.argmin(np.linalg.norm(
            sampled[:, None, :] - palette[None, :, :], axis=2
        ).mean(axis=0)))
        records.append(
            {
                "area": len(pixels),
                "fill": "#{:02x}{:02x}{:02x}".format(*FILL_COLORS[palette_index]),
                "bbox": [min(xs), min(ys), max(xs) + 1, max(ys) + 1],
                "centroid": [round(sum(xs) / len(xs), 2), round(sum(ys) / len(ys), 2)],
                "points": [
                    [round(x * scale, 2), round(y * scale, 2)]
                    for x, y in simplified
                ],
            }
        )

    records.sort(key=lambda item: (item["bbox"][1], item["bbox"][0]))
    for index, record in enumerate(records, start=1):
        record["trace_id"] = index

    preview = image.copy()
    draw = ImageDraw.Draw(preview)
    for record in records:
        x1, y1, x2, y2 = record["bbox"]
        draw.rectangle((x1, y1, x2, y2), outline=(0, 0, 0), width=1)
        draw.text((record["centroid"][0], record["centroid"][1]), str(record["trace_id"]), fill=(0, 0, 0), stroke_width=2, stroke_fill=(255, 255, 255))
    preview.save(args.output / "seat-map-contours.png")

    payload = {
        "source": {"width": source_width, "height": source_height},
        "target": {"width": target_width, "height": args.target_height, "scale": scale},
        "components": records,
    }
    (args.output / "seat-map-contours.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    js_payload = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    (args.output / "seat-map-traced.js").write_text(
        f"window.{args.global_name}={js_payload};\n", encoding="utf-8"
    )
    print(json.dumps({"components": len(records), "target": payload["target"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
