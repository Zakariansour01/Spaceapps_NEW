
        // Initialize the map
        let map = L.map('worldMap').setView([20, 0], 2);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        // Custom icon for impact marker
        let impactIcon = L.divIcon({
            className: 'impact-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Initialize marker at center
        let impactMarker = L.marker([20, 0], {
            icon: impactIcon,
            draggable: true
        }).addTo(map);

        // Function to update coordinates display
        function updateCoordinates(lat, lng) {
            document.getElementById('coordinates').textContent = 
                `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`;
            
            // Reverse geocoding to get location name (simplified)
            document.getElementById('location').textContent = 
                `Selected location: ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        }

        // Initial coordinate display
        updateCoordinates(20, 0);

        // Handle map clicks
        map.on('click', function(e) {
            let lat = e.latlng.lat;
            let lng = e.latlng.lng;
            
            // Move marker to clicked position
            impactMarker.setLatLng([lat, lng]);
            updateCoordinates(lat, lng);
            
            // Add a small impact effect
            let circle = L.circle([lat, lng], {
                color: '#e74c3c',
                fillColor: '#e74c3c',
                fillOpacity: 0.3,
                radius: 100000
            }).addTo(map);
            
            // Remove the circle after animation
            setTimeout(() => {
                map.removeLayer(circle);
            }, 1000);
        });

        // Handle marker drag
        impactMarker.on('dragend', function(e) {
            let lat = e.target.getLatLng().lat;
            let lng = e.target.getLatLng().lng;
            updateCoordinates(lat, lng);
        });

        // Reset function
        function resetMarker() {
            impactMarker.setLatLng([20, 0]);
            map.setView([20, 0], 2);
            updateCoordinates(20, 0);
        }

        // Add some styling to the map controls
        document.querySelector('.leaflet-control-zoom').style.border = '2px solid #3498db';
        document.querySelector('.leaflet-control-zoom').style.borderRadius = '10px';
