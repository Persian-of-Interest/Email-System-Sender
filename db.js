// Handles the database connection
const mysql = require('mysql');
const config = require('./config');

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = connection;
