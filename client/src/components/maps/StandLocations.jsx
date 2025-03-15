'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoid2lzaGVlMCIsImEiOiJjbTg4ZWs3cjYwaXhvMmpxdTFlaTgwaTE1In0.a8V9qDw_Lh4ezGkWdg0Lhg'

export default function StandLocations({ 
  standLocations, 
  userLocation = null, 
  driverLocation = null,
  showStandsBenefits = false 
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  
  useEffect(() => {
    if (map.current) return 
    
    let center
    if (userLocation) {
      center = [userLocation.lng, userLocation.lat]
    } else if (driverLocation) {
      center = [driverLocation.lng, driverLocation.lat]
    } else {
      center = [80.2707, 13.0827]
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 12
    })
    
    map.current.on('load', () => {
      if (userLocation) {
        new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
          .addTo(map.current)
      }
      
      if (driverLocation) {
        new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([driverLocation.lng, driverLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Driver Location</h3>"))
          .addTo(map.current)
      }
      
      standLocations.forEach(stand => {
        let popupContent
        
        if (showStandsBenefits) {
          popupContent = `
            <div class="p-2">
              <h3 class="font-bold">${stand.name}</h3>
              <p>Available drivers: ${stand.availableDrivers}</p>
              <p>Wait time: ${stand.waitTime} min</p>
              <p>Surge discount: ${stand.surgeDiscount}</p>
              <p>Distance: ${stand.distance}</p>
              <div class="mt-2 text-sm text-green-600 font-bold">
                Using this stand saves you money during peak hours!
              </div>
            </div>
          `
        } else {
          popupContent = `
            <div class="p-2">
              <h3 class="font-bold">${stand.name}</h3>
              <p>Available drivers: ${stand.availableDrivers}</p>
              <p>Wait time: ${stand.waitTime} min</p>
            </div>
          `
        }
        
        new mapboxgl.Marker({ color: '#2563EB' })
          .setLngLat([stand.lng, stand.lat])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map.current)
      })
      
      standLocations.forEach((stand, idx) => {
        map.current.addSource(`stand-radius-${idx}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [stand.lng, stand.lat]
            }
          }
        })
        
        map.current.addLayer({
          id: `stand-radius-${idx}`,
          type: 'circle',
          source: `stand-radius-${idx}`,
          paint: {
            'circle-radius': {
              'base': 1.75,
              'stops': [
                [12, 100],
                [22, 2000]
              ]
            },
            'circle-color': '#3B82F6',
            'circle-opacity': 0.2,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#2563EB'
          }
        })
      })
    })
    
    return () => map.current.remove()
  }, [standLocations, userLocation, driverLocation])
  
  return (
    <div className="w-full h-full" ref={mapContainer} />
  )
}