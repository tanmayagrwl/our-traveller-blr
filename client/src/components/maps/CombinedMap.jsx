'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function CombinedMap({ 
  parkingSpots = [], 
  hotspots = [], 
  driverLocation, 
  topRecommendation,
  activeLayer = 'both'
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationCoords, setLocationCoords] = useState([])
  
  // For fetching geocoding data for hotspots
  const fetchGeocoding = async (locations) => {
    const coordsPromises = locations.map(async (location) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location},Bangalore,India&format=json&limit=1`)
        if (!response.ok) {
          throw new Error(`Failed to fetch coordinates for ${location}`)
        }
        
        const data = await response.json()
        if (data && data.length > 0) {
          return {
            name: location,
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
        }
        
        return null
      } catch (error) {
        console.error(`Error fetching coordinates for ${location}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(coordsPromises)
    return results.filter(result => result !== null)
  }
  
  // Get geocoding data for hotspots
  useEffect(() => {
    const getCoordinates = async () => {
      setIsLoading(true)
      
      const uniqueLocations = Array.from(new Set([
        ...hotspots,
        topRecommendation
      ].filter(Boolean)))
      
      if (uniqueLocations.length > 0) {
        const coords = await fetchGeocoding(uniqueLocations)
        setLocationCoords(coords)
      }
      
      setIsLoading(false)
    }
    
    getCoordinates()
  }, [hotspots, topRecommendation])
  
  // Initialize and render map
  useEffect(() => {
    if (!mapContainer.current || isLoading) {
      return
    }
    
    if (map.current) {
      try {
        map.current?.remove()
      } catch (err) {
        console.error('Error removing map:', err)
      }
    }
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [driverLocation.lng, driverLocation.lat],
        zoom: 12
      })
      
      map.current.on('load', () => {
        // Add driver location marker
        new mapboxgl.Marker({ color: '#22c55e' })
          .setLngLat([driverLocation.lng, driverLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
          .addTo(map.current)
        
        // Add hotspot heat zones if hotspot layer is active
        if (activeLayer === 'both' || activeLayer === 'hotspots') {
          addHotspotLayers()
        }
        
        // Add parking spot markers if parking layer is active
        if (activeLayer === 'both' || activeLayer === 'parking') {
          addParkingLayers()
        }
        
        addLegend()
        setIsLoading(false)
      })
    } catch (err) {
      console.error('Error setting up map:', err)
      setIsLoading(false)
    }
    
    return () => {
      if (map.current) {
        try {
          map.current.remove()
        } catch (err) {
          console.error('Error removing map in cleanup:', err)
        }
        
        try {
          const legend = document.querySelector('.map-legend')
          if (legend && legend.parentNode) {
            legend.parentNode.removeChild(legend)
          }
        } catch (err) {
          console.error('Error removing legend:', err)
        }
      }
    }
  }, [isLoading, locationCoords, parkingSpots, driverLocation, activeLayer])
  
  // Add hotspot heat zones
  const addHotspotLayers = () => {
    locationCoords.forEach((location, index) => {
      const isTopRecommendation = location.name === topRecommendation
      const hotspotIndex = hotspots.indexOf(location.name)
      
      let radiusKm = 1.0
      let radiusSmall = 0.25
      let color = '#facc15'
      
      if (isTopRecommendation) {
        radiusKm = 1.0
        radiusSmall = 0.25
        color = '#ef4444'  // Dark red
      } else if (hotspotIndex !== -1) {
        radiusKm = 1.0 - (hotspotIndex * 0.1)
        radiusSmall = 0.25 - (hotspotIndex * 0.03)
        
        if (hotspotIndex === 0) color = '#ef4444'      // Dark red
        else if (hotspotIndex === 1) color = '#f97316' // Orange
        else if (hotspotIndex === 2) color = '#f59e0b' // Amber
        else if (hotspotIndex === 3) color = '#eab308' // Yellow
        else color = '#facc15'                        // Light yellow
      }
      
      createHeatZone(location, radiusKm, color, isTopRecommendation, 0.3)
      createHeatZone(location, radiusSmall, color, isTopRecommendation, 0.7)
    })
  }
  
  // Create heat zone circles
  const createHeatZone = (location, radiusKm, color, isTopRecommendation, opacity = 0.5) => {
    const radiusInDegrees = radiusKm / 111.32  // Rough conversion from km to degrees at equator
    const center = [location.lng, location.lat]
    const points = 64
    const coords = []
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (2 * Math.PI)
      const lng = center[0] + (radiusInDegrees * Math.cos(angle))
      const lat = center[1] + (radiusInDegrees * Math.sin(angle) * 0.7)
      coords.push([lng, lat])
    }
    coords.push(coords[0])
    
    const sourceId = `zone-${location.name.replace(/\s+/g, '-').toLowerCase()}-${radiusKm}`
    
    map.current.addSource(sourceId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {
          'name': location.name,
          'isTop': isTopRecommendation
        },
        'geometry': {
          'type': 'Polygon',
          'coordinates': [coords]
        }
      }
    })
    
    map.current.addLayer({
      'id': `${sourceId}-fill`,
      'type': 'fill',
      'source': sourceId,
      'layout': {},
      'paint': {
        'fill-color': color,
        'fill-opacity': opacity
      }
    })
    
    map.current.addLayer({
      'id': `${sourceId}-line`,
      'type': 'line',
      'source': sourceId,
      'layout': {},
      'paint': {
        'line-color': color,
        'line-width': isTopRecommendation ? 2 : 1,
        'line-opacity': 0.8
      }
    })
    
    if (radiusKm > 0.5) {
      map.current.addLayer({
        'id': `${sourceId}-label`,
        'type': 'symbol',
        'source': sourceId,
        'layout': {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': isTopRecommendation ? 16 : 12,
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-offset': [0, 0]
        },
        'paint': {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      })
    }
    
    if (isTopRecommendation && radiusKm > 0.5) {
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(center)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h3>${location.name}</h3>
            <p><strong>TOP RECOMMENDATION</strong></p>`
          )
        )
        .addTo(map.current)
    }
  }
  
  // Add parking spot markers and related layers
  const addParkingLayers = () => {
    // Add parking spot markers
    parkingSpots.forEach((spot) => {
      const markerColor = spot.is_edge_location ? '#ef4444' : '#3b82f6'
      
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map.current)
      
      let popupHtml = `
        <div style="max-width: 200px">
          <h3 style="font-weight: bold; margin-bottom: 5px">${spot.name || 'Parking Spot'}</h3>
      `
      
      if (spot.vicinity) {
        popupHtml += `<p style="font-size: 0.9em; margin-bottom: 5px">${spot.vicinity}</p>`
      }
      
      if (spot.rating) {
        popupHtml += `
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <span style="color: #facc15; margin-right: 3px">★</span>
            <span>${spot.rating}</span>
            ${spot.user_ratings_total ? `<span style="font-size: 0.8em; margin-left: 3px">(${spot.user_ratings_total})</span>` : ''}
          </div>
        `
      }
      
      if (spot.walking_info) {
        popupHtml += `
          <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #4b5563">
            <p style="font-size: 0.9em; margin-bottom: 3px">
              <strong>Distance:</strong> ${spot.walking_info.distance}
            </p>
            <p style="font-size: 0.9em">
              <strong>Walking time:</strong> ${spot.walking_info.duration}
            </p>
          </div>
        `
        
        // Draw route polyline if walking info exists
        if (spot.walking_info.polyline && spot.nearby_hotspot) {
          try {
            // In a real implementation, this would decode the polyline
            // and show actual walking routes
            
            // Draw a simple line between the hotspot and parking
            const hotspotCoords = [spot.nearby_hotspot.lng, spot.nearby_hotspot.lat]
            const parkingCoords = [spot.lng, spot.lat]
            
            const sourceId = `route-${spot.place_id}`
            map.current.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [hotspotCoords, parkingCoords]
                }
              }
            })
            
            map.current.addLayer({
              id: sourceId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': spot.is_edge_location ? '#ef4444' : '#3b82f6',
                'line-width': 2,
                'line-opacity': 0.5,
                'line-dasharray': [2, 1]
              }
            })
          } catch (err) {
            console.error('Error drawing route:', err)
          }
        }
      }
      
      if (spot.is_edge_location) {
        popupHtml += `
          <div style="margin-top: 5px; background-color: #fef2f2; color: #b91c1c; padding: 3px 5px; border-radius: 4px; font-size: 0.9em">
            <strong>Edge Location</strong>
          </div>
        `
      }
      
      popupHtml += `</div>`
      
      marker.setPopup(new mapboxgl.Popup().setHTML(popupHtml))
    })
    
    // Add hotspot markers for spots with nearby_hotspot
    const hotspots = new Set()
    
    parkingSpots.forEach(spot => {
      if (spot.nearby_hotspot && spot.nearby_hotspot.name) {
        const hotspotId = `${spot.nearby_hotspot.lat}-${spot.nearby_hotspot.lng}-${spot.nearby_hotspot.name}`
        if (!hotspots.has(hotspotId)) {
          hotspots.add(hotspotId)
          
          // Create a translucent circle for the hotspot area
          const sourceId = `hotspot-${spot.nearby_hotspot.name.replace(/\s+/g, '-').toLowerCase()}`
          const radiusInDegrees = 0.5 / 111.32 // Approximate 500m radius
          const center = [spot.nearby_hotspot.lng, spot.nearby_hotspot.lat]
          const points = 64
          const coords = []
          
          for (let i = 0; i < points; i++) {
            const angle = (i / points) * (2 * Math.PI)
            const lng = center[0] + (radiusInDegrees * Math.cos(angle))
            const lat = center[1] + (radiusInDegrees * Math.sin(angle) * 0.7)
            coords.push([lng, lat])
          }
          coords.push(coords[0])
          
          map.current.addSource(sourceId, {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {
                'name': spot.nearby_hotspot.name
              },
              'geometry': {
                'type': 'Polygon',
                'coordinates': [coords]
              }
            }
          })
          
          map.current.addLayer({
            'id': `${sourceId}-fill`,
            'type': 'fill',
            'source': sourceId,
            'layout': {},
            'paint': {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.1
            }
          })
          
          map.current.addLayer({
            'id': `${sourceId}-line`,
            'type': 'line',
            'source': sourceId,
            'layout': {},
            'paint': {
              'line-color': '#3b82f6',
              'line-width': 1,
              'line-opacity': 0.5,
              'line-dasharray': [3, 2]
            }
          })
          
          map.current.addLayer({
            'id': `${sourceId}-label`,
            'type': 'symbol',
            'source': sourceId,
            'layout': {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-justify': 'center',
              'text-offset': [0, 0]
            },
            'paint': {
              'text-color': '#ffffff',
              'text-halo-color': '#3b82f6',
              'text-halo-width': 0.5
            }
          })
        }
      }
    })
  }
  
  // Add legend with both hotspot and parking information
  const addLegend = () => {
    // Remove any existing legend first
    try {
      const existingLegend = document.querySelector('.map-legend')
      if (existingLegend && existingLegend.parentNode) {
        existingLegend.parentNode.removeChild(existingLegend)
      }
    } catch (err) {
      console.error('Error removing existing legend:', err)
    }
    
    const legend = document.createElement('div')
    legend.className = 'map-legend'
    legend.style.position = 'absolute'
    legend.style.bottom = '20px'
    legend.style.right = '20px'
    legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
    legend.style.padding = '10px'
    legend.style.borderRadius = '4px'
    legend.style.color = 'white'
    legend.style.maxWidth = '220px'
    
    const title = document.createElement('h4')
    title.textContent = 'Map Legend'
    title.style.margin = '0 0 10px 0'
    legend.appendChild(title)
    
    if (activeLayer === 'both' || activeLayer === 'hotspots') {
      const hotspotTitle = document.createElement('h5')
      hotspotTitle.textContent = 'Hotspot Rankings'
      hotspotTitle.style.margin = '5px 0'
      hotspotTitle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)'
      hotspotTitle.style.paddingBottom = '3px'
      legend.appendChild(hotspotTitle)
      
      const hotspotLevels = [
        { color: '#ef4444', label: '#1 (Highest)' },
        { color: '#f97316', label: '#2' },
        { color: '#f59e0b', label: '#3' },
        { color: '#eab308', label: '#4' },
        { color: '#facc15', label: '#5 (Lowest)' }
      ]
      
      hotspotLevels.forEach(level => {
        const item = document.createElement('div')
        item.style.display = 'flex'
        item.style.alignItems = 'center'
        item.style.marginBottom = '5px'
        
        const colorBox = document.createElement('div')
        colorBox.style.width = '15px'
        colorBox.style.height = '15px'
        colorBox.style.backgroundColor = level.color
        colorBox.style.marginRight = '5px'
        
        const label = document.createElement('span')
        label.textContent = level.label
        
        item.appendChild(colorBox)
        item.appendChild(label)
        legend.appendChild(item)
      })
    }
    
    if (activeLayer === 'both' || activeLayer === 'parking') {
      const parkingTitle = document.createElement('h5')
      parkingTitle.textContent = 'Parking Locations'
      parkingTitle.style.margin = '10px 0 5px 0'
      parkingTitle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)'
      parkingTitle.style.paddingBottom = '3px'
      legend.appendChild(parkingTitle)
      
      const parkingMarkers = [
        { color: '#22c55e', label: 'Your Location' },
        { color: '#3b82f6', label: 'Parking Spot' },
        { color: '#ef4444', label: 'Edge Location' },
        { color: '#3b82f6', label: 'Nearby Hotspot', dash: true }
      ]
      
      parkingMarkers.forEach(marker => {
        const item = document.createElement('div')
        item.style.display = 'flex'
        item.style.alignItems = 'center'
        item.style.marginBottom = '5px'
        
        const colorBox = document.createElement('div')
        colorBox.style.width = '15px'
        colorBox.style.height = '15px'
        colorBox.style.backgroundColor = marker.color
        colorBox.style.marginRight = '5px'
        
        if (marker.dash) {
          colorBox.style.opacity = '0.5'
          colorBox.style.border = '1px dashed ' + marker.color
          colorBox.style.backgroundColor = 'transparent'
        }
        
        const label = document.createElement('span')
        label.textContent = marker.label
        
        item.appendChild(colorBox)
        item.appendChild(label)
        legend.appendChild(item)
      })
    }
    
    mapContainer.current.appendChild(legend)
  }
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-emerald-500"></div>
          <p className="mt-4 text-white">Loading map data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full h-full relative" ref={mapContainer} />
  )
}