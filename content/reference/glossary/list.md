+++
title = "List"

[extra]
category = "hoon-nock"
+++

A **list** is a basic data structure in [Hoon](/reference/glossary/hoon),
similar to an array in other languages. The underlying structure of a list is a
null-terminated n-tuple like `[1 2 3 4 ~]`. An empty list is just null (`~`). The
`++list` mold-builder forms a list of the given type, like `(list @ud)`.

#### Further Reading

- [Hoon school lesson 1](/guides/core/hoon-school/B-syntax#lists): This lesson
  includes a section on lists.
