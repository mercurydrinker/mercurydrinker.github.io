map.on('load', function () {
    // 使用 Fetch API 加载 GeoJSON 数据
    fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
        .then(response => response.json())
        .then(data => {
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

            // 获取所有多边形的几何数据
            const allPolygons = data.features.map(feature => feature.geometry);

            // 合并所有多边形
            const mergedPolygon = turf.union(...allPolygons);

            // 添加 GeoJSON 数据到地图
            map.addSource('merged-polygon', {
                'type': 'geojson',
                'data': mergedPolygon
            });

            // 添加合并后的多边形图层并填充颜色
            map.addLayer({
                'id': 'merged-polygon-layer',
                'type': 'fill',
                'source': 'mergedPolygon',
                'paint': {
                    'fill-color': 'rgba(255, 255, 255, 0.5)', // 半透明白色填充
                    'fill-outline-color': 'white' // 边界颜色
                }
            });

            // 生成随机点
            var numberOfPoints = 100; // 替换为您想要生成的随机点数量
            var randomPoints = turf.randomPointWithin(numberOfPoints, mergedPolygon);

            // 添加随机点图层
            map.addSource('random-points', {
                'type': 'geojson',
                'data': randomPoints
            });

            map.addLayer({
                'id': 'random-points-layer',
                'type': 'circle',
                'source': 'random-points',
                'paint': {
                    'circle-radius': 5,
                    'circle-color': 'red' // 随机点颜色
                }
            });
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });
});
