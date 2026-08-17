# Public data

Problem records in this directory are English-only JSON files validated by
`data/schema/problem.schema.json`. The first public release contains problem
statements and cited public progress only. Internal solutions and uncleared
Lean sources are intentionally absent.

`this_work` is a disclosure-safe progress marker for work under anonymous
review. It must have an empty `citation_labels` array and must not contain a
URL, DOI/ePrint identifier, email address, author name, or answer-bearing
artifact reference.

`data/manifest.json` lists the release version, record count, and the source
families intentionally excluded from the public index.

Records are added only after source, status, citation, disclosure, and license
review. See [`DESIGN.md`](../DESIGN.md) for the corpus audit and publication
policy.
