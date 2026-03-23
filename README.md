# CV Builder

A simple CV/Resume builder.

## Overview

- **Interactive Editor** - Edit your CV sections
- **Autofill from Text** - Paste your existing resume text to automatically extract and populate fields
- **Compact Print** - Clean, professional A4 layout for printing or PDF export

## Contributing

### Prerequisites

- Node.js 24 or higher
- pnpm 10.32.1 or higher

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm format` - Format code with Prettier
- `pnpm check` - Run TypeScript and Svelte checks
- `pnpm test` - Run unit tests

## Deployment

### Netlify

This project is configured for seamless deployment to Netlify using the `@sveltejs/adapter-netlify` adapter.

**Deploy via Netlify UI:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Netlify will auto-detect settings from `netlify.toml`:
   - Build command: `pnpm run build`
   - Publish directory: `build`
   - Node version: 24
6. Click "Deploy site"

**Required Environment Variables:**
Set these in the Netlify UI (Site settings → Environment variables):
- `BASE_URL` - Your site's URL (e.g., `https://your-site.netlify.app`)
- `PRIVATE_KEY` - OAuth private key for AT Protocol authentication (keep this secret!)

**Deploy via CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --build --prod
```

## License

MIT
