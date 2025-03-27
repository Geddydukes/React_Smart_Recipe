import { AIService } from '@/services/ai';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Google Generative AI library
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
  GenerativeModel: jest.fn(),
}));

describe('AIService', () => {
  let aiService: AIService;
  let mockModel: jest.Mocked<GenerativeModel>;
  let mockVisionModel: jest.Mocked<GenerativeModel>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock model instances
    mockModel = {
      generateContent: jest.fn(),
    } as unknown as jest.Mocked<GenerativeModel>;

    mockVisionModel = {
      generateContent: jest.fn(),
    } as unknown as jest.Mocked<GenerativeModel>;

    // Mock the GoogleGenerativeAI constructor
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    }));

    // Create a new instance of AIService for each test
    aiService = new AIService();
  });

  describe('generateRecipeVideo', () => {
    const videoConfig = {
      recipe: {
        title: 'Test Recipe',
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        instructions: ['Step 1', 'Step 2'],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
      },
      style: {
        aspectRatio: '16:9' as const,
        duration: 60,
        music: 'upbeat' as const,
        transitions: 'minimal' as const,
      },
    };

    it('should generate a video successfully', async () => {
      const mockVideoUrl = 'https://example.com/video.mp4';
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockVideoUrl,
        },
      } as any);

      const result = await aiService.generateRecipeVideo(videoConfig);

      expect(result).toBe(mockVideoUrl);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(videoConfig.recipe.title)
      );
    });

    it('should handle generation error', async () => {
      const error = new Error('Generation failed');
      mockModel.generateContent.mockRejectedValueOnce(error);

      await expect(aiService.generateRecipeVideo(videoConfig)).rejects.toThrow(
        'Video generation failed'
      );
    });
  });

  describe('parseRecipeFromImage', () => {
    const mockImageUrl = 'https://example.com/recipe.jpg';
    const mockParsedRecipe = {
      title: 'Test Recipe',
      ingredients: [
        {
          name: 'Test Ingredient',
          amount: 100,
          unit: 'g',
          category: 'Pantry',
        },
      ],
      instructions: ['Step 1'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
    };

    it('should parse recipe from image successfully', async () => {
      mockVisionModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockParsedRecipe),
        },
      } as any);

      const result = await aiService.parseRecipeFromImage(mockImageUrl);

      expect(result).toEqual(mockParsedRecipe);
      expect(mockVisionModel.generateContent).toHaveBeenCalledWith([
        expect.any(String),
        { inlineData: { imageUrl: mockImageUrl } },
      ]);
    });

    it('should handle parsing error', async () => {
      const error = new Error('Parsing failed');
      mockVisionModel.generateContent.mockRejectedValueOnce(error);

      await expect(
        aiService.parseRecipeFromImage(mockImageUrl)
      ).rejects.toThrow('Recipe parsing failed');
    });
  });

  describe('categorizeIngredients', () => {
    const mockIngredients = ['100g flour', '2 eggs'];
    const mockCategorizedIngredients = [
      {
        name: 'flour',
        amount: 100,
        unit: 'g',
        category: 'Pantry',
      },
      {
        name: 'eggs',
        amount: 2,
        unit: 'pieces',
        category: 'Dairy & Eggs',
      },
    ];

    it('should categorize ingredients successfully', async () => {
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockCategorizedIngredients),
        },
      } as any);

      const result = await aiService.categorizeIngredients(mockIngredients);

      expect(result).toEqual(mockCategorizedIngredients);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(mockIngredients[0])
      );
    });

    it('should handle categorization error', async () => {
      const error = new Error('Categorization failed');
      mockModel.generateContent.mockRejectedValueOnce(error);

      await expect(
        aiService.categorizeIngredients(mockIngredients)
      ).rejects.toThrow('Ingredient categorization failed');
    });
  });
});
