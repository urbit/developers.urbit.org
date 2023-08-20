+++
title = "Kernel"

[extra]
category = "arvo"

[glossaryEntry.kernel]
name = "kernel"
symbol = ""
usage = "arvo"
desc = "The core components of an operating system; Arvo and its vanes in Urbit."

+++

The **kernel** is the core, fundamental components of an operating system. In
the case of [Arvo](/reference/glossary/arvo), it is `arvo.hoon`, its
[vanes](/reference/glossary/vane) (kernel modules), and associated libraries.
The code for Arvo's kernel is located in the `/sys` directory of the `%base`
[desk](/reference/glossary/desk). "Kernelspace" is contrasted with "userspace",
which includes [agents](/reference/glossary/agent),
[threads](/reference/glossary/thread),
[generators](/reference/glossary/generator), front-end resources and other
non-kernel files in [Clay](/reference/glossary/clay).

#### Further reading

- [Arvo overview](/reference/arvo/overview): Technical overview of Arvo.
