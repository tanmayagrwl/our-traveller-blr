'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function IncentiveCalculator({ 
	baseRate = 50,
	driverTier = 'Gold',
	peakMultiplier = 1.5,
	standPickup = false
}) {
	const [distance, setDistance] = useState(5)
	const [isPeakHour, setIsPeakHour] = useState(true)
	const [useStand, setUseStand] = useState(standPickup)
	const [calculated, setCalculated] = useState(false)
	const [fareDetails, setFareDetails] = useState(null)
	
	const tierBenefits = {
		Bronze: { bonusPoints: 5, peakBonus: 0.05 },
		Silver: { bonusPoints: 10, peakBonus: 0.08 },
		Gold: { bonusPoints: 15, peakBonus: 0.12 },
		Platinum: { bonusPoints: 20, peakBonus: 0.15 },
		Diamond: { bonusPoints: 25, peakBonus: 0.20 }
	}
	
	const calculateFare = () => {
		const perKmRate = 12
		const baseFare = baseRate
		const distanceFare = distance * perKmRate
		
		let standardFare = baseFare + distanceFare
		
		let peakFare = 0
		if (isPeakHour) {
			peakFare = standardFare * (peakMultiplier - 1)
		}
		
		let standBonus = 0
		if (useStand) {
			standBonus = standardFare * 0.05
		}
		
		const tierBonus = isPeakHour ? standardFare * tierBenefits[driverTier].peakBonus : 0
		const bonusPoints = tierBenefits[driverTier].bonusPoints + (isPeakHour ? 10 : 0) + (useStand ? 5 : 0)
		
		const totalFare = standardFare + peakFare + standBonus + tierBonus
		
		setFareDetails({
			baseFare,
			distanceFare,
			peakFare,
			standBonus,
			tierBonus,
			totalFare,
			bonusPoints,
			estimatedTime: Math.round(distance * 2.5)
		})
		
		setCalculated(true)
	}
	
	useEffect(() => {
		calculateFare()
	}, [])
	
	useEffect(() => {
		if (calculated) {
			calculateFare()
		}
	}, [distance, isPeakHour, useStand])
	
	const popularRoutes = [
		{ from: 'Koramangala', to: 'Indiranagar', avgDistance: 6 },
		{ from: 'Whitefield', to: 'Electronic City', avgDistance: 22 },
		{ from: 'HSR Layout', to: 'MG Road', avgDistance: 11 },
		{ from: 'Airport', to: 'Sarjapur', avgDistance: 45 },
		{ from: 'JP Nagar', to: 'Marathahalli', avgDistance: 15 },
		{ from: 'Jayanagar', to: 'Hebbal', avgDistance: 13 }
	]
	
	return (
		<motion.div 
			className="card bg-gray-800 shadow-xl border border-gray-700 overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="card-body p-6">
				<h2 className="card-title text-2xl text-white mb-4">Fare & Incentives Calculator</h2>
				
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="space-y-6">
						<div className="bg-gray-750 rounded-lg p-5 border border-gray-600">
							<h3 className="font-medium text-lg text-white mb-4">Trip Details</h3>
							
							<div className="form-control mb-5">
								<label className="label">
									<span className="label-text text-gray-300 font-medium">Distance (km)</span>
									<span className="label-text-alt text-emerald-400">{distance} km</span>
								</label>
								<input 
									type="range" 
									min="1" 
									max="50" 
									step="1"
									value={distance} 
									onChange={(e) => setDistance(parseInt(e.target.value))}
									className="range range-sm range-primary bg-gray-700" 
								/>
								<div className="w-full flex justify-between text-xs px-2 text-gray-400 mt-1">
									<span>1km</span>
									<span>10km</span>
									<span>20km</span>
									<span>30km</span>
									<span>40km</span>
									<span>50km</span>
								</div>
							</div>
							
							<div className="form-control my-4">
								<label className="label cursor-pointer justify-start gap-3">
									<span className="label-text text-gray-300 font-medium">Peak Hour Trip</span> 
									<input 
										type="checkbox" 
										className="toggle toggle-sm toggle-primary bg-gray-700" 
										checked={isPeakHour} 
										onChange={() => setIsPeakHour(!isPeakHour)} 
									/>
									{isPeakHour && <span className="text-xs text-emerald-400">+50% fare</span>}
								</label>
								<p className="text-xs text-gray-400 mt-1 ml-6">Peak hours: 8-10 AM, 5-8 PM on weekdays</p>
							</div>
							
							<div className="form-control my-4">
								<label className="label cursor-pointer justify-start gap-3">
									<span className="label-text text-gray-300 font-medium">Pickup from Stand</span> 
									<input 
										type="checkbox" 
										className="toggle toggle-sm toggle-primary bg-gray-700" 
										checked={useStand} 
										onChange={() => setUseStand(!useStand)} 
									/>
									{useStand && <span className="text-xs text-emerald-400">+5% bonus</span>}
								</label>
								<p className="text-xs text-gray-400 mt-1 ml-6">Official pickup points in high-traffic areas</p>
							</div>
						</div>
						
						<div className="bg-gray-750 rounded-lg p-5 border border-gray-600">
							<h3 className="font-medium text-lg text-white mb-4">Popular Routes</h3>
							<div className="overflow-x-auto max-h-56 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
								<table className="table table-sm table-zebra bg-transparent text-gray-300">
									<thead className="sticky top-0 bg-gray-750 z-10">
										<tr className="border-b border-gray-600">
											<th className="text-xs font-medium uppercase">From</th>
											<th className="text-xs font-medium uppercase">To</th>
											<th className="text-xs font-medium uppercase text-right">Distance</th>
											<th className="text-xs font-medium uppercase text-right">Approx. Fare</th>
										</tr>
									</thead>
									<tbody>
										{popularRoutes.map((route, index) => {
											const routeBaseFare = baseRate + (route.avgDistance * 12);
											const estimatedFare = Math.round(routeBaseFare * (isPeakHour ? peakMultiplier : 1));
											
											return (
												<tr 
													key={index} 
													className="hover:bg-gray-700 cursor-pointer border-b border-gray-700"
													onClick={() => setDistance(route.avgDistance)}
												>
													<td>{route.from}</td>
													<td>{route.to}</td>
													<td className="text-right">{route.avgDistance} km</td>
													<td className="text-right text-emerald-400">₹{estimatedFare}</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
					
					<div>
						{fareDetails && (
							<motion.div 
								className="bg-gray-750 p-5 rounded-lg border border-gray-600 h-full"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.2 }}
							>
								<h3 className="font-bold text-xl mb-5 text-white">Trip Summary</h3>
								
								<div className="space-y-5">
									<div className="bg-gray-800 rounded-lg p-4">
										<div className="flex justify-between items-center">
											<h4 className="text-gray-300 font-medium">Base Fare</h4>
											<span className="text-white font-medium">₹{fareDetails.baseFare.toFixed(2)}</span>
										</div>
										<div className="divider my-2"></div>
										<div className="flex justify-between items-center">
											<h4 className="text-gray-300 flex gap-2 items-center">
												Distance Fare
												<span className="text-xs text-gray-400">({distance} km × ₹12/km)</span>
											</h4>
											<span className="text-white font-medium">₹{fareDetails.distanceFare.toFixed(2)}</span>
										</div>
									</div>
									
									<div className="bg-gray-800 rounded-lg p-4">
										<h4 className="text-emerald-300 font-medium mb-2">Bonuses & Incentives</h4>
										
										{isPeakHour && (
											<div className="flex justify-between items-center mt-2">
												<span className="text-gray-300 flex gap-2 items-center">
													Peak Hour Bonus
													<span className="badge badge-xs bg-emerald-500">+50%</span>
												</span>
												<span className="text-emerald-300">₹{fareDetails.peakFare.toFixed(2)}</span>
											</div>
										)}
										
										{useStand && (
											<div className="flex justify-between items-center mt-2">
												<span className="text-gray-300 flex gap-2 items-center">
													Stand Pickup Bonus
													<span className="badge badge-xs bg-emerald-500">+5%</span>
												</span>
												<span className="text-emerald-300">₹{fareDetails.standBonus.toFixed(2)}</span>
											</div>
										)}
										
										<div className="flex justify-between items-center mt-2">
											<span className="text-gray-300 flex gap-2 items-center">
												{driverTier} Tier Bonus
												<span className="badge badge-xs bg-emerald-500">
													+{(tierBenefits[driverTier].peakBonus * 100).toFixed(0)}%
												</span>
											</span>
											<span className="text-emerald-300">₹{fareDetails.tierBonus.toFixed(2)}</span>
										</div>
									</div>
									
									<div className="bg-emerald-900 bg-opacity-30 rounded-lg p-4 border border-emerald-700">
										<div className="flex justify-between items-center">
											<h4 className="text-white font-bold">Total Fare</h4>
											<span className="text-2xl font-bold text-emerald-400">₹{fareDetails.totalFare.toFixed(2)}</span>
										</div>
										<div className="flex justify-between items-center mt-3">
											<h4 className="text-emerald-300 font-medium">Reward Points</h4>
											<span className="badge badge-md bg-emerald-500 text-white font-medium">+{fareDetails.bonusPoints} points</span>
										</div>
									</div>
									
									<div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-2">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<span className="text-gray-300">Estimated Trip Time</span>
											</div>
											<span className="text-white">{fareDetails.estimatedTime} minutes</span>
										</div>
										
										<div className="flex justify-between items-center mt-3">
											<div className="flex items-center gap-2">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												<span className="text-gray-300">Traffic Conditions</span>
											</div>
											<span className="text-yellow-400">Moderate</span>
										</div>
									</div>
									
									<div className="alert alert-sm bg-gray-800 border-l-4 border-emerald-500">
										<svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 h-6 w-6" fill="none" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<div>
											<p className="text-xs text-gray-300">Based on current traffic conditions in Bangalore</p>
											<p className="text-xs text-gray-400">Actual fare may vary slightly with road conditions</p>
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	)
}