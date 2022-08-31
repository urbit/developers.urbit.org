+++
title = "Jet"

[extra]
category = "arvo"
+++

[Hoon](/reference/glossary/hoon) is compiled to
[Nock](/reference/glossary/nock), a purely functional turing-complete combinator
calculus that can be thought of as Urbit's assembly language or basic opcodes of
the virtual machine. Nock is extremely minimalist, with only 11 basic operators,
and consequently there are computations that cannot be *efficiently* implemented
in Nock. To allow fast computation in these cases, Nock includes the ability to
hand them off to a fast C implementation on the host system. These external
implementations are called **jets**, and any Hoon/Nock code can be **jetted** in
this way.

#### Further reading

- [Jet writing reference](/reference/runtime/jetting): developer documentation
  on how to write jets.
- [Nock documentation](/reference/nock/definition): how Nock works.
