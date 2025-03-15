'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import HeatMap from '@/components/maps/HeatMap'
import { motion } from 'framer-motion'

export default function DriverHeatmap() {
	const [timeOfDay, setTimeOfDay] = useState('morning')
	const [recommendations, setRecommendations] = useState({
		block_recommendations: [],
		hourly_recommendations: [],
		top_recommendation: '',
		time_block: '',
		time_of_day: ''
	})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [driverLocation, setDriverLocation] = useState({ lat: 12.9716, lng: 77.5946 })

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				// const response = await fetch('https://66qj4qkb-5001.inc1.devtunnels.ms/api/get-recommendations?time=19:00')
				
				// if (!response.ok) {
				// 	throw new Error('Failed to fetch heatmap data')
				// }
				
				// const data = await response.json()
                const data = {
                    "block_recommendations": [
                      "Hebbal",
                      "B. T. M. Layout",
                      "Bangalore South",
                      "Ramanagaram",
                      "Govindraj Nagar"
                    ],
                    "hour": 19,
                    "hourly_recommendations": [
                      "Hoskote",
                      "Padmanabhanagar",
                      "Hebbal",
                      "Sarvagnanagar",
                      "Basavanagudi"
                    ],
                    "status": "success",
                    "time_block": "evening",
                    "time_input": "19:00",
                    "time_of_day": "19-20",
                    "top_recommendation": "Hoskote"
                  }
				setRecommendations(data)
				setError(null)
			} catch (err) {
				console.error('Error processing data:', err)
				setError('Failed to load data. Please try again later.')
			} finally {
				setIsLoading(false)
			}
		}
		
		fetchData()
	}, [timeOfDay])
	
	const handleTimeChange = (time) => {
		setTimeOfDay(time)
	}
	
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				<div className="text-center">
					<div className="loading loading-spinner loading-lg text-emerald-500"></div>
					<p className="mt-4">Loading heatmap data...</p>
				</div>
			</div>
		)
	}
	
	if (error) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				<div className="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			</div>
		)
	}
	
	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<Navbar />
			
			<div className="container mx-auto px-4 py-8">
				<motion.h1 
					className="text-3xl font-bold mb-6 text-white"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					Driver Recommendations
				</motion.h1>
				
				<motion.div 
					className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="card-body">
						<div className="flex flex-wrap items-center justify-between mb-4">
							<h2 className="card-title text-white">Heat Map: {recommendations.time_block || 'Current Time'}</h2>
							
							<div className="form-control">
								<div className="join">
									<motion.button 
										className={`btn join-item ${timeOfDay === 'morning' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
										onClick={() => handleTimeChange('morning')}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										Morning (8-10 AM)
									</motion.button>
									<motion.button 
										className={`btn join-item ${timeOfDay === 'afternoon' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
										onClick={() => handleTimeChange('afternoon')}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										Afternoon (1-3 PM)
									</motion.button>
									<motion.button 
										className={`btn join-item ${timeOfDay === 'evening' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
										onClick={() => handleTimeChange('evening')}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										Evening (5-8 PM)
									</motion.button>
								</div>
							</div>
						</div>
						
						<div className="h-[70vh] w-full rounded-lg overflow-hidden">
							<HeatMap 
								hourlyRecommendations={recommendations.hourly_recommendations} 
								blockRecommendations={recommendations.block_recommendations}
								driverLocation={driverLocation}
								topRecommendation={recommendations.top_recommendation}
							/>
						</div>
						
						<div className="alert bg-gray-700 mt-4 border border-gray-600">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span className="text-gray-200">
								Top recommendation: <span className="text-emerald-400 font-bold">{recommendations.top_recommendation}</span> (Time: {recommendations.time_of_day})
							</span>
						</div>
					</div>
				</motion.div>
				
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<div className="card-body">
							<h2 className="card-title text-white">Hourly Recommendations</h2>
							
							<div className="overflow-x-auto">
								<table className="table bg-gray-700 text-gray-200">
									<thead className="text-gray-200">
										<tr>
											<th>Rank</th>
											<th>Area</th>
											<th>Intensity</th>
										</tr>
									</thead>
									<tbody>
										{recommendations.hourly_recommendations.map((area, index) => (
											<tr key={index} className="hover:bg-gray-600">
												<td className="text-white">#{index + 1}</td>
												<td>{area}</td>
												<td>
													<progress 
														className="progress bg-gray-600" 
														style={{ 
															color: index === 0 ? "#ef4444" : 
																   index === 1 ? "#f97316" : 
																   index === 2 ? "#f59e0b" : 
																   index === 3 ? "#eab308" : "#facc15" 
														}} 
														value={100 - (index * 20)} 
														max="100"
													></progress>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</motion.div>
					
					<motion.div 
						className="card bg-gray-800 shadow-xl border border-gray-700"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<div className="card-body">
							<h2 className="card-title text-white">Block Recommendations</h2>
							
							<div className="overflow-x-auto">
								<table className="table bg-gray-700 text-gray-200">
									<thead className="text-gray-200">
										<tr>
											<th>Rank</th>
											<th>Area</th>
											<th>Intensity</th>
										</tr>
									</thead>
									<tbody>
										{recommendations.block_recommendations.map((area, index) => (
											<tr key={index} className="hover:bg-gray-600">
												<td className="text-white">#{index + 1}</td>
												<td>{area}</td>
												<td>
													<progress 
														className="progress bg-gray-600" 
														style={{ 
															color: index === 0 ? "#ef4444" : 
																   index === 1 ? "#f97316" : 
																   index === 2 ? "#f59e0b" : 
																   index === 3 ? "#eab308" : "#facc15" 
														}} 
														value={100 - (index * 20)} 
														max="100"
													></progress>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							
							<div className="divider bg-gray-700"></div>
							
							<h3 className="font-bold text-white">Current Time: {recommendations.time_input || 'N/A'}</h3>
							<h3 className="font-bold text-white">Hour: {recommendations.hour || 'N/A'}</h3>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}