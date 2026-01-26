# Contributing

Thanks for contributing! This project is a TypeScript monorepo managed with npm workspaces.

## Getting started

```bash
npm install
```

## Useful commands

```bash
npm run lint
npm run test
npm run build
npm run demo
```

## Project structure

- `packages/calendar-heatmap` – vanilla D3 implementation
- `packages/react-calendar-heatmap` – React wrapper
- `example/` – demo site (Vite)

## Changesets (releases)

We use Changesets for versioning and publishing.

```bash
npm run changeset
npm run version
npm run release
```

## Pull requests

- Keep changes focused and well scoped.
- Update tests or add new ones where it makes sense.
- Update docs or examples if the API or behavior changes.
