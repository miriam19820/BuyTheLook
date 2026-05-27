export interface UserProfile {
  user_id: string;
  age: number;
  style_preferences: string[];
  favorite_colors: string[];
  avoid_colors: string[];
  occasion: string;
  budget_max: number;
}

export interface Product {
  product_id: string;
  name: string;
  category: string;
  colors: string[];
  style_tags: string[];
  occasions: string[];
  price: number;
  description: string;
}

export interface RecommendationResult {
  product_id: string;
  name: string;
  price: number;
  explanation: string;
}