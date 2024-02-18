mapboxgl.accessToken = 'pk.eyJ1IjoicG9ueWJveSIsImEiOiJjajVremgyNTYydnA0MnFyeXJmczk2MDRnIn0.XFHQyRIcVOqyd5R7k88Pfw'; // use your own access token
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ponyboy/clj0gk00l00u301p7cx0abm95', // use your own style URL
    center: [104.195397, 35.86166], // China geolocation
    zoom: 2.5
});

map.on('load', function () {
    // 在这里添加缩放控件到地图上
    map.addControl(new mapboxgl.NavigationControl());
});

map.on('load', function () {
    // 步骤1: 读取CSV文件以确定点的数量并获取C列的文本
    fetch('https://mercurydrinker.github.io/yaogun/nanjing_artists.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.trim().split('\n');
            const numberOfPoints = Math.max(0, rows.length - 1); // X = 行数 - 1
            // 提取C列的文本
            const labels = rows.slice(1).map(row => {
                const columns = row.split(',');
                return columns[2]; // 假设C列是每行的第三列
            });

            // 步骤2: 加载GeoJSON数据，合并多边形，和之前步骤相同
            return fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
                .then(response => response.json())
                .then(data => {
                    const flattened = turf.flatten(data);
                    const dissolved = turf.dissolve(flattened);

                    // 省略添加多边形图层的代码以节省空间
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
                    // 步骤3 & 4: 在合并后的多边形内生成随机点，并选择X个点
                    const bbox = turf.bbox(dissolved);
                    const largeRandomPoints = turf.randomPoint(1000, {bbox: bbox});
                    const pointsWithin = turf.pointsWithinPolygon(largeRandomPoints, dissolved);
                    const selectedPoints = turf.featureCollection(
                        pointsWithin.features.sort(() => 0.5 - Math.random()).slice(0, numberOfPoints)
                    );

                    // 将随机选中的点添加到地图上
                    map.addSource('random-selected-points', {
                        'type': 'geojson',
                        'data': selectedPoints
                    });
                    map.addLayer({
                        'id': 'random-selected-points-layer',
                        'type': 'circle',
                        'source': 'random-selected-points',
                        'paint': {
                            'circle-radius': 5,
                            'circle-color': 'red'
                        }
                    });

                    // 步骤5: 在选中的点上添加文本标记
                    selectedPoints.features.forEach((feature, index) => {
                        const coordinates = feature.geometry.coordinates;
                        const label = labels[index % labels.length]; // 循环使用标签

                        // 创建一个自定义标记的图层
                        map.addLayer({
                            'id': `point-label-${index}`,
                            'type': 'symbol',
                            'source': {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {
                                        'description': label
                                    },
                                    'geometry': {
                                        'type': 'Point',
                                        'coordinates': coordinates
                                    }
                                }
                            },
                            'layout': {
                                'text-field': ['get', 'description'],
                                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                                'text-radial-offset': 0.5,
                                'text-justify': 'auto',
                                'text-size': 12
                            }
                        });
                    });
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
