class GenerativeModel {
  constructor(config) {
    this.config = config;
  }

  async generateContent(prompt) {
    const mockResponse = {
      response: {
        text: () => {
          if (Array.isArray(prompt) && prompt[0].includes('JSON')) {
            return JSON.stringify({
              title: 'Mock Recipe',
              ingredients: [
                {
                  name: 'Mock Ingredient',
                  amount: 1,
                  unit: 'cup',
                  category: 'PRODUCE',
                },
              ],
              instructions: ['Step 1', 'Step 2'],
              prepTime: 30,
              cookTime: 45,
              servings: 4,
            });
          }
          return 'mock_video_url';
        },
      },
    };
    return mockResponse;
  }
}

export class GoogleGenerativeAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getGenerativeModel(config) {
    return new GenerativeModel(config);
  }
}

module.exports = {
  GoogleGenerativeAI,
  GenerativeModel,
};
