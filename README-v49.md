# V49 — Question Designer Math Formula Builder

Based on the confirmed V48 frontend.

## Changes
- Added a graphical Math Formula Builder to Question Designer's MathEditor.
- Supports fraction, square root, superscript, subscript, logarithm with base, definite integral, summation, and 2x2 matrix.
- Builder generates LaTeX and previews the result with the existing KaTeX renderer.
- Insertion respects the current textarea selection/cursor.
- No backend or database changes.
- Existing V48 toolbar and live preview remain intact.

## Test
```powershell
cd frontend
npm run build
npm run lint
```
