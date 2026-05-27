import request from 'supertest';
import app from '../src/app.js';

describe('Recommendation API Tests', () => {


  it('should return up to 5 recommendations with explanations for a valid profile', async () => {
    const validProfile = {
      user_id: "u_123",
      age: 32,
      style_preferences: ["casual", "minimalist"],
      favorite_colors: ["black", "white"],
      avoid_colors: ["neon_yellow"],
      occasion: "work_from_home",
      budget_max: 300
    };

    const response = await request(app)
      .post('/api/recommend')
      .send({ profile: validProfile, use_ai: false }); 

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeLessThanOrEqual(5); 

    if (response.body.data.length > 0) {
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('product_id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('price');
      expect(firstItem).toHaveProperty('explanation');
      expect(firstItem.price).toBeLessThanOrEqual(300); 
    }
  });


  it('should return 400 Bad Request when mandatory fields are missing', async () => {
    const invalidProfile = {
      user_id: "u_123",

      age: 32,
      style_preferences: ["casual"],
      favorite_colors: ["black"],
      avoid_colors: []
    };

    const response = await request(app)
      .post('/api/recommend')
      .send({ profile: invalidProfile });

    expect(response.status).toBe(400); 
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Invalid input data");
    expect(response.body.details).toBeDefined(); 
  });

  it('should return an empty array if no products match the criteria', async () => {
    const poorProfile = {
      user_id: "u_999",
      age: 25,
      style_preferences: ["casual"],
      favorite_colors: ["black"],
      avoid_colors: [],
      occasion: "work_from_home",
      budget_max: 5
    };

    const response = await request(app)
      .post('/api/recommend')
      .send({ profile: poorProfile, use_ai: false });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

});