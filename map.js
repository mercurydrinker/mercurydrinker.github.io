map.on('load', function () {
    // 使用 Fetch API 加载 GeoJSON 数据
    fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
        .then(response => response.json())
        .then(data => {
            // 打印各个多边形的几何信息
            data.features.forEach(feature => {
                console.log(feature.geometry);
            });

            // 合并所有多边形
            var mergedPolygon = turf.union(...data.features.map(feature => feature.geometry));

            // 添加 GeoJSON 数据到地图
            map.addSource('merged-polygon', {
                'type': 'geojson',
                'data': mergedPolygon
            });

            // 添加合并后的多边形图层并填充颜色
            map.addLayer({
                'id': 'merged-polygon-layer',
                'type': 'fill',
                'source': 'merged-polygon',
                'paint': {
                    'fill-color': 'rgba(255, 255, 255, 0.5)', // 半透明白色填充
                    'fill-outline-color': 'white' // 边界颜色
                }
            });
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });
});
