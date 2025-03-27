import { act } from '@testing-library/react-native';
import { useShoppingStore } from '@/store/shopping';
import { shoppingService } from '@/services/shopping';

// Mock shopping service
jest.mock('@/services/shopping', () => ({
  shoppingService: {
    getShoppingList: jest.fn(),
    addToShoppingList: jest.fn(),
    toggleItemChecked: jest.fn(),
    removeItem: jest.fn(),
    clearCheckedItems: jest.fn(),
    updateItemAmount: jest.fn(),
  },
}));

describe('Shopping Store', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Apples',
      amount: 5,
      totalAmount: '5',
      unit: 'pieces',
      checked: false,
      category: 'produce',
      recipes: [],
    },
    {
      id: '2',
      name: 'Milk',
      amount: 1,
      totalAmount: '1',
      unit: 'liter',
      checked: true,
      category: 'dairy',
      recipes: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useShoppingStore.setState({
        items: [],
        loading: false,
        error: null,
      });
    });
  });

  describe('loadItems', () => {
    it('should load shopping list items successfully', async () => {
      (shoppingService.getShoppingList as jest.Mock).mockResolvedValueOnce(
        mockItems
      );

      await act(async () => {
        await useShoppingStore.getState().loadItems();
      });

      expect(useShoppingStore.getState().items).toEqual(mockItems);
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to load items');
      (shoppingService.getShoppingList as jest.Mock).mockRejectedValueOnce(
        error
      );

      await act(async () => {
        await useShoppingStore.getState().loadItems();
      });

      expect(useShoppingStore.getState().items).toEqual([]);
      expect(useShoppingStore.getState().error).toBe(
        'Failed to load shopping list'
      );
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });

  describe('addItems', () => {
    const newItems = [
      {
        name: 'Bananas',
        amount: 3,
        unit: 'pieces',
        category: 'produce',
      },
    ];

    it('should add items successfully', async () => {
      (shoppingService.addToShoppingList as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      (shoppingService.getShoppingList as jest.Mock).mockResolvedValueOnce([
        ...mockItems,
        ...newItems,
      ]);

      await act(async () => {
        await useShoppingStore
          .getState()
          .addItems(newItems, 'recipe-1', 'Banana Bread');
      });

      expect(shoppingService.addToShoppingList).toHaveBeenCalledWith(
        newItems,
        'recipe-1',
        'Banana Bread'
      );
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle add items error', async () => {
      const error = new Error('Failed to add items');
      (shoppingService.addToShoppingList as jest.Mock).mockRejectedValueOnce(
        error
      );

      await act(async () => {
        try {
          await useShoppingStore
            .getState()
            .addItems(newItems, 'recipe-1', 'Banana Bread');
        } catch (e) {
          // Error is expected
        }
      });

      expect(useShoppingStore.getState().error).toBe('Failed to add items');
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });

  describe('toggleItem', () => {
    it('should toggle item checked status successfully', async () => {
      act(() => {
        useShoppingStore.setState({ items: mockItems });
      });

      (shoppingService.toggleItemChecked as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await useShoppingStore.getState().toggleItem('1', true);
      });

      const updatedItems = useShoppingStore.getState().items;
      expect(updatedItems.find((item) => item.id === '1')?.checked).toBe(true);
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle toggle error', async () => {
      const error = new Error('Failed to toggle item');
      (shoppingService.toggleItemChecked as jest.Mock).mockRejectedValueOnce(
        error
      );

      await act(async () => {
        try {
          await useShoppingStore.getState().toggleItem('1', true);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useShoppingStore.getState().error).toBe('Failed to update item');
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      act(() => {
        useShoppingStore.setState({ items: mockItems });
      });

      (shoppingService.removeItem as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await useShoppingStore.getState().removeItem('1');
      });

      expect(useShoppingStore.getState().items).toHaveLength(1);
      expect(
        useShoppingStore.getState().items.find((item) => item.id === '1')
      ).toBeUndefined();
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle remove error', async () => {
      const error = new Error('Failed to remove item');
      (shoppingService.removeItem as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useShoppingStore.getState().removeItem('1');
        } catch (e) {
          // Error is expected
        }
      });

      expect(useShoppingStore.getState().error).toBe('Failed to remove item');
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });

  describe('clearCheckedItems', () => {
    it('should clear checked items successfully', async () => {
      act(() => {
        useShoppingStore.setState({ items: mockItems });
      });

      (shoppingService.clearCheckedItems as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await useShoppingStore.getState().clearCheckedItems();
      });

      expect(useShoppingStore.getState().items).toHaveLength(1);
      expect(
        useShoppingStore.getState().items.every((item) => !item.checked)
      ).toBe(true);
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle clear checked items error', async () => {
      const error = new Error('Failed to clear checked items');
      (shoppingService.clearCheckedItems as jest.Mock).mockRejectedValueOnce(
        error
      );

      await act(async () => {
        try {
          await useShoppingStore.getState().clearCheckedItems();
        } catch (e) {
          // Error is expected
        }
      });

      expect(useShoppingStore.getState().error).toBe(
        'Failed to clear checked items'
      );
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });

  describe('updateItemAmount', () => {
    it('should update item amount successfully', async () => {
      act(() => {
        useShoppingStore.setState({ items: mockItems });
      });

      (shoppingService.updateItemAmount as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        await useShoppingStore.getState().updateItemAmount('1', 10);
      });

      expect(
        useShoppingStore.getState().items.find((item) => item.id === '1')
          ?.amount
      ).toBe(10);
      expect(useShoppingStore.getState().loading).toBe(false);
      expect(useShoppingStore.getState().error).toBe(null);
    });

    it('should handle update amount error', async () => {
      const error = new Error('Failed to update amount');
      (shoppingService.updateItemAmount as jest.Mock).mockRejectedValueOnce(
        error
      );

      await act(async () => {
        try {
          await useShoppingStore.getState().updateItemAmount('1', 10);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useShoppingStore.getState().error).toBe(
        'Failed to update item amount'
      );
      expect(useShoppingStore.getState().loading).toBe(false);
    });
  });
});
