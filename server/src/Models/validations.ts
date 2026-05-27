import { z } from 'zod';

export const userProfileSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  age: z.number().positive().int(),
  style_preferences: z.array(z.string()),
  favorite_colors: z.array(z.string()),
  avoid_colors: z.array(z.string()),
  occasion: z.string().min(1, "Occasion is required"),
  budget_max: z.number().positive("Budget must be greater than 0")
});