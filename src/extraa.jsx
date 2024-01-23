// import React, { useState, useEffect } from 'react';

// const MapContainer = () => {
//   const [map, setMap] = useState(null);
//   const [directionsService, setDirectionsService] = useState(null);
//   const [directionsRenderer, setDirectionsRenderer] = useState(null);
//   const [startZip, setStartZip] = useState('');
//   const [endZip, setEndZip] = useState('');

//   const initializeMap = () => {
//     const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
//       center: { lat: 0, lng: 0 },
//       zoom: 10,
//     });

//     const directionsServiceInstance = new window.google.maps.DirectionsService();
//     const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
//       map: mapInstance,
//     });

//     setMap(mapInstance);
//     setDirectionsService(directionsServiceInstance);
//     setDirectionsRenderer(directionsRendererInstance);
//   };

//   useEffect(() => {
//     if (window.google) {
//       initializeMap();
//     } else {
//       // Handle case where the Google Maps JavaScript API fails to load
//     }
//   }, []);

//   const findRoute = () => {
//     if (!startZip || !endZip) {
//       alert('Please enter both start and end zip codes.');
//       return;
//     }

//     const geocoder = new window.google.maps.Geocoder();
//     const startCoordinates = geocodeZip(startZip);
//     const endCoordinates = geocodeZip(endZip);

//     Promise.all([startCoordinates, endCoordinates])
//       .then(([start, end]) => {
//         const request = {
//           origin: start,
//           destination: end,
//           travelMode: 'DRIVING',
//         };

//         directionsService.route(request, (result, status) => {
//           if (status === 'OK') {
//             directionsRenderer.setDirections(result);
//           } else {
//             console.error('Error in findRoute:', status);
//             alert('Error finding route. Please try again.');
//           }
//         });
//       })
//       .catch((error) => {
//         console.error('Error in geocoding:', error);
//         alert('Error finding coordinates. Please try again.');
//       });
//   };

//   const geocodeZip = (zip) => {
//     return new Promise((resolve, reject) => {
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ address: zip }, (results, status) => {
//         if (status === 'OK') {
//           resolve(results[0].geometry.location);
//         } else {
//           reject(new Error(`Geocoding failed with status: ${status}`));
//         }
//       });
//     });
//   };

//   return (
//     <div style={{ height: '100vh', width: '100%' }}>
//       <div id="map" style={{ height: '60vh', marginBottom: '20px' }} />
//       <label htmlFor="startZip">Start Zip Code:</label>
//       <input type="text" id="startZip" value={startZip} onChange={(e) => setStartZip(e.target.value)} />

//       <label htmlFor="endZip">End Zip Code:</label>
//       <input type="text" id="endZip" value={endZip} onChange={(e) => setEndZip(e.target.value)} />

//       <button style={{}}onClick={findRoute}>Find Route</button>
//     </div>
//   );
// };

// export default MapContainer;
import React, { useState, useEffect } from 'react';

const MapContainer = () => {
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [startZip, setStartZip] = useState('');
  const [endZip, setEndZip] = useState('');
  const [thirdZip, setThirdZip] = useState('');

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
  };

  useEffect(() => {
    if (window.google) {
      initializeMap();
    } else {
      // Handle case where the Google Maps JavaScript API fails to load
    }
  }, []);

  const findRoute = () => {
    if (!startZip || !endZip || !thirdZip) {
      alert('Please enter all three zip codes.');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const startCoordinates = geocodeZip(startZip);
    const endCoordinates = geocodeZip(endZip);
    const thirdCoordinates = geocodeZip(thirdZip);

    Promise.all([startCoordinates, endCoordinates, thirdCoordinates])
      .then(([start, end, third]) => {
        const request = {
          origin: start,
          destination: end,
          waypoints: [{ location: third, stopover: true }],
          travelMode: 'DRIVING',
        };

        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
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

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div id="map" style={{ height: '60vh', marginBottom: '20px' }} />
      <label htmlFor="startZip">Start Zip Code:</label>
      <input type="text" id="startZip" value={startZip} onChange={(e) => setStartZip(e.target.value)} />

      <label htmlFor="endZip">End Zip Code:</label>
      <input type="text" id="endZip" value={endZip} onChange={(e) => setEndZip(e.target.value)} />

      <label htmlFor="thirdZip">Third Zip Code:</label>
      <input type="text" id="thirdZip" value={thirdZip} onChange={(e) => setThirdZip(e.target.value)} />

      <button onClick={findRoute}>Find Route</button>
    </div>
  );
};

export default MapContainer;