This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory based on `.env.example`:
   
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your `.env.local` file** with actual values:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devevents?retryWrites=true&w=majority

   # JWT Configuration (generate with: openssl rand -base64 32)
   JWT_SECRET=your_long_random_secret_key_here_at_least_32_characters

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Cloudinary Configuration (for image uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # PostHog Configuration (analytics - optional)
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Development Setup with Dummy Credentials

For local development and testing, use these dummy credentials:

```env
# MongoDB Configuration - Using local instance (required)
# Make sure MongoDB is running on localhost:27017
MONGODB_URI=mongodb://127.0.0.1:27017/devevents

# JWT Configuration (for development only)
JWT_SECRET=dev_secret_key_change_in_production_min_32_characters_long_required

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Cloudinary Configuration (dummy for development)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=devevent

# PostHog Configuration (dummy for development)
NEXT_PUBLIC_POSTHOG_KEY=phc_test_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Prerequisites for local development:**
- MongoDB must be installed and running on `localhost:27017`
- To verify MongoDB is running: `mongosh`

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

git add README.md
## Security Best Practices

1. **Environment Variables**: Store all secrets in `.env.local` (never commit)
2. **Strong JWT Secret**: Use at least 32 characters (generate with `openssl rand -base64 32`)
3. **Password Security**: Passwords are hashed with bcryptjs (10 salt rounds)
4. **Token Expiration**: Tokens expire after 30 days
5. **HTTPS in Production**: Always use HTTPS when deploying

## Deployment

### Vercel

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these on your hosting platform:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Secure random secret (different from development)
- `NEXT_PUBLIC_API_URL` - Your production URL
- `CLOUDINARY_*` - Cloudinary credentials
- `NEXT_PUBLIC_POSTHOG_*` - PostHog analytics (if using)

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT Authentication](https://jwt.io)

## Troubleshooting

**MONGODB_URI not defined**: Ensure `.env.local` exists with MongoDB URI

**JWT_SECRET not defined**: Add JWT_SECRET to `.env.local` and restart dev server

**Authentication not working**: Check browser console for errors and verify MongoDB connection

**Events not displaying**: Verify MongoDB is running and events exist in database

## Support

For issues and questions, please create an issue in the GitHub repository.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
