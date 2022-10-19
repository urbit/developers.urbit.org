+++
title = "Zuse"

[glossaryEntry.zuse]
name = "zuse"
symbol = ""
usage = "arvo"
desc = "A utility library included in the kernel, primarily dealing with cryptography and HTML/JSON parsing/printing."

+++

**Zuse** is a utility library included with the
[kernel](/reference/glossary/kernel) at `/sys/zuse.hoon` in the `%base`
[desk](/reference/glossary/zuse). Zuse contains a large number of useful
functions, most prominently those relating to cryptography and HTML/JSON
parsing/printing.

Zuse is the farthest downstream component of the kernel in terms of dependency,
so its version number is used to represent the version of the kernel as a whole.

### Further Reading

- [Zuse reference](/reference/hoon/zuse/table-of-contents): Developer
  documentation of various functions in `zuse.hoon`, particularly those relating
  to JSON.
