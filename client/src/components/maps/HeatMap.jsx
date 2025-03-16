'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function HeatMap({ hourlyRecommendations, blockRecommendations, driverLocation, topRecommendation }) {
	const mapContainer = useRef(null)
	const map = useRef(null)
	const [locationCoords, setLocationCoords] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	
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
	
	useEffect(() => {
		const getCoordinates = async () => {
			setIsLoading(true)
			
			const uniqueLocations = Array.from(new Set([
				...hourlyRecommendations,
				...blockRecommendations,
				topRecommendation
			].filter(Boolean)))
			
			const coords = await fetchGeocoding(uniqueLocations)
			setLocationCoords(coords)
			setIsLoading(false)
		}
		
		getCoordinates()
	}, [hourlyRecommendations, blockRecommendations, topRecommendation])
	
	useEffect(() => {
		if (isLoading || locationCoords.length === 0 || !mapContainer.current) return
		
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
				zoom: 10
			})
			
			map.current.on('load', () => {
				new mapboxgl.Marker({ color: '#22c55e' })
					.setLngLat([driverLocation.lng, driverLocation.lat])
					.setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
					.addTo(map.current)
				
				locationCoords.forEach((location) => {
					const isTopRecommendation = location.name === topRecommendation
					const hourlyIndex = hourlyRecommendations.indexOf(location.name)
					const blockIndex = blockRecommendations.indexOf(location.name)
					
					let radiusKm = 1.0
					let radiusSmall = 0.25
					let color = '#facc15'
					
					if (isTopRecommendation) {
						radiusKm = 1.0
						radiusSmall = 0.25
						color = '#ef4444'  // Dark red
					} else if (hourlyIndex !== -1) {
						radiusKm = 1.0 - (hourlyIndex * 0.1)
						radiusSmall = 0.25 - (hourlyIndex * 0.03)
						
						if (hourlyIndex === 0) color = '#ef4444'      // Dark red
						else if (hourlyIndex === 1) color = '#f97316' // Orange
						else if (hourlyIndex === 2) color = '#f59e0b' // Amber
						else if (hourlyIndex === 3) color = '#eab308' // Yellow
						else color = '#facc15'                        // Light yellow
					} else if (blockIndex !== -1) {
						radiusKm = 0.8 - (blockIndex * 0.1)
						radiusSmall = 0.2 - (blockIndex * 0.02)
						
						if (blockIndex === 0) color = '#ef4444'      // Dark red
						else if (blockIndex === 1) color = '#f97316' // Orange
						else if (blockIndex === 2) color = '#f59e0b' // Amber
						else if (blockIndex === 3) color = '#eab308' // Yellow
						else color = '#facc15'                       // Light yellow
					}
					
					createHeatZone(location, radiusKm, color, isTopRecommendation, 0.3)
					createHeatZone(location, radiusSmall, color, isTopRecommendation, 0.7)
				})
				
				addLegend()
			})
		} catch (err) {
			console.error('Error setting up map:', err)
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
	}, [isLoading, locationCoords, driverLocation])
	
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
	
	const addLegend = () => {
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
		title.textContent = 'Recommendation Rank'
		title.style.margin = '0 0 10px 0'
		legend.appendChild(title)
		
		const levels = [
			{ color: '#ef4444', label: '#1 (Highest)' },
			{ color: '#f97316', label: '#2' },
			{ color: '#f59e0b', label: '#3' },
			{ color: '#eab308', label: '#4' },
			{ color: '#facc15', label: '#5 (Lowest)' }
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