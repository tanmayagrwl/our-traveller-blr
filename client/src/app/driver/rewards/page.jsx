'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import RewardSystem from '@/components/driver/RewardSystem'
import IncentiveCalculator from '@/components/driver/IncentiveCalculator'
import { mockRewardsData } from '@/utils/mockRewardsData'
import { mockIcons } from '@/utils/mockData'

export default function DriverRewards() {
	const [driverData, setDriverData] = useState(mockRewardsData)
	const [selectedTab, setSelectedTab] = useState('rewards')
	const [activeSection, setActiveSection] = useState('main')
	
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<Navbar />
			
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6 text-white">Rewards & Incentives</h1>
				
				<div className="mb-6">
					<div className="tabs tabs-boxed bg-gray-900">
						<a 
							className={`tab ${activeSection === 'main' ? 'bg-emerald-600 text-white font-bold' : 'text-white'}`}
							onClick={() => setActiveSection('main')}
						>
							Main Dashboard
						</a>
						<a 
							className={`tab ${activeSection === 'system' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-300'}`}
							onClick={() => setActiveSection('system')}
						>
							Reward System
						</a>
						<a 
							className={`tab ${activeSection === 'calculator' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-300'}`}
							onClick={() => setActiveSection('calculator')}
						>
							Fare Calculator
						</a>
					</div>
				</div>

				{activeSection === 'main' && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left column - Profile and Stats */}
						<div className="lg:col-span-1">
							<div className="card bg-gray-900 shadow-2xl mb-6 border border-gray-800 rounded-xl overflow-hidden">
								<div className="card-body p-6">
									<div className="avatar flex justify-center">
										<div className="w-24 rounded-full ring ring-emerald-600 ring-offset-base-100 ring-offset-2">
											<img src={driverData.driver.profileImage} alt="Driver profile" />
										</div>
									</div>
									
									<h2 className="card-title text-center mt-4 text-white font-bold">{driverData.driver.name}</h2>
									<p className="text-center text-gray-400">Driver since {driverData.driver.joiningDate}</p>
									
									<div className="mt-4">
										<p className="font-bold text-gray-200">Current Tier: <span className="text-emerald-400">{driverData.rewards.tier}</span></p>
										<div className="w-full bg-gray-800 rounded-full h-2 mt-2">
											<div 
												className="bg-emerald-500 h-2 rounded-full" 
												style={{ width: `${driverData.rewards.points}%` }}
											></div>
										</div>
										<p className="text-sm text-right text-gray-400">{driverData.rewards.points}% to {driverData.rewards.nextTier}</p>
									</div>
									
									<div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 mt-6">
										<div className="grid grid-cols-2 divide-x divide-gray-700">
											<div className="p-4 text-center">
												<p className="text-sm text-gray-400 mb-1">Total Points</p>
												<p className="font-bold text-xl text-emerald-400">{driverData.driver.points}</p>
												<p className="text-xs text-gray-400 mt-1">↗︎ {driverData.rewards.weeklyPointsGained} this week</p>
											</div>
											<div className="p-4 text-center">
												<p className="text-sm text-gray-400 mb-1">Badges</p>
												<p className="font-bold text-xl text-white">{driverData.badges.length}</p>
												<p className="text-xs text-gray-400 mt-1">↗︎ {driverData.rewards.monthlyBadgesGained} new</p>
											</div>
										</div>
									</div>
									
									<div className="flex flex-wrap gap-2 mt-6">
										{driverData.badges.map((badge) => (
											<span 
												key={badge.id} 
												className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700"
											>
												{badge.name}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>
						
						<div className="lg:col-span-2">
							<div className="card bg-gray-900 shadow-2xl border border-gray-800 rounded-xl overflow-hidden">
								<div className="card-body p-6">
									<div className="tabs tabs-boxed bg-gray-800 mb-6">
										<a 
											className={`tab ${selectedTab === 'rewards' ? 'bg-emerald-600 text-white font-bold' : 'text-white'}`}
											onClick={() => setSelectedTab('rewards')}
										>
											Reward Levels
										</a>
										<a 
											className={`tab ${selectedTab === 'brands' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-300'}`}
											onClick={() => setSelectedTab('brands')}
										>
											Brand Collaborations
										</a>
										<a 
											className={`tab ${selectedTab === 'challenges' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-300'}`}
											onClick={() => setSelectedTab('challenges')}
										>
											Challenges
										</a>
									</div>
									
									{selectedTab === 'rewards' && (
										<div>
											<h2 className="text-xl font-bold mb-4 text-white">Reward Levels</h2>
											
											<ul className="steps steps-horizontal w-full mb-6 text-gray-200">
												{driverData.tierProgress.map((tier, index) => (
													<li 
														key={tier} 
														className={`step ${index <= driverData.tierProgress.indexOf(driverData.rewards.tier) ? 'step-primary' : ''} font-medium`}
													>
														{tier}
													</li>
												))}
											</ul>
											
											<div className="overflow-x-auto">
												<table className="table bg-gray-800 text-gray-200 border border-gray-700 rounded-xl overflow-hidden">
													<thead className="text-gray-200 bg-gray-900">
														<tr>
															<th className="font-bold">Level</th>
															<th className="font-bold">Benefits</th>
															<th className="font-bold">Requirements</th>
															<th className="font-bold">Status</th>
														</tr>
													</thead>
													<tbody>
														{driverData.tierProgress.map((tier, index) => {
															const currentTierIndex = driverData.tierProgress.indexOf(driverData.rewards.tier);
															
															let status;
															if (index < currentTierIndex) {
																status = <div className="badge bg-emerald-600 text-white border-0 p-3 font-medium">Completed</div>;
															} else if (index === currentTierIndex) {
																status = <div className="badge bg-amber-600 text-white border-0 p-3 font-medium">In Progress</div>;
															} else {
																status = <div className="badge bg-gray-700 text-gray-300 border border-gray-600 p-3">Locked</div>;
															}
															
															return (
																<tr 
																	key={tier} 
																	className={`hover:bg-gray-700 ${index === currentTierIndex ? 'bg-emerald-900/30' : ''}`}
																>
																	<td>
																		<div className="font-bold text-white">{tier}</div>
																	</td>
																	<td>
																		<ul className="list-disc list-inside text-sm">
																			{driverData.tierBenefits[tier].map((benefit, i) => (
																				<li key={i} className="text-gray-300">{benefit}</li>
																			))}
																		</ul>
																	</td>
																	<td>
																		<ul className="list-disc list-inside text-sm">
																			{driverData.tierRequirements[tier].map((req, i) => (
																				<li key={i} className="text-gray-300">{req}</li>
																			))}
																		</ul>
																	</td>
																	<td>{status}</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											</div>
										</div>
									)}
									
									{selectedTab === 'brands' && (
										<div>
											<h2 className="text-xl font-bold mb-4 text-white">Brand Collaborations</h2>
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{driverData.brandCollaborations.map((brand) => (
													<div key={brand.id} className="bg-gray-800 border border-gray-700 hover:border-emerald-500 rounded-xl p-4 transition-all">
														<h3 className="font-bold text-white mb-2">{brand.category}</h3>
														<div className="flex gap-3">
															<div className="avatar">
																<div className="w-16 rounded">
																	<img src={brand.logo} alt={brand.name} />
																</div>
															</div>
															<div className="flex-1">
																<p className="font-bold text-gray-200">{brand.name}</p>
																<p className="text-sm text-gray-300">{brand.description}</p>
																<button className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 mt-2 rounded-lg font-medium">Redeem</button>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
									
									{selectedTab === 'challenges' && (
										<div>
											<h2 className="text-xl font-bold mb-4 text-white">Weekly Challenges</h2>
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{driverData.challenges.map((challenge) => (
													<div key={challenge.id} className="bg-gray-800 border border-gray-700 hover:border-emerald-500 rounded-xl p-5 transition-all">
														<h3 className="font-bold text-white mb-2">{challenge.name}</h3>
														<p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
														<div className="w-full bg-gray-700 rounded-full h-2">
															<div 
																className="bg-emerald-500 h-2 rounded-full" 
																style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
															></div>
														</div>
														<p className="text-xs text-right text-gray-400 mt-1">{challenge.progress}/{challenge.total} completed</p>
														<div className="flex flex-wrap gap-2 mt-3">
															{challenge.reward.includes('points') && (
																<span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
																	{challenge.reward.split(' ')[0]} points
																</span>
															)}
															{challenge.reward.includes('bonus') && (
																<span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-700">
																	{challenge.reward.split('+ ')[1]}
																</span>
															)}
															{challenge.badge && (
																<span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
																	New Badge
																</span>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
				
				{activeSection === 'system' && (
					<div className="w-full">
						<RewardSystem initialData={driverData} />
					</div>
				)}
				
				{activeSection === 'calculator' && (
					<div className="w-full">
						<IncentiveCalculator 
							baseRate={50}
							driverTier={driverData.rewards.tier}
							peakMultiplier={1.5}
							standPickup={false}
						/>
					</div>
				)}
			</div>
		</div>
	)
}