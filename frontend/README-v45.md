# Griffin Academy — V45

## Math / LaTeX Support in Question Designer

V45 adds mathematical formula rendering to the Question Designer preview using KaTeX.

### Input syntax

- Inline formula: `$x^2 + 1$`
- Display formula: `$$\\frac{a}{b}$$`
- Persian text can be mixed with inline formulas.
- The same syntax is supported in question text, all four options, and the explanation shown in Preview.

### Example

```text
اگر $x=2$ باشد، مقدار عبارت زیر را به‌دست آورید:
$$x^2 + 3x + 1$$
```

### Dependency

The frontend now requires `katex`.

After replacing/updating the project files, run:

```bash
cd frontend
npm install
npm run build
npm run lint
```

`npm install` is required once on an existing checkout so the new KaTeX dependency is added to `node_modules` and the lockfile is synchronized.

### Scope

This version intentionally focuses on reliable LaTeX rendering and preview. A graphical Math Editor for inserting fractions, powers, roots, integrals, matrices, Greek letters, etc. can be added in a later version without changing the database model.
