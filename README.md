## LostLink

React and Express lost-and-found platform with Prisma, PostgreSQL, claims, admin moderation, and optional Gemini matching.

### Deploy as one free website

The repository includes a Vercel configuration for a single deployment:

1. Import the GitHub repository into Vercel.
2. Keep the project root as the repository root.
3. Add these environment variables in Vercel:
	- `DATABASE_URL`: your PostgreSQL/Neon connection string
	- `JWT_SECRET`: a random value of at least 32 characters
	- `NODE_ENV`: `production`
	- `AI_PROVIDER`: `gemini` (optional)
	- `AI_API_KEY`: your Gemini key (optional)
	- `AI_MODEL`: `gemini-2.5-flash` (optional)
4. Deploy. The frontend and `/api` run on the same domain.

Never commit `.env`; use Vercel environment variables for secrets.
