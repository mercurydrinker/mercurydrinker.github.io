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

            // 使用 turf.flatten 确保所有的 MultiPolygon 被转换为 Polygon
            const flattened = turf.flatten(data);

            // 现在所有的要素都应该是 Polygon 类型，可以进行 dissolve 操作
            // 注意：这个示例假设你不需要根据特定属性来合并多边形
            // 如果需要，turf.dissolve 第二个参数可以是一个选项对象，指定根据哪个属性进行合并
            const dissolved = turf.dissolve(flattened);

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
                    'fill-color': 'rgba(255, 255, 255, 0.5)', // 半透明白色填充
                    'fill-outline-color': 'white' // 边界颜色
                }
            });


            // 在合并后的多边形内部生成一百个随机点
            const randomPoints = turf.randomPoint(100, { within: dissolved });
            
            // 添加随机点到地图上
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
                    'circle-color': 'red'
                }
            });
        })
        .catch(error => {
            console.error('Error fetching GeoJSON:', error);
        });

});