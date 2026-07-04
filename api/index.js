const app = require('../backend/app');
const connectDB = require('../backend/config/db');

// Vercel serverless function entry point
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in serverless handler:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  return app(req, res);
};
