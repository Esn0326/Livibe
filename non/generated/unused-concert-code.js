// 已於 2026-08-21 從 assets/js/pages/concert.js 移出。
// 這些函式沒有任何呼叫點，僅留作歷史參考，不參與正式網站載入。

function mapEmbedUrl(venue) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`;
}

function bindViewControls() {
    const descriptions = {
        front: ['A 區 近舞台', '距離表演者最近，適合想感受舞台能量與細節的觀眾。'],
        middle: ['B 區 主視角', '舞台、燈光與大螢幕比例最均衡，是多數演唱會的安全選擇。'],
        upper: ['C 區 全景視角', '可完整看見舞台設計與全場燈海，適合重視整體氛圍的觀眾。']
    };

    document.querySelectorAll('.seat-zone').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.seat-zone').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            const [title, copy] = descriptions[button.dataset.zone];
            qs('#view-title').textContent = title;
            qs('#view-description').textContent = copy;
        });
    });
}
