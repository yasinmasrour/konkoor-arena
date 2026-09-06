# Griffin Academy — V48 Math Editor Upgrade

V48 builds on the confirmed V47 UI baseline and improves the Question Designer's math editing experience.

## Highlights

- Grouped math toolbar for Question Designer fields.
- Structure tools: fraction, square root, superscript, subscript, parentheses, absolute value.
- Function tools: log with base, ln, sin, cos, tan, limit.
- Operator tools: integral, summation, infinity, arrow.
- Symbol tools: pi, alpha, beta, theta, delta, plus/minus, inequalities, not-equal.
- Advanced tools: 2×2 matrix template, partial derivative, nabla.
- Advanced tools can be collapsed to keep the editor compact.
- Selecting text before inserting a structure places the selected text into the first available placeholder.
- Live KaTeX preview remains available below each MathEditor.
- No backend or Prisma changes.
- Existing V47 light/dark theme fixes are preserved.

## Validation

Run in `frontend`:

```bash
npm run build
npm run lint
```

V48 does not add a new npm dependency; it continues using the KaTeX dependency introduced in V45.
