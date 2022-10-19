+++
title = "Cask"

[extra]
category = "hoon-nock"

[glossaryEntry.cask]
name = "cask"
symbol = ""
usage = "hoon-nock"
desc = "A cell of a mark and a noun. Similar to a cage but with a simple noun rather than a vase in the tail."

+++

A **cask** is a [cell](/reference/glossary/cell) whose head is a
[mark](/reference/glossary/mark) and whose tail is a
[noun](/reference/glossary/noun). It is similar to a `cage` except with a simple
noun rather than `vase` in the tail. Casks are primarily used by the
[kernel](/reference/glossary/kernel) for sending data over the
[Ames](/reference/glossary/ames) network, because `vase`s should only be used
locally.
