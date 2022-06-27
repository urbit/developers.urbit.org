+++
title = "Runes"
weight = 20
sort_by = "weight"
template = "sections/docs/chapters.html"
aliases = ["docs/reference/hoon-expressions/rune/"]
insert_anchor_links = "right"
+++

Runes are a way to form expressions in Hoon.

## Non-Rune Expressions

### [Constants](/reference/hoon/rune/constants)

Hoon uses runes to form expressions, but not all expressions have runes in them. First, we have constant expressions (and also expressions that would be constant, but that they allow for interpolations).

### [Limbs and Wings](/reference/hoon/limbs/)

Limb and wing expressions also lack runes.

## Runes Proper

### [`. dot` (Nock)](/reference/hoon/rune/dot)

Runes used for carrying out Nock operations in Hoon.

### [`! zap` (wild)](/reference/hoon/rune/zap)

Wildcard category. Expressions that don't fit anywhere else go here.

### [`= tis` (Subject Modification)](/reference/hoon/rune/tis)

Runes used to modify the subject.

### [`? wut` (Conditionals)](/reference/hoon/rune/wut)

Runes used for branching on conditionals.

### [`| bar` (Cores)](/reference/hoon/rune/bar)

Runes used to produce cores.

### [`+ lus` (Arms)](/reference/hoon/rune/lus)

Runes used to define arms in a core.

### [`: col` (Cells)](/reference/hoon/rune/col)

Runes used to produce cells, which are pairs of nouns.

### [`% cen` (Calls)](/reference/hoon/rune/cen)

Runes used for making function calls in Hoon.

### [`^ ket` (Casts)](/reference/hoon/rune/ket)

Runes that let us adjust types without violating type constraints.

### [`$ buc` (Structures)](/reference/hoon/rune/buc)

Runes used for defining custom types.

### [`; mic` (Make)](/reference/hoon/rune/mic)

Miscellaneous useful macros.

### [`~ sig` (Hints)](/reference/hoon/rune/sig)

Runes that use Nock `11` to pass non-semantic info to the interpreter.

### [`/ fas` (Imports)](/reference/hoon/rune/fas)

Ford runes which import files.

### [`--`, `==` (Terminators)](/reference/hoon/rune/terminators)

Runes used to terminate expressions.
