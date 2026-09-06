# Griffin Academy — V46 Math Editor

V46 extends the V45 KaTeX math rendering with a lightweight Math Editor inside Question Designer.

## Added
- Reusable `MathEditor` component.
- Toolbar buttons for fraction, square root, powers, subscripts, parentheses, Greek letters, infinity, integral and summation.
- Selected text is wrapped when a toolbar operation supports it.
- Cursor is returned to the useful placeholder position after insertion.
- Live KaTeX preview while editing question text, options and explanations.
- Existing `$...$` inline and `$$...$$` block syntax remains supported.
- No database migration is required; LaTeX remains stored as normal strings.

## Verification
After updating the project:

```powershell
cd frontend
npm install
npm run build
npm run lint
```

Then open Question Designer and verify toolbar insertion plus Preview for:
- fractions
- roots
- powers/subscripts
- Greek letters
- integral/summation
- formulas inside all four options
- formulas inside the explanation

V46 does not change backend Question APIs or the custom Arena sticker assets.
