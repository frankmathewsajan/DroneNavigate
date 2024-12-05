// Center map at VIT AP Campus
const vitApLat = 16.4819, vitApLng = 80.5083;
const map = L.map('map').setView([vitApLat, vitApLng], 16); // Zoom level 16 for campus view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Store clicked points as coordinates
let coordinates = [];
const markers = [];
const tableBody = document.querySelector("#points-table tbody");

// Add marker on map click
map.on('click', function (e) {
    const latlng = [e.latlng.lat, e.latlng.lng];
    const marker = L.marker(e.latlng).addTo(map);
    markers.push(marker);
    coordinates.push(latlng);

    // Update textarea and table
    updateCoordinatesInput();
    updateTable();

    // Enable marker removal on click
    marker.on('click', function () {
        removeMarker(latlng, marker);
    });
});

// Remove a specific marker
function removeMarker(latlng, marker) {
    const index = coordinates.findIndex(coord => coord[0] === latlng[0] && coord[1] === latlng[1]);
    if (index > -1) {
        coordinates.splice(index, 1);
        map.removeLayer(marker);
    }
    updateCoordinatesInput();
    updateTable();
}

// Clear all markers
document.getElementById('clear-markers').addEventListener('click', () => {
    markers.forEach(marker => map.removeLayer(marker));
    coordinates = [];
    updateCoordinatesInput();
    updateTable();
});

// Update hidden textarea with JSON coordinates
function updateCoordinatesInput() {
    document.getElementById('coordinates').value = JSON.stringify(coordinates);
}

// Update the table with the current coordinates
function updateTable() {
    tableBody.innerHTML = "";
    coordinates.forEach((coord, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${index + 1}</td>
                <td>${coord[0].toFixed(6)}</td>
                <td>${coord[1].toFixed(6)}</td>
                <td><button onclick="deletePoint(${index})">Delete</button></td>
            `;
        tableBody.appendChild(row);
    });
}

// Delete a specific point from the table
window.deletePoint = function (index) {
    const marker = markers[index];
    const coord = coordinates[index];
    if (marker) map.removeLayer(marker);
    if (coord) coordinates.splice(index, 1);
    markers.splice(index, 1);

    updateCoordinatesInput();
    updateTable();
};

// Handle form submission
document.getElementById('coordinates-form').onsubmit = function (event) {
    event.preventDefault();
    fetch('', {
        method: 'POST',
        headers: {'X-CSRFToken': '{{ csrf_token }}'},
        body: new FormData(this),
    })
        .then(response => response.json())
        .then(data => {
            var mstLayer = L.layerGroup().addTo(map);
            var droneLayer = L.layerGroup().addTo(map);

            data.mst.forEach(edge => {
                L.polyline(edge, {color: 'blue'}).addTo(mstLayer);
            });

            data.mst.forEach(edge => {
                const [p1, p2] = edge;
                const offsetEdge = calculateOffset(p1, p2, 2); // 2 meters offset
                L.polyline(offsetEdge, {color: 'green', dashArray: '5, 10'}).addTo(droneLayer);
            });
        });
};