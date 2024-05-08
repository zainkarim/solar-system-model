require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Unified endpoint using a safer query from server.js
app.get('/planets/:name', (req, res) => {
  console.log(`Fetching data for planet: ${req.params.name}`);
  const sql = `SELECT * FROM planets WHERE name = ?`;
  db.query(sql, [req.params.name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      console.log('Planet not found');
      return res.status(404).json({ error: 'Planet not found' });
    }
    console.log('Data sent:', result[0]);
    res.json(result[0]);
  });
});



const port = process.env.PORT || 5001; // Use environment variable if available
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
