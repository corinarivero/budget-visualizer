# Ledger — a budget visualizer

A small, good-looking expense tracker. Log what you spend, watch it print to
a receipt tape, and see it broken down by category and by day.

Everything is saved in your browser's `localStorage` — no backend, no
database, no account. Open it, use it, close it, it's still there next time.

## Run it

No build step needed. Just open `index.html` in your browser:

```bash
open index.html          # macOS
```

Or, for a nicer local dev loop (auto-reload isn't included, but this avoids
any file:// quirks with some browsers):

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Project structure

```
budget-visualizer/
├── index.html    structure
├── style.css     the "ledger book" visual design
├── script.js     storage, form handling, charts
└── README.md
```

## Ideas to extend it

- Add a monthly filter/dropdown instead of always showing "this month"
- Export entries as CSV
- Add a budget limit per category with a warning when you're close
- Swap localStorage for a tiny backend (Flask/Express + SQLite) so entries
  sync across devices
- Add recurring expenses (rent, subscriptions) that auto-post each month

## Push this to GitHub

```bash
cd budget-visualizer
git init
git add .
git commit -m "Initial commit: budget visualizer"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/budget-visualizer.git
git push -u origin main
```

(Create the empty repo on GitHub first via the "+" → "New repository" button,
without a README, so there's no merge conflict on first push.)
