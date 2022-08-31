+++
title = "Warm atom"
[extra]
category = "hoon-nock"
+++

A **warm atom** is an [atom](/reference/glossary/atom) with an ordinary
[aura](/reference/glossary/aura). The type of a warm atom is, conceptually, the
set of all possible values for that aura. For example, the
[cord](/reference/glossary/cord) `'foo'` nests under the type of the cord
`'bar'` - they both have `@t` auras. This is in contrast to a [cold
atom](/reference/glossary/cold-atom), where its type is an exact value.

### Further Reading

- [Atoms and Strings](/reference/hoon/rune/constants): A guide to atoms.
- [Hoon School](/guides/core/hoon-school/): Our guide to learning the Hoon
  programming language.
  - [“Hoon Syntax”](/guides/core/hoon-school/B-syntax#nouns): A Hoon School
    lesson that explains how atoms work.
