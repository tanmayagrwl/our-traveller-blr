// database.js
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const fs = require('fs')
const config = require('../config')

let db

async function initializeClient() {
	// Ensure directory exists
	const dbDir = path.dirname(path.resolve(__dirname, '..', '..', config.databasePath))
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true })
	}

	// Open SQLite database connection
	const database = await open({
		filename: path.resolve(__dirname, '..', '..', config.databasePath),
		driver: sqlite3.Database
	})

	// Enable foreign keys
	await database.exec('PRAGMA foreign_keys = ON')

	return database
}

module.exports = async () => {
	if (!db) {
		db = await initializeClient()
	}

	return db
}

module.exports.query = async (sql, params = []) => {
	const database = await module.exports()
	return database.all(sql, params)
}

module.exports.get = async (sql, params = []) => {
	const database = await module.exports()
	return database.get(sql, params)
}

module.exports.run = async (sql, params = []) => {
	const database = await module.exports()
	return database.run(sql, params)
}