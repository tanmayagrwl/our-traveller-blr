'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'

export default function HeatMap({ heatmapData, driverLocation, showStands, standLocations }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  
  useEffect(() => {
    if (map.current) return 
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [driverLocation.lng, driverLocation.lat],
      zoom: 12
    })
    
    map.current.on('load', () => {
      new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
        .addTo(map.current)
      
      if (showStands && standLocations) {
        standLocations.forEach(stand => {
          new mapboxgl.Marker({ color: '#2563EB' })
            .setLngLat([stand.lng, stand.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<h3>${stand.name}</h3>
                <p>Available drivers: ${stand.availableDrivers}</p>
                <p>Wait time: ${stand.waitTime} min</p>`
              )
            )
            .addTo(map.current)
        })
      }
      
      const zones = [
        {
          name: "IT Corridor",
          center: [80.2506, 12.9907],
          demand: "Very High",
          color: "#FF0000",
          radius: 0.03
        },
        {
          name: "Central Chennai",
          center: [80.2707, 13.0827],
          demand: "High",
          color: "#FF7700",
          radius: 0.025
        },
        {
          name: "T Nagar",
          center: [80.2425, 13.0420],
          demand: "High",
          color: "#FF7700",
          radius: 0.02
        },
        {
          name: "Velachery",
          center: [80.2206, 12.9815],
          demand: "Moderate",
          color: "#FFFF00",
          radius: 0.02
        },
        {
          name: "Anna Nagar",
          center: [80.2091, 13.0846],
          demand: "Moderate",
          color: "#FFFF00",
          radius: 0.02
        },
        {
          name: "Airport",
          center: [80.1708, 12.9941],
          demand: "Low",
          color: "#00AAFF",
          radius: 0.025
        },
        {
          name: "Adyar",
          center: [80.2548, 13.0012],
          demand: "Moderate",
          color: "#FFFF00",
          radius: 0.018
        }
      ]
      
      zones.forEach((zone, index) => {
        const center = zone.center
        const radius = zone.radius
        const points = 64
        const coords = []
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * (2 * Math.PI)
          const lng = center[0] + (radius * Math.cos(angle))
          const lat = center[1] + (radius * Math.sin(angle) * 0.7)
          coords.push([lng, lat])
        }
        coords.push(coords[0])
        
        map.current.addSource(`zone-${index}`, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {
              'name': zone.name,
              'demand': zone.demand
            },
            'geometry': {
              'type': 'Polygon',
              'coordinates': [coords]
            }
          }
        })
        
        map.current.addLayer({
          'id': `zone-fill-${index}`,
          'type': 'fill',
          'source': `zone-${index}`,
          'layout': {},
          'paint': {
            'fill-color': zone.color,
            'fill-opacity': 0.5
          }
        })
        
        map.current.addLayer({
          'id': `zone-line-${index}`,
          'type': 'line',
          'source': `zone-${index}`,
          'layout': {},
          'paint': {
            'line-color': zone.color,
            'line-width': 2
          }
        })
        
        map.current.addLayer({
          'id': `zone-label-${index}`,
          'type': 'symbol',
          'source': `zone-${index}`,
          'layout': {
            'text-field': ['format',
              ['get', 'name'], {'font-scale': 1.2},
              '\n', {},
              ['get', 'demand'], {'font-scale': 0.8}
            ],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
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
      })
      
      const legend = document.createElement('div')
      legend.className = 'map-legend'
      legend.style.position = 'absolute'
      legend.style.bottom = '20px'
      legend.style.right = '20px'
      legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
      legend.style.padding = '10px'
      legend.style.borderRadius = '4px'
      legend.style.color = 'white'
      legend.style.maxWidth = '200px'
      
      const title = document.createElement('h4')
      title.textContent = 'Demand Levels'
      title.style.margin = '0 0 10px 0'
      legend.appendChild(title)
      
      const levels = [
        { color: '#FF0000', label: 'Very High' },
        { color: '#FF7700', label: 'High' },
        { color: '#FFFF00', label: 'Moderate' },
        { color: '#00AAFF', label: 'Low' }
      ]
      
      levels.forEach(level => {
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
      
      mapContainer.current.appendChild(legend)
    })
    
    return () => {
      if (map.current) {
        map.current.remove()
        
        const legend = document.querySelector('.map-legend')
        if (legend && legend.parentNode) {
          legend.parentNode.removeChild(legend)
        }
      }
    }
  }, [])
  
  return (
    <div className="w-full h-full" ref={mapContainer} />
  )
}