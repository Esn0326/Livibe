(function () {
    const errorTarget = document.querySelector('#featured-diagram');
    try {
        const bundledData = window.LIVIBE_VENUE_DATA;
        if (!Array.isArray(bundledData?.venues) || !bundledData?.locations?.cities) {
            throw new Error('場館資料格式錯誤');
        }
        window.LIVIBE_IMPORTED_VENUES = bundledData.venues;
        window.LIVIBE_LOCATION_DATA = bundledData.locations;

        const pageScript = document.createElement('script');
        pageScript.src = 'assets/js/pages/venues.js?v=20260821-2';
        pageScript.defer = true;
        pageScript.onerror = () => { throw new Error('場館頁程式載入失敗'); };
        document.body.append(pageScript);
    } catch (error) {
        console.error(error);
        if (errorTarget) {
            errorTarget.setAttribute('viewBox', '0 0 1000 600');
            errorTarget.innerHTML = '<text class="map-error-label" x="500" y="300">場館資料載入失敗</text>';
        }
    }
}());
