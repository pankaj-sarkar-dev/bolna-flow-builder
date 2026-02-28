# Bolna Flow Builder (React + TypeScript + Vite)

A lightweight React + TypeScript flow-builder UI scaffolded with Vite. It provides components and utilities to compose, edit, and preview node-based flows (uses a custom/react flow library integration in `src/context`).

**Getting Started**

- **Requirements:** Node.js 18+ and a package manager (`npm`, `pnpm`, or `yarn`).
- **Install:** `npm install`
- **Run (dev):** `npm run dev` — starts Vite dev server
- **Build:** `npm run build` — runs TypeScript build then `vite build`

**Project Structure (key files)**

- **Root:** package.json, `vite.config.ts`, `tsconfig.json`
- **Entry:** [src/main.tsx](src/main.tsx) — React app bootstrap
- **App shell:** [src/App.tsx](src/App.tsx)
- **Styles:** [src/index.css](src/index.css)

**Source layout**

- **Components:** `src/components/` — reusable UI blocks
  - [src/components/AddNodeModal](src/components/AddNodeModal) — modal for creating nodes
  - [src/components/EdgePanel](src/components/EdgePanel) — edge configuration UI
  - [src/components/JsonViewer](src/components/JsonViewer) — syntax-highlighted JSON display
  - [src/components/NodePanel](src/components/NodePanel) — node properties and actions
  - [src/components/PlayGround](src/components/PlayGround) — main canvas / preview area
  - [src/components/StyledEdge](src/components/StyledEdge) — custom edge renderer
  - Inputs: `TextField`, `SelectField`, `Button`, `PanelTitle` for consistent UI
- **Context:** [src/context/RFContext.tsx](src/context/RFContext.tsx) — central flow context and provider
- **Types:** [src/types/index.ts](src/types/index.ts) — shared TypeScript types
- **Utils:** [src/utils/converter.utils.ts](src/utils/converter.utils.ts) — conversion helpers
- **Validators:** `src/validator/` — request/shape validation helpers (add/edit validations)

**Architecture notes**

- The app centers around a context provider in `src/context/RFContext.tsx` that manages flow state and exposes actions for nodes and edges.
- The `PlayGround` component composes the interactive canvas and connects UI panels (node/edge inspectors) to the context.
- Components are intentionally small and focused — extend or replace with your preferred UI primitives.

**Development tips**

- Type-check and build before publishing: `npm run build` (this runs `tsc -b` then `vite build`).
- Tailwind: configured via `tailwindcss` and `@tailwindcss/vite` plugin (see `package.json` devDependencies).

**Extending the project**

- Add new node types by extending the node model in `src/types/index.ts` and adding renderers in `src/components`.
- For new validation rules, add files under `src/validator` and hook them into forms or context actions.

**Testing & CI**

- This repository does not include a test runner by default. Add your preferred testing setup (Vitest, Jest) and reference the `tsconfig` settings.
# bolna-flow-builder
