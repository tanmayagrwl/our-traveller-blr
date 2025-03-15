import { motion } from 'framer-motion'

export default function Card({ 
	title, 
	children, 
	className = "", 
	footer = null,
	actionButton = null,
	badge = null 
}) {
	return (
		<motion.div 
			className={`card bg-gray-800 shadow-xl border border-gray-700 hover:border-gray-600 transition-all ${className}`}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ y: -5 }}
		>
			<div className="card-body">
				{(title || badge) && (
					<div className="flex justify-between items-center">
						{title && <h2 className="card-title text-white">{title}</h2>}
						{badge && <div className={`badge ${badge.color || 'badge-primary'}`}>{badge.text}</div>}
					</div>
				)}
				
				<div className="py-2 text-gray-200">
					{children}
				</div>
				
				{(footer || actionButton) && (
					<div className="card-actions justify-end mt-4">
						{footer}
						{actionButton && (
							<motion.button 
								className={`btn ${actionButton.color || 'bg-emerald-500 text-white hover:bg-emerald-600 border-none'}`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								{actionButton.text}
							</motion.button>
						)}
					</div>
				)}
			</div>
		</motion.div>
	)
}