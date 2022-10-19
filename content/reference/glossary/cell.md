+++
title = "Cell"

[extra]
category = "hoon-nock"

[glossaryEntry.cell]
name = "cell"
symbol = ""
usage = "hoon-nock"
desc = "An ordered pair of nouns in Hoon and Nock."

+++

A **cell** is an ordered pair of [nouns](/reference/glossary/noun). It is a
fundamental data type in both [Hoon](/reference/glossary/hoon) and
[Nock](/reference/glossary/cell): a noun is either an
[atom](/reference/glossary/atom) or a cell. Its [mold](/reference/glossary/mold)
in Hoon is `^`, and it's formed with either square brackets like `[123 456]` or
`:`-family [runes](/reference/glossary/rune). A cell can also be thought of as
an internal node in the binary tree of a noun. It is similar to a cons-cell in
Lisp.

#### Further Reading

- [`:`-family rune reference](/reference/hoon/rune/col): The various runes in
  Hoon that form cells.
