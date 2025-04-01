# React Smart Recipe App

A smart recipe management application with premium features powered by Stripe subscriptions.

## Features

### Free Tier

- Basic shopping list functionality
- Basic recipe management
- Basic calorie tracking
- Limited recipe storage

### Premium Features

- Advanced shopping list features
  - Smart categorization
  - Barcode scanning
  - Price tracking
  - Shopping history
- Advanced recipe management
  - AI-powered recipe suggestions
  - Custom recipe creation
  - Recipe sharing
  - Unlimited recipe storage
- Advanced calorie tracking
  - Detailed nutritional information
  - Meal planning
  - Progress tracking
  - Custom goals
- Additional premium features
  - Ad-free experience
  - Offline access
  - Priority support

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Stripe account
- Supabase account

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create two products in your Stripe dashboard:
   - Monthly subscription ($7.99/month)
   - Annual subscription ($63.99/year)
3. Get your API keys from the Stripe dashboard
4. Set up a webhook endpoint in your Stripe dashboard pointing to:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
5. Get your webhook signing secret from the Stripe dashboard

### Database Setup

1. Run the database migrations:
   ```bash
   npx supabase db push
   ```
2. Verify the subscriptions table was created:
   ```bash
   npx supabase db dump
   ```

### Installation

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## Subscription Management

### Creating a Subscription

1. User selects a plan (monthly or annual)
2. User enters payment information
3. Stripe processes the payment
4. Webhook updates the database with subscription details

### Managing Subscriptions

- Users can view their subscription status
- Users can cancel their subscription
- Users can reactivate canceled subscriptions
- Failed payments are handled automatically

### Security

- All API endpoints are protected with authentication
- Stripe webhooks are verified using signatures
- Database access is controlled with Row Level Security
- Sensitive data is encrypted at rest

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
