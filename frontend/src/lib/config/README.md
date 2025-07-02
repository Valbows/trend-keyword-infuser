# G.O.A.T. C.O.D.E.X. B.O.T. - Environment Configuration Guide

## Environment Variable Architecture

This project implements a robust, 'Durable', and 'Tactical' approach to environment variable management across multiple deployment contexts:

1. **Development Environment**

   - Uses `.env.development` for mock values during local development
   - Developers should copy `.env.local.example` to `.env.local` with actual values

2. **CI/CD Environment (GitHub Actions)**

   - Uses GitHub Secrets with proper variable mapping in workflow file
   - Both `SUPABASE_SERVICE_KEY` and `SUPABASE_KEY` naming conventions supported

3. **Production Environment (Vercel)**
   - Uses Vercel environment variables configured in project settings
   - Mapped through `next.config.js` for runtime access

## Required Environment Variables

| Variable                                 | Purpose                     | Required In      |
| ---------------------------------------- | --------------------------- | ---------------- |
| `SUPABASE_URL`                           | Supabase project URL        | All environments |
| `SUPABASE_KEY` or `SUPABASE_SERVICE_KEY` | API key for Supabase access | All environments |
| `GEMINI_API_KEY`                         | Google Gemini API access    | Optional         |
| `YOUTUBE_API_KEY`                        | YouTube Data API access     | Optional         |

## Implementation Details

1. **Centralized Configuration**: All environment variables are accessed through the `environment.ts` module, which provides:

   - Type safety with the `EnvironmentVariables` interface
   - Validation with meaningful error messages
   - Fallback mechanisms for different naming conventions

2. **Service Layer Integration**: Services use the centralized configuration for consistent access:

   ```typescript
   import { env } from '../config/environment';

   // Use environment variables
   const url = env.SUPABASE_URL;
   ```

3. **Error Handling**: The `serviceUtils.ts` module provides standardized error handling patterns for all service operations:
   ```typescript
   return await withErrorHandling<Script[]>('operation', async () => {
     // Service implementation
   });
   ```

## Adding New Environment Variables

1. Add the variable to the `EnvironmentVariables` interface in `environment.ts`
2. Add validation logic in the `getEnvironmentVariables()` function
3. Add the variable to the appropriate `.env` files
4. Configure the variable in GitHub Actions and Vercel

## Troubleshooting

If you encounter environment variable errors:

1. **Local Development**: Check your `.env.local` file
2. **CI/CD**: Verify GitHub Secrets configuration
3. **Vercel**: Check environment variables in Vercel project settings

All environment variables are logged during build (with sensitive values masked) to help diagnose issues.
