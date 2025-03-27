import { act } from '@testing-library/react-native';
import { useRecipeStore } from '@/store/recipe';
import { recipeService } from '@/services/recipe';

// Mock recipe service
jest.mock('@/services/recipe', () => ({
  recipeService: {
    getRecipe: jest.fn(),
    getUserRecipes: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    searchRecipes: jest.fn(),
  },
}));

describe('Recipe Store', () => {
  const mockRecipes = [
    {
      id: '1',
      title: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta dish',
      ingredients: [
        {
          name: 'Spaghetti',
          amount: 500,
          unit: 'g',
          category: 'pasta',
        },
        {
          name: 'Eggs',
          amount: 4,
          unit: 'pieces',
          category: 'dairy',
        },
      ],
      instructions: ['Boil pasta', 'Mix eggs with cheese', 'Combine and serve'],
      servings: 4,
      prepTime: 20,
      cookTime: 15,
      image: 'https://example.com/carbonara.jpg',
      authorId: 'user-1',
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useRecipeStore.setState({
        recipes: [],
        currentRecipe: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('loadRecipes', () => {
    it('should load recipes successfully', async () => {
      (recipeService.getUserRecipes as jest.Mock).mockResolvedValueOnce(
        mockRecipes
      );

      await act(async () => {
        await useRecipeStore.getState().loadRecipes();
      });

      expect(useRecipeStore.getState().recipes).toEqual(mockRecipes);
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to load recipes');
      (recipeService.getUserRecipes as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        await useRecipeStore.getState().loadRecipes();
      });

      expect(useRecipeStore.getState().recipes).toEqual([]);
      expect(useRecipeStore.getState().error).toBe('Failed to load recipes');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });

  describe('loadRecipe', () => {
    it('should load single recipe successfully', async () => {
      const recipe = mockRecipes[0];
      (recipeService.getRecipe as jest.Mock).mockResolvedValueOnce(recipe);

      await act(async () => {
        await useRecipeStore.getState().loadRecipe('1');
      });

      expect(useRecipeStore.getState().currentRecipe).toEqual(recipe);
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle loading error for single recipe', async () => {
      const error = new Error('Failed to load recipe');
      (recipeService.getRecipe as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        await useRecipeStore.getState().loadRecipe('1');
      });

      expect(useRecipeStore.getState().currentRecipe).toBe(null);
      expect(useRecipeStore.getState().error).toBe('Failed to load recipe');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });

  describe('createRecipe', () => {
    const newRecipe = {
      title: 'New Recipe',
      description: 'Test recipe',
      ingredients: [
        {
          name: 'Ingredient 1',
          amount: 100,
          unit: 'g',
          category: 'test',
        },
      ],
      instructions: ['Step 1'],
      servings: 2,
      prepTime: 10,
      cookTime: 20,
      image: 'https://example.com/test.jpg',
    };

    it('should create recipe successfully', async () => {
      const createdRecipe = {
        ...newRecipe,
        id: '2',
        authorId: 'user-1',
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T12:00:00Z',
      };
      (recipeService.createRecipe as jest.Mock).mockResolvedValueOnce(
        createdRecipe
      );

      await act(async () => {
        await useRecipeStore.getState().createRecipe(newRecipe);
      });

      expect(recipeService.createRecipe).toHaveBeenCalledWith(newRecipe);
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create recipe');
      (recipeService.createRecipe as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useRecipeStore.getState().createRecipe(newRecipe);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useRecipeStore.getState().error).toBe('Failed to create recipe');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });

  describe('updateRecipe', () => {
    const updatedRecipe = {
      ...mockRecipes[0],
      title: 'Updated Recipe Name',
    };

    it('should update recipe successfully', async () => {
      (recipeService.updateRecipe as jest.Mock).mockResolvedValueOnce(
        updatedRecipe
      );

      await act(async () => {
        await useRecipeStore.getState().updateRecipe('1', updatedRecipe);
      });

      expect(recipeService.updateRecipe).toHaveBeenCalledWith(
        '1',
        updatedRecipe
      );
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update recipe');
      (recipeService.updateRecipe as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useRecipeStore.getState().updateRecipe('1', updatedRecipe);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useRecipeStore.getState().error).toBe('Failed to update recipe');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      (recipeService.deleteRecipe as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await useRecipeStore.getState().deleteRecipe('1');
      });

      expect(recipeService.deleteRecipe).toHaveBeenCalledWith('1');
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete recipe');
      (recipeService.deleteRecipe as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useRecipeStore.getState().deleteRecipe('1');
        } catch (e) {
          // Error is expected
        }
      });

      expect(useRecipeStore.getState().error).toBe('Failed to delete recipe');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });

  describe('searchRecipes', () => {
    const searchQuery = 'pasta';

    it('should search recipes successfully', async () => {
      (recipeService.searchRecipes as jest.Mock).mockResolvedValueOnce(
        mockRecipes
      );

      await act(async () => {
        await useRecipeStore.getState().searchRecipes(searchQuery);
      });

      expect(recipeService.searchRecipes).toHaveBeenCalledWith(searchQuery);
      expect(useRecipeStore.getState().recipes).toEqual(mockRecipes);
      expect(useRecipeStore.getState().loading).toBe(false);
      expect(useRecipeStore.getState().error).toBe(null);
    });

    it('should handle search error', async () => {
      const error = new Error('Failed to search recipes');
      (recipeService.searchRecipes as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        await useRecipeStore.getState().searchRecipes(searchQuery);
      });

      expect(useRecipeStore.getState().error).toBe('Failed to search recipes');
      expect(useRecipeStore.getState().loading).toBe(false);
    });
  });
});
