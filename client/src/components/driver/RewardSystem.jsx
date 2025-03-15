'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockRewardsData } from '@/utils/mockRewardsData'
import { mockIcons } from '@/utils/mockData'

export default function RewardSystem({ initialData = null }) {
	const [rewardsData, setRewardsData] = useState(initialData || mockRewardsData)
	const [selectedTab, setSelectedTab] = useState('overview')
	
	const tierProgressPercentage = rewardsData.rewards.points
	const tiers = rewardsData.tierProgress
	const currentTierIndex = tiers.indexOf(rewardsData.rewards.tier)
	
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
									<h3 className="font-bold text-xl text-white">{rewardsData.rewards.tier} Tier</h3>
									<p className="text-gray-300 mt-1">Working towards {rewardsData.rewards.nextTier}</p>
								</div>
								<div className="text-center">
									<span className="text-3xl font-bold text-emerald-400">{rewardsData.driver.points}</span>
									<p className="text-gray-300 text-sm">Total Points</p>
								</div>
							</div>
							
							<div className="mt-5">
								<div className="flex justify-between mb-2 text-sm font-medium">
									<span className="text-gray-300">{rewardsData.rewards.tier}</span>
									<span className="text-gray-300">{rewardsData.rewards.nextTier}</span>
								</div>
								<div className="h-2.5 w-full bg-gray-600 rounded-full overflow-hidden">
									<div 
										className="h-full bg-emerald-500 rounded-full" 
										style={{ width: `${rewardsData.rewards.points}%` }}
									></div>
								</div>
								<div className="flex justify-between mt-2 text-sm">
									<span className="text-emerald-400 font-medium">{rewardsData.rewards.points}% complete</span>
									<span className="text-gray-300">{rewardsData.rewards.pointsToNextTier} points needed</span>
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
							{rewardsData.availableBadges.map(badge => (
								<motion.div 
									key={badge.id}
									className="flex bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 transition-all opacity-90"
									whileHover={{ y: -3, opacity: 1 }}
								>
									<div className="bg-gray-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
										{badge.icon}
									</div>
									<div className="ml-4">
										<h4 className="font-bold text-lg text-white">{badge.name}</h4>
										<p className="text-gray-300 mt-1">{badge.description}</p>
										<div className="mt-3 flex items-center">
											<div className="h-1.5 w-24 bg-gray-600 rounded-full overflow-hidden">
												<div 
													className="h-full bg-emerald-500 rounded-full" 
													style={{ width: `${(badge.progress / badge.total) * 100}%` }}
												></div>
											</div>
											<span className="text-xs text-gray-400 ml-3">
												{typeof badge.progress === 'number' && typeof badge.total === 'number' 
													? badge.progress >= 1000 
														? `₹${badge.progress.toLocaleString()}/₹${badge.total.toLocaleString()}`
														: `${badge.progress}/${badge.total} ${badge.progress >= 1000 ? '' : 'completed'}`
													: '0% complete'
												}
											</span>
										</div>
									</div>
								</motion.div>
							))}
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
													{mockIcons.info}
												</svg>
												<span className="ml-2 text-gray-300">
													Expires in {challenge.id === 'ch1' ? '4' : challenge.id === 'ch2' ? '6' : '4'} days
												</span>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
						
						<h3 className="text-xl font-bold text-white mb-5 mt-10">Upcoming Challenges</h3>
						
						<div className="space-y-4">
							{rewardsData.upcomingChallenges.map(challenge => (
								<motion.div 
									key={challenge.id}
									className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all"
									whileHover={{ y: -3 }}
								>
									<div className="card-body p-5">
										<div className="flex justify-between items-center">
											<h3 className="text-xl font-bold text-white flex items-center gap-2">
												<span className="text-amber-400">{challenge.icon}</span>
												{challenge.name}
											</h3>
											<span className="badge bg-gray-600 text-gray-200">Next Week</span>
										</div>
										<p className="text-gray-300 mt-2">{challenge.description}</p>
										<div className="mt-4 flex justify-between items-center">
											<span className="text-emerald-400 font-medium">Reward: {challenge.reward}</span>
											<button className="btn btn-xs btn-outline border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white">Set Reminder</button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
						
						<div className="alert bg-gray-800 mt-6 border-l-4 border-emerald-500">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
								{mockIcons.info}
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
								Current: {rewardsData.rewards.tier}
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
										const isCurrentTier = tier === rewardsData.rewards.tier;
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
																{mockIcons.check}
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
													<ul className="list-disc list-inside space-y-1">
														{rewardsData.tierRequirements[tier].map((req, i) => (
															<li key={i}>{req}</li>
														))}
													</ul>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						
						<h3 className="text-xl font-bold text-white mb-5 mt-8">Partner Benefits</h3>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{rewardsData.partnerBenefits.map(benefit => (
								<div key={benefit.id} className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
									<div className="card-body p-5">
										<h3 className="card-title text-white flex items-center gap-2">
											<span className="text-amber-400">{benefit.icon}</span>
											{benefit.name}
										</h3>
										<div className="p-3 bg-gray-800 rounded-md mt-3">
											<div className="flex items-center">
												<div className="bg-emerald-500 bg-opacity-30 p-3 rounded-full">
													<span className="text-2xl">{benefit.icon}</span>
												</div>
												<div className="ml-3">
													<p className="text-gray-300 mb-1">{benefit.description}</p>
													<p className="text-sm text-emerald-400">{benefit.tier} Tier Benefit</p>
												</div>
											</div>
											<div className="mt-3 flex justify-between items-center">
												<div className="flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
														{mockIcons.info}
													</svg>
													<span className="ml-1 text-xs text-gray-400">Valid till {benefit.validUntil}</span>
												</div>
												<button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none">Activate</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
						
						<div className="mt-8 space-y-4">
							<h3 className="text-xl font-bold text-white mb-3">Upcoming Benefits</h3>
							
							{rewardsData.upcomingBenefits.map(benefit => (
								<div key={benefit.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
									<div className="flex justify-between items-center">
										<h4 className="font-bold text-white text-lg flex items-center gap-2">
											<span className="text-amber-400">{benefit.icon}</span>
											{benefit.name}
										</h4>
										<div className="badge bg-purple-500 text-white">{benefit.tier} Tier</div>
									</div>
									<p className="text-gray-300 mt-2">{benefit.description}</p>
									<div className="mt-3 flex items-center">
										<span className="text-gray-400 text-sm">Available when you reach {benefit.tier} tier</span>
										<span className="ml-3 badge badge-sm bg-emerald-500 text-white">+{rewardsData.rewards.pointsToNextTier} points needed</span>
									</div>
								</div>
							))}
						</div>
						
						<div className="flex justify-center mt-8">
							<div className="stats shadow bg-gray-800 border border-gray-700">
								<div className="stat">
									<div className="stat-figure text-emerald-400">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											{mockIcons.info}
										</svg>
									</div>
									<div className="stat-title text-gray-400">Money Saved</div>
									<div className="stat-value text-emerald-400">₹{rewardsData.rewardsStats.moneySaved}</div>
									<div className="stat-desc text-gray-400">Via {rewardsData.rewards.tier} tier benefits</div>
								</div>
								
								<div className="stat">
									<div className="stat-figure text-emerald-400">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											{mockIcons.check}
										</svg>
									</div>
									<div className="stat-title text-gray-400">Active Benefits</div>
									<div className="stat-value text-emerald-400">{rewardsData.rewardsStats.activeBenefits}</div>
									<div className="stat-desc text-gray-400">Out of {rewardsData.rewardsStats.totalAvailableBenefits} available</div>
								</div>
							</div>
						</div>
						
						<div className="alert bg-gray-800 mt-6 border-l-4 border-emerald-500">
							<svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
								{mockIcons.check}
							</svg>
							<div>
								<h3 className="font-bold text-white">Pro Tip</h3>
								<div className="text-gray-300">{rewardsData.challengesTips}</div>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	)
}