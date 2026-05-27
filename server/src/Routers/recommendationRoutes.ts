import { Router, type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { getRecommendations } from '../Controllers/recommendationController.js';

const router = Router();


const recommendationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: { 
    success: false, 
    error: "Too many recommendation requests from this IP, please try again after 15 minutes." 
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});




router.post('/recommend', recommendationLimiter as RequestHandler, getRecommendations);

export default router;