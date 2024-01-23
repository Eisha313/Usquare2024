import React, { useState, useEffect } from 'react';

const MapContainer = () => {
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [startZip, setStartZip] = useState('');
  const [endZip, setEndZip] = useState('');
  const [clickedLocation, setClickedLocation] = useState(null);

  const initializeMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 0, lng: 0 },
      zoom: 10,
    });

    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
    });

    setMap(mapInstance);
    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);

    // Add a click event listener to the map
    mapInstance.addListener('click', (event) => {
      setClickedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });
  };

  useEffect(() => {
    if (window.google) {
      initializeMap();
    } else {
      // Handle case where the Google Maps JavaScript API fails to load
    }
  }, []);

  const findRoute = () => {
    if (!startZip || !endZip) {
      alert('Please enter both start and end zip codes.');
      return;
    }

    if (!clickedLocation) {
      alert('Please click on the map to select a third location.');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const startCoordinates = geocodeZip(startZip);
    const endCoordinates = geocodeZip(endZip);

    Promise.all([startCoordinates, endCoordinates])
      .then(([start, end]) => {
        const request = {
          origin: start,
          destination: end,
          travelMode: 'DRIVING',
        };

        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);

            // Check if the clicked location is close to the route
            const routeCoordinates = result.routes[0].overview_path;
            const isClose = checkIfCloseToRoute(clickedLocation, routeCoordinates);
            if (isClose) {
              alert('The third location is close to the route.');
            } else {
              alert('The third location is not close to the route.');
            }
          } else {
            console.error('Error in findRoute:', status);
            alert('Error finding route. Please try again.');
          }
        });
      })
      .catch((error) => {
        console.error('Error in geocoding:', error);
        alert('Error finding coordinates. Please try again.');
      });
  };

  const geocodeZip = (zip) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: zip }, (results, status) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error(`Geocoding failed with status: ${status}`));
        }
      });
    });
  };

  const checkIfCloseToRoute = (location, routeCoordinates) => {
    // Implement your logic to check if the location is close to the route
    // You can use distance calculation or other methods based on your requirements
    // For simplicity, let's consider it close if it is within a certain distance from any route point
    const distanceThreshold = 0.1; // Adjust this threshold as needed

    for (const routePoint of routeCoordinates) {
      const distance = getDistance(location, routePoint);
      if (distance < distanceThreshold) {
        return true;
      }
    }

    return false;
  };

  const getDistance = (point1, point2) => {
    const lat1 = point1.lat;
    const lng1 = point1.lng;
    const lat2 = point2.lat();
    const lng2 = point2.lng();

    // Implement your distance calculation logic here
    // This is a simple example using Haversine formula
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div id="map" style={{ height: '60vh', marginBottom: '20px' }} />
      <label htmlFor="startZip">Start Zip Code:</label>
      <input type="text" id="startZip" value={startZip} onChange={(e) => setStartZip(e.target.value)} />

      <label htmlFor="endZip">End Zip Code:</label>
      <input type="text" id="endZip" value={endZip} onChange={(e) => setEndZip(e.target.value)} />

      <button onClick={findRoute}>Find Route</button>
    </div>
  );
};

export default MapContainer;