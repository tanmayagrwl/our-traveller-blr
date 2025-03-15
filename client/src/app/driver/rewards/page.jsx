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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Rewards & Incentives</h1>
        
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-gray-800">
            <a 
              className={`tab ${activeSection === 'main' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
              onClick={() => setActiveSection('main')}
            >
              Main Dashboard
            </a>
            <a 
              className={`tab ${activeSection === 'system' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
              onClick={() => setActiveSection('system')}
            >
              Reward System
            </a>
            <a 
              className={`tab ${activeSection === 'calculator' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
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
              <div className="card bg-gray-800 shadow-xl mb-6 border border-gray-700">
                <div className="card-body">
                  <div className="avatar flex justify-center">
                    <div className="w-24 rounded-full ring ring-emerald-500 ring-offset-base-100 ring-offset-2">
                      <img src={driverData.driver.profileImage} alt="Driver profile" />
                    </div>
                  </div>
                  
                  <h2 className="card-title text-center mt-4 text-white font-bold">{driverData.driver.name}</h2>
                  <p className="text-center text-gray-400">Driver since {driverData.driver.joiningDate}</p>
                  
                  <div className="mt-4">
                    <p className="font-bold text-gray-200">Current Tier: <span className="text-emerald-400">{driverData.rewards.tier}</span></p>
                    <progress 
                      className="progress w-full bg-gray-700 mt-2" 
                      value={driverData.rewards.points} 
                      max="100"
                    ></progress>
                    <p className="text-sm text-right text-gray-400">{driverData.rewards.points}% to {driverData.rewards.nextTier}</p>
                  </div>
                  
                  <div className="stats stats-vertical bg-gray-700 shadow mt-6 text-gray-100">
                    <div className="stat">
                      <div className="stat-title text-gray-400 font-medium">Total Points</div>
                      <div className="stat-value text-emerald-400">{driverData.driver.points}</div>
                      <div className="stat-desc text-gray-400">↗︎ {driverData.rewards.weeklyPointsGained} points this week</div>
                    </div>
                    
                    <div className="stat">
                      <div className="stat-title text-gray-400 font-medium">Badges Earned</div>
                      <div className="stat-value text-white">{driverData.badges.length}</div>
                      <div className="stat-desc text-gray-400">↗︎ {driverData.rewards.monthlyBadgesGained} new this month</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {driverData.badges.map((badge) => (
                      <div key={badge.id} className="badge bg-gray-700 text-gray-200 p-3 font-medium">{badge.name}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="card bg-gray-800 shadow-xl border border-gray-700">
                <div className="card-body">
                  <div className="tabs tabs-boxed bg-gray-700 mb-6">
                    <a 
                      className={`tab ${selectedTab === 'rewards' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('rewards')}
                    >
                      Reward Levels
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'brands' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('brands')}
                    >
                      Brand Collaborations
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'challenges' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
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
                        <table className="table bg-gray-700 text-gray-200">
                          <thead className="text-gray-200 bg-gray-800">
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
                                status = <div className="badge bg-emerald-500 text-white font-medium">Completed</div>;
                              } else if (index === currentTierIndex) {
                                status = <div className="badge bg-amber-500 text-white font-medium">In Progress</div>;
                              } else {
                                status = <div className="badge bg-gray-700 text-gray-300 border border-gray-600">Locked</div>;
                              }
                              
                              return (
                                <tr 
                                  key={tier} 
                                  className={`bg-gray-700 hover:bg-gray-600 ${index === currentTierIndex ? 'bg-emerald-900 bg-opacity-30' : ''}`}
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
                          <div key={brand.id} className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                            <div className="card-body">
                              <h3 className="card-title text-white">{brand.category}</h3>
                              <div className="flex gap-2 mt-2">
                                <div className="avatar">
                                  <div className="w-16 rounded">
                                    <img src={brand.logo} alt={brand.name} />
                                  </div>
                                </div>
                                <div>
                                  <p className="font-bold text-gray-200">{brand.name}</p>
                                  <p className="text-sm text-gray-300">{brand.description}</p>
                                  <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-2 font-medium">Redeem</button>
                                </div>
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
                          <div key={challenge.id} className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                            <div className="card-body">
                              <h3 className="card-title text-white">{challenge.name}</h3>
                              <p className="text-gray-300">{challenge.description}</p>
                              <progress 
                                className="progress mt-2 bg-gray-600" 
                                value={challenge.progress} 
                                max={challenge.total}
                              ></progress>
                              <p className="text-sm text-right text-gray-400">{challenge.progress}/{challenge.total} completed</p>
                              <div className="card-actions justify-end mt-2">
                                <div className="badge bg-gray-600 text-gray-300 font-medium">
                                  {challenge.reward.includes('points') ? challenge.reward.split(' ')[0] + ' points' : ''}
                                </div>
                                {challenge.reward.includes('bonus') && (
                                  <div className="badge bg-emerald-500 text-white font-medium">{challenge.reward.split('+ ')[1]}</div>
                                )}
                                {challenge.badge && (
                                  <div className="badge bg-purple-500 text-white font-medium">New Badge</div>
                                )}
                              </div>
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