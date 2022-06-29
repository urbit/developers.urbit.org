+++
title = "Hoon"
weight = 20
+++

Hoon is a strictly typed functional programming language that compiles itself
to Nock and is designed to support higher-order functional programming without
requiring knowledge of category theory or other advanced mathematics.  Haskell
is fun but it isn't for everybody.

Hoon aspires to a concrete, imperative feel.  To discourage the creation of
write-only code, Hoon forbids user-level macros and uses ASCII digraphs instead
of keywords.  The type system infers only forward and does not use unification,
but is not much weaker than Haskell's.  The compiler and inference engine is
about 3000 lines of Hoon.

## Further Reading

* [Hoon Overview](/reference/hoon/overview): Learn why we created a new language
  to build Urbit in.
* [Hoon School](/guides/core/hoon-school/): A collection of tutorials
  designed to teach you the Hoon language.
* [Guides](/guides/additional/hoon/): Guides to specific Hoon tasks,
including testing, command-line interface apps, and parsing.
* [Reference](/reference/hoon/): Reference material primarily
  intended for Hoon developers with some experience.
