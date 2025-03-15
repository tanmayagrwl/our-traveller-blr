'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import RewardSystem from '@/components/driver/RewardSystem'
import IncentiveCalculator from '@/components/driver/IncentiveCalculator'
import { DriverDashboard } from '@/utils/response/driver/dashboard'

export default function DriverRewards() {
  const [rewardsData, setRewardsData] = useState(DriverDashboard.rewards)
  const [driverProfile, setDriverProfile] = useState(DriverDashboard)
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
              className={`tab ${activeSection === 'main' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
              onClick={() => setActiveSection('main')}
            >
              Main Dashboard
            </a>
            <a 
              className={`tab ${activeSection === 'system' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
              onClick={() => setActiveSection('system')}
            >
              Reward System
            </a>
            <a 
              className={`tab ${activeSection === 'calculator' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
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
                      <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="Driver profile" />
                    </div>
                  </div>
                  
                  <h2 className="card-title text-center mt-4 text-white">{driverProfile.driver.name}</h2>
                  <p className="text-center text-gray-400">Driver since {driverProfile.joiningDate}</p>
                  
                  <div className="mt-4">
                    <p className="font-bold text-gray-200">Current Tier: <span className="text-emerald-400">{driverProfile.rewards.level}</span></p>
                    <progress 
                      className="progress w-full bg-gray-700 mt-2" 
                      value={driverProfile.rewards.points} 
                      max="100"
                      style={{ "--progress-color": "#10b981" }}
                    ></progress>
                    <p className="text-sm text-right text-gray-400">{driverProfile.rewards.points}% to {driverProfile.rewards.nextLevel}</p>
                  </div>
                  
                  <div className="stats stats-vertical bg-gray-700 shadow mt-6 text-gray-100">
                    <div className="stat">
                      <div className="stat-title text-gray-400">Total Points</div>
                      <div className="stat-value text-emerald-400">{driverProfile.driver.points}</div>
                      <div className="stat-desc text-gray-400">↗︎ 32 points this week</div>
                    </div>
                    
                    <div className="stat">
                      <div className="stat-title text-gray-400">Badges Earned</div>
                      <div className="stat-value text-white">{driverProfile.rewards.badges.length}</div>
                      <div className="stat-desc text-gray-400">↗︎ 2 new this month</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {driverProfile.rewards.badges.map((badge, index) => (
                      <div key={index} className="badge bg-gray-700 text-gray-200">{badge.name}</div>
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
                      className={`tab ${selectedTab === 'rewards' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('rewards')}
                    >
                      Reward Levels
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'brands' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('brands')}
                    >
                      Brand Collaborations
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'challenges' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('challenges')}
                    >
                      Challenges
                    </a>
                  </div>
                  
                  {selectedTab === 'rewards' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Reward Levels</h2>
                      
                      <ul className="steps steps-horizontal w-full mb-6 text-gray-200">
                        <li className="step step-primary">Bronze</li>
                        <li className="step step-primary">Silver</li>
                        <li className="step step-primary">Gold</li>
                        <li className="step">Platinum</li>
                        <li className="step">Diamond</li>
                      </ul>
                      
                      <div className="overflow-x-auto">
                        <table className="table bg-gray-700 text-gray-200">
                          <thead className="text-gray-200">
                            <tr>
                              <th>Level</th>
                              <th>Benefits</th>
                              <th>Requirements</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-700 hover:bg-gray-600">
                              <td>
                                <div className="font-bold text-white">Bronze</div>
                              </td>
                              <td>
                                <ul className="list-disc list-inside text-sm">
                                  <li>Basic rewards</li>
                                  <li>5% off on fuel</li>
                                  <li>App priority during normal hours</li>
                                </ul>
                              </td>
                              <td>Starting level</td>
                              <td>
                                <div className="badge bg-emerald-500 text-white">Completed</div>
                              </td>
                            </tr>
                            <tr className="bg-gray-700 hover:bg-gray-600">
                              <td>
                                <div className="font-bold text-white">Silver</div>
                              </td>
                              <td>
                                <ul className="list-disc list-inside text-sm">
                                  <li>8% off on fuel</li>
                                  <li>10% off vehicle maintenance</li>
                                  <li>Priority customer support</li>
                                </ul>
                              </td>
                              <td>
                                <p>50 rides completed</p>
                                <p>4.5+ rating</p>
                              </td>
                              <td>
                                <div className="badge bg-emerald-500 text-white">Completed</div>
                              </td>
                            </tr>
                            <tr className="bg-gray-700 hover:bg-gray-600">
                              <td>
                                <div className="font-bold text-white">Gold</div>
                              </td>
                              <td>
                                <ul className="list-disc list-inside text-sm">
                                  <li>12% off on fuel</li>
                                  <li>15% off vehicle maintenance</li>
                                  <li>Vehicle insurance benefits</li>
                                  <li>App priority during peak hours</li>
                                </ul>
                              </td>
                              <td>
                                <p>200 rides completed</p>
                                <p>4.7+ rating</p>
                                <p>90%+ acceptance rate</p>
                              </td>
                              <td>
                                <div className="badge bg-emerald-500 text-white">Completed</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-600">
                              <td>
                                <div className="font-bold text-white">Platinum</div>
                              </td>
                              <td>
                                <ul className="list-disc list-inside text-sm">
                                  <li>15% off on fuel</li>
                                  <li>20% off vehicle maintenance</li>
                                  <li>Healthcare benefits</li>
                                  <li>Educational scholarships for children</li>
                                  <li>Top-tier app priority</li>
                                </ul>
                              </td>
                              <td>
                                <p>500 rides completed</p>
                                <p>4.8+ rating</p>
                                <p>95%+ acceptance rate</p>
                                <p>5+ badges earned</p>
                              </td>
                              <td>
                                <div className="badge bg-amber-500 text-white">In Progress</div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-600">
                              <td>
                                <div className="font-bold text-white">Diamond</div>
                              </td>
                              <td>
                                <ul className="list-disc list-inside text-sm">
                                  <li>20% off on fuel</li>
                                  <li>25% off vehicle maintenance</li>
                                  <li>Premium healthcare package</li>
                                  <li>Vehicle upgrade assistance</li>
                                  <li>Exclusive access to premium riders</li>
                                </ul>
                              </td>
                              <td>
                                <p>1000+ rides completed</p>
                                <p>4.9+ rating</p>
                                <p>97%+ acceptance rate</p>
                                <p>10+ badges earned</p>
                              </td>
                              <td>
                                <div className="badge bg-gray-700 text-gray-300 border border-gray-600">Locked</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {selectedTab === 'brands' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Brand Collaborations</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Fuel Partner Discounts</h3>
                            <div className="flex gap-2 mt-2">
                              <div className="avatar">
                                <div className="w-16 rounded">
                                  <img src="https://daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.jpg" alt="Shell" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-200">Shell Bangalore</p>
                                <p className="text-sm text-gray-300">12% discount at all participating stations</p>
                                <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-2">Redeem</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Vehicle Maintenance</h3>
                            <div className="flex gap-2 mt-2">
                              <div className="avatar">
                                <div className="w-16 rounded">
                                  <img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Bosch" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-200">Bosch Service Koramangala</p>
                                <p className="text-sm text-gray-300">15% off on all services</p>
                                <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-2">Redeem</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Food & Refreshments</h3>
                            <div className="flex gap-2 mt-2">
                              <div className="avatar">
                                <div className="w-16 rounded">
                                  <img src="https://daisyui.com/images/stock/photo-1565619022442-8686c4b73500.jpg" alt="Third Wave" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-200">Third Wave Coffee Indiranagar</p>
                                <p className="text-sm text-gray-300">Buy 1 Get 1 Free on weekdays</p>
                                <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-2">Redeem</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Healthcare</h3>
                            <div className="flex gap-2 mt-2">
                              <div className="avatar">
                                <div className="w-16 rounded">
                                  <img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Apollo" />
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-gray-200">Apollo HSR Layout</p>
                                <p className="text-sm text-gray-300">Free health check-ups</p>
                                <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-2">Redeem</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTab === 'challenges' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Weekly Challenges</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Peak Hour Hero</h3>
                            <p className="text-gray-300">Complete 10 rides during peak hours in Koramangala</p>
                            <progress 
                              className="progress mt-2 bg-gray-600" 
                              value="4" 
                              max="10"
                              style={{ "--progress-color": "#10b981" }}
                            ></progress>
                            <p className="text-sm text-right text-gray-400">4/10 completed</p>
                            <div className="card-actions justify-end mt-2">
                              <div className="badge bg-gray-600 text-gray-300">+50 points</div>
                              <div className="badge bg-emerald-500 text-white">₹200 Bonus</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Perfect Rating</h3>
                            <p className="text-gray-300">Maintain a 5-star rating for 20 consecutive rides</p>
                            <progress 
                              className="progress mt-2 bg-gray-600" 
                              value="12" 
                              max="20"
                              style={{ "--progress-color": "#10b981" }}
                            ></progress>
                            <p className="text-sm text-right text-gray-400">12/20 completed</p>
                            <div className="card-actions justify-end mt-2">
                              <div className="badge bg-gray-600 text-gray-300">+75 points</div>
                              <div className="badge bg-purple-500 text-white">New Badge</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Distance Champion</h3>
                            <p className="text-gray-300">Complete rides totaling 500 km across Bangalore</p>
                            <progress 
                              className="progress mt-2 bg-gray-600" 
                              value="310" 
                              max="500"
                              style={{ "--progress-color": "#10b981" }}
                            ></progress>
                            <p className="text-sm text-right text-gray-400">310/500 km</p>
                            <div className="card-actions justify-end mt-2">
                              <div className="badge bg-gray-600 text-gray-300">+100 points</div>
                              <div className="badge bg-emerald-500 text-white">₹300 Bonus</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                          <div className="card-body">
                            <h3 className="card-title text-white">Stand Utilizer</h3>
                            <p className="text-gray-300">Pick up 5 passengers from designated stands in Electronic City</p>
                            <progress 
                              className="progress mt-2 bg-gray-600" 
                              value="2" 
                              max="5"
                              style={{ "--progress-color": "#10b981" }}
                            ></progress>
                            <p className="text-sm text-right text-gray-400">2/5 completed</p>
                            <div className="card-actions justify-end mt-2">
                              <div className="badge bg-gray-600 text-gray-300">+30 points</div>
                              <div className="badge bg-emerald-500 text-white">Free Car Wash</div>
                            </div>
                          </div>
                        </div>
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
            <RewardSystem initialData={rewardsData} />
          </div>
        )}
        
        {activeSection === 'calculator' && (
          <div className="w-full">
            <IncentiveCalculator 
              baseRate={50}
              driverTier={driverProfile.rewards.level}
              peakMultiplier={1.5}
              standPickup={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}