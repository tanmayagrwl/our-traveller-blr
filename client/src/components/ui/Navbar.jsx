'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
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
	
	return (
		<div className="navbar bg-gray-800 text-white shadow-lg border-b border-gray-700">
			<div className="navbar-start">
				<div className="dropdown">
					<label tabIndex={0} className="btn btn-ghost lg:hidden">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
						</svg>
					</label>
					<ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-gray-800 rounded-box w-52 border border-gray-700">
						{isDriver ? (
							<>
								<li><Link href="/driver/dashboard" className="hover:text-emerald-400">Dashboard</Link></li>
								<li><Link href="/driver/rewards" className="hover:text-emerald-400">Rewards & Incentives</Link></li>
								<li><Link href="/driver/heatmap" className="hover:text-emerald-400">Demand Heatmap</Link></li>
								<li><Link href="/driver/schedule" className="hover:text-emerald-400">Schedule Rides</Link></li>
							</>
						) : (
							<>
								<li><Link href="/user/dashboard" className="hover:text-emerald-400">Dashboard</Link></li>
								<li><Link href="/user/booking" className="hover:text-emerald-400">Book a Ride</Link></li>
								<li><Link href="/user/carpooling" className="hover:text-emerald-400">Carpooling</Link></li>
								<li><Link href="/user/shuttle" className="hover:text-emerald-400">Shuttle Service</Link></li>
							</>
						)}
					</ul>
				</div>
				<Link href="/" className="flex items-center">
					<motion.div 
						className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text"
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
			</div>
			<div className="navbar-center hidden lg:flex">
				<ul className="menu menu-horizontal px-1">
					{isDriver ? (
						<>
							<li><Link href="/driver/dashboard" className={`hover:text-emerald-400 ${pathname === '/driver/dashboard' ? 'text-emerald-400 font-bold' : ''}`}>Dashboard</Link></li>
							<li><Link href="/driver/rewards" className={`hover:text-emerald-400 ${pathname === '/driver/rewards' ? 'text-emerald-400 font-bold' : ''}`}>Rewards & Incentives</Link></li>
							<li><Link href="/driver/heatmap" className={`hover:text-emerald-400 ${pathname === '/driver/heatmap' ? 'text-emerald-400 font-bold' : ''}`}>Demand Heatmap</Link></li>
							<li><Link href="/driver/schedule" className={`hover:text-emerald-400 ${pathname === '/driver/schedule' ? 'text-emerald-400 font-bold' : ''}`}>Schedule Rides</Link></li>
						</>
					) : (
						<>
							<li><Link href="/user/dashboard" className={`hover:text-emerald-400 ${pathname === '/user/dashboard' ? 'text-emerald-400 font-bold' : ''}`}>Dashboard</Link></li>
							<li><Link href="/user/booking" className={`hover:text-emerald-400 ${pathname === '/user/booking' ? 'text-emerald-400 font-bold' : ''}`}>Book a Ride</Link></li>
							<li><Link href="/user/carpooling" className={`hover:text-emerald-400 ${pathname === '/user/carpooling' ? 'text-emerald-400 font-bold' : ''}`}>Carpooling</Link></li>
							<li><Link href="/user/shuttle" className={`hover:text-emerald-400 ${pathname === '/user/shuttle' ? 'text-emerald-400 font-bold' : ''}`}>Shuttle Service</Link></li>
						</>
					)}
				</ul>
			</div>
			<div className="navbar-end">
				<motion.button 
					className="btn btn-sm bg-gray-700 hover:bg-emerald-500 text-white border-none"
					onClick={() => router.push('/')}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Switch Mode
				</motion.button>
			</div>
		</div>
	)
}