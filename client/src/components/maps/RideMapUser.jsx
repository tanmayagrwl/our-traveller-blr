'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoid2lzaGVlMCIsImEiOiJjbTg4ZWs3cjYwaXhvMmpxdTFlaTgwaTE1In0.a8V9qDw_Lh4ezGkWdg0Lhg'

const BangaloreMap = ({ 
  userLocation = { lat: 12.9716, lng: 77.5946 },
  driverLocation, 
  showRouteEstimate = false, 
  destination = '',
  bookingStep = 1,
  onDestinationSelect
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const userMarker = useRef(null)
  const driverMarker = useRef(null)
  const destinationMarker = useRef(null)
  const routeLine = useRef(null)
  
  const [mapLoaded, setMapLoaded] = useState(false)
  
  const bangalorePoints = [
    { name: 'MG Road', coordinates: [77.6097, 12.9751] },
    { name: 'Cubbon Park', coordinates: [77.5929, 12.9762] },
    { name: 'Koramangala', coordinates: [77.6245, 12.9352] },
    { name: 'Indiranagar', coordinates: [77.6408, 12.9784] },
    { name: 'Electronic City', coordinates: [77.6770, 12.8399] }
  ]
  
  useEffect(() => {
    if (map.current) return
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12
    })
    
    map.current.on('load', () => {
      setMapLoaded(true)
      
      // Create user marker
      const userEl = document.createElement('div')
      userEl.className = 'w-6 h-6 bg-blue-600 rounded-full border-2 border-white'
      
      userMarker.current = new mapboxgl.Marker({
        element: userEl,
        anchor: 'center'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current)
      
      // Add landmarks
      bangalorePoints.forEach(point => {
        const markerEl = document.createElement('div')
        markerEl.className = 'w-4 h-4 bg-amber-500 rounded-full border border-white flex items-center justify-center'
        markerEl.style.cursor = 'pointer'
        
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'center'
        })
        .setLngLat(point.coordinates)
        .addTo(map.current)
        
        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`<p class="text-xs font-medium">${point.name}</p>`)
        
        marker.setPopup(popup)
        
        // Click handler
        markerEl.addEventListener('click', () => {
          if (onDestinationSelect) onDestinationSelect(point.name)
        })
      })
    })
    
    return () => {
      map.current?.remove()
    }
  }, [])
  
  // Update driver marker when driver location changes
  useEffect(() => {
    if (!mapLoaded || !driverLocation || !map.current) return
    
    // Remove existing driver marker
    if (driverMarker.current) {
      driverMarker.current.remove()
    }
    
    // Create driver marker
    const driverEl = document.createElement('div')
    driverEl.className = 'w-6 h-6 bg-emerald-500 rounded-full border-2 border-white'
    
    driverMarker.current = new mapboxgl.Marker({
      element: driverEl,
      anchor: 'center'
    })
    .setLngLat([driverLocation.lng, driverLocation.lat])
    .addTo(map.current)
    
    // Update route between driver and user
    updateDrivingRoute([driverLocation.lng, driverLocation.lat], [userLocation.lng, userLocation.lat], 'driver-route')
  }, [driverLocation, mapLoaded])
  
  // Update destination when destination changes
  useEffect(() => {
    if (!mapLoaded || !destination || !map.current) return
    
    // Find coordinates from landmark name or geocode
    const point = bangalorePoints.find(p => p.name.toLowerCase().includes(destination.toLowerCase()))
    const coordinates = point ? point.coordinates : [77.5946 + Math.random() * 0.05, 12.9716 + Math.random() * 0.05]
    
    // Remove existing destination marker
    if (destinationMarker.current) {
      destinationMarker.current.remove()
    }
    
    // Create destination marker
    const destEl = document.createElement('div')
    destEl.className = 'w-6 h-6 bg-red-600 rounded-full border-2 border-white'
    
    destinationMarker.current = new mapboxgl.Marker({
      element: destEl,
      anchor: 'center'
    })
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p class="text-xs font-medium">${destination}</p>`))
    .addTo(map.current)
    
    if (showRouteEstimate) {
      // Update route between user and destination
      updateDrivingRoute([userLocation.lng, userLocation.lat], coordinates, 'destination-route')
      
      // Fit bounds to include all points
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([userLocation.lng, userLocation.lat])
      bounds.extend(coordinates)
      if (driverLocation) bounds.extend([driverLocation.lng, driverLocation.lat])
      
      map.current.fitBounds(bounds, { padding: 100 })
    }
  }, [destination, mapLoaded, showRouteEstimate])
  
  // Handle booking step changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return
    
    if (bookingStep === 1) {
      // Clear route and destination
      if (destinationMarker.current) {
        destinationMarker.current.remove()
        destinationMarker.current = null
      }
      
      if (map.current.getSource('destination-route')) {
        map.current.removeLayer('destination-route-layer')
        map.current.removeSource('destination-route')
      }
    }
  }, [bookingStep, mapLoaded])
  
  // Helper to update driving route
  const updateDrivingRoute = (start, end, sourceId) => {
    // If source already exists, remove it
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(`${sourceId}-layer`)
      map.current.removeSource(sourceId)
    }
    
    // Create simple route line (in real app, use Mapbox Directions API)
    const routeData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [start, end]
      }
    }
    
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: routeData
    })
    
    map.current.addLayer({
      id: `${sourceId}-layer`,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': sourceId === 'driver-route' ? '#10B981' : '#3B82F6',
        'line-width': 3,
        'line-dasharray': [2, 1]
      }
    })
  }
  
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
        </div>
      )}
      
      {bookingStep === 1 && mapLoaded && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-80 rounded-lg overflow-hidden z-10 shadow-lg">
          <div className="px-3 py-2 text-xs text-white font-medium border-b border-gray-700">
            Popular places in Bangalore
          </div>
          <div className="flex flex-wrap gap-1 p-2 max-w-xs">
            {bangalorePoints.map((point, index) => (
              <div 
                key={index} 
                className="bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-xs text-gray-200 cursor-pointer transition-colors"
                onClick={() => onDestinationSelect && onDestinationSelect(point.name)}
              >
                {point.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {bookingStep === 3 && mapLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-20 flex items-center justify-center">
          <div className="bg-gray-900 bg-opacity-90 px-6 py-4 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
              <p className="text-white font-medium">Finding nearby drivers...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BangaloreMap