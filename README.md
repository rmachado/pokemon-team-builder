# VGC Team Builder

A web-based Pokemon team builder focused on VGC (Video Game Championships) competitive formats. Built with React, TypeScript, and Vite.

## What It Does

This application helps competitive Pokemon players build, analyze, and manage their teams with features including:

- **Team Builder**: Create teams of up to 6 Pokemon with full customization (species, moves, items, abilities, EVs/IVs, natures, Tera Types)
- **Meta Analysis**: View type coverage, matchup tables against the current meta, and Smogon usage statistics
- **Damage Calculator**: Calculate damage between your team members and common meta threats
- **Team Comparison**: Compare your team against saved opposing teams
- **Import/Export**: Support for standard Pokemon Showdown export format
- **Smart Search**: Intelligent search for Pokemon, moves, items, and abilities
- **Format Support**: Multiple competitive formats with format-specific rules and data
- **Local Storage**: Teams are persisted locally in the browser

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Package Manager**: Bun
- **Pokemon Data**: [@pkmn](https://github.com/pkmn/ps) ecosystem (@pkmn/data, @pkmn/dex, @pkmn/sim, @pkmn/smogon)
- **Damage Calculation**: @smogon/calc

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI primitives (Button, Badge, Modal)
│   ├── TeamBuilder/     # Builder tab components
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonEditor.tsx
│   │   ├── MoveEditor.tsx
│   │   ├── ItemEditor.tsx
│   │   ├── AbilityEditor.tsx
│   │   ├── StatEditor.tsx
│   │   ├── EditingPanel.tsx
│   │   └── TeamActions.tsx
│   ├── Analysis/        # Analysis tab components
│   │   ├── TypeCoverage.tsx
│   │   ├── MatchupTable.tsx
│   │   ├── DamageCalcPanel.tsx
│   │   └── TeamComparison.tsx
│   ├── SmartSearch.tsx
│   ├── FormatSelector.tsx
│   └── TabBar.tsx
├── pages/               # Top-level page components (tabs)
│   ├── BuilderTab.tsx
│   ├── AnalysisTab.tsx
│   └── TeamsTab.tsx
├── domain/              # Domain layer (business logic)
│   ├── entities/        # Domain entities
│   │   ├── Pokemon.ts   # Immutable Pokemon entity
│   │   └── Team.ts      # Immutable Team entity
│   └── services/        # Domain services
│       ├── StatsCalculator.ts
│       ├── DamageCalculator.ts
│       ├── MetaAnalyzer.ts
│       ├── SearchEngine.ts
│       ├── DraftRepository.ts
│       └── TeamService.ts
├── stores/              # Zustand state stores
│   ├── teamStore.ts
│   ├── formatStore.ts
│   └── metaStore.ts
├── hooks/               # Custom React hooks
│   ├── useLearnableMoves.ts
│   └── useKeyboardNav.ts
├── lib/                 # Utility libraries
│   ├── pkmn.ts          # Pokemon data access
│   ├── smogonCalc.ts    # Smogon calc integration
│   ├── smogonMeta.ts    # Smogon meta data fetching
│   ├── search.ts        # Search utilities
│   ├── storage.ts       # Local storage helpers
│   ├── importExport.ts  # Showdown format import/export
│   └── theme.ts
├── types/               # TypeScript type definitions
└── App.tsx              # Root application component
```

### Architecture Notes

- **Immutable Domain Models**: `Pokemon` and `Team` are immutable classes using the builder pattern (`withX()` methods). This ensures predictable state changes and easy undo/redo support.
- **Separation of Concerns**: Domain logic lives in `domain/`, UI in `components/`, and state management in `stores/`.
- **SPA with Tabs**: The app uses a tab-based navigation (Builder, Analysis, Teams) with Framer Motion transitions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
bun run build
```

The production build will be output to the `dist/` directory.

### Lint

```bash
bun run lint
```

## Deployment

This project is configured to deploy automatically to **GitHub Pages** via GitHub Actions.

### Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**

### How It Works

Every push to the `master` branch triggers the workflow defined in `.github/workflows/deploy.yml`:

1. Runs on Ubuntu latest
2. Sets up Bun
3. Installs dependencies (`bun install`)
4. Runs lint checks (`bun run lint`)
5. Builds the project (`bun run build`)
6. Deploys the `dist/` folder to GitHub Pages

The deployed site will be available at `https://<username>.github.io/pokemon-teambuilder/`.

## Keyboard Shortcuts

The builder supports keyboard navigation for quick team editing:

| Key | Action |
|-----|--------|
| `1-6` | Edit Pokemon in slot 1-6 |
| `Esc` | Close editing panel |
| Navigation arrows | Move between fields |

## Data Sources

- **Pokemon Data**: [@pkmn/dex](https://github.com/pkmn/ps/tree/main/dex) - Complete Pokemon game data
- **Meta Usage Stats**: [Smogon](https://smogon.com) - Competitive usage statistics
- **Damage Calculation**: [@smogon/calc](https://github.com/smogon/damage-calc/tree/master/calc) - Official damage formula

## Browser Support

This app uses modern web technologies and is tested on:
- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This is a fan-made tool for the Pokemon community. Pokemon and all related trademarks are property of Nintendo, Game Freak, and The Pokemon Company.
