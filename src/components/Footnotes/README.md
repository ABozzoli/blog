# Footnotes components

Use these components together so footnote refs and entries stay in sync:

```mdx
import { Footnote, FootnoteRef, Footnotes } from "../../components/Footnotes";

Here is some text<FootnoteRef n={1} />

<Footnotes>
  <Footnote n={1}>Supporting detail.</Footnote>
</Footnotes>
```

- Keep `n` values unique per page and reuse the same `n` between `FootnoteRef` and `Footnote`.
- Wrap all `Footnote` items in a single `Footnotes` list to maintain semantics and jump targets.
- If you need to link across routes, pass full paths to the components’ `href` calculations.
