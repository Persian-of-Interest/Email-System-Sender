// Backend
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const nodemailer = require('nodemailer');
const config = require('./config');

const app = express();

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Function to check if the 'users' table exists and create it if not
async function createUsersTable() {
  const sql = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  )`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log('Table "users" created or already exists');
        resolve();
      }
    });
  });
}

app.post('/api/store-email', async (req, res) => {
  const { name, email } = req.body; // Retrieves both name and email from the request body

  try {
    // Checks if the 'users' table exists, if not, creates it
    await createUsersTable();

    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.query(sql, [name, email], (err) => {
      // Throws error if the email can't be stored
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error storing user info' });
      }
      sendConfirmationEmail(name, email); // Sends both name and email to the function
      res.json({ message: 'User info stored successfully' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating table or storing user info' });
  }
});

function sendConfirmationEmail(name, email) {
  const transporter = nodemailer.createTransport({
    service: config.emailService, // Uses the email service provider from the config.js file
    auth: config.emailAuth, // Uses the email authentication details from the config.js file
  });

  const mailOptions = {
    from: config.emailAuth.user, // Gets the "from" email from the config.js file
    to: email, // Uses the user-submitted email address as the "to" email
    subject: 'Confirmation Email',
    html: `<p>Hello ${name},</p><p>Thank you for providing your email address. We confirm that we have received your email: ${email}.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Confirmation email sent:', info.response);
    }
  });
}

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
