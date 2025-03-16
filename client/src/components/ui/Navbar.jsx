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
	
	const driverLinks = [
		{ href: '/driver/dashboard', label: 'Dashboard' },
		{ href: '/driver/rewards', label: 'Rewards & Incentives' },
		{ href: '/driver/heatmap', label: 'Demand Heatmap' },
		{ href: '/driver/schedule', label: 'Schedule Rides' }
	]
	
	const userLinks = [
		{ href: '/user/dashboard', label: 'Dashboard' },
		{ href: '/user/booking', label: 'Book a Ride' },
		{ href: '/user/shuttle', label: 'Shuttle Service' },
		{ href: '/user/rewards', label: 'Rewards' },

	]
	
	const navLinks = isDriver ? driverLinks : userLinks
	
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
						{navLinks.map((link) => (
							<li key={link.href}>
								<Link href={link.href} className="hover:text-emerald-400 font-medium">
									{link.label}
								</Link>
							</li>
						))}
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
					{navLinks.map((link) => (
						<li key={link.href}>
							<Link 
								href={link.href} 
								className={`hover:text-emerald-400 ${pathname === link.href ? 'text-emerald-400 font-bold' : ''}`}
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
			<div className="navbar-end">
				<motion.button 
					className="btn btn-sm bg-gray-700 hover:bg-emerald-500 text-white border-none font-bold"
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