import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';
import type { UserProfile, Product, RecommendationResult } from '../Models/types.js';
import productsData from '../Data/products.json' with { type: 'json' };

const products: Product[] = productsData as Product[];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache עם זמן חיים קצר לדינמיות
const cache = new NodeCache({ stdTTL: 60 }); 

export class RecommendationService {
  
  public async getRecommendations(user: UserProfile, useAI: boolean = false): Promise<RecommendationResult[]> {
    if (!user || !user.budget_max) throw new Error("Invalid profile");

    // מפתח קאש שכולל timestamp כדי להבטיח שכל דקה מקבלים תוצאות רעננות
    const cacheKey = `recs_${user.user_id}_${Math.floor(Date.now() / 60000)}_${JSON.stringify(user)}`;
    const cached = cache.get<RecommendationResult[]>(cacheKey);
    if (cached) return cached;

    // 1. סינון ראשוני
    const filteredProducts = products.filter(p => 
      p.price <= user.budget_max && !p.colors.some(c => user.avoid_colors.includes(c))
    );

    // 2. מנוע דירוג עם Diversity (גיוון)
    const scoredProducts = filteredProducts.map(product => {
      let score = 0;
      if (product.occasions.includes(user.occasion)) score += 15;
      score += product.style_tags.filter(t => user.style_preferences.includes(t)).length * 10;
      score += product.colors.filter(c => user.favorite_colors.includes(c)).length * 5;
      score += (1 - (product.price / user.budget_max)) * 3;
      
      // מפתח גיוון: מוסיף ציון אקראי גבוה יותר כדי לטלטל את הדירוג
      score += Math.random() * 8; 

      return { product, score };
    });

    // 3. מיון
    const topCandidates = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.product);

    // 4. יצירת תוצאה
    const result = useAI 
      ? await this.generateAIExplanations(user, topCandidates)
      : topCandidates.map(p => ({ 
          product_id: p.product_id, 
          name: p.name, 
          price: p.price, 
          explanation: this.generateExplanation(user, p) 
        }));

    cache.set(cacheKey, result);
    return result;
  }

  private generateExplanation(user: UserProfile, product: Product): string {
    const matched = product.style_tags.find(t => user.style_preferences.includes(t));
    return `Great find for ${user.occasion.replace(/_/g, ' ')}! ${matched ? `It perfectly matches your ${matched} style.` : 'A versatile piece for your wardrobe.'}`;
  }

  private async generateAIExplanations(user: UserProfile, candidates: Product[]): Promise<RecommendationResult[]> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Stylist task: User profile ${JSON.stringify(user)}. Recommend 5 items from ${JSON.stringify(candidates)}. Return JSON array of objects with product_id, name, price, explanation.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(text);
    } catch (e) {
      return candidates.map(p => ({ product_id: p.product_id, name: p.name, price: p.price, explanation: this.generateExplanation(user, p) }));
    }
  }
}