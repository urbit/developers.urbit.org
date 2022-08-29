+++
title = "Wet Gate"

[extra]
category = "hoon-nock"
+++

A **wet gate** is a [gate](/reference/glossary/gate) that can accept arguments
of a type other than what it has specified, and transparently pass them through.
This is in contrast to a [dry gate](/reference/glossary/dry-gate), which can
only take arguments of the type it specified. The typical
[rune](/reference/glossary/rune) for a wet gate is `|*`, as opposed to the usual
`|=`.

### Further Reading

- [Hoon School lesson 18](/guides/core/hoon-school/R-metals): This lesson covers
  dry and wet gates.
