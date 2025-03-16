'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function ParkingMap({ parkingSpots = [], driverLocation }) {
	const mapContainer = useRef(null)
	const map = useRef(null)
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('map')
	
	useEffect(() => {
		if (!mapContainer.current || parkingSpots.length === 0) {
			setIsLoading(false)
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
									'fill-color': '#ef4444',
									'fill-opacity': 0.1
								}
							})
							
							map.current.addLayer({
								'id': `${sourceId}-line`,
								'type': 'line',
								'source': sourceId,
								'layout': {},
								'paint': {
									'line-color': '#ef4444',
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
									'text-halo-color': '#ef4444',
									'text-halo-width': 0.5
								}
							})
						}
					}
				})
				
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
					const legend = document.querySelector('.parking-map-legend')
					if (legend && legend.parentNode) {
						legend.parentNode.removeChild(legend)
					}
				} catch (err) {
					console.error('Error removing legend:', err)
				}
			}
		}
	}, [parkingSpots, driverLocation])
	
	const addLegend = () => {
		const legend = document.createElement('div')
		legend.className = 'parking-map-legend'
		legend.style.position = 'absolute'
		legend.style.bottom = '20px'
		legend.style.right = '20px'
		legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
		legend.style.padding = '10px'
		legend.style.borderRadius = '4px'
		legend.style.color = 'white'
		legend.style.maxWidth = '200px'
		
		const title = document.createElement('h4')
		title.textContent = 'Map Legend'
		title.style.margin = '0 0 10px 0'
		legend.appendChild(title)
		
		const markers = [
			{ color: '#22c55e', label: 'Your Location' },
			{ color: '#3b82f6', label: 'Parking Spot' },
			{ color: '#ef4444', label: 'Edge Location' },
			{ color: '#ef4444', label: 'Hotspot Area', dash: true }
		]
		
		markers.forEach(marker => {
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
		
		mapContainer.current.appendChild(legend)
	}
	
	if (isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-gray-800">
				<div className="text-center">
					<div className="loading loading-spinner loading-lg text-emerald-500"></div>
					<p className="mt-4 text-white">Loading parking data...</p>
				</div>
			</div>
		)
	}
	
	if (parkingSpots.length === 0) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
				<p>No parking spots available</p>
			</div>
		)
	}
	
	return (
		<div className="w-full h-full">
			<div className="w-full bg-gray-800">
				<div className="tabs tabs-boxed bg-gray-700 mb-2">
					<a 
						className={`tab ${activeTab === 'map' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
						onClick={() => setActiveTab('map')}
					>
						Interactive Map
					</a>
					<a 
						className={`tab ${activeTab === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
						onClick={() => setActiveTab('list')}
					>
						Parking List
					</a>
				</div>
				
				{activeTab === 'map' && (
					<div className="h-[64vh]">
						<div className="w-full h-full relative" ref={mapContainer} />
					</div>
				)}
				
				{activeTab === 'list' && (
					<div className="h-[64vh] bg-gray-800 p-4 overflow-auto">
						<div className="overflow-x-auto">
							<table className="table w-full text-gray-200">
								<thead className="bg-gray-700">
									<tr>
										<th>Name</th>
										<th>Type</th>
										<th>Distance</th>
										<th>Rating</th>
										<th>Location</th>
									</tr>
								</thead>
								<tbody>
									{parkingSpots.map((spot, index) => (
										<tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
											<td className="font-medium">
												{spot.name || 'Unnamed Parking'}
												{spot.is_edge_location && (
													<span className="ml-2 px-2 py-1 bg-red-900 text-red-100 text-xs rounded">Edge</span>
												)}
											</td>
											<td>
												{spot.nearby_hotspot?.name || 'General Parking'}
											</td>
											<td>{spot.walking_info?.distance || 'N/A'}</td>
											<td>
												<div className="flex items-center">
													{spot.rating ? (
														<>
															<span className="text-yellow-400 mr-1">★</span>
															<span>{spot.rating}</span>
															{spot.user_ratings_total && (
																<span className="text-xs ml-1">({spot.user_ratings_total})</span>
															)}
														</>
													) : 'No ratings'}
												</div>
											</td>
											<td className="text-xs">{spot.vicinity || `${spot.lat.toFixed(5)}, ${spot.lng.toFixed(5)}`}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}