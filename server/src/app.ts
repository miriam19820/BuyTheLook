import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import recommendationRoutes from './Routers/recommendationRoutes.js';
import { errorHandler } from './Middlewares/errorHandler.js';

const app = express();

// ==========================================
// 🛡️ Middlewares גלובליים (אבטחה ולוגים)
// ==========================================

// הגנה על כותרות HTTP
app.use(helmet());

// איפשור גישה מצד לקוח (כדי שהפרונט-אנד העתידי יוכל לשלוח בקשות)
app.use(cors());

// לוגים - מדפיס לקונסול כל בקשה שנכנסת לשרת (מעולה לדיבוג ולפרודקשן)
app.use(morgan('dev'));

// פיענוח גוף הבקשה (JSON)
app.use(express.json()); 

// ==========================================
// 🚀 ראוטרים
// ==========================================
app.use('/api', recommendationRoutes);

// ==========================================
// 🛑 טיפול שגיאות גלובלי (חובה להיות בסוף!)
// ==========================================
app.use(errorHandler);

export default app;