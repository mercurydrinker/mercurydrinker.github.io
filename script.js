mapboxgl.accessToken = 'pk.eyJ1IjoicG9ueWJveSIsImEiOiJjajVremgyNTYydnA0MnFyeXJmczk2MDRnIn0.XFHQyRIcVOqyd5R7k88Pfw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ponyboy/clj0gk00l00u301p7cx0abm95',
    center: [104.195397, 35.86166],
    zoom: 2.5
});

map.on('load', function () {
    map.addControl(new mapboxgl.NavigationControl());

    fetch('https://mercurydrinker.github.io/yaogun/nanjing_artists.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.trim().split('\n');
            const labels = rows.slice(1).map(row => row.split(',')[2]); // 获取C列作为标签

            fetch('https://mercurydrinker.github.io/GeoMapData_CN-master/citys/320100.json')
                .then(response => response.json())
                .then(data => {
                    const dissolved = turf.dissolve(turf.flatten(data));

                    const bbox = turf.bbox(dissolved);
                    const pointsWithin = turf.randomPoint(labels.length, {bbox: bbox});

                    pointsWithin.features.forEach((feature, index) => {
                        feature.properties.description = labels[index % labels.length];
                    });

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

                    map.addSource('random-selected-points', {
                        'type': 'geojson',
                        'data': pointsWithin,
                        'cluster': true,
                        'clusterMaxZoom': 14,
                        'clusterRadius': 50
                    });

                    // 添加聚类图层
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

                    // 添加聚类计数图层
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

                    // 添加未聚类点图层
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

                    // 添加未聚类点的文本标签图层
                    map.addLayer({
                        id: 'unclustered-point-label',
                        type: 'symbol',
                        source: 'random-selected-points',
                        filter: ['!', ['has', 'point_count']],
                        layout: {
                            'text-field': ['get', 'description'],
                            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                            'text-radial-offset': 0.5,
                            'text-justify': 'auto',
                            'text-size': 32
                        },
                        paint: {
                            'text-color': '#FFFFFF'
                        }
                    });
                });
        })
        .catch(error => console.error('Error:', error));

});
map.on('click', function(e) {
    // 用户点击地图后显示Popup
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML('<div class="sketchfab-embed-wrapper">' +
        '<iframe title="小胡2" frameborder="0" allowfullscreen mozallowfullscreen="true" ' +
        'webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" ' +
        'xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share ' +
        'src="https://sketchfab.com/models/5a966962bf3c4f258ba8e8fddffeb106/embed">' +
        '</iframe>' +
        '<p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;">' +
        '<a href="https://sketchfab.com/3d-models/2-5a966962bf3c4f258ba8e8fddffeb106?utm_medium=embed&utm_campaign=share-popup&utm_content=5a966962bf3c4f258ba8e8fddffeb106" target="_blank" ' +
        'rel="nofollow" style="font-weight: bold; color: #1CAAD9;">小胡2</a> by ' +
        '<a href="https://sketchfab.com/xiaofei.zhang2021?utm_medium=embed&utm_campaign=share-popup&utm_content=5a966962bf3c4f258ba8e8fddffeb106" target="_blank" ' +
        'rel="nofollow" style="font-weight: bold; color: #1CAAD9;">xiaofei.zhang2021</a> on ' +
        '<a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=5a966962bf3c4f258ba8e8fddffeb106" target="_blank" ' +
        'rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p>' +
                '</div>')
        .addTo(map);
});