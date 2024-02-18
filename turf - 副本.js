map.on('load', function () {
    fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
        .then(response => response.json())
        .then(data => {
            const flattened = turf.flatten(data);
            const dissolved = turf.dissolve(flattened);
            // 添加各个多边形的图层并描绘绿色的边界
            data.features.forEach((feature, index) => {
                map.addSource(`polygon-${index}`, {
                    'type': 'geojson',
                    'data': feature.geometry
                });

                map.addLayer({
                    'id': `polygon-layer-${index}`,
                    'type': 'line',
                    'source': `polygon-${index}`,
                    'paint': {
                        'line-color': 'green', // 多边形边界颜色
                        'line-width': 2 // 多边形边界宽度
                    }
                });
            });
            // 添加合并后的多边形到地图
            map.addSource('dissolved-polygon', {
                'type': 'geojson',
                'data': dissolved
            });
            map.addLayer({
                'id': 'dissolved-polygon-layer',
                'type': 'fill',
                'source': 'dissolved-polygon',
                'paint': {
                    'fill-color': 'rgba(255, 255, 255, 0.5)',
                    'fill-outline-color': 'white'
                }
            });

            // 在一个较大的区域内生成大量的随机点
            const bbox = turf.bbox(dissolved);
            const largeRandomPoints = turf.randomPoint(1000, { bbox: bbox });

            // 筛选出位于合并后多边形内的点
            const pointsWithin = turf.pointsWithinPolygon(largeRandomPoints, dissolved);

            // 添加筛选后的随机点到地图上
            map.addSource('random-points', {
                'type': 'geojson',
                'data': pointsWithin
            });
            map.addLayer({
                'id': 'random-points-layer',
                'type': 'circle',
                'source': 'random-points',
                'paint': {
                    'circle-radius': 5,
                    'circle-color': 'red'
                }
            });
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });
});