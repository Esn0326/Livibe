import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin

def scrape_with_progress():
    start_urls = [
        "https://www.businessweekly.com.tw/style/blog/3018831",
        "https://www.businessweekly.com.tw/style/blog/3019879"
    ]

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }

    all_concerts = []
    urls_to_visit = start_urls.copy()
    visited_urls = set()

    # --- 階段 1：掃描子連結 ---
    print("--- 🚀 階段 1：正在獲取所有月份連結 ---")
    for url in start_urls:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            for a in soup.find_all('a', href=True):
                if ("月" in a.text or "演唱會" in a.text) and "businessweekly.com.tw" in a['href']:
                    full_url = urljoin(url, a['href'])
                    if full_url not in urls_to_visit:
                        urls_to_visit.append(full_url)
        except: pass

    total_pages = len(urls_to_visit)
    print(f"📊 掃描完成，共計 {total_pages} 個分頁待解析。\n")

    # --- 階段 2：深度萃取 ---
    print("--- 🔍 階段 2：開始萃取詳細資料 ---")
    for index, url in enumerate(urls_to_visit, 1):
        if url in visited_urls: continue
        visited_urls.add(url)

        # 計算進度百分比
        progress = (index / total_pages) * 100
        print(f"[{progress:6.2f}%] 正在處理 ({index}/{total_pages}): {url}")

        try:
            res = requests.get(url, headers=headers, timeout=10)
            res.encoding = 'utf-8'
            soup = BeautifulSoup(res.text, 'html.parser')
            content_tags = soup.find_all(['h1', 'h2', 'h3', 'p', 'li', 'img'])

            page_count = 0
            current_item = None
            found_poster = False

            for tag in content_tags:
                if tag.name == 'img' and current_item and not found_poster:
                    img_src = tag.get('src') or tag.get('data-src')
                    if img_src and "static" not in img_src:
                        current_item["海報連結"] = urljoin(url, img_src)
                        found_poster = True
                    continue

                text = tag.get_text(" ", strip=True).replace("：", ":")
                if not text: continue

                is_title = tag.name in ['h1', 'h2', 'h3'] or (tag.name == 'p' and tag.find('strong') and 3 < len(text) < 60)

                if is_title and not any(x in text for x in ["延伸閱讀", "目錄", "相關報導", "來源"]):
                    if current_item and (current_item["時間"] or current_item["地點"]):
                        all_concerts.append(current_item)
                        page_count += 1

                    current_item = {
                        "藝人_主題": text, "時間": "", "地點": "", "售票系統": "",
                        "售票時間": "", "售價": "", "海報連結": "", "來源": url
                    }
                    found_poster = False
                    continue

                if current_item and len(text) <= 50:
                    val = text.split(":")[-1].strip() if ":" in text else text
                    if "日期" in text or ("時間" in text and "售票時間" not in text):
                        current_item["時間"] = val
                    elif "地點" in text or "場地" in text:
                        current_item["地點"] = val
                    elif "平台" in text or "系統" in text or "購票" in text:
                        current_item["售票系統"] = val
                    elif "售票時間" in text or "開賣" in text:
                        current_item["售票時間"] = "已結束販售" if "2025" in text or "完售" in val else val
                    elif "票價" in text or "售價" in text:
                        current_item["售價"] = val

            if current_item and (current_item["時間"] or current_item["地點"]):
                all_concerts.append(current_item)
                page_count += 1

            if page_count > 0:
                print(f"   ✨ 此頁面新增 {page_count} 筆資料")

        except Exception as e:
            print(f"   ❌ 解析出錯: {e}")

        time.sleep(0.5)

    # 儲存與總結
    with open('all_concerts_full_list.json', 'w', encoding='utf-8') as f:
        json.dump(all_concerts, f, ensure_ascii=False, indent=4)

    print("\n" + "="*50)
    print(f"🎉 任務完成！")
    print(f"📂 存檔路徑: D:\\Project\\LIVIBE_Project\\all_concerts_full_list.json")
    print(f"📝 總共收集到: {len(all_concerts)} 筆演唱會資料")
    print("="*50)

if __name__ == "__main__":
    scrape_with_progress()