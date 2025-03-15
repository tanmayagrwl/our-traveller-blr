'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Sidebar() {
	const router = useRouter()
	const pathname = usePathname()
	const [userType, setUserType] = useState('')
	
	useEffect(() => {
		if (pathname.includes('/driver')) {
			setUserType('driver')
		} else if (pathname.includes('/user')) {
			setUserType('user')
		} else {
			setUserType('')
		}
	}, [pathname])

	const isDriver = userType === 'driver'
	
	if (!userType) return null
	
	return (
		<div className="drawer-side">
			<label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
			<aside className="bg-gray-800 w-64 h-full border-r border-gray-700">
				<div className="px-4 py-5 flex flex-col h-full">
					<Link href="/" className="flex items-center justify-center">
						<motion.div 
							className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text mb-6"
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
					</Link>
					
					<ul className="menu p-4 rounded-box text-gray-200">
						<li className="menu-title">
							<span className="text-emerald-400">{isDriver ? 'Driver Menu' : 'User Menu'}</span>
						</li>
						
						{isDriver ? (
							<>
								<li>
									<Link 
										href="/driver/dashboard" 
										className={`hover:text-emerald-400 ${pathname === '/driver/dashboard' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
										</svg>
										Dashboard
									</Link>
								</li>
								<li>
									<Link 
										href="/driver/rewards" 
										className={`hover:text-emerald-400 ${pathname === '/driver/rewards' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Rewards & Incentives
									</Link>
								</li>
								<li>
									<Link 
										href="/driver/heatmap" 
										className={`hover:text-emerald-400 ${pathname === '/driver/heatmap' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
										</svg>
										Demand Heatmap
									</Link>
								</li>
								<li>
									<Link 
										href="/driver/schedule" 
										className={`hover:text-emerald-400 ${pathname === '/driver/schedule' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Scheduled Rides
									</Link>
								</li>
							</>
						) : (
							<>
								<li>
									<Link 
										href="/user/dashboard" 
										className={`hover:text-emerald-400 ${pathname === '/user/dashboard' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
										</svg>
										Dashboard
									</Link>
								</li>
								<li>
									<Link 
										href="/user/booking" 
										className={`hover:text-emerald-400 ${pathname === '/user/booking' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Book a Ride
									</Link>
								</li>
								<li>
									<Link 
										href="/user/carpooling" 
										className={`hover:text-emerald-400 ${pathname === '/user/carpooling' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
										</svg>
										Carpooling
									</Link>
								</li>
								<li>
									<Link 
										href="/user/shuttle" 
										className={`hover:text-emerald-400 ${pathname === '/user/shuttle' ? 'text-emerald-400 font-bold' : ''}`}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
										</svg>
										Shuttle Service
									</Link>
								</li>
							</>
						)}
					</ul>
					
					<div className="mt-auto">
						<div className="alert bg-gray-700 border border-gray-600 text-white">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-emerald-400 shrink-0 w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>
								{isDriver 
									? 'Set your availability to receive more rides during peak hours!' 
									: 'Try carpooling to save up to 50% during peak hours!'}
							</span>
						</div>
						
						<motion.button 
							className="btn btn-outline w-full mt-4 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
							onClick={() => router.push('/')}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Switch to {isDriver ? 'User' : 'Driver'} Mode
						</motion.button>
					</div>
				</div>
			</aside>
		</div>
	)
}