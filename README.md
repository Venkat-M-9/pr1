# System Console — Enterprise Next.js Application

A high-performance, modular Next.js enterprise web application engineered for managing, analyzing, and visualizing large-scale datasets (5,000+ records) with monochrome aesthetics, full accessibility, and real-time client-side interactivity.

---

## 🏛 Architecture & Design System

### 1. Component Layer (`src/components`)
- **Layout**: `PageShell`, `Sidebar`, `TopBar`, `ClientLayout` form the responsive shell.
- **Tables**: `ResourceTable` composite component combines `DataTable` (TanStack Table v8 + `@tanstack/react-virtual`), `FilterBar`, and detail `Drawer`.
- **Charts**: `ChartCard` (Recharts) supports instant chart ↔ data table view switching (Challenge 4).
- **UI System**: `StatusBadge`, `SummaryCard`, `Modal`, `Drawer`, `ConfirmDialog`, `CollapsibleSection`, `LoadingSkeleton`, `ToastContainer`.

### 2. State & Data Layer (`src/context` & `src/hooks`)
- **`DataContext`**: Central reactive data store managing 5,000 system records and 1,500 financial entries with live cross-dashboard updates.
- **`PreferencesContext`**: Persists user settings (`pref_page_size`, `pref_compact`, `pref_notifications`, `pref_virtualization`) to LocalStorage and applies them globally.
- **`useTableManager`**: Reusable generic table state hook managing searching, filtering, sorting, selection, and debouncing.

---

## 🎯 Challenges Implemented

1. **Challenge 1 — Large Data Handling**: Virtualized scrolling via `@tanstack/react-virtual` for 5,000+ records; instant debounced search.
2. **Challenge 2 — Familiar Modules**: Standardized design language using shared `ResourceTable`, `PageShell`, and monochrome styling tokens.
3. **Challenge 3 — Code Reusability**: Single composite `ResourceTable` component and generic `useTableManager` hook eliminate table duplication across Home, Data, and Reports.
4. **Challenge 4 — User Workflow Adaptability**: Toggle between graphical charts and tabular data view on all analytics visualizations.
5. **Challenge 5 — Information Density**: `CollapsibleSection` container lets users collapse heavy visual blocks to prioritize tabular focus.
6. **Challenge 6 — User Feedback**: Global `loading.tsx`, `error.tsx` boundary, `not-found.tsx`, loading skeletons, and interactive toast system.
7. **Challenge 7 — Future Growth**: Barrel exports (`src/components/index.ts`, `src/lib/index.ts`), strict TypeScript interfaces, JSDoc annotations.
8. **Challenge 8 — Responsive Experience**: Responsive layout with mobile hamburger sidebar drawer, auto-collapsing panels, and horizontal table scrolling.
9. **Challenge 9 — Personalization & Productivity**: Centralized preferences provider syncing compact UI mode (`data-density="compact"`), page size defaults, and notification toggles.
10. **Challenge 10 — Real-World Reliability**: `ConfirmDialog` for destructive/large batch operations, empty data export guards, and double-click debouncing.
11. **Challenge 11 — Developer Experience**: Clean directory structure, documented modules, complete TypeScript type coverage.

---

## 🛠 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
```
