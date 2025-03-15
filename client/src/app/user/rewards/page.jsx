'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import { mockRewardsData } from '@/utils/mockRewardsData'

export default function UserRewards() {
  const [userData, setUserData] = useState({
    ...mockRewardsData,
    user: {
      ...mockRewardsData.driver,
      points: 1750
    },
    rewards: {
      ...mockRewardsData.rewards,
      tier: "Eco Rider",
      nextTier: "Green Traveller", 
      points: 75,
      weeklyPointsGained: 250,
      monthlyBadgesGained: 2
    },
    tierProgress: ["Beginner", "Eco Rider", "Green Traveller", "Sustainability Champion"],
    tierBenefits: {
      "Beginner": [
        "Basic rewards program access",
        "Walk-to-pickup bonus points",
        "Personal carbon footprint tracking"
      ],
      "Eco Rider": [
        "5% discount when choosing walk-to-pickup option",
        "Weekly walking challenges",
        "Quarterly sustainability bonus",
        "Health tracker integration"
      ],
      "Green Traveller": [
        "10% discount on rides with walk-to-pickup",
        "Priority matching for nearby rides",
        "Quarterly bonus +25%",
        "Exclusive green events access"
      ],
      "Sustainability Champion": [
        "15% discount with walk-to-pickup option",
        "Carbon offset credits for all walks",
        "Annual green travel bonus",
        "Wellness rewards and perks",
        "Green ambassador status"
      ]
    },
    tierRequirements: {
      "Beginner": [
        "Complete account setup",
        "Walk to pickup points 5 times"
      ],
      "Eco Rider": [
        "Walk to pickup points 50+ times",
        "Maintain 4.7+ rating",
        "Join walk-rewards program"
      ],
      "Green Traveller": [
        "Walk to pickup points 200+ times",
        "Maintain 4.8+ rating",
        "Save 15%+ emissions through walking"
      ],
      "Sustainability Champion": [
        "Walk to pickup points 500+ times",
        "Maintain 4.9+ rating",
        "Save 30%+ emissions through walking"
      ]
    },
    badges: [
      { id: 1, name: "Walk Champion" },
      { id: 2, name: "Step Counter Extraordinaire" },
      { id: 3, name: "Green Walker" },
      { id: 4, name: "Carbon Footprint Reducer" },
      { id: 5, name: "Health & Sustainability Star" }
    ],
    challenges: [
      {
        id: 1,
        name: "Weekly Walking Challenge",
        description: "Walk to pickup points 10 times this week",
        progress: 7,
        total: 10,
        reward: "150 points + Walker Badge",
        badge: true
      },
      {
        id: 2,
        name: "5th Walk Milestone",
        description: "Complete your 5th walk to pickup this week",
        progress: 4,
        total: 5,
        reward: "100 points + Step Streak Bonus",
        badge: false
      },
      {
        id: 3,
        name: "Kilometer Crusher",
        description: "Walk a total of 15km to pickup points",
        progress: 12,
        total: 15,
        reward: "200 points",
        badge: false
      },
      {
        id: 4,
        name: "Early Bird Walker",
        description: "Walk to 5 pickup points before 9am",
        progress: 2,
        total: 5,
        reward: "250 points + Morning Champion Badge",
        badge: true
      }
    ],
    greenInitiatives: [
      {
        id: 1,
        name: "Walk & Earn Program",
        description: "Earn extra points for every meter you walk to pickup points",
        category: "Health & Sustainability",
        pointsReward: 300,
        status: "Available"
      },
      {
        id: 2,
        name: "Step Counter Rewards",
        description: "Connect your fitness tracker to earn bonus points for steps",
        category: "Health Integration",
        pointsReward: 50,
        status: "Available"
      },
      {
        id: 3,
        name: "Walking Community",
        description: "Join our community of users who prefer walking to pickup points",
        category: "Community",
        pointsReward: 200,
        status: "Available"
      },
      {
        id: 4,
        name: "Optimal Pickup Planner",
        description: "Get suggestions for walkable pickup points that optimize your route",
        category: "Travel Planning",
        pointsReward: 150,
        status: "Available"
      }
    ]
  })
  
  const [selectedTab, setSelectedTab] = useState('rewards')
  const [activeSection, setActiveSection] = useState('main')
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Green Rewards</h1>
        
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-gray-800">
            <a 
              className={`tab ${activeSection === 'main' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
              onClick={() => setActiveSection('main')}
            >
              Dashboard
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
                      <img src={userData.user.profileImage} alt="User profile" />
                    </div>
                  </div>
                  
                  <h2 className="card-title text-center mt-4 text-white font-bold">{userData.user.name}</h2>
                  <p className="text-center text-gray-400">Member since {userData.user.joiningDate}</p>
                  
                  <div className="mt-4">
                    <p className="font-bold text-gray-200">Current Tier: <span className="text-emerald-400">{userData.rewards.tier}</span></p>
                    <progress 
                      className="progress w-full bg-gray-700 mt-2 progress-success" 
                      value={userData.rewards.points} 
                      max="100"
                    ></progress>
                    <p className="text-sm text-right text-gray-400">{userData.rewards.points}% to {userData.rewards.nextTier}</p>
                  </div>
                  
                  <div className="stats stats-vertical bg-gray-700 shadow mt-6 text-gray-100">
                    <div className="stat">
                      <div className="stat-title text-gray-400 font-medium">Sustainability Points</div>
                      <div className="stat-value text-emerald-400">{userData.user.points}</div>
                      <div className="stat-desc text-gray-400">↗︎ {userData.rewards.weeklyPointsGained} points this week</div>
                    </div>
                    
                    <div className="stat">
                      <div className="stat-title text-gray-400 font-medium">Green Badges</div>
                      <div className="stat-value text-white">{userData.badges.length}</div>
                      <div className="stat-desc text-gray-400">↗︎ {userData.rewards.monthlyBadgesGained} new this month</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userData.badges.map((badge) => (
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
                      Green Tiers
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'initiatives' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('initiatives')}
                    >
                      Eco Initiatives
                    </a>
                    <a 
                      className={`tab ${selectedTab === 'challenges' ? 'bg-emerald-500 text-white font-medium' : 'text-gray-300'}`}
                      onClick={() => setSelectedTab('challenges')}
                    >
                      Green Challenges
                    </a>
                  </div>
                  
                  {selectedTab === 'rewards' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Sustainability Tiers</h2>
                      
                      <ul className="steps steps-horizontal w-full mb-6 text-gray-200">
                        {userData.tierProgress.map((tier, index) => (
                          <li 
                            key={tier} 
                            className={`step ${index <= userData.tierProgress.indexOf(userData.rewards.tier) ? 'step-success' : ''} font-medium`}
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
                            {userData.tierProgress.map((tier, index) => {
                              const currentTierIndex = userData.tierProgress.indexOf(userData.rewards.tier);
                              
                              let status;
                              if (index < currentTierIndex) {
                                status = <div className="badge bg-emerald-500 text-white font-medium">Completed</div>;
                              } else if (index === currentTierIndex) {
                                status = <div className="badge bg-amber-500 text-white font-medium">Walking</div>;
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
                                      {userData.tierBenefits[tier].map((benefit, i) => (
                                        <li key={i} className="text-gray-300">{benefit}</li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td>
                                    <ul className="list-disc list-inside text-sm">
                                      {userData.tierRequirements[tier].map((req, i) => (
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
                  
                  {selectedTab === 'initiatives' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Green Travel Initiatives</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userData.greenInitiatives.map((initiative) => (
                          <div key={initiative.id} className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                            <div className="card-body">
                              <h3 className="card-title text-white">{initiative.name}</h3>
                              <p className="font-medium text-emerald-300">{initiative.category}</p>
                              <p className="text-sm text-gray-300">{initiative.description}</p>
                              <div className="flex justify-between items-center mt-3">
                                <span className="badge bg-emerald-700 text-white">+{initiative.pointsReward} points</span>
                                {initiative.status === "Available" ? (
                                  <button className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-none font-medium">Join</button>
                                ) : (
                                  <span className="badge badge-outline text-emerald-300">{initiative.status}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedTab === 'challenges' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Eco-Friendly Challenges</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userData.challenges.map((challenge) => (
                          <div key={challenge.id} className="card bg-gray-700 border border-gray-600 hover:border-emerald-500 transition-all">
                            <div className="card-body">
                              <h3 className="card-title text-white">{challenge.name}</h3>
                              <p className="text-gray-300">{challenge.description}</p>
                              <progress 
                                className="progress mt-2 bg-gray-600 progress-success" 
                                value={challenge.progress} 
                                max={challenge.total}
                              ></progress>
                              <p className="text-sm text-right text-gray-400">{challenge.progress}/{challenge.total} completed</p>
                              <div className="card-actions justify-end mt-2">
                                <div className="badge bg-emerald-700 text-white font-medium">
                                  {challenge.reward.includes('points') ? challenge.reward.split(' ')[0] + ' points' : ''}
                                </div>
                                {challenge.reward.includes('Bonus') && (
                                  <div className="badge bg-emerald-500 text-white font-medium">{challenge.reward.split('+ ')[1]}</div>
                                )}
                                {challenge.badge && (
                                  <div className="badge bg-purple-500 text-white font-medium">Green Badge</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-emerald-600">
                        <h3 className="text-lg font-bold text-white mb-2">5th Ride Bonus Tracker</h3>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((ride) => (
                            <div 
                              key={ride}
                              className={`w-6 h-6 rounded-full flex items-center justify-center 
                                ${ride <= userData.challenges[1].progress ? 'bg-emerald-500' : 'bg-gray-600'}`}
                            >
                              {ride}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-300 mt-2">Complete your 5th ride this week to get a 100 point bonus!</p>
                        <div className="mt-2">
                          <span className="text-xs text-emerald-300">Resets every Monday at midnight</span>
                        </div>
                      </div>

                      <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-green-600">
                        <h3 className="text-lg font-bold text-white mb-2">Eco-Friendly Travel Bonus</h3>
                        <p className="text-sm text-gray-300">Choose eco-friendly travel options to earn:</p>
                        <ul className="list-disc list-inside text-xs text-gray-300 mt-2">
                          <li>25 bonus points per eco-friendly ride booking</li>
                          <li>Special "Carbon Conscious" badge after 20 green rides</li>
                          <li>Monthly leaderboard for top eco-travelers</li>
                        </ul>
                        <button className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-white border-none mt-3 font-medium">
                          Start Tracking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
    
      </div>
    </div>
  )
}