# Chefing - Full Context Document

## Project Overview

Chefing is an AI-powered cooking companion app that helps users create, manage, and share recipes. The app features a modern React Native architecture with Expo Router, TypeScript, and Supabase backend.

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **UI Framework**: React Native Paper
- **Backend**: Supabase
- **AI Integration**: Google Gemini API
- **State Management**: React Context + Local State
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Analytics**: Custom analytics service
- **Accessibility**: Native accessibility features

## Project Structure

```
app/
├── (tabs)/              # Tab-based navigation
│   ├── index.tsx        # Home screen
│   ├── recipes/         # Recipe management
│   ├── scan.tsx         # Recipe scanning
│   ├── shopping/        # Shopping list
│   └── settings.tsx     # User settings
├── _layout.tsx          # Root layout
└── onboarding.tsx       # Onboarding flow

components/              # Reusable components
services/               # Business logic
├── ai.ts              # AI service
├── analytics.ts       # Analytics
├── auth.ts           # Authentication
├── recipe.ts         # Recipe management
└── onboarding.ts     # Onboarding state

types/                 # TypeScript definitions
utils/                 # Helper functions
```

## Key Features Implemented

1. **Authentication**

   - Email/password login
   - Social auth (Google, Apple)
   - Protected routes
   - Session management

2. **Recipe Management**

   - Recipe creation
   - Recipe viewing
   - Recipe listing
   - Recipe sharing
   - Image upload

3. **AI Integration**

   - Recipe generation
   - Image-to-recipe parsing
   - Ingredient categorization
   - Video generation

4. **Shopping List**

   - List creation
   - Item management
   - Category organization
   - Smart consolidation

5. **User Experience**
   - Onboarding flow
   - Accessibility support
   - Analytics tracking
   - Performance monitoring

## Database Schema

- **profiles**: User profiles
- **recipes**: Recipe data
- **ingredients**: Recipe ingredients
- **instructions**: Recipe steps
- **shopping_lists**: Shopping lists
- **shopping_items**: Shopping items

## Current State

- Core features implemented
- Database schema established
- Basic UI components created
- Authentication flow working
- AI integration started
- Analytics tracking implemented
- Accessibility features added

## Next Steps

1. Complete AI integration
2. Implement social features
3. Add offline support
4. Enhance performance
5. Add comprehensive testing
6. Implement error boundaries
7. Add data caching
8. Enhance security measures

## Development Guidelines

- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Maintain accessibility standards
- Write clean, documented code
- Use proper state management
- Follow security best practices

## Environment Setup

- Node.js 18+
- Expo CLI
- Supabase account
- Google Cloud account (for Gemini API)
- iOS/Android development environment

## Important Notes

- App is named "Chefing" throughout
- Uses Chefing branding consistently
- Focuses on user experience
- Prioritizes accessibility
- Implements proper error handling
- Follows security best practices
