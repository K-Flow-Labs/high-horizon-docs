# High Horizon Docs

Public static documentation for High Horizon operating boundaries and implementation notes.

## Build

```bash
npm run build
```

The generated site is written to `dist/`.

## Local Preview

```bash
npm run preview
```

Open `http://127.0.0.1:8788`.

## Deploy

```bash
npx wrangler pages project create high-horizon-docs --production-branch main
npm run build
npx wrangler pages deploy dist --project-name high-horizon-docs --branch main
```

Custom domain setup uses `docs.high-horizon.net` so the existing `high-horizon.net` homepage remains untouched.
