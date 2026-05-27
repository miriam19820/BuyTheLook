import { GoogleGenerativeAI } from '@google/generative-ai';
import NodeCache from 'node-cache';
import type { UserProfile, Product, RecommendationResult } from '../Models/types.js';
import productsData from '../Data/products.json' with { type: 'json' };

const products: Product[] = productsData as Product[];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


const cache = new NodeCache({ stdTTL: 3600 });

export class RecommendationService {
  
  public async getRecommendations(user: UserProfile, useAI: boolean = false): Promise<RecommendationResult[]> {

    if (!user || !user.budget_max) {
      throw new Error("Invalid user profile: Missing essential fields.");
    }

  
    const cacheKey = `recs_${user.user_id}_${useAI}`;
    const cachedResponse = cache.get<RecommendationResult[]>(cacheKey);

    if (cachedResponse) {
      console.log(`⚡ Returning recommendations for ${user.user_id} directly from Cache! (0ms)`);
      return cachedResponse;
    }


    const filteredProducts = products.filter(product => {
      const isWithinBudget = product.price <= user.budget_max;
      const hasAvoidedColor = product.colors.some(color => user.avoid_colors.includes(color));
      return isWithinBudget && !hasAvoidedColor;
    });

    if (filteredProducts.length === 0) {
      return [];
    }

    const scoredProducts = filteredProducts.map(product => {
      let score = 0;
      if (product.occasions.includes(user.occasion)) score += 3;
      const matchingStyles = product.style_tags.filter(tag => user.style_preferences.includes(tag));
      score += matchingStyles.length * 2;
      const matchingColors = product.colors.filter(color => user.favorite_colors.includes(color));
      score += matchingColors.length;

      return { product, score };
    });

    const topCandidates = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.product);


    let finalResult: RecommendationResult[];

    if (useAI) {
      finalResult = await this.generateAIExplanations(user, topCandidates);
    } else {
      finalResult = topCandidates.slice(0, 5).map(product => ({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        explanation: this.generateExplanation(user, product)
      }));
    }

    cache.set(cacheKey, finalResult);
    
    return finalResult;
  }

  private generateExplanation(user: UserProfile, product: Product): string {
    const reasons: string[] = [];
    
    if (product.occasions.includes(user.occasion)) {
      reasons.push(`perfect for ${user.occasion.replace(/_/g, ' ')}`);
    }
    
    const matchedStyle = product.style_tags.find(tag => user.style_preferences.includes(tag));
    if (matchedStyle) {
      reasons.push(`matches your ${matchedStyle} style`);
    }

    const matchedColor = product.colors.find(color => user.favorite_colors.includes(color));
    if (matchedColor) {
      reasons.push(`comes in your favorite ${matchedColor} color`);
    }

    if (reasons.length === 0) {
      return `A great piece that fits comfortably under your $${user.budget_max} budget.`;
    }

    const explanation = `Recommended because it is ${reasons.join(' and ')}.`;
    return explanation.charAt(0).toUpperCase() + explanation.slice(1);
  }

  private async generateAIExplanations(user: UserProfile, candidates: Product[]): Promise<RecommendationResult[]> {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are an expert fashion stylist. 
        User profile: ${JSON.stringify(user)}
        Top candidate products: ${JSON.stringify(candidates)}
        
        Task: 
        1. Select exactly the top 5 most suitable products for this user out of the candidates.
        2. Write a short, personalized explanation (1 sentence) for EACH selected product, explaining why it fits her specific style, colors, and occasion.
        
        Return ONLY a JSON array with this exact structure:
        [
          {
            "product_id": "string",
            "name": "string",
            "price": number,
            "explanation": "string"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const aiContent = result.response.text();
      
      if (!aiContent) throw new Error("AI returned empty response");

      const parsedData = JSON.parse(aiContent);
      return Array.isArray(parsedData) ? parsedData : parsedData.recommendations || parsedData;
      
    } catch (error) {
      console.error("AI Generation failed. Falling back to local logic:", error);
     
      return candidates.slice(0, 5).map(product => ({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        explanation: this.generateExplanation(user, product)
      }));
    }
  }
}