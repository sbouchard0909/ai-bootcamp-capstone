import app from './app';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/database';
import { seedTestUser } from './utils/seed';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize database and seed data
async function startServer() {
  try {
    // Initialize database schema
    initializeDatabase();
    
    // Seed test user for non-production environments
    await seedTestUser();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
