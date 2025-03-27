# Recipe App Overview

## Current Features

### Home Screen (`app/(tabs)/index.tsx`)
- Featured recipe showcase
- Trending recipes section
- Quick actions grid
- Variables:
  - No state management currently implemented
  - Static UI only

### Recipes Screen (`app/(tabs)/recipe/index.tsx`)
- Recipe list view with categories
- Search functionality
- Filter button (UI only)
- Variables:
  - Search input state (local)
  - Category filter state (local)

### Recipe Details (`app/(tabs)/recipe/details.tsx`)
- Recipe information display
- Video generation feature
- Variables:
  - `isGeneratingVideo` (local state)
  - `videoUrl` (local state)

### Recipe Creation (`app/(tabs)/recipe/create.tsx`)
- Form for new recipes
- Variables:
  - `form` (local state) containing:
    - title
    - prepTime
    - cookTime
    - servings
    - ingredients
    - instructions

### Scan Screen (`app/(tabs)/scan.tsx`)
- Image upload functionality
- Camera integration (non-web platforms)
- AI recipe parsing
- Variables:
  - `scanning` (local state)
  - `error` (local state)

### Shopping List (`app/(tabs)/shopping/index.tsx`)
- Categorized shopping items
- Add/remove items
- Check/uncheck items
- Variables:
  - `newItem` (local state)
  - `items` (local state) with ShoppingItem interface

### Shopping Cart (`app/(tabs)/shopping/cart.tsx`)
- Cart view for selected items
- Variables:
  - `items` (local state) with ShoppingItem interface

### Settings Screen (`app/(tabs)/settings.tsx`)
- User profile section
- Preferences
- Security settings
- Support options
- Variables:
  - No state management currently implemented
  - Static UI only

## Services

### AI Service (`services/ai.ts`)
- Recipe parsing from images
- Video generation
- Ingredient categorization
- Variables:
  - `aiService` (singleton instance)
  - Uses Gemini API

## Types

### Recipe Types (`types/recipe.ts`)
- GroceryCategory enum
- Recipe interface
- Ingredient interface
- ShoppingItem interface

## Utilities

### Shopping Utils (`utils/shopping.ts`)
- Shopping list consolidation
- Amount formatting
- Functions:
  - `consolidateShoppingList`
  - `consolidateAmounts`
  - `formatAmount`

## Needed Implementations

1. Database Integration
   - Supabase setup
   - Recipe storage
   - User authentication
   - Shopping list persistence

2. State Management
   - Global state solution needed
   - User session management
   - Recipe data caching

3. Recipe Features
   - Recipe editing
   - Recipe sharing
   - Recipe favorites
   - Recipe categories/tags
   - Recipe search with filters

4. Shopping List Features
   - Smart shopping list consolidation
   - Recipe-based shopping lists
   - Shopping history
   - List sharing

5. AI Integration
   - Complete Gemini API integration
   - Recipe video generation
   - Image-to-recipe parsing
   - Ingredient categorization

6. User Features
   - User profiles
   - Settings persistence
   - Theme customization
   - Language selection
   - Notifications

7. Performance Optimizations
   - Image caching
   - Data prefetching
   - Lazy loading
   - Pagination

8. Testing
   - Unit tests
   - Integration tests
   - E2E tests

9. Error Handling
   - Comprehensive error states
   - Offline support
   - Error boundaries
   - Loading states

10. Security
    - Input validation
    - Data sanitization
    - API security
    - User data protection

11. Accessibility
    - Screen reader support
    - Keyboard navigation
    - Color contrast
    - Focus management

12. Analytics
    - Usage tracking
    - Error tracking
    - Performance monitoring
    - User engagement metrics