import { ShoppingService } from '@/services/shopping';
import { supabase } from '@/lib/supabase';
import { Ingredient } from '@/types/recipe';

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
    })),
  },
}));

describe('ShoppingService', () => {
  let shoppingService: ShoppingService;
  const mockUser = { id: 'user-1' };
  const mockIngredients: Ingredient[] = [
    {
      name: 'Test Ingredient',
      amount: 100,
      unit: 'g',
      category: 'test',
    },
  ];
  const mockRecipeId = 'recipe-1';
  const mockRecipeTitle = 'Test Recipe';

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: mockUser });
    shoppingService = new ShoppingService();
  });

  describe('addToShoppingList', () => {
    it('should add new items to shopping list', async () => {
      // Mock that item doesn't exist
      (supabase.from as jest.Mock).mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
      }));

      await shoppingService.addToShoppingList(
        mockIngredients,
        mockRecipeId,
        mockRecipeTitle
      );

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from).toHaveBeenCalledWith('shopping_item_recipes');
    });

    it('should update existing items in shopping list', async () => {
      // Mock that item exists
      const mockExistingItem = {
        id: 'item-1',
        amount: 50,
      };

      (supabase.from as jest.Mock).mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockExistingItem }),
      }));

      await shoppingService.addToShoppingList(
        mockIngredients,
        mockRecipeId,
        mockRecipeTitle
      );

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from).toHaveBeenCalledWith('shopping_item_recipes');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(
        shoppingService.addToShoppingList(
          mockIngredients,
          mockRecipeId,
          mockRecipeTitle
        )
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('getShoppingList', () => {
    it('should get shopping list items', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Test Item',
          amount: 100,
          unit: 'g',
          category: 'test',
          checked: false,
          shopping_item_recipes: [
            {
              recipe_id: mockRecipeId,
              recipe_title: mockRecipeTitle,
            },
          ],
        },
      ];

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockItems }),
      }));

      const result = await shoppingService.getShoppingList();

      expect(result).toEqual(
        mockItems.map((item) => ({
          ...item,
          recipes: item.shopping_item_recipes.map((ref) => ({
            id: ref.recipe_id,
            title: ref.recipe_title,
          })),
        }))
      );
      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(shoppingService.getShoppingList()).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error if database query fails', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
      }));

      await expect(shoppingService.getShoppingList()).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('toggleItemChecked', () => {
    it('should toggle item checked status', async () => {
      const mockItemId = 'item-1';
      const mockChecked = true;

      await shoppingService.toggleItemChecked(mockItemId, mockChecked);

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from('shopping_items').update).toHaveBeenCalledWith({
        checked: mockChecked,
        updated_at: expect.any(String),
      });
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(
        shoppingService.toggleItemChecked('item-1', true)
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('removeItem', () => {
    it('should remove item from shopping list', async () => {
      const mockItemId = 'item-1';

      await shoppingService.removeItem(mockItemId);

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from('shopping_items').delete).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(shoppingService.removeItem('item-1')).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('clearCheckedItems', () => {
    it('should clear all checked items', async () => {
      await shoppingService.clearCheckedItems();

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from('shopping_items').delete).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(shoppingService.clearCheckedItems()).rejects.toThrow(
        'User not authenticated'
      );
    });
  });

  describe('updateItemAmount', () => {
    it('should update item amount', async () => {
      const mockItemId = 'item-1';
      const mockAmount = 200;

      await shoppingService.updateItemAmount(mockItemId, mockAmount);

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(supabase.from('shopping_items').update).toHaveBeenCalledWith({
        amount: mockAmount,
        updated_at: expect.any(String),
      });
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: null });

      await expect(
        shoppingService.updateItemAmount('item-1', 200)
      ).rejects.toThrow('User not authenticated');
    });
  });
});
