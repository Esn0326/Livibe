import requests
import json
import re
import time
from bs4 import BeautifulSoup

# ================= 1. 配置區 =================
VENUE_MAP = {
    "臺北小巨蛋演唱會列表": "臺北小巨蛋",
    "臺北大巨蛋": "臺北大巨蛋",
    "國家體育場_(高雄市)": "高雄國家體育場",
    "高雄市現代化綜合體育館": "高雄巨蛋",
    "樂天桃園棒球場": "樂天桃園棒球場",
    "臺北流行音樂中心": "臺北流行音樂中心",
    "高雄流行音樂中心": "高雄流行音樂中心"
}

WIKI_API_URL = "https://zh.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "LIVIBE_Logger_Bot/7.0"}

# 語義對稱表
SEMANTIC_MAP = {
    "date": ["日期", "時間", "演出日期"],
    "title": ["主題", "名稱", "演唱會名稱", "演出名稱", "活動"],
    "artist": ["演出者", "藝人", "表演者", "歌手"],
    "org": ["主辦", "製作", "主辦單位", "協辦"]
}

def clean_val(text):
    if not text: return None
    t = re.sub(r'\[.*?\]', '', text).strip()
    return t if t not in ["", "-", "—", "N/A", "無", "？"] else None

def run_scraper_with_logs():
    all_events = []

    for wiki_title, venue_name in VENUE_MAP.items():
        print(f"\n🚀 [開始處理] 場館: {venue_name} ({wiki_title})")
        params = {"action": "parse", "page": wiki_title, "prop": "text", "format": "json", "redirects": 1}

        try:
            res = requests.get(WIKI_API_URL, params=params, headers=HEADERS, timeout=15).json()
            if 'parse' not in res:
                print(f"⚠️ [跳過] 無法取得 Wiki 頁面內容")
                continue

            soup = BeautifulSoup(res['parse']['text']['*'], 'lxml')
            active_year = "2026" # 預設年份
            context = {"artist": None, "org": None}

            content_div = soup.find('div', class_='mw-parser-output')
            elements = content_div.find_all(['h2', 'h3', 'table']) if content_div else []

            for elem in elements:
                # Log: 年份偵測
                if elem.name in ['h2', 'h3']:
                    y_match = re.search(r'(\d{4})年', elem.get_text())
                    if y_match:
                        active_year = y_match.group(1)
                        print(f"📅 [年份更新] 偵測到標題，目前年份切換至: {active_year}")
                    continue

                # 處理表格
                if elem.name == 'table' and 'wikitable' in elem.get('class', []):
                    rows = elem.find_all('tr')
                    if not rows: continue

                    # Log: 標頭解析
                    header_cells = [c.get_text(strip=True) for c in rows[0].find_all(['th', 'td'])]
                    idx = {k: -1 for k in SEMANTIC_MAP.keys()}
                    for i, h in enumerate(header_cells):
                        for key, kws in SEMANTIC_MAP.items():
                            if any(kw in h for kw in kws): idx[key] = i

                    print(f"📊 [表格掃描] 找到標頭: {header_cells} | 索引對位: {idx}")

                    for r_idx, row in enumerate(rows[1:]):
                        cells = row.find_all(['td', 'th'])

                        # 處理特殊行
                        if len(cells) == 1:
                            txt = cells[0].get_text(strip=True)
                            y_m = re.search(r'(\d{4})年', txt)
                            if y_m: active_year = y_m.group(1)
                            print(f"ℹ️  [列 {r_idx}] 偵測到分割行: {txt} -> 更新年份: {active_year}")
                            continue

                        # 核心解析邏輯
                        def fetch(key):
                            p = idx[key]
                            if p != -1 and p < len(cells):
                                val = clean_val(cells[p].get_text())
                                if val and key in ["artist", "org"]: context[key] = val
                                return val
                            # 合併儲存格回補
                            return context.get(key) if key in ["artist", "org"] else None

                        t_val = fetch("title")
                        d_val = fetch("date")
                        a_val = fetch("artist")
                        o_val = fetch("org")

                        if t_val or d_val:
                            # 日期標準化
                            final_date = d_val
                            if d_val and not re.search(r'\d{4}', d_val):
                                final_date = f"{active_year}年{d_val}"

                            # Log: 每一筆成功抓取的動作
                            print(f"✅ [成功] 演出: {t_val or 'null'} | 日期: {final_date or 'null'} | 藝人: {a_val or 'null'}")

                            all_events.append({
                                "演出名稱": t_val if t_val else None,
                                "演出日期": final_date if final_date else None,
                                "場地": venue_name,
                                "演出者": a_val if a_val else None,
                                "主辦單位": o_val if o_val else None
                            })
                        else:
                            print(f"❓ [略過] 列 {r_idx} 內容不完整或無關鍵資料")

            time.sleep(1) # 頻率控制
        except Exception as e:
            print(f"❌ [錯誤] 處理 {venue_name} 時發生崩潰: {e}")

    return all_events

if __name__ == "__main__":
    data = run_scraper_with_logs()
    with open('concerts_logged.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"\n🏁 [任務結束] 共取得 {len(data)} 筆資料，已儲存至 concerts_logged.json")