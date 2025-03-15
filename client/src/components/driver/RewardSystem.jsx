'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function RewardSystem({ initialData = null }) {
	const defaultData = {
		points: 785,
		tier: 'Gold',
		nextTier: 'Platinum',
		pointsToNextTier: 215,
		badges: [
			{ id: 1, name: 'Peak Hero', description: 'Completed 50+ rides during peak hours in Koramangala', icon: '🌟' },
			{ id: 2, name: 'Weekend Warrior', description: 'Maintained 90%+ acceptance rate on weekends', icon: '🏆' },
			{ id: 3, name: '5-Star Driver', description: 'Maintained a 5-star rating for 30+ consecutive rides', icon: '⭐' },
			{ id: 4, name: 'Marathon Driver', description: 'Completed 1000+ rides in total across Bangalore', icon: '🏃' },
			{ id: 5, name: 'Passenger Favorite', description: 'Received 50+ compliments from passengers', icon: '❤️' }
		],
		challenges: [
			{ id: 1, name: 'Peak Hour Hero', progress: 4, total: 10, reward: '50 points', description: 'Complete 10 rides during peak hours in Koramangala this week' },
			{ id: 2, name: 'Perfect Rating', progress: 12, total: 20, reward: '75 points', description: 'Maintain a 5-star rating for 20 consecutive rides' },
			{ id: 3, name: 'Distance Champion', progress: 310, total: 500, reward: '100 points', description: 'Complete rides totaling 500 km across Bangalore this week' }
		],
		tierBenefits: {
			Bronze: ['Basic rewards', '5% off on fuel', 'App priority during normal hours'],
			Silver: ['8% off on fuel', '10% off vehicle maintenance', 'Priority customer support'],
			Gold: ['12% off on fuel', '15% off vehicle maintenance', 'Vehicle insurance benefits', 'App priority during peak hours'],
			Platinum: ['15% off on fuel', '20% off vehicle maintenance', 'Healthcare benefits', 'Educational scholarships for children', 'Top-tier app priority'],
			Diamond: ['20% off on fuel', '25% off vehicle maintenance', 'Premium healthcare package', 'Vehicle upgrade assistance', 'Exclusive access to premium riders']
		}
	}
	
	const [rewardsData, setRewardsData] = useState(initialData || defaultData)
	const [selectedTab, setSelectedTab] = useState('overview')
	
	const tierProgressPercentage = Math.round((rewardsData.points / (rewardsData.points + rewardsData.pointsToNextTier)) * 100)
	const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
	const currentTierIndex = tiers.indexOf(rewardsData.tier)
	
	const badges = rewardsData.badges || []
	const challenges = rewardsData.challenges || []
	const tierBenefits = rewardsData.tierBenefits || {}
	
	return (
		<div className="card bg-gray-800 shadow-xl border border-gray-700">
			<div className="card-body p-6">
				<h2 className="card-title text-xl font-bold text-white mb-4">Rewards & Incentives System</h2>
				
				<div className="tabs tabs-boxed bg-gray-700 mb-6 p-1 rounded-lg">
					<button 
						className={`tab text-base transition-colors duration-200 ${selectedTab === 'overview' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300 hover:text-white'}`}
						onClick={() => setSelectedTab('overview')}
					>
						Overview
					</button>
					<button 
						className={`tab text-base transition-colors duration-200 ${selectedTab === 'badges' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300 hover:text-white'}`}
						onClick={() => setSelectedTab('badges')}
					>
						Badges
					</button>
					<button 
						className={`tab text-base transition-colors duration-200 ${selectedTab === 'challenges' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300 hover:text-white'}`}
						onClick={() => setSelectedTab('challenges')}
					>
						Challenges
					</button>
					<button 
						className={`tab text-base transition-colors duration-200 ${selectedTab === 'benefits' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300 hover:text-white'}`}
						onClick={() => setSelectedTab('benefits')}
					>
						Benefits
					</button>
				</div>
				
				{/* OVERVIEW TAB */}
				{selectedTab === 'overview' && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="bg-gray-700 rounded-lg p-5 border border-gray-600 mb-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-bold text-xl text-white">{rewardsData.tier} Tier</h3>
									<p className="text-gray-300 mt-1">Working towards {rewardsData.nextTier}</p>
								</div>
								<div className="text-center">
									<span className="text-3xl font-bold text-emerald-400">{rewardsData.points}</span>
									<p className="text-gray-300 text-sm">Total Points</p>
								</div>
							</div>
							
							<div className="mt-5">
								<div className="flex justify-between mb-2 text-sm font-medium">
									<span className="text-gray-300">{rewardsData.tier}</span>
									<span className="text-gray-300">{rewardsData.nextTier}</span>
								</div>
								<div className="h-2.5 w-full bg-gray-600 rounded-full overflow-hidden">
									<div 
										className="h-full bg-emerald-500 rounded-full" 
										style={{ width: `${tierProgressPercentage}%` }}
									></div>
								</div>
								<div className="flex justify-between mt-2 text-sm">
									<span className="text-emerald-400 font-medium">{rewardsData.points} points</span>
									<span className="text-gray-300">{rewardsData.pointsToNextTier} points needed</span>
								</div>
							</div>
						</div>
						
						<div className="mb-8">
							<ul className="steps steps-horizontal w-full">
								{tiers.map((tier, index) => (
									<li 
										key={tier} 
										className={`step ${index <= currentTierIndex ? 'step-primary' : ''} text-sm font-medium ${index <= currentTierIndex ? 'text-white' : 'text-gray-400'}`}
									>
										{tier}
									</li>
								))}
							</ul>
						</div>
						
						<div className="mb-8">
							<h3 className="text-lg font-bold text-white mb-4 flex items-center">
								<span className="mr-2">Your Badges</span>
								<span className="badge badge-sm bg-emerald-500 text-white">{badges.length}</span>
							</h3>
							
							<div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
								{badges.map(badge => (
									<div 
										key={badge.id} 
										className="flex flex-col items-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all duration-200"
										data-tip={badge.description}
									>
										<span className="text-2xl mb-2">{badge.icon}</span>
										<span className="text-sm text-gray-200 text-center font-medium">{badge.name}</span>
									</div>
								))}
							</div>
						</div>
						
						<div>
							<h3 className="text-lg font-bold text-white mb-4 flex items-center">
								<span className="mr-2">Active Challenges</span>
								<span className="badge badge-sm bg-emerald-500 text-white">{challenges.length}</span>
							</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								{challenges.map(challenge => (
									<motion.div 
										key={challenge.id} 
										className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all"
										whileHover={{ y: -5 }}
									>
										<div className="flex justify-between items-start">
											<h4 className="font-bold text-white text-lg">
												{challenge.name}
											</h4>
											<span className="badge bg-gray-600 text-emerald-400 font-medium">
												{challenge.reward}
											</span>
										</div>
										
										<p className="text-gray-300 mt-2 mb-3">{challenge.description}</p>
										
										<div className="mt-3">
											<div className="h-2 w-full bg-gray-600 rounded-full overflow-hidden">
												<div 
													className="h-full bg-emerald-500 rounded-full" 
													style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
												></div>
											</div>
											<div className="flex justify-between text-sm mt-2">
												<span className="text-gray-300">{challenge.progress}/{challenge.total} completed</span>
												<span className="text-emerald-400">{Math.round((challenge.progress / challenge.total) * 100)}%</span>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				)}
				
				{/* BADGES TAB */}
				{selectedTab === 'badges' && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className="text-xl font-bold text-white mb-5">Your Earned Badges</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
							{badges.map(badge => (
								<motion.div 
									key={badge.id} 
									className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all"
									whileHover={{ y: -3 }}
								>
									<div className="bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
										{badge.icon}
									</div>
									<div className="ml-4">
										<h4 className="font-bold text-lg text-white">{badge.name}</h4>
										<p className="text-gray-300 mt-1">{badge.description}</p>
									</div>
								</motion.div>
							))}
						</div>
						
						<h3 className="text-xl font-bold text-white mb-5 mt-10">Available Badges</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<motion.div 
								className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all opacity-90"
								whileHover={{ y: -3, opacity: 1 }}
							>
								<div className="bg-gray-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
									🌙
								</div>
								<div className="ml-4">
									<h4 className="font-bold text-lg text-white">Night Owl</h4>
									<p className="text-gray-300 mt-1">Complete 30+ rides after 10 PM in Indiranagar</p>
									<div className="mt-3 flex items-center">
										<div className="h-1.5 w-24 bg-gray-600 rounded-full overflow-hidden">
											<div className="h-full bg-emerald-500 rounded-full w-1/5"></div>
										</div>
										<span className="text-xs text-gray-400 ml-3">6/30 completed</span>
									</div>
								</div>
							</motion.div>
							
							<motion.div 
								className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all opacity-90"
								whileHover={{ y: -3, opacity: 1 }}
							>
								<div className="bg-gray-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
									🏆
								</div>
								<div className="ml-4">
									<h4 className="font-bold text-lg text-white">Top Earner</h4>
									<p className="text-gray-300 mt-1">Earn ₹10,000+ in a single week in Whitefield</p>
									<div className="mt-3 flex items-center">
										<div className="h-1.5 w-24 bg-gray-600 rounded-full overflow-hidden">
											<div className="h-full bg-emerald-500 rounded-full w-3/5"></div>
										</div>
										<span className="text-xs text-gray-400 ml-3">₹6,240/₹10,000</span>
									</div>
								</div>
							</motion.div>
							
							<motion.div 
								className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all opacity-90"
								whileHover={{ y: -3, opacity: 1 }}
							>
								<div className="bg-gray-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
									⚡
								</div>
								<div className="ml-4">
									<h4 className="font-bold text-lg text-white">Speed Demon</h4>
									<p className="text-gray-300 mt-1">Achieve average pickup time under 3 minutes for 50+ rides</p>
									<div className="mt-3 flex items-center">
										<div className="h-1.5 w-24 bg-gray-600 rounded-full overflow-hidden">
											<div className="h-full bg-emerald-500 rounded-full w-2/5"></div>
										</div>
										<span className="text-xs text-gray-400 ml-3">21/50 rides</span>
									</div>
								</div>
							</motion.div>
							
							<motion.div 
								className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all opacity-90"
								whileHover={{ y: -3, opacity: 1 }}
							>
								<div className="bg-gray-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
									🌱
								</div>
								<div className="ml-4">
									<h4 className="font-bold text-lg text-white">Green Driver</h4>
									<p className="text-gray-300 mt-1">Complete 100+ rides with electric/CNG vehicle in Bengaluru</p>
									<div className="mt-3 flex items-center">
										<div className="h-1.5 w-24 bg-gray-600 rounded-full overflow-hidden">
											<div className="h-full bg-emerald-500 rounded-full w-4/5"></div>
										</div>
										<span className="text-xs text-gray-400 ml-3">82/100 rides</span>
									</div>
								</div>
							</motion.div>
						</div>
					</motion.div>
				)}
				
				{/* CHALLENGES TAB */}
				{selectedTab === 'challenges' && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className="text-xl font-bold text-white mb-5">Weekly Challenges</h3>
						
						<div className="space-y-4 mb-8">
							{challenges.map(challenge => (
								<motion.div 
									key={challenge.id} 
									className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all"
									whileHover={{ y: -3 }}
								>
									<div className="card-body p-5">
										<div className="flex justify-between items-center">
											<h3 className="text-xl font-bold text-white">
												{challenge.name}
											</h3>
											<span className="badge bg-emerald-500 text-white px-3 py-3 font-medium">
												{challenge.reward}
											</span>
										</div>
										
										<p className="text-gray-300 mt-2">{challenge.description}</p>
										
										<div className="mt-4">
											<div className="h-2.5 w-full bg-gray-600 rounded-full overflow-hidden">
												<div 
													className="h-full bg-emerald-500 rounded-full" 
													style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
												></div>
											</div>
											<div className="flex justify-between items-center mt-2">
												<span className="text-gray-300">{challenge.progress}/{challenge.total} completed</span>
												<span className="text-emerald-400 font-bold">{Math.round((challenge.progress / challenge.total) * 100)}%</span>
											</div>
										</div>
										
										<div className="mt-4 bg-gray-800 p-3 rounded-md">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
												</svg>
												<span className="ml-2 text-gray-300">
													{challenge.name === 'Peak Hour Hero' && 'Expires in 4 days'}
													{challenge.name === 'Perfect Rating' && 'Expires in 6 days'}
													{challenge.name === 'Distance Champion' && 'Expires in 4 days'}
												</span>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
						
						<h3 className="text-xl font-bold text-white mb-5 mt-10">Upcoming Challenges</h3>
						
						<div className="space-y-4">
							<motion.div 
								className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all"
								whileHover={{ y: -3 }}
							>
								<div className="card-body p-5">
									<div className="flex justify-between items-center">
										<h3 className="text-xl font-bold text-white flex items-center gap-2">
											<span className="text-amber-400">✈️</span>
											Airport Champion
										</h3>
										<span className="badge bg-gray-600 text-gray-200">Next Week</span>
									</div>
									<p className="text-gray-300 mt-2">Complete 15 airport pickups/drops in a week</p>
									<div className="mt-4 flex justify-between items-center">
										<span className="text-emerald-400 font-medium">Reward: 120 points + ₹500 bonus</span>
										<button className="btn btn-xs btn-outline border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white">Set Reminder</button>
									</div>
								</div>
							</motion.div>
							
							<motion.div 
								className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all"
								whileHover={{ y: -3 }}
							>
								<div className="card-body p-5">
									<div className="flex justify-between items-center">
										<h3 className="text-xl font-bold text-white flex items-center gap-2">
											<span className="text-amber-400">⭐</span>
											Five Star Week
										</h3>
										<span className="badge bg-gray-600 text-gray-200">Next Week</span>
									</div>
									<p className="text-gray-300 mt-2">Maintain consistent 5-star ratings for all rides in a week</p>
									<div className="mt-4 flex justify-between items-center">
										<span className="text-emerald-400 font-medium">Reward: 150 points + "Perfect Driver" badge</span>
										<button className="btn btn-xs btn-outline border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white">Set Reminder</button>
									</div>
								</div>
							</motion.div>
						</div>
						
						<div className="alert bg-gray-800 mt-6 border-l-4 border-emerald-500">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<div>
								<h3 className="font-bold text-white">Challenge Update</h3>
								<div className="text-gray-300">New challenges are added every Monday. Complete them to earn reward points!</div>
							</div>
						</div>
					</motion.div>
				)}
				
				{/* BENEFITS TAB */}
				{selectedTab === 'benefits' && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex justify-between items-center mb-5">
							<h3 className="text-xl font-bold text-white">Tier Benefits</h3>
							<div className="badge badge-lg bg-emerald-500 text-white font-medium px-3 py-3">
								Current: {rewardsData.tier}
							</div>
						</div>
						
						<div className="overflow-x-auto rounded-lg border border-gray-600 mb-8">
							<table className="table table-zebra bg-gray-700 text-gray-200 w-full">
								<thead className="bg-gray-800 text-white">
									<tr>
										<th className="font-bold text-base">Tier</th>
										<th className="font-bold text-base">Benefits</th>
										<th className="font-bold text-base">Requirements</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(tierBenefits).map(([tier, benefits], index) => {
										const isCurrentTier = tier === rewardsData.tier;
										const isPastTier = tiers.indexOf(tier) < currentTierIndex;
										const isFutureTier = tiers.indexOf(tier) > currentTierIndex;
										
										return (
											<tr 
												key={tier} 
												className={`
													border-b border-gray-600 
													${isCurrentTier ? 'bg-emerald-900 bg-opacity-30' : ''}
													${isPastTier ? 'opacity-80' : ''}
													${isFutureTier ? 'opacity-60' : ''}
												`}
											>
												<td className="py-4">
													<div className="font-bold text-lg text-white flex items-center gap-2">
														{tier}
														{isCurrentTier && (
															<div className="badge bg-emerald-500 text-white">Current</div>
														)}
														{isPastTier && (
															<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
																<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
															</svg>
														)}
													</div>
												</td>
												<td className="py-4">
													<ul className="list-disc list-inside space-y-1">
														{benefits.map((benefit, i) => (
															<li key={i} className="text-gray-300">{benefit}</li>
														))}
													</ul>
												</td>
												<td className="py-4 text-gray-300">
													{tier === 'Bronze' && (
														<p>Starting level</p>
													)}
													{tier === 'Silver' && (
														<ul className="list-disc list-inside space-y-1">
															<li>50 rides completed</li>
															<li>4.5+ rating</li>
														</ul>
													)}
													{tier === 'Gold' && (
														<ul className="list-disc list-inside space-y-1">
															<li>200 rides completed</li>
															<li>4.7+ rating</li>
															<li>90%+ acceptance rate</li>
														</ul>
													)}
													{tier === 'Platinum' && (
														<ul className="list-disc list-inside space-y-1">
															<li>500 rides completed</li>
															<li>4.8+ rating</li>
															<li>95%+ acceptance rate</li>
															<li>5+ badges earned</li>
														</ul>
													)}
													{tier === 'Diamond' && (
														<ul className="list-disc list-inside space-y-1">
															<li>1000+ rides completed</li>
															<li>4.9+ rating</li>
															<li>97%+ acceptance rate</li>
															<li>10+ badges earned</li>
														</ul>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						
						<h3 className="text-xl font-bold text-white mb-5 mt-8">Partner Benefits</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
								<div className="card-body p-5">
									<h3 className="card-title text-white flex items-center gap-2">
										<span className="text-amber-400">🏥</span>
										Apollo Healthcare
									</h3>
									<div className="p-3 bg-gray-800 rounded-md mt-3">
										<div className="flex items-center">
											<div className="bg-emerald-500 bg-opacity-30 p-3 rounded-full">
												<span className="text-2xl">🏥</span>
											</div>
											<div className="ml-3">
												<p className="text-gray-300 mb-1">Free health check-up & 15% discount on treatments</p>
												<p className="text-sm text-emerald-400">Gold Tier Benefit</p>
											</div>
										</div>
										<div className="mt-3 flex justify-between items-center">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
												</svg>
												<span className="ml-1 text-xs text-gray-400">Valid till Dec 2025</span>
											</div>
											<button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">Activate</button>
										</div>
									</div>
								</div>
							</div>
							
							<div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
								<div className="card-body p-5">
									<h3 className="card-title text-white flex items-center gap-2">
										<span className="text-amber-400">☕</span>
										Third Wave Coffee
									</h3>
									<div className="p-3 bg-gray-800 rounded-md mt-3">
										<div className="flex items-center">
											<div className="bg-emerald-500 bg-opacity-30 p-3 rounded-full">
												<span className="text-2xl">☕</span>
											</div>
											<div className="ml-3">
												<p className="text-gray-300 mb-1">Buy 1 Get 1 Free on weekdays at all Indiranagar outlets</p>
												<p className="text-sm text-emerald-400">Gold Tier Benefit</p>
											</div>
										</div>
										<div className="mt-3 flex justify-between items-center">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
												</svg>
												<span className="ml-1 text-xs text-gray-400">Valid till Nov 2025</span>
											</div>
											<button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">Activate</button>
										</div>
									</div>
								</div>
							</div>
							
							<div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
								<div className="card-body p-5">
									<h3 className="card-title text-white flex items-center gap-2">
										<span className="text-amber-400">🔧</span>
										Bosch Service
									</h3>
									<div className="p-3 bg-gray-800 rounded-md mt-3">
										<div className="flex items-center">
											<div className="bg-emerald-500 bg-opacity-30 p-3 rounded-full">
												<span className="text-2xl">🔧</span>
											</div>
											<div className="ml-3">
												<p className="text-gray-300 mb-1">15% discount on all vehicle maintenance services</p>
												<p className="text-sm text-emerald-400">Gold Tier Benefit</p>
											</div>
										</div>
										<div className="mt-3 flex justify-between items-center">
											<div className="flex items-center">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
												</svg>
												<span className="ml-1 text-xs text-gray-400">Valid till Jan 2026</span>
											</div>
											<button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">Activate</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						
						<div className="mt-8 space-y-4">
							<h3 className="text-xl font-bold text-white mb-3">Upcoming Benefits</h3>
							
							<div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
								<div className="flex justify-between items-center">
									<h4 className="font-bold text-white text-lg flex items-center gap-2">
										<span className="text-amber-400">🏋️</span>
										Cult.fit Premium Membership
									</h4>
									<div className="badge bg-purple-500 text-white">Platinum Tier</div>
								</div>
								<p className="text-gray-300 mt-2">Get 30% off on annual membership at all Cult.fit locations in Bangalore</p>
								<div className="mt-3 flex items-center">
									<span className="text-gray-400 text-sm">Available when you reach Platinum tier</span>
									<span className="ml-3 badge badge-sm bg-emerald-500 text-white">+215 points needed</span>
								</div>
							</div>
							
							<div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
								<div className="flex justify-between items-center">
									<h4 className="font-bold text-white text-lg flex items-center gap-2">
										<span className="text-amber-400">🏠</span>
										OYO Rooms Discount
									</h4>
									<div className="badge bg-purple-500 text-white">Platinum Tier</div>
								</div>
								<p className="text-gray-300 mt-2">20% discount on stay at OYO Premium Properties across India</p>
								<div className="mt-3 flex items-center">
									<span className="text-gray-400 text-sm">Available when you reach Platinum tier</span>
									<span className="ml-3 badge badge-sm bg-emerald-500 text-white">+215 points needed</span>
								</div>
							</div>
						</div>
						
						<div className="flex justify-center mt-8">
							<div className="stats shadow bg-gray-800 border border-gray-700">
								<div className="stat">
									<div className="stat-figure text-emerald-400">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div className="stat-title text-gray-400">Money Saved</div>
									<div className="stat-value text-emerald-400">₹2,840</div>
									<div className="stat-desc text-gray-400">Via Gold tier benefits</div>
								</div>
								
								<div className="stat">
									<div className="stat-figure text-emerald-400">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
										</svg>
									</div>
									<div className="stat-title text-gray-400">Active Benefits</div>
									<div className="stat-value text-emerald-400">4</div>
									<div className="stat-desc text-gray-400">Out of 6 available</div>
								</div>
							</div>
						</div>
						
						<div className="alert bg-gray-800 mt-6 border-l-4 border-emerald-500">
							<svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div>
								<h3 className="font-bold text-white">Pro Tip</h3>
								<div className="text-gray-300">Focus on peak hour rides in high-demand areas like Electronic City to earn reward points faster!</div>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	)
}