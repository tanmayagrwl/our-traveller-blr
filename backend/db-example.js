// Example user model
const db = require('./src/loaders/database')

class UserModel {
	async findByEmail(email) {
		return db.get('SELECT * FROM users WHERE email = ?', [email])
	}

	async findById(id) {
		return db.get('SELECT * FROM users WHERE id = ?', [id])
	}

	async create(userData) {
		const { lastID } = await db.run(
			'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
			[userData.name, userData.email, userData.password]
		)
		return this.findById(lastID)
	}

	async getAll(limit = 100, offset = 0) {
		return db.query(
			'SELECT * FROM users LIMIT ? OFFSET ?',
			[limit, offset]
		)
	}

	async update(id, userData) {
		const { changes } = await db.run(
			'UPDATE users SET name = ?, email = ? WHERE id = ?',
			[userData.name, userData.email, id]
		)
		return changes > 0 ? this.findById(id) : null
	}

	async delete(id) {
		const { changes } = await db.run('DELETE FROM users WHERE id = ?', [id])
		return changes > 0
	}
}

module.exports = new UserModel()