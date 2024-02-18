mapboxgl.accessToken = 'pk.eyJ1IjoicG9ueWJveSIsImEiOiJjajVremgyNTYydnA0MnFyeXJmczk2MDRnIn0.XFHQyRIcVOqyd5R7k88Pfw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ponyboy/clj0gk00l00u301p7cx0abm95', // use your own style URL
    center: [104.195397, 35.86166], // China geolocation
    zoom: 2.5
});

map.on('load', function () {
    map.addControl(new mapboxgl.NavigationControl());

    fetch('https://mercurydrinker.github.io/yaogun/nanjing_artists.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.trim().split('\n');
            const labels = rows.slice(1).map(row => row.split(',')[2]);

            fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
                .then(response => response.json())
                .then(data => {
                    const dissolved = turf.dissolve(turf.flatten(data));

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
                    const bbox = turf.bbox(dissolved);
                    const pointsWithin = turf.pointsWithinPolygon(turf.randomPoint(1000, {bbox: bbox}), dissolved);
                    const selectedPoints = turf.featureCollection(pointsWithin.features.slice(0, labels.length));

                    map.addSource('random-selected-points', {
                        'type': 'geojson',
                        'data': selectedPoints,
                        'cluster': true,
                        'clusterMaxZoom': 14,
                        'clusterRadius': 50
                    });

                    map.addLayer({
                        id: 'clusters',
                        type: 'circle',
                        source: 'random-selected-points',
                        filter: ['has', 'point_count'],
                        paint: {
                            'circle-color': [
                                'step',
                                ['get', 'point_count'],
                                '#51bbd6',
                                100,
                                '#f1f075',
                                750,
                                '#f28cb1'
                            ],
                            'circle-radius': [
                                'step',
                                ['get', 'point_count'],
                                20,
                                100,
                                30,
                                750,
                                40
                            ]
                        }
                    });

                    map.addLayer({
                        id: 'cluster-count',
                        type: 'symbol',
                        source: 'random-selected-points',
                        filter: ['has', 'point_count'],
                        layout: {
                            'text-field': '{point_count_abbreviated}',
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12
                        }
                    });

                    map.addLayer({
                        id: 'unclustered-point',
                        type: 'circle',
                        source: 'random-selected-points',
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-color': '#11b4da',
                            'circle-radius': 4,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff'
                        }
                    });

                    // Add text labels for unclustered points
                    selectedPoints.features.forEach((feature, index) => {
                        const coordinates = feature.geometry.coordinates;
                        const label = labels[index % labels.length];
                        // Note: To add text labels to the map, you might need to create a custom solution
                        // as Mapbox GL JS does not directly support adding text labels to each point in a cluster layer.
                    });
                    // 继续上述代码，在添加未聚类点图层后添加以下代码

                    // 添加未聚类点的文字描述图层
                    map.addLayer({
                        id: 'unclustered-point-label',
                        type: 'symbol',
                        source: 'csvData',
                        filter: ['!', ['has', 'point_count']],
                        layout: {
                            'text-field': ['get', 'description'], // 使用描述属性
                            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                            'text-radial-offset': 0.5,
                            'text-justify': 'auto',
                            'text-size': 12
                        },
                        paint: {
                            "text-color": "#000000" // 可以调整为所需的颜色
                        }
                    });

                });
        });
});
