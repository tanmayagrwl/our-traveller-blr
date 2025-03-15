'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'

const SAMPLE_RIDES = [
	{ origin: [72.8777, 19.0760], destination: [77.5946, 12.9716], progress: 0 },
	{ origin: [77.1025, 28.7041], destination: [88.3639, 22.5726], progress: 0 },
	{ origin: [80.2707, 13.0827], destination: [73.8567, 18.5204], progress: 0 },
	{ origin: [78.4867, 17.3850], destination: [72.8777, 19.0760], progress: 0 },
	{ origin: [76.9366, 8.5241], destination: [80.2707, 13.0827], progress: 0 }
]

const RIDE_UPDATES = [
	'Shreya completed a ride in Mumbai, saved ₹120 with carpooling',
	'Raj earned a 5-star rating in Delhi for excellent service',
	'Peak hour bonus activated in Bangalore - drivers earning +20%',
	'New AI route optimization reduced commute time by 15% in Chennai',
	'800 rides completed in Hyderabad in the last hour',
	'Driver Aditya reached Diamond tier with 500 completed rides',
	'Wait times reduced by 24% in Pune during morning rush hour',
	'Smart shuttle service launched in Ahmedabad with 98% occupancy'
]

export default function Home() {
	const router = useRouter()
	const mapContainer = useRef(null)
	const map = useRef(null)
	const [activeRides, setActiveRides] = useState([...SAMPLE_RIDES])
	const markersRef = useRef([])
	const animationRef = useRef(null)
	const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0)
	
	useEffect(() => {
		if (map.current) return

		mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/mapbox/dark-v11',
			center: [78.9629, 20.5937],
			zoom: 3.5,
			pitch: 40,
			bearing: 20,
			antialias: true
		})

		map.current.on('load', () => {
			map.current.addSource('routes', {
				type: 'geojson',
				data: { type: 'FeatureCollection', features: [] }
			})

			map.current.addLayer({
				id: 'route-lines',
				type: 'line',
				source: 'routes',
				layout: { 'line-join': 'round', 'line-cap': 'round' },
				paint: { 'line-color': '#10b981', 'line-width': 2, 'line-opacity': 0.7 }
			})

			startRideAnimations()
		})

		return () => {
			if (map.current) map.current.remove()
			if (animationRef.current) cancelAnimationFrame(animationRef.current)
		}
	}, [])

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentUpdateIndex(prevIndex => (prevIndex + 1) % RIDE_UPDATES.length)
		}, 5000)
		
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (!map.current) return
		
		const rotateGlobe = () => {
			if (!map.current) return
			
			map.current.easeTo({
				bearing: map.current.getBearing() + 0.1,
				duration: 0,
				easing: t => t
			})
			
			requestAnimationFrame(rotateGlobe)
		}
		
		const animation = requestAnimationFrame(rotateGlobe)
		return () => cancelAnimationFrame(animation)
	}, [])

	const startRideAnimations = () => {
		activeRides.forEach((ride) => {
			const el = document.createElement('div')
			el.className = 'ride-marker'
			el.style.width = '12px'
			el.style.height = '12px'
			el.style.borderRadius = '50%'
			el.style.backgroundColor = '#10b981'
			el.style.boxShadow = '0 0 15px #10b981'
			el.style.transition = 'all 0.3s ease'
			
			const marker = new mapboxgl.Marker(el)
				.setLngLat(ride.origin)
				.addTo(map.current)
			
			markersRef.current.push(marker)
		})
		
		const updateRoutes = () => {
			const updatedRides = activeRides.map((ride, i) => {
				const newProgress = Math.min(ride.progress + 0.005, 1)
				const currentLng = ride.origin[0] + (ride.destination[0] - ride.origin[0]) * newProgress
				const currentLat = ride.origin[1] + (ride.destination[1] - ride.origin[1]) * newProgress
				
				if (markersRef.current[i]) {
					markersRef.current[i].setLngLat([currentLng, currentLat])
				}
				
				if (newProgress >= 1) {
					const flash = document.createElement('div')
					flash.className = 'completion-flash'
					flash.style.position = 'absolute'
					flash.style.left = '0'
					flash.style.top = '0'
					flash.style.width = '30px'
					flash.style.height = '30px'
					flash.style.borderRadius = '50%'
					flash.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
					flash.style.border = '2px solid #10b981'
					flash.style.transform = 'translate(-50%, -50%)'
					flash.style.zIndex = '100'
					flash.style.animation = 'flash-pulse 1s ease-out forwards'
					
					const coordinates = markersRef.current[i].getLngLat()
					const point = map.current.project(coordinates)
					flash.style.transform = `translate(${point.x}px, ${point.y}px)`
					
					mapContainer.current.appendChild(flash)
					setTimeout(() => {
						if (flash.parentNode) {
							flash.parentNode.removeChild(flash)
						}
					}, 1000)
					
					const cities = [
						[72.8777, 19.0760], [77.5946, 12.9716], [77.1025, 28.7041], 
						[88.3639, 22.5726], [80.2707, 13.0827], [73.8567, 18.5204], 
						[78.4867, 17.3850], [76.9366, 8.5241]
					]
					
					const originIndex = Math.floor(Math.random() * cities.length)
					let destIndex = Math.floor(Math.random() * cities.length)
					while (destIndex === originIndex) {
						destIndex = Math.floor(Math.random() * cities.length)
					}
					
					return { 
						origin: cities[originIndex],
						destination: cities[destIndex],
						progress: 0
					}
				}
				
				return { ...ride, progress: newProgress }
			})
			
			setActiveRides(updatedRides)
			
			const features = updatedRides.map(ride => ({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [ride.origin, [
						ride.origin[0] + (ride.destination[0] - ride.origin[0]) * ride.progress,
						ride.origin[1] + (ride.destination[1] - ride.origin[1]) * ride.progress
					]]
				},
				properties: { progress: ride.progress }
			}))
			
			if (map.current && map.current.getSource('routes')) {
				map.current.getSource('routes').setData({
					type: 'FeatureCollection',
					features
				})
			}
			
			animationRef.current = requestAnimationFrame(updateRoutes)
		}
		
		updateRoutes()
	}

	return (
		<div className="flex min-h-screen flex-col bg-gray-900 text-white overflow-hidden">
			<div ref={mapContainer} className="w-full h-[60vh] relative">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
				
				<div className="absolute inset-0 flex items-center justify-center z-20">
					<motion.div 
						className="container mx-auto px-6 flex flex-col items-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
					>
						<motion.h1 
							className="text-5xl md:text-6xl font-bold text-center mb-4 text-white drop-shadow-lg"
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5 }}
						>
							<motion.div 
								className="text-transparent bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text"
								animate={{ 
									backgroundPosition: ['0% center', '100% center', '0% center'],
								}}
								transition={{ 
									duration: 8,
									repeat: Infinity,
									ease: 'linear'
								}}
							>
								Team Heisenberg
							</motion.div>
							<div className="mt-2"><span className='italic'>Our Traveller </span><span className="text-emerald-400">Peak-Hour Optimizer</span></div>
						</motion.h1>
						<motion.p 
							className="text-xl md:text-2xl text-center max-w-3xl mb-8 text-gray-100"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.7 }}
						>
							Intelligent system optimizing supply-demand during peak hours,
							reducing wait times and improving earnings.
						</motion.p>
						
						<motion.div 
							className="flex flex-col sm:flex-row gap-4 mt-6"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
						>
							<motion.button 
								className="btn btn-primary btn-lg"
								onClick={() => router.push('/user/dashboard')}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								Enter as Passenger
							</motion.button>
							<motion.button 
								className="btn btn-secondary btn-lg"
								onClick={() => router.push('/driver/dashboard')}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								Enter as Driver
							</motion.button>
						</motion.div>
					</motion.div>
				</div>
			</div>
			
			<div className="bg-gray-800 py-3 border-t border-b border-gray-700">
				<div className="container mx-auto">
					<div className="flex items-center">
						<motion.div 
							className="flex-shrink-0 px-4 bg-emerald-500 text-white py-1 rounded font-medium"
							animate={{ 
								backgroundColor: ['#10b981', '#059669', '#10b981'],
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<span className='font-bold'>LIVE UPDATES</span>
						</motion.div>
						<div className="ml-4 overflow-hidden h-8 flex items-center">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentUpdateIndex}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.5 }}
									className="text-gray-200 whitespace-nowrap"
								>
									<span className="text-emerald-400 mr-2">•</span>
									<TypeAnimation
										sequence={[RIDE_UPDATES[currentUpdateIndex]]}
										speed={50}
										cursor={false}
									/>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-12 overflow-x-hidden">
				<div className="stats stats-vertical lg:stats-horizontal shadow bg-gray-800 w-full">
					<div className="stat">
						<div className="stat-title text-gray-400">Ride Acceptance</div>
						<motion.div 
							className="stat-value text-primary"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							+24%
						</motion.div>
						<div className="stat-desc text-gray-400">↗︎ During peak hours</div>
					</div>
					
					<div className="stat">
						<div className="stat-title text-gray-400">Wait Time</div>
						<motion.div 
							className="stat-value text-secondary"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
						>
							-32%
						</motion.div>
						<div className="stat-desc text-gray-400">↘︎ Improved efficiency</div>
					</div>
					
					<div className="stat">
						<div className="stat-title text-gray-400">Driver Earnings</div>
						<motion.div 
							className="stat-value text-emerald-400"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.5 }}
						>
							+15%
						</motion.div>
						<div className="stat-desc text-gray-400">↗︎ Due to incentives</div>
					</div>
					
					<div className="stat">
						<div className="stat-title text-gray-400">Daily Rides</div>
						<motion.div 
							className="stat-value text-amber-400"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.5 }}
						>
							32K+
						</motion.div>
						<div className="stat-desc text-gray-400">↗︎ Across India</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<motion.h2 
					className="text-3xl font-bold text-center mb-12 text-white"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					Smart Features
				</motion.h2>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700 hover:border-emerald-500 transition-all"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
					>
						<div className="card-body">
							<motion.div 
								className="text-emerald-400 text-4xl mb-4"
								animate={{ y: [0, -5, 0] }}
								transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</motion.div>
							<h2 className="card-title text-white">Smart Incentives</h2>
							<p className="text-gray-300">GPay-like rewards system with levels, badges, and brand collaborations to motivate drivers.</p>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700 hover:border-emerald-500 transition-all"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
					>
						<div className="card-body">
							<motion.div 
								className="text-emerald-400 text-4xl mb-4"
								animate={{ y: [0, -5, 0] }}
								transition={{ duration: 2, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
								</svg>
							</motion.div>
							<h2 className="card-title text-white">Demand Prediction</h2>
							<p className="text-gray-300">AI-driven heat maps showing high-demand areas with precise time estimates.</p>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700 hover:border-emerald-500 transition-all"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
					>
						<div className="card-body">
							<motion.div 
								className="text-emerald-400 text-4xl mb-4"
								animate={{ y: [0, -5, 0] }}
								transition={{ duration: 2, repeat: Infinity, repeatType: "loop", delay: 0.6 }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</motion.div>
							<h2 className="card-title text-white">Smart Transportation</h2>
							<p className="text-gray-300">Carpooling options, pre-booking, and shuttle services for efficient commuting.</p>
						</div>
					</motion.div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes flash-pulse {
					0% {
						opacity: 1;
						transform: translate(-50%, -50%) scale(0.8);
					}
					50% {
						opacity: 0.6;
						transform: translate(-50%, -50%) scale(1.5);
					}
					100% {
						opacity: 0;
						transform: translate(-50%, -50%) scale(2);
					}
				}
				
				.mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib {
					display: none !important;
				}
				
				.stats:hover {
					overflow: hidden !important;
				}
			`}</style>
		</div>
	)
}