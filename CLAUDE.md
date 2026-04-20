# csswind — project guide

## Stack

- **React 19** — single component (`src/App.jsx`) managing all quiz state
- **Vite 8** — dev server and build tool (`npm run dev`, `npm run build`)
- **DM Mono** — monospace font loaded from Google Fonts, used throughout
- No routing, no state library, no CSS framework

## Key files

| File            | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `src/App.jsx`   | Main component: game logic, state, rendering                   |
| `src/pool.js`   | Question bank — the only file to edit when adding questions    |
| `src/App.css`   | All component styles                                           |
| `src/index.css` | Global reset, CSS variables (colours, fonts, radii), keyframes |

## CSS variables

All design tokens live in `src/index.css` under `:root`. Changing them reskins the whole app.

```css
--bg, --surface, --surface2   /* backgrounds */
--border                      /* borders */
--text, --muted               /* foreground */
--accent, --green             /* primary green (#4ade80) */
--red, --amber                /* wrong / warning states */
--font, --mono                /* both DM Mono */
--radius                      /* 2px — sharp corners */
--max-w                       /* 540px content column */
```

## Adding questions

All questions live in `src/pool.js` as an exported array of `{ tw, css }` pairs:

```js
{ tw: "flex", css: "display: flex" }
```

- `tw` is the Tailwind class name
- `css` is the full CSS declaration (property + value, no semicolon needed)

Each round randomly assigns each question a direction — either Tailwind to CSS or CSS to Tailwind — so every pair covers both directions automatically.

Answer checking is forgiving: case, spaces around `:` and `/`, and trailing semicolons are all normalised before comparison.

### Example additions

```js
{ tw: "sr-only", css: "position: absolute" },
{ tw: "truncate", css: "overflow: hidden" },
{ tw: "not-sr-only", css: "position: static" },
```

For arbitrary value entries, match the format exactly as Tailwind outputs it:

```js
{ tw: "w-[200px]", css: "width: 200px" },
```

## Game constants

In `src/App.jsx`:

```js
const TOTAL_Q = 20; // questions per round
const TOTAL_TIME = 240; // seconds (4 minutes)
```
