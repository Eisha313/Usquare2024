


import React, { useState, useEffect } from 'react';

const MapContainer = () => {
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [startZip, setStartZip] = useState('');
  const [endZip, setEndZip] = useState('');
  const [clickedLocation, setClickedLocation] = useState(null);
  const [clickedMarker, setClickedMarker] = useState(null);

  const initializeMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 0, lng: 0 },
      zoom: 10,
    });

    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      polylineOptions: { strokeColor: '#000' }, // Set default stroke color
    });

    setMap(mapInstance);
    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);

    // Add a click event listener to the map
    // mapInstance.addListener('click', (event) => {
    //   setClickedLocation({
    //     lat: event.latLng.lat(),
    //     lng: event.latLng.lng(),
    //   });
    //   clearHighlightedRoute();
    //   calculateAndDisplayRoute();
    // });
    mapInstance.addListener('click', (event) => {
      setClickedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      clearHighlightedRoute();
      calculateAndDisplayRoute();
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
            highlightRoute(result.routes[0].overview_path, '#000');
            calculateAndDisplayRoute();
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

  // const calculateAndDisplayRoute = () => {
  //   if (clickedLocation) {
  //     const start = clickedLocation;
  //     const end = directionsRenderer.directions.routes[0].legs[0].end_location;

  //     const request = {
  //       origin: start,
  //       destination: end,
  //       travelMode: 'DRIVING',
  //     };

  //     directionsService.route(request, (result, status) => {
  //       if (status === 'OK') {
  //         highlightRoute(result.routes[0].overview_path, '#FF0000'); // Set different color for the new route
  //         displayClosenessInfo(result.routes[0].legs[0].distance.value);
  //       } else {
  //         console.error('Error in calculateAndDisplayRoute:', status);
  //         alert('Error calculating route. Please try again.');
  //       }
  //     });
  //   }
  // };


  const calculateAndDisplayRoute = () => {
    if (clickedLocation && directionsRenderer && directionsRenderer.directions) {
      const start = clickedLocation;
      const end = directionsRenderer.directions.routes[0].legs[0].end_location;
  
      const request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
      };
  
      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          // Clear previous third route calculation
          clearHighlightedRoute();
  
          // Highlight new route
          highlightRoute(result.routes[0].overview_path, '#FF0000');
          displayClosenessInfo(result.routes[0].legs[0].distance.value);
  
          // Mark the clicked location
          markClickedLocation(start);
        } else if (status === 'ZERO_RESULTS') {
          console.error('Error in calculateAndDisplayRoute:', status);
          alert('No route found. Please check your locations and try again.');
          // Clear previous third route calculation and marker
          clearHighlightedRoute();
          setClickedLocation(null);
        } else {
          console.error('Error in calculateAndDisplayRoute:', status);
          alert('Error calculating route. Please try again.');
        }
      });
    }
  };
  const markClickedLocation = (location) => {
    if (clickedMarker) {
      clickedMarker.setMap(null); // Remove previous clicked marker
    }

    const marker = new window.google.maps.Marker({
      position: location,
      map,
      title: 'Clicked Location',
      animation: window.google.maps.Animation.DROP,
    });

    setClickedMarker(marker);
  };







  const highlightRoute = (path, color) => {
    const highlightedRoute = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    highlightedRoute.setMap(map);
  };

  // const clearHighlightedRoute = () => {
  //   // Check if directionsRenderer is available
  //   if (directionsRenderer) {
  //     // Retrieve the current set of directions
  //     const directions = directionsRenderer.getDirections();
  
  //     // Check if directions exist and if polylines are present
  //     if (directions && directions.routes && directions.routes.length > 0) {
  //       // Remove the previously highlighted route
  //       const highlightedRoute = directions.routes[0].overview_path;
  //       if (highlightedRoute) {
  //         highlightedRoute.setMap(null);
  //       }
  //     }
  //   }
  // };

  const clearHighlightedRoute = () => {
    // Remove previous highlighted route
    const highlightedRoute = new window.google.maps.Polyline({
      path: [],
    });

    highlightedRoute.setMap(map);

    // Remove previous clicked marker
    if (clickedMarker) {
      clickedMarker.setMap(null);
    }
  };

  const displayClosenessInfo = (distance) => {
    const distanceInKm = distance / 1000;

    if (distanceInKm < 1) {
      alert(`The third location is very close to the route (${distanceInKm.toFixed(2)} km).`);
    } else {
      alert(`The third location is not very close to the route (${distanceInKm.toFixed(2)} km).`);
    }
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