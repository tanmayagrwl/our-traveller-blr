// config/index.js
require('dotenv').config()

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
	/**
	 * Port the app should run on
	 */
	port: parseInt(process.env.PORT) || 5050,

	/**
	 * Database path for SQLite
	 */
	databasePath: process.env.DB_PATH || 'data/sqlite.db',

	/**
	 * The secret sauce to validate JWT
	 */
	jwtSecret: process.env.JWT_SECRET,

	/**
	 * Used by Winston logger
	 */
	logs: {
		level: process.env.LOG_LEVEL || 'silly'
	},

	/**
	 * API configs
	 */
	api: {
		prefix: '/api'
	}
}