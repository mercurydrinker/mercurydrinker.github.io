map.on('load', function () {
    // 使用 Fetch API 加载 GeoJSON 数据
    fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
        .then(response => response.json())
        .then(data => {
            // 添加 GeoJSON 数据到地图
            map.addSource('city-boundary', {
                'type': 'geojson',
                'data': data
            });

            // 添加边界图层
            map.addLayer({
                'id': 'city-boundary-layer',
                'type': 'line',
                'source': 'city-boundary',
                'paint': {
                    'line-color': 'white', // 边界线颜色
                    'line-width': 3 // 边界线宽度
                }
            });

            // 使用 Turf.js 在边界内生成随机点
            var boundary = turf.polygon(data.features[0].geometry.coordinates);
            var numberOfPoints = 100; // 替换为您想要生成的随机点数量
            var randomPoints = turf.randomPoint(numberOfPoints, { bbox: turf.bbox(boundary) });

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
                    'circle-radius': 50,
                    'circle-color': 'red' // 随机点颜色
                }
            });
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });
});