
## Goal

Bring your `pyplay-main` project into this Lovable workspace and fix all the pain points you listed: Colab-style text cells, mobile scrolling, browser-side code storage, crash protection, smart auto-indentation, and AI-powered code suggestions.

## Step 1 — Import the project

Copy your existing source into the current workspace:

- `src/components/*` (NotebookCell, CodeEditor, Header, Footer, FileTabs, OutputPanel, PackageInstaller, ProjectTemplates, ShareSaveDownload, HistoryPanel, StatusBar, NavLink, all `ui/*`)
- `src/hooks/*` (usePyodide, useAIFix, useRunHistory, use-mobile, use-toast)
- `src/lib/*` (parse-error, python-errors, utils)
- `src/pages/*` → converted to TanStack Start routes: `routes/index.tsx`, `routes/lessons.tsx`, `routes/docs.tsx`, `routes/admin.tsx`
- `public/favicon.png`, design tokens from your `index.css` → `src/styles.css`

Routing: replace `react-router-dom` `<Link>`/`useNavigate` with `@tanstack/react-router` equivalents inside Header/NavLink. Keep Pyodide loaded via your existing `usePyodide` hook (CDN, client-only).

Lovable Cloud will be enabled to back the AI suggestions, AI fix, and (optional) cloud sync of saved notebooks.

## Step 2 — Fix the 6 issues

### 2a. Colab-style text + code cells
Extend `CellData` with `type: 'code' | 'markdown'`. Add a "+ Text" button next to "+ Code". Markdown cells:
- Edit mode: textarea
- Render mode (on blur / double-click to re-edit): `react-markdown` with GFM, code blocks, headings, lists, links, images
- Same reorder/delete/drag controls as code cells

### 2b. Mobile scrolling
Root cause: Monaco grabs touch events and the cell list uses inner `overflow-auto`, which traps page scroll. Fixes:
- Set Monaco `scrollbar.alwaysConsumeMouseWheel: false`, `scrollBeyondLastLine: false`, fixed height per cell
- Wrap each editor in a container with `touch-action: pan-y`; on mobile, show a "tap to edit" overlay so a single tap scrolls the page and a tap on the overlay opens the editor
- Make the page itself the scroll container (remove inner `overflow-auto` on the cell list); add safe-area padding for iOS

### 2c. Browser storage of code
Add `useNotebookStorage` hook backed by IndexedDB (via `idb-keyval`):
- Auto-save every cell change (debounced 500ms) under a notebook id
- Sidebar drawer "My notebooks" with rename / duplicate / delete / export to `.ipynb`-style JSON
- "New notebook" / "Open" controls in Header
- Survives refresh, offline, and tab close. Optional cloud sync to Lovable Cloud when signed in.

### 2d. Crash hardening
- Wrap each cell render and the page in an `<ErrorBoundary>` with a "Reset cell" button so a single cell failure no longer takes down the whole app
- Run Pyodide in a **Web Worker** (`pyodide.worker.ts`) so an infinite loop or memory blow-up no longer freezes the UI
- Per-run timeout (default 15s) with a "Stop" button that terminates and respawns the worker
- Catch unhandled promise rejections + Pyodide init failure → friendly toast + retry button instead of a white screen
- Persist cell state before each run so a crash can be recovered on reload

### 2e. Smart auto-indent for control flow
Configure Monaco for Python:
- `monaco.languages.setLanguageConfiguration('python', …)` with `onEnterRules`: lines ending in `:` (if/for/while/def/class/try/except/with/elif/else) auto-add one indent level
- `tabSize: 4`, `insertSpaces: true`, `detectIndentation: false`
- Auto-dedent after `return`, `pass`, `break`, `continue`, `raise`
- Bracket matching + auto-close for `()[]{}''""`
- Shift+Tab to dedent block, Tab to indent selection

### 2f. AI code suggestions (next-line completion)
Lovable AI Gateway via a server function `suggestCode`:
- Inline ghost-text (Copilot-style) using Monaco's `InlineCompletionsProvider`
- Trigger: 400ms debounce after a typing pause; sends the last ~40 lines of context + cursor position
- Model: `google/gemini-3-flash-preview` (fast, cheap), prompt constrained to "complete the next 1–3 lines of Python only"
- `Tab` accepts, `Esc` dismisses, `Alt+]` cycles alternatives
- Toggle in Header to disable suggestions
- Handle 402/429 with a non-blocking toast; never block typing

## Step 3 — Polish

- Header: cleaner mobile layout (hamburger sheet), keyboard-shortcut help dialog (`?`)
- Run-all status bar with progress
- Verify Monaco theme switches with light/dark
- SEO `head()` per route

## Technical Notes

- **Stack**: TanStack Start (current workspace) + Pyodide via Web Worker + Monaco + Lovable Cloud (Supabase) + Lovable AI Gateway
- **New deps**: `@monaco-editor/react`, `monaco-editor`, `idb-keyval`, `react-markdown`, `remark-gfm`, `comlink`
- **New files**: `src/workers/pyodide.worker.ts`, `src/hooks/useNotebookStorage.ts`, `src/hooks/usePyodideWorker.ts`, `src/lib/monaco-python.ts`, `src/lib/inline-completions.ts`, `src/lib/suggest.functions.ts`
- **Cloud**: enabled to host the AI suggest server function and (optional) `notebooks(id, user_id, title, cells jsonb, updated_at)` table with RLS
- **Out of scope** unless requested: real-time collaboration, in-notebook file uploads, GPU/heavy ML libraries

```text
┌─ Header (notebooks menu, run-all, AI toggle) ─────────┐
│ ┌─ Cell list (page-scroll) ───────────────────────┐   │
│ │  [code cell]  ▶  ⎘  ⇅  ✕                       │   │
│ │  [text cell]  ✎  ⎘  ⇅  ✕   (markdown render)   │   │
│ │  + Code   + Text                                │   │
│ └─────────────────────────────────────────────────┘   │
│  Pyodide Worker  ←→  Cell runner  ←→  IndexedDB       │
│         ↑                                             │
│  Lovable AI (inline completions, fix-with-AI)         │
└───────────────────────────────────────────────────────┘
```

Approve this and I'll start implementing.
