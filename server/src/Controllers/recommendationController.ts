import type { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../Services/recommendationService.js';
import { userProfileSchema } from '../Models/validations.js';
import type { UserProfile } from '../Models/types.js';

const recommendationService = new RecommendationService();

export const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawProfile = req.body.profile || req.body;
    const useAI: boolean = req.body.use_ai === true; 
    

    const validatedProfile = userProfileSchema.parse(rawProfile) as UserProfile;

    const recommendations = await recommendationService.getRecommendations(validatedProfile, useAI);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {

    next(error);
  }
};