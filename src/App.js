import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

function MapComponent() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Configure Leaflet's default marker icon paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: marker2x,
      iconUrl: marker,
      shadowUrl: shadow,
    });

    // Initialize the map only once when the component mounts
    if (!mapRef.current) {
      mapRef.current = L.map('mapid').setView([0, 0], 2); // Start with a world view

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setError(null);

        // Update the map view and add/update the marker
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15); // Zoom in to the location

          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
          }
        }
      },
      (err) => {
        setError(err);
        if (err.code === 1) {
          alert('Please allow geolocation access to see your location on the map.');
        } else {
          alert('Failed to get current location: ' + err.message);
          console.error("Geolocation error:", err);
        }
      },
      {
        enableHighAccuracy: true, // Request more accurate location (may drain battery)
        timeout: 10000,          // Maximum time to wait for location (milliseconds)
        maximumAge: 0             // Don't use cached location
      }
    );

    // Clean up the watchPosition on component unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div>
      <div id="mapid" style={{ height: '500px', width: '100%' }}></div>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}

export default MapComponent;