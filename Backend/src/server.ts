import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 5000;
const app = createApp();

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma.');

    app.listen(PORT, () => {
      console.log(`🚀 GlobeTrotter Backend API running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
