import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { GroceryCategory, Ingredient } from '../types/recipe';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export interface VideoGenerationConfig {
  recipe: {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
  };
  style: {
    aspectRatio: '9:16' | '16:9' | '1:1';
    duration: number;
    music: 'upbeat' | 'relaxing' | 'none';
    transitions: 'minimal' | 'dynamic';
  };
}

export interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
}

export class AIService {
  private model: GenerativeModel;
  private visionModel: GenerativeModel;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });
    this.visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  }

  async generateRecipeVideo(config: VideoGenerationConfig): Promise<string> {
    try {
      const prompt = this.buildVideoPrompt(config);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const videoUrl = response.text();
      return videoUrl;
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw new Error('Video generation failed');
    }
  }

  private buildVideoPrompt(config: VideoGenerationConfig): string {
    return `
Create a viral cooking video for ${config.recipe.title} with the following specifications:

Style:
- Aspect Ratio: ${config.style.aspectRatio}
- Duration: ${config.style.duration} seconds
- Music: ${config.style.music}
- Transitions: ${config.style.transitions}

Recipe Details:
- Prep Time: ${config.recipe.prepTime} minutes
- Cook Time: ${config.recipe.cookTime} minutes
- Servings: ${config.recipe.servings}

Ingredients:
${config.recipe.ingredients.map(i => `- ${i}`).join('\n')}

Instructions:
${config.recipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Please generate a visually appealing, step-by-step cooking video optimized for social media sharing.
Include dynamic text overlays, engaging transitions, and proper pacing for each step.
    `.trim();
  }

  async parseRecipeFromImage(imageUrl: string): Promise<{
    ingredients: ParsedIngredient[];
    instructions: string[];
    title?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
  }> {
    try {
      const prompt = `
Analyze this recipe image and extract the following information in JSON format:
{
  "title": "Recipe title if visible",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": number,
      "unit": "measurement unit",
      "category": "one of: ${Object.values(GroceryCategory).join(', ')}"
    }
  ],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": "preparation time in minutes if specified",
  "cookTime": "cooking time in minutes if specified",
  "servings": "number of servings if specified"
}

For ingredients, categorize each item into the most appropriate grocery category.
Parse amounts into numerical values and standardize units.
      `.trim();

      const result = await this.visionModel.generateContent([
        prompt,
        { inlineData: { imageUrl } }
      ]);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Failed to parse recipe from image:', error);
      throw new Error('Recipe parsing failed');
    }
  }

  async categorizeIngredients(ingredients: string[]): Promise<ParsedIngredient[]> {
    try {
      const prompt = `
Analyze these ingredients and categorize them. Return a JSON array with parsed amounts and appropriate grocery categories:
[
  {
    "name": "ingredient name",
    "amount": number,
    "unit": "measurement unit",
    "category": "one of: ${Object.values(GroceryCategory).join(', ')}"
  }
]

Input ingredients:
${ingredients.join('\n')}

Guidelines:
- Parse ingredient amounts into numerical values
- Standardize units (e.g., cups, tablespoons, ounces)
- Categorize each ingredient into the most appropriate grocery section
- Handle combined measurements (e.g., "1 1/2 cups" should be 1.5)
      `.trim();

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Failed to categorize ingredients:', error);
      throw new Error('Ingredient categorization failed');
    }
  }
}

export const aiService = new AIService();