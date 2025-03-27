import { RecipeService } from '@/services/recipe';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/recipe';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('RecipeService', () => {
  let recipeService: RecipeService;
  const mockUser = { id: 'user-1' };
  const mockRecipe: Omit<
    Recipe,
    'id' | 'createdAt' | 'updatedAt' | 'authorId'
  > = {
    title: 'Test Recipe',
    description: 'Test Description',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    image: 'https://example.com/image.jpg',
    ingredients: [
      {
        name: 'Test Ingredient',
        amount: 100,
        unit: 'g',
        category: 'test',
      },
    ],
    instructions: ['Step 1'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUser });
    recipeService = new RecipeService();
  });

  describe('createRecipe', () => {
    it('should create recipe successfully', async () => {
      const mockCreatedRecipe = {
        id: 'recipe-1',
        ...mockRecipe,
        author_id: mockUser.id,
        created_at: '2024-03-20T10:00:00Z',
        updated_at: '2024-03-20T10:00:00Z',
      };

      (supabase.from as jest.Mock).mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedRecipe }),
      }));

      const result = await recipeService.createRecipe(mockRecipe);

      expect(result).toEqual(mockCreatedRecipe);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(supabase.from).toHaveBeenCalledWith('ingredients');
      expect(supabase.from).toHaveBeenCalledWith('instructions');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(recipeService.createRecipe(mockRecipe)).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error if recipe creation fails', async () => {
      (supabase.from as jest.Mock).mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ error: new Error('Database error') }),
      }));

      await expect(recipeService.createRecipe(mockRecipe)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getRecipe', () => {
    it('should get recipe by id', async () => {
      const mockRecipeData = {
        id: 'recipe-1',
        ...mockRecipe,
        author_id: mockUser.id,
        created_at: '2024-03-20T10:00:00Z',
        updated_at: '2024-03-20T10:00:00Z',
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions.map((content, index) => ({
          recipe_id: 'recipe-1',
          step_number: index + 1,
          content,
        })),
      };

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRecipeData }),
      }));

      const result = await recipeService.getRecipe('recipe-1');

      expect(result).toEqual(mockRecipeData);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error if recipe not found', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
      }));

      await expect(recipeService.getRecipe('recipe-1')).rejects.toThrow(
        'Recipe not found'
      );
    });
  });

  describe('getUserRecipes', () => {
    it('should get user recipes', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          ...mockRecipe,
          author_id: mockUser.id,
          created_at: '2024-03-20T10:00:00Z',
          updated_at: '2024-03-20T10:00:00Z',
          ingredients: mockRecipe.ingredients,
          instructions: mockRecipe.instructions.map((content, index) => ({
            recipe_id: 'recipe-1',
            step_number: index + 1,
            content,
          })),
        },
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRecipes }),
      }));

      const result = await recipeService.getUserRecipes();

      expect(result).toEqual(mockRecipes);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(recipeService.getUserRecipes()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('updateRecipe', () => {
    const mockUpdates = {
      title: 'Updated Recipe',
      description: 'Updated Description',
    };

    it('should update recipe successfully', async () => {
      const mockUpdatedRecipe = {
        id: 'recipe-1',
        ...mockRecipe,
        ...mockUpdates,
        author_id: mockUser.id,
        updated_at: '2024-03-20T11:00:00Z',
      };

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdatedRecipe }),
      }));

      const result = await recipeService.updateRecipe('recipe-1', mockUpdates);

      expect(result).toEqual(mockUpdatedRecipe);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(
        recipeService.updateRecipe('recipe-1', mockUpdates)
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }));

      await recipeService.deleteRecipe('recipe-1');

      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(recipeService.deleteRecipe('recipe-1')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes successfully', async () => {
      const mockRecipes = [
        {
          id: 'recipe-1',
          ...mockRecipe,
          author_id: mockUser.id,
          created_at: '2024-03-20T10:00:00Z',
          updated_at: '2024-03-20T10:00:00Z',
          ingredients: [{ name: 'Test Ingredient' }],
          instructions: [{ content: 'Step 1' }],
        },
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRecipes }),
      }));

      const result = await recipeService.searchRecipes('test');

      expect(result).toEqual(mockRecipes);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('should handle empty search results', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [] }),
      }));

      const result = await recipeService.searchRecipes('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
