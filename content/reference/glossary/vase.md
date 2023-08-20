+++
title = "Vase"

[extra]
category = "hoon-nock"

[glossaryEntry.vase]
name = "vase"
symbol = ""
usage = "hoon-nock"
desc = "A pair of a type and noun, where the type describes the noun."

+++

A **vase** is a pair of [`$type`](/reference/hoon/stdlib/4o#type) and
[`$noun`](/reference/hoon/stdlib/2q#noun), where the type describes the noun.

They're used all over Urbit to represent data whose type we can't know ahead of
time. This often comes up when being asked to compile and run other Hoon code.
It's also used to store data that could be any type, but where we want to know
the type.

### Further Reading

- [Vase guide](/guides/additional/vases) - an overview of vases and the tools
  for working with them.
- [Standard library section 5c](/reference/hoon/stdlib/5c): This contains most
  of the vase functions in the standard library.
