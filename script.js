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
