import type { UserProfile, Product, RecommendationResult } from '../Models/types.js';
import productsData from '../Data/products.json' with { type: 'json' };

const products: Product[] = productsData as Product[];

export class RecommendationService {
  
  public getRecommendations(user: UserProfile): RecommendationResult[] {

    if (!user || !user.budget_max) {
      throw new Error("Invalid user profile: Missing essential fields.");
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

    const topProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.product);


    return topProducts.map(product => ({
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      explanation: this.generateExplanation(user, product)
    }));
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
}