+++
title = "Runes"
weight = 20
sort_by = "weight"
insert_anchor_links = "right"
+++

Runes are a way to form expressions in Hoon.

## Non-Rune Expressions

### [Constants](/reference/hoon/rune/constants)

Hoon uses runes to form expressions, but not all expressions have runes in them. First, we have constant expressions (and also expressions that would be constant, but that they allow for interpolations).

### [Limbs and Wings](/reference/hoon/limbs/)

Limb and wing expressions also lack runes.

### [`+ lus` (Arms)](/reference/hoon/rune/lus)

Runes (digraphs) used to define arms in a core.

## Runes Proper

### [`| bar` (Cores)](/reference/hoon/rune/bar)

Runes used to produce cores.

### [`$ buc` (Structures)](/reference/hoon/rune/buc)

Runes used for defining custom types.

### [`% cen` (Calls)](/reference/hoon/rune/cen)

Runes used for making function calls in Hoon.

### [`: col` (Cells)](/reference/hoon/rune/col)

Runes used to produce cells, which are pairs of nouns.

### [`. dot` (Nock)](/reference/hoon/rune/dot)

Runes used for carrying out Nock operations in Hoon.

### [`/ fas` (Imports)](/reference/hoon/rune/fas)

Ford runes which import files.

### [`^ ket` (Casts)](/reference/hoon/rune/ket)

Runes that let us adjust types without violating type constraints.

### [`; mic` (Make)](/reference/hoon/rune/mic)

Miscellaneous useful macros.

### [`= tis` (Subject Modification)](/reference/hoon/rune/tis)

Runes used to modify the subject.

### [`~ sig` (Hints)](/reference/hoon/rune/sig)

Runes that use Nock `11` to pass non-semantic info to the interpreter.

### [`? wut` (Conditionals)](/reference/hoon/rune/wut)

Runes used for branching on conditionals.

### [`! zap` (wild)](/reference/hoon/rune/zap)

Wildcard category. Expressions that don't fit anywhere else go here.

### [`--`, `==` (Terminators)](/reference/hoon/rune/terminators)

Runes used to terminate expressions.
