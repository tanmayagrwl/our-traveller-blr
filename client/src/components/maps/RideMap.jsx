'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoid2lzaGVlMCIsImEiOiJjbTg4ZWs3cjYwaXhvMmpxdTFlaTgwaTE1In0.a8V9qDw_Lh4ezGkWdg0Lhg'

export default function RideMap({ 
	userLocation = null, 
	driverLocation = null, 
	showRouteEstimate = false,
	destination = null 
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
			style: 'mapbox://styles/mapbox/dark-v11',
			center,
			zoom: 13,
			pitch: 40,
			bearing: 20
		})
		
		map.current.on('load', () => {
			if (userLocation) {
				const el = document.createElement('div')
				el.className = 'user-marker'
				el.style.width = '15px'
				el.style.height = '15px'
				el.style.borderRadius = '50%'
				el.style.backgroundColor = '#3B82F6'
				el.style.boxShadow = '0 0 10px #3B82F6'
				
				new mapboxgl.Marker({ element: el })
					.setLngLat([userLocation.lng, userLocation.lat])
					.setPopup(new mapboxgl.Popup().setHTML("<h3 class='text-black'>Your Location</h3>"))
					.addTo(map.current)
			}
			
			if (driverLocation) {
				const el = document.createElement('div')
				el.className = 'driver-marker'
				el.style.width = '15px'
				el.style.height = '15px'
				el.style.borderRadius = '50%'
				el.style.backgroundColor = '#10b981'
				el.style.boxShadow = '0 0 15px #10b981'
				
				new mapboxgl.Marker({ element: el })
					.setLngLat([driverLocation.lng, driverLocation.lat])
					.setPopup(new mapboxgl.Popup().setHTML("<h3 class='text-black'>Driver Location</h3>"))
					.addTo(map.current)
			}
			
			if (showRouteEstimate) {
				const mockDestination = [
					userLocation.lng + (Math.random() * 0.05 - 0.025),
					userLocation.lat + (Math.random() * 0.05 - 0.025)
				]
				
				const el = document.createElement('div')
				el.className = 'destination-marker'
				el.style.width = '15px'
				el.style.height = '15px'
				el.style.borderRadius = '50%'
				el.style.backgroundColor = '#f59e0b'
				el.style.boxShadow = '0 0 10px #f59e0b'
				
				new mapboxgl.Marker({ element: el })
					.setLngLat(mockDestination)
					.setPopup(new mapboxgl.Popup().setHTML("<h3 class='text-black'>Destination</h3>"))
					.addTo(map.current)
				
				map.current.addSource('route', {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: [
								[userLocation.lng, userLocation.lat],
								mockDestination
							]
						}
					}
				})
				
				map.current.addLayer({
					id: 'route',
					type: 'line',
					source: 'route',
					layout: { 'line-join': 'round', 'line-cap': 'round' },
					paint: {
						'line-color': '#10B981',
						'line-width': 4,
						'line-dasharray': [2, 1]
					}
				})
			}
			
			if (userLocation && driverLocation) {
				map.current.addSource('driver-route', {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: [
								[driverLocation.lng, driverLocation.lat],
								[userLocation.lng, userLocation.lat]
							]
						}
					}
				})
				
				map.current.addLayer({
					id: 'driver-route',
					type: 'line',
					source: 'driver-route',
					layout: { 'line-join': 'round', 'line-cap': 'round' },
					paint: {
						'line-color': '#3B82F6',
						'line-width': 4,
						'line-dasharray': [2, 1]
					}
				})
				
				const pulsingDot = {
					width: 100,
					height: 100,
					data: new Uint8Array(100 * 100 * 4),
					
					onAdd: function() {
						const canvas = document.createElement('canvas')
						canvas.width = this.width
						canvas.height = this.height
						this.context = canvas.getContext('2d')
					},
					
					render: function() {
						const duration = 1000
						const t = (performance.now() % duration) / duration
						
						const radius = (this.width / 2) * 0.3
						const outerRadius = (this.width / 2) * 0.7 * t + radius
						const context = this.context
						
						context.clearRect(0, 0, this.width, this.height)
						context.beginPath()
						context.arc(
							this.width / 2,
							this.height / 2,
							outerRadius,
							0,
							Math.PI * 2
						)
						context.fillStyle = `rgba(16, 185, 129, ${1 - t})`
						context.fill()
						
						context.beginPath()
						context.arc(
							this.width / 2,
							this.height / 2,
							radius,
							0,
							Math.PI * 2
						)
						context.fillStyle = 'rgba(16, 185, 129, 1)'
						context.strokeStyle = 'white'
						context.lineWidth = 2 + 4 * (1 - t)
						context.fill()
						context.stroke()
						
						this.data = context.getImageData(
							0,
							0,
							this.width,
							this.height
						).data
						
						map.current.triggerRepaint()
						
						return true
					}
				}
				
				map.current.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 })
				
				map.current.addSource('points', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [
							{
								type: 'Feature',
								geometry: {
									type: 'Point',
									coordinates: [userLocation.lng, userLocation.lat]
								},
								properties: { title: 'User' }
							}
						]
					}
				})
				
				map.current.addLayer({
					id: 'points',
					type: 'symbol',
					source: 'points',
					layout: {
						'icon-image': 'pulsing-dot',
						'icon-allow-overlap': true
					}
				})
			}
		})
		
		return () => map.current?.remove()
	}, [userLocation, driverLocation, showRouteEstimate])
	
	return (
		<div className="w-full h-full" ref={mapContainer} />
	)
}