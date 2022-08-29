+++
title = "Mold"
[extra]
category = "hoon-nock"
+++

**Molds** are data types in [Hoon](/reference/glossary/hoon).
[Atom](/reference/glossary/atom) [auras](/reference/glossary/aura) like `@ud`
are molds, as are more complex structures like `json`, `path`, `(list @ud)`,
`(unit manx)`, `card:agent:gall`, `(map @tas (pair @t @ux))`, etc. Raw values
may be type-cast to a mold, and molds can also be called as functions to coerce
a value to its type (this is called "molding" or "clamming"). Molds may be
create with "mold builder" functions, or with `$`-family runes.

### Further Reading

- [Hoon school lesson 4](/guides/core/hoon-school/E-types): A lesson on molds.

- [Buc (`$`) rune reference](/reference/hoon/rune/buc): Details on the runes
  that can create molds.
