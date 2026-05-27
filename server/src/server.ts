import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;


const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`✨ BuyTheLook Recommendation API is ready!`);
});

process.on('unhandledRejection', (reason: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  console.error(reason.name, reason.message);
  

  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...');
  console.error(error.name, error.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});