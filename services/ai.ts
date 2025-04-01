import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedRecipe } from '../types/ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);

export const aiService = {
  async parseRecipeFromImage(imageUri: string): Promise<ParsedRecipe> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Convert image URI to base64
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const prompt = `Please analyze this recipe image and extract the following information in JSON format:
      {
        "title": "Recipe title",
        "description": "Brief description of the recipe",
        "cookTime": "Cooking time in minutes",
        "servings": "Number of servings",
        "ingredients": ["List of ingredients"],
        "instructions": ["Step by step instructions"]
      }
      
      Please ensure all measurements are in metric units and times are in minutes.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64.split(',')[1],
          },
        },
      ]);

      const aiResponse = await result.response;
      const text = aiResponse.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse recipe data');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return {
        title: parsedData.title,
        description: parsedData.description,
        cookTime: parseInt(parsedData.cookTime),
        servings: parseInt(parsedData.servings),
        ingredients: parsedData.ingredients,
        instructions: parsedData.instructions,
      };
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw new Error('Failed to parse recipe from image');
    }
  },

  async estimateCaloriesFromImage(imageUri: string): Promise<{
    foodItems: Array<{
      name: string;
      portion: string;
      calories: number;
      confidence: 'High' | 'Medium' | 'Low';
      nutrients: {
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
    totalCalories: number;
    confidence: 'High' | 'Medium' | 'Low';
    notes: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Convert image URI to base64
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const prompt = `Analyze this food image and provide a detailed nutritional breakdown in JSON format:
      {
        "foodItems": [
          {
            "name": "Food name",
            "portion": "Estimated portion size",
            "calories": "Estimated calories",
            "confidence": "High/Medium/Low",
            "nutrients": {
              "protein": "g",
              "carbs": "g",
              "fat": "g"
            }
          }
        ],
        "totalCalories": "Total estimated calories",
        "confidence": "Overall confidence in estimation",
        "notes": "Any relevant notes about the estimation"
      }

      Please ensure:
      1. Portion sizes are in standard measurements (g, ml, cups, etc.)
      2. Confidence levels reflect the clarity of the image and food recognition
      3. Include any visible ingredients or toppings
      4. Note if the estimation is based on typical serving sizes
      5. Consider the visual size of the food items in the image
      6. Account for any visible sauces, dressings, or toppings`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64.split(',')[1],
          },
        },
      ]);

      const aiResponse = await result.response;
      const text = aiResponse.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse calorie data');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return {
        foodItems: parsedData.foodItems.map((item: any) => ({
          ...item,
          calories: parseInt(item.calories),
          nutrients: {
            protein: parseFloat(item.nutrients.protein),
            carbs: parseFloat(item.nutrients.carbs),
            fat: parseFloat(item.nutrients.fat),
          },
        })),
        totalCalories: parseInt(parsedData.totalCalories),
        confidence: parsedData.confidence,
        notes: parsedData.notes,
      };
    } catch (error) {
      console.error('Error estimating calories:', error);
      throw new Error('Failed to estimate calories from image');
    }
  },

  async parseRecipeFromText(recipeText: string): Promise<ParsedRecipe> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Please analyze this recipe text and extract the following information in JSON format:
      {
        "title": "Recipe title",
        "description": "Brief description of the recipe",
        "cookTime": "Cooking time in minutes",
        "servings": "Number of servings",
        "ingredients": ["List of ingredients"],
        "instructions": ["Step by step instructions"]
      }
      
      Recipe text:
      ${recipeText}
      
      Please ensure all measurements are in metric units and times are in minutes.`;

      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;
      const responseText = aiResponse.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Failed to parse recipe data');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return {
        title: parsedData.title,
        description: parsedData.description,
        cookTime: parseInt(parsedData.cookTime),
        servings: parseInt(parsedData.servings),
        ingredients: parsedData.ingredients,
        instructions: parsedData.instructions,
      };
    } catch (error) {
      console.error('Error parsing recipe text:', error);
      throw new Error('Failed to parse recipe from text');
    }
  },
};
