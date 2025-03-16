'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Replace with your actual Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoid2lzaGVlMCIsImEiOiJjbTg4ZWs3cjYwaXhvMmpxdTFlaTgwaTE1In0.a8V9qDw_Lh4ezGkWdg0Lhg'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

export default function HeatMap({ hotspots, parkingSpots, driverLocation }) {
  console.log(hotspots)
  console.log(parkingSpots)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const popupsRef = useRef([])
  const circlesRef = useRef([])
  
  // Center map on driver location by default, or first hotspot if no driver location
  const getMapCenter = () => {
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      return [driverLocation.lng, driverLocation.lat]
    } else if (hotspots && hotspots.length > 0 && hotspots[0].lat && hotspots[0].lng) {
      return [hotspots[0].lng, hotspots[0].lat]
    } else {
      // Default to Bangalore
      return [77.5946, 12.9716]
    }
  }

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current) return // Initialize map only once
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: getMapCenter(),
      zoom: 11,
      attributionControl: false
    })
    
    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        cleanupMarkers()
        mapRef.current.remove()
      }
    }
  }, [])
  
  // Cleanup function for markers and popups
  const cleanupMarkers = () => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    popupsRef.current.forEach(popup => popup.remove())
    popupsRef.current = []

    // Clean up circle sources and layers
    circlesRef.current.forEach(circleId => {
      if (mapRef.current.getLayer(circleId)) {
        mapRef.current.removeLayer(circleId)
      }
      if (mapRef.current.getSource(circleId)) {
        mapRef.current.removeSource(circleId)
      }
    })
    circlesRef.current = []
  }
  
  // Add driver location marker
  useEffect(() => {
    if (!mapRef.current || !driverLocation || !driverLocation.lat || !driverLocation.lng) return
    
    // Clean up existing driver marker
    // const driverMarkerIndex = markersRef.current.findIndex(marker => marker.isDiverMarker)
    // if (driverMarkerIndex !== -1) {
    //   markersRef.current[driverMarkerIndex].remove()
    //   markersRef.current.splice(driverMarkerIndex, 1)
    // }
    
    // Create driver marker element
    const driverEl = document.createElement('div')
    driverEl.className = 'driver-marker'
    driverEl.style.width = '24px'
    driverEl.style.height = '24px'
    driverEl.style.borderRadius = '50%'
    driverEl.style.backgroundColor = '#4CAF50'
    driverEl.style.border = '3px solid white'
    driverEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'
    
    // Add driver marker to map
    // const driverMarker = new mapboxgl.Marker(driverEl)
    //   .setLngLat([driverLocation.lng, driverLocation.lat])
    //   .addTo(mapRef.current)
    
    // driverMarker.isDiverMarker = true
    // markersRef.current.push(driverMarker)
    
    // Center map on driver location and fly to it
    mapRef.current.flyTo({
      center: [driverLocation.lng, driverLocation.lat],
      essential: true,
      duration: 1000
    })
  }, [driverLocation])
  
  // Add heatmap layer and 200m radius circles
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !hotspots || hotspots.length === 0) return
    
    // Filter out hotspots that don't have lat/lng
    const validHotspots = hotspots.filter(spot => spot.lat && spot.lng)
    
    if (validHotspots.length === 0) return
    
    // Function to check if source and layer exist and create or update them
    const setupHeatmap = () => {
      // Check if source already exists
      if (map.getSource('hotspots')) {
        // Update source data
        map.getSource('hotspots').setData({
          type: 'FeatureCollection',
          features: validHotspots.map(spot => ({
            type: 'Feature',
            properties: {
              intensity: 1,
              name: spot.location,
              address: spot.formatted_address
            },
            geometry: {
              type: 'Point',
              coordinates: [spot.lng, spot.lat]
            }
          }))
        })
      } else {
        // Add source if it doesn't exist
        map.addSource('hotspots', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: validHotspots.map(spot => ({
              type: 'Feature',
              properties: {
                intensity: 1,
                name: spot.location,
                address: spot.formatted_address
              },
              geometry: {
                type: 'Point',
                coordinates: [spot.lng, spot.lat]
              }
            }))
          }
        })
        
        // Add heatmap layer
        map.addLayer({
          id: 'hotspots-heat',
          type: 'heatmap',
          source: 'hotspots',
          paint: {
            // Increase weight as diameter increases
            'heatmap-weight': 1,
            // Increase intensity as zoom level increases
            'heatmap-intensity': 1,
            // Assign color values to heatmap
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            // Adjust the heatmap radius with zoom
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 15,
              15, 25
            ],
            // Opacity based on zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 1,
              16, 0.6
            ]
          }
        })
        
        // Add circle layer for hotspot visualization when zoomed in
        map.addLayer({
          id: 'hotspots-point',
          type: 'circle',
          source: 'hotspots',
          minzoom: 7, // Make visible at lower zoom levels (was 14)
          paint: {
            'circle-radius': 8,
            'circle-color': '#d73027',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#f7f7f7',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 0.6, // Visible at lower zoom levels
              15, 0.8
            ]
          }
        })
      }

      // Clean up existing circle sources and layers
      circlesRef.current.forEach(circleId => {
        if (map.getLayer(circleId)) {
          map.removeLayer(circleId)
        }
        if (map.getSource(circleId)) {
          map.removeSource(circleId)
        }
      })
      circlesRef.current = []

      // Add 200m radius circles for each hotspot
      validHotspots.forEach((spot, index) => {
        const circleId = `hotspot-circle-${index}`
        
        // Create a GeoJSON source for the circle
        map.addSource(circleId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [spot.lng, spot.lat]
            }
          }
        })

        // Add a layer for the circle with a 200m radius
        map.addLayer({
          id: circleId,
          type: 'circle',
          source: circleId,
          paint: {
            // 200m radius converted to pixels at different zoom levels
            'circle-radius': [
              'interpolate',
              ['exponential', 2],
              ['zoom'],
              10, 5,         // At zoom level 10, circle radius will be small
              14, 50,        // At zoom level 14, circle radius gets larger
              16, 200        // At zoom level 16, circle radius is largest
            ],
            'circle-color': 'rgba(255, 0, 0, 0.15)',
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255, 0, 0, 0.5)',
            'circle-opacity': 0.7
          }
        })

        circlesRef.current.push(circleId)
      })
    }
    
    // Wait for the style to load before adding layers
    if (map.isStyleLoaded()) {
      setupHeatmap()
    } else {
      map.once('style.load', setupHeatmap)
    }
  }, [hotspots])
  
  // Add parking spot markers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !parkingSpots) return
    
    // Clean up existing parking markers
    markersRef.current
      .filter(marker => !marker.isDiverMarker)
      .forEach(marker => marker.remove())
    
    popupsRef.current.forEach(popup => popup.remove())
    popupsRef.current = []
    
    markersRef.current = markersRef.current.filter(marker => marker.isDiverMarker)
    
    // Create and add new parking markers
    parkingSpots.forEach(spot => {
      if (!spot.lat || !spot.lng) return
      
      // Create popup content
      const popupContent = document.createElement('div')
      popupContent.className = 'parking-popup'
      popupContent.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 12px; max-width: 240px;">
          <h3 style="margin: 0 0 8px; color: #4338ca; font-size: 16px; font-weight: 600;">
            ${spot.name}
          </h3>
          ${spot.vicinity ? `
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151;">
              <strong>Address:</strong> ${spot.vicinity}
            </p>
          ` : ''}
          ${spot.walking_info ? `
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151;">
              <strong>Walking:</strong> ${spot.walking_info.distance} (${spot.walking_info.duration})
            </p>
          ` : ''}
          ${typeof spot.rating !== 'undefined' ? `
            <div style="margin: 0 0 8px; font-size: 13px; color: #374151; display: flex; align-items: center;">
              <strong style="margin-right: 4px;">Rating:</strong>
              <span style="color: #eab308; font-weight: 600;">${spot.rating.toFixed(1)}</span>
              <span style="color: #eab308; margin-left: 2px;">★</span>
              <span style="margin-left: 4px; font-size: 12px; color: #6b7280;">(${spot.user_ratings_total || 0})</span>
            </div>
          ` : ''}
          ${spot.open_now !== undefined ? `
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151;">
              <strong>Status:</strong> 
              <span style="color: ${spot.open_now ? '#10b981' : '#ef4444'}; font-weight: 500;">
                ${spot.open_now ? 'Open Now' : 'Closed'}
              </span>
            </p>
          ` : ''}
          ${spot.nearby_hotspot ? `
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Near ${spot.nearby_hotspot.name}
            </p>
          ` : ''}
        </div>
      `
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setDOMContent(popupContent)
      
      popupsRef.current.push(popup)
      
      // Create parking marker element
      const markerEl = document.createElement('div')
      markerEl.className = 'parking-marker'
      markerEl.style.width = '32px'
      markerEl.style.height = '32px'
      markerEl.style.backgroundImage = "url('data:image/svg+xml;charset=UTF-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%232563eb\"><path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/><path d=\"M10 7h4v6h-1.5V10h-2.5z\"/></svg>')"
      markerEl.style.backgroundSize = 'cover'
      markerEl.style.cursor = 'pointer'
      
      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([spot.lng, spot.lat])
        .setPopup(popup)
        .addTo(map)
      
      markersRef.current.push(marker)
      
      // Add hover and click functionality
      markerEl.addEventListener('mouseenter', () => {
        popup.addTo(map)
      })
      
      markerEl.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (!popup.isOpen()) {
            popup.remove()
          }
        }, 300)
      })
    })
  }, [parkingSpots])
  
  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
  )
}