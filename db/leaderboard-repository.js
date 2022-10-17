class LeaderboardRepository {
  constructor(dao) {
    this.dao = dao
  }

  run(sql, params = []) {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function (err) {
          if (err) {
            console.log('Error running sql ' + sql)
            console.log(err)
            reject(err)
          } else {
            resolve({ id: this.lastID })
          }
        })
      })
  }
  
  createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS leaderboard (
        username VARCHAR(10) PRIMARY KEY,
        points INTEGER DEFAULT 0)`
      return this.dao.run(sql)
  }

  createIfNotExists(username) {
    return this.dao.run(
      `insert into leaderboard (username)
        Select ? Where not exists(select * from leaderboard where username = ?)`,
      [username, username])
  }

  reward(username) {
    return this.dao.run(
      `UPDATE leaderboard SET points = points + 1 WHERE username = ?`,
      [username]
    )
  }

  getByName(username) {
    return this.dao.get(
      `SELECT * FROM leaderboard WHERE username = ?`,
      [username])
  }

  getAll() {
    return this.dao.all(`SELECT * FROM leaderboard ORDER BY points DESC`)
  }

}

module.exports = LeaderboardRepository;