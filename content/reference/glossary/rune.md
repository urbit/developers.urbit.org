+++
title = "Rune"
[extra]
category = "hoon-nock"
+++

**Runes** are the fundamental operators/functions in the
[Hoon](/reference/glossary/hoon) programming language, and the building blocks
of Hoon expressions. Runes are digraphs made of two ASCII special characters,
for example `:-`, `!<`, `^-`, `?:`, `.^`, etc. Most runes take a fixed number of
arguments (usually 1-4), or else an arbitrary number of arguments terminated
with `==`. Runes are organized into 11 main families by their first character,
so for example the `:`-family forms [cells](/reference/glossary/cell), and has
variations like `:-`,`:_`, `:~`, `:^`, etc, to create different kinds of cells.
Runes are composed together to create complex expressions.

### Further Reading

- [Hoon School](/guides/core/hoon-school/): Our guide to learning the Hoon
  programming language.
  - [“Hoon Syntax”](/guides/core/hoon-school/B-syntax#nouns): A Hoon School
    lesson that explains runes.
- [The Rune reference](/reference/hoon/rune): A comprehensive catalogue of the
  different runes and how to use them.
