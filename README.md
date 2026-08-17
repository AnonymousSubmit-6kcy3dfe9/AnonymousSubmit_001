# CryptoFrontierAtlas

CryptoFrontierAtlas is a public, source-aware atlas of open questions in
cryptography. Its taxonomy reserves symmetric cryptography, asymmetric
cryptography, and other cryptographic research as top-level areas; the current
release populates symmetric cryptography only. It indexes formal problem
statements, public literature progress, scope boundaries, and evidence status
in a static site designed for GitHub Pages.

The first release contains 13 English problem records. It does not publish
private solutions, uncleared manuscripts, or Lean source code. A claim that a
proof exists is kept separate from whether the proof artifact is publicly
available or reproducible.

The `This work` timeline marker denotes progress reported in work under
anonymous review. Such entries intentionally contain no citation, author,
paper identifier, or external link.

## Local development

```bash
npm install
npm run check:data
npm run dev
```

The production build is:

```bash
npm run build
npm run preview
```

The data contract is [`data/schema/problem.schema.json`](data/schema/problem.schema.json),
the release manifest is [`data/manifest.json`](data/manifest.json),
and the inclusion, disclosure, taxonomy, and release policy is documented in
[`DESIGN.md`](DESIGN.md).

## Contribution boundary

New records require a public source citation, an auditable scope, status and
disclosure fields, and license review. Do not add local absolute paths,
private proof text, answer-bearing filenames, or Lean artifacts that have not
been explicitly cleared for publication.

## License

Metadata and dataset text are released under CC BY 4.0; the website and
validation code are released under Apache-2.0. See `LICENSE-DATA.md` and
`LICENSE`.
