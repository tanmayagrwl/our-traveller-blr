'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import HeatMap from '@/components/maps/HeatMap'
import StandLocations from '@/components/maps/StandLocations'
import { motion } from 'framer-motion'
import {heatMapData} from '@/utils/response/driver/heatmap'
export default function DriverHeatmap() {
    const [timeOfDay, setTimeOfDay] = useState('morning')
    const [heatmapData, setHeatmapData] = useState([])
    const [standLocations, setStandLocations] = useState([])
    const [driverLocation, setDriverLocation] = useState(null)
    const [showStands, setShowStands] = useState(true)
    const [viewMode, setViewMode] = useState('heatmap')
    const [incentives, setIncentives] = useState([])
    const [demandTrends, setDemandTrends] = useState([])
    const [recommendedAreas, setRecommendedAreas] = useState([])
    const [dailyChallenge, setDailyChallenge] = useState(null)
    const [demandInfo, setDemandInfo] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)



// Fetch data from API endpoint
useEffect(() => {
    const fetchData = async () => {
        try {
            setIsLoading(true);
            // If using an actual API endpoint:
            // const response = await fetch('/api/driver/heatmap');
            // if (!response.ok) {
            //     throw new Error('Failed to fetch heatmap data');
            // }
            // const data = await response.json();
            
            // Using the imported data directly:
            const data = heatMapData;
            
            setHeatmapData(data.heatmapData[timeOfDay]);
            setStandLocations(data.standLocations);
            setDriverLocation(data.driverLocation);
            setIncentives(data.incentives);
            setDemandTrends(data.demandTrends);
            setRecommendedAreas(data.recommendedAreas);
            setDailyChallenge(data.dailyChallenges);
            setDemandInfo(data.demandInfo);
            setError(null);
        } catch (err) {
            console.error('Error processing data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchData();
}, [timeOfDay]); // Include timeOfDay in the dependency array
    
    // Update heatmap data when timeOfDay changes
    useEffect(() => {
        if (heatmapData && timeOfDay) {
            // Only update if we have data already loaded
            fetch('/api/driver/heatmap')
                .then(res => res.json())
                .then(data => {
                    setHeatmapData(data.heatmapData[timeOfDay]);
                })
                .catch(err => console.error('Error updating heatmap for time period:', err));
        }
    }, [timeOfDay]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-emerald-500"></div>
                    <p className="mt-4">Loading heatmap data...</p>
                </div>
            </div>
        );
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
        );
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
                    Demand Heatmap
                </motion.h1>
                
                <motion.div 
                    className="card bg-gray-800 shadow-xl mb-6 border border-gray-700"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="card-body">
                        <div className="flex flex-wrap items-center justify-between mb-4">
                            <h2 className="card-title text-white">Peak Hour Prediction</h2>
                            
                            <div className="form-control">
                                <div className="join">
                                    <motion.button 
                                        className={`btn join-item ${timeOfDay === 'morning' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                        onClick={() => setTimeOfDay('morning')}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Morning (8-10 AM)
                                    </motion.button>
                                    <motion.button 
                                        className={`btn join-item ${timeOfDay === 'afternoon' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                        onClick={() => setTimeOfDay('afternoon')}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Afternoon (1-3 PM)
                                    </motion.button>
                                    <motion.button 
                                        className={`btn join-item ${timeOfDay === 'evening' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                        onClick={() => setTimeOfDay('evening')}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Evening (5-8 PM)
                                    </motion.button>
                                </div>
                            </div>
                            
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text mr-2 text-gray-300">Show Pickup Stands</span> 
                                    <input 
                                        type="checkbox" 
                                        className="toggle" 
                                        style={{ backgroundColor: "#10b981" }}
                                        checked={showStands} 
                                        onChange={() => setShowStands(!showStands)} 
                                    />
                                </label>
                            </div>
                        </div>
                        
                        <div className="tabs tabs-boxed bg-gray-700 mb-4">
                            <a 
                                className={`tab ${viewMode === 'heatmap' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
                                onClick={() => setViewMode('heatmap')}
                            >
                                Demand Heatmap
                            </a>
                            <a 
                                className={`tab ${viewMode === 'stands' ? 'bg-emerald-500 text-white' : 'text-gray-300'}`}
                                onClick={() => setViewMode('stands')}
                            >
                                Pickup Stands
                            </a>
                        </div>
                        
                        <div className="h-[70vh] w-full rounded-lg overflow-hidden">
                            {viewMode === 'heatmap' ? (
                                <HeatMap 
                                    heatmapData={heatmapData} 
                                    driverLocation={driverLocation}
                                    showStands={showStands}
                                    standLocations={standLocations}
                                />
                            ) : (
                                <StandLocations
                                    standLocations={standLocations}
                                    driverLocation={driverLocation}
                                />
                            )}
                        </div>
                        
                        <div className="alert bg-gray-700 mt-4 border border-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-gray-200">
                                {demandInfo[timeOfDay]}
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
                            <h2 className="card-title text-white">Peak Hour Incentives</h2>
                            
                            <div className="overflow-x-auto">
                                <table className="table bg-gray-700 text-gray-200">
                                    <thead className="text-gray-200">
                                        <tr>
                                            <th>Area</th>
                                            <th>Time</th>
                                            <th>Surge</th>
                                            <th>Bonus</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incentives.map((incentive, index) => (
                                            <tr key={index} className="hover:bg-gray-600">
                                                <td className="text-white">{incentive.area}</td>
                                                <td>{incentive.time}</td>
                                                <td>{incentive.surge}</td>
                                                <td>
                                                    <div className="badge bg-emerald-500 text-white">+{incentive.bonus} points</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="alert bg-emerald-900/50 mt-4 border border-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-emerald-400 shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-emerald-100">{dailyChallenge?.description}</span>
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
                            <h2 className="card-title text-white">Demand Trends</h2>
                            
                            <div className="overflow-x-auto">
                                <table className="table bg-gray-700 text-gray-200">
                                    <thead className="text-gray-200">
                                        <tr>
                                            <th>Time Period</th>
                                            <th>Avg. Fare</th>
                                            <th>Demand Level</th>
                                            <th>Prediction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demandTrends.map((trend, index) => (
                                            <tr key={index} className="hover:bg-gray-600">
                                                <td className="text-white">{trend.period}</td>
                                                <td>₹{trend.averageFare}</td>
                                                <td>
                                                    <progress 
                                                        className="progress bg-gray-600" 
                                                        style={{ color: trend.demandLevel > 70 ? "#10b981" : trend.demandLevel > 40 ? "#f59e0b" : "#ef4444" }} 
                                                        value={trend.demandLevel} 
                                                        max="100"
                                                    ></progress>
                                                </td>
                                                <td className={
                                                    trend.prediction === "Very High" ? "text-emerald-400" :
                                                    trend.prediction === "Moderate" ? "text-amber-400" : "text-red-400"
                                                }>
                                                    {trend.prediction}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="divider bg-gray-700"></div>
                            
                            <h3 className="font-bold text-white">Recommended Areas</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {recommendedAreas.map((area, index) => (
                                    <div 
                                        key={index}
                                        className={`badge badge-lg ${area.highlight ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                    >
                                        {area.name} ({area.distance} km)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}