const db = require('./src/loaders/database')

async function setupDatabase() {
	await db.run(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)

	console.log('Database setup complete!')
}

if (require.main === module) {
	setupDatabase().catch(console.error)
}

module.exports = setupDatabase