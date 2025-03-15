export const mockRewardsData = {
	driver: {
		id: 'driver123',
		name: 'Adhvik Reddy',
		points: 785,
		joiningDate: 'Jan 2023',
		profileImage: 'https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
	},
	rewards: {
		tier: 'Gold',
		level: 'Gold', // for backward compatibility
		nextTier: 'Platinum',
		nextLevel: 'Platinum', // for backward compatibility
		points: 70, // progress percentage to next tier
		pointsToNextTier: 215,
		weeklyPointsGained: 32,
		monthlyBadgesGained: 2
	},
	badges: [
		{
			id: 'badge1',
			name: 'Peak Hero',
			description: 'Completed 50+ rides during peak hours',
			icon: '⏰'
		},
		{
			id: 'badge2',
			name: 'Weekend Warrior',
			description: 'Completed 30+ rides on weekends',
			icon: '🏆'
		},
		{
			id: 'badge3',
			name: '5-Star Driver',
			description: 'Maintained 5-star rating for 100+ rides',
			icon: '⭐'
		},
		{
			id: 'badge4',
			name: 'Marathon Driver',
			description: 'Completed 12+ hour shift without breaks',
			icon: '🏃'
		},
		{
			id: 'badge5',
			name: 'Passenger Favorite',
			description: 'Received 50+ compliments from passengers',
			icon: '❤️'
		}
	],
	availableBadges: [
		{
			id: 'avail1',
			name: 'Night Owl',
			description: 'Complete 30+ rides after 10 PM in Indiranagar',
			icon: '🌙',
			progress: 6,
			total: 30
		},
		{
			id: 'avail2',
			name: 'Top Earner',
			description: 'Earn ₹10,000+ in a single week in Whitefield',
			icon: '🏆',
			progress: 6240,
			total: 10000
		},
		{
			id: 'avail3',
			name: 'Speed Demon',
			description: 'Achieve average pickup time under 3 minutes for 50+ rides',
			icon: '⚡',
			progress: 21,
			total: 50
		},
		{
			id: 'avail4',
			name: 'Green Driver',
			description: 'Complete 100+ rides with electric/CNG vehicle in Bengaluru',
			icon: '🌱',
			progress: 82,
			total: 100
		}
	],
	challenges: [
		{
			id: 'ch1',
			name: 'Peak Hour Hero',
			description: 'Complete 20 rides during peak hours (8-10am, 5-8pm) this week',
			progress: 14,
			total: 20,
			reward: '50 points + ₹200 bonus'
		},
		{
			id: 'ch2',
			name: 'Perfect Rating',
			description: 'Maintain 5-star rating for your next 15 rides',
			progress: 9,
			total: 15,
			reward: '60 points',
			badge: true
		},
		{
			id: 'ch3',
			name: 'Distance Champion',
			description: 'Complete 200km of total ride distance this week',
			progress: 135,
			total: 200,
			reward: '75 points + "Road Warrior" badge'
		},
		{
			id: 'ch4',
			name: 'Stand Utilizer',
			description: 'Pick up 5 passengers from designated stands in Electronic City',
			progress: 2,
			total: 5,
			reward: '30 points + Free Car Wash'
		}
	],
	upcomingChallenges: [
		{
			id: 'upcoming1',
			name: 'Airport Champion',
			description: 'Complete 15 airport pickups/drops in a week',
			reward: '120 points + ₹500 bonus',
			icon: '✈️'
		},
		{
			id: 'upcoming2',
			name: 'Five Star Week',
			description: 'Maintain consistent 5-star ratings for all rides in a week',
			reward: '150 points + "Perfect Driver" badge',
			icon: '⭐'
		}
	],
	tierBenefits: {
		'Bronze': [
			'Basic ride insurance',
			'Weekly payment cycle',
			'Standard support access'
		],
		'Silver': [
			'All Bronze benefits',
			'Priority support access',
			'10% discount on vehicle maintenance',
			'Faster payment cycle (3 days)'
		],
		'Gold': [
			'All Silver benefits',
			'Health insurance benefits',
			'15% discount on vehicle maintenance',
			'Partner discounts (food & retail)',
			'Daily payment option'
		],
		'Platinum': [
			'All Gold benefits',
			'Premium health insurance',
			'25% discount on vehicle maintenance',
			'Exclusive partner benefits',
			'Instant payment option',
			'Family insurance coverage'
		],
		'Diamond': [
			'All Platinum benefits',
			'Comprehensive insurance package',
			'35% discount on vehicle maintenance',
			'VIP partner benefits',
			'Vehicle upgrade assistance',
			'Education benefits for children',
			'Retirement savings contribution'
		]
	},
	tierRequirements: {
		'Bronze': [
			'Starting level'
		],
		'Silver': [
			'50 rides completed',
			'4.5+ rating'
		],
		'Gold': [
			'200 rides completed',
			'4.7+ rating',
			'90%+ acceptance rate'
		],
		'Platinum': [
			'500 rides completed',
			'4.8+ rating',
			'95%+ acceptance rate',
			'5+ badges earned'
		],
		'Diamond': [
			'1000+ rides completed',
			'4.9+ rating',
			'97%+ acceptance rate',
			'10+ badges earned'
		]
	},
	tierProgress: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
	partnerBenefits: [
		{
			id: 'partner1',
			name: 'Apollo Healthcare',
			description: 'Free health check-up & 15% discount on treatments',
			icon: '🏥',
			tier: 'Gold',
			validUntil: 'Dec 2025',
			logo: '/api/placeholder/64/64'
		},
		{
			id: 'partner2',
			name: 'Third Wave Coffee',
			description: 'Buy 1 Get 1 Free on weekdays at all Indiranagar outlets',
			icon: '☕',
			tier: 'Gold',
			validUntil: 'Nov 2025',
			logo: '/api/placeholder/64/64'
		},
		{
			id: 'partner3',
			name: 'Bosch Service',
			description: '15% discount on all vehicle maintenance services',
			icon: '🔧',
			tier: 'Gold',
			validUntil: 'Jan 2026',
			logo: '/api/placeholder/64/64'
		}
	],
	upcomingBenefits: [
		{
			id: 'upcoming1',
			name: 'Cult.fit Premium Membership',
			description: 'Get 30% off on annual membership at all Cult.fit locations in Bangalore',
			tier: 'Platinum',
			icon: '🏋️'
		},
		{
			id: 'upcoming2',
			name: 'OYO Rooms Discount',
			description: '20% discount on stay at OYO Premium Properties across India',
			tier: 'Platinum',
			icon: '🏠'
		}
	],
	brandCollaborations: [
		{
			id: 'brand1',
			name: 'Shell Bangalore',
			description: '12% discount at all participating stations',
			category: 'Fuel Partner Discounts',
			logo: '/api/placeholder/64/64'
		},
		{
			id: 'brand2',
			name: 'Bosch Service Koramangala',
			description: '15% off on all services',
			category: 'Vehicle Maintenance',
			logo: '/api/placeholder/64/64'
		},
		{
			id: 'brand3',
			name: 'Third Wave Coffee Indiranagar',
			description: 'Buy 1 Get 1 Free on weekdays',
			category: 'Food & Refreshments',
			logo: '/api/placeholder/64/64'
		},
		{
			id: 'brand4',
			name: 'Apollo HSR Layout',
			description: 'Free health check-ups',
			category: 'Healthcare',
			logo: '/api/placeholder/64/64'
		}
	],
	rewardsStats: {
		moneySaved: 2840,
		activeBenefits: 4,
		totalAvailableBenefits: 6
	},
	challengesTips: 'Focus on peak hour rides in high-demand areas like Electronic City to earn reward points faster!'
}