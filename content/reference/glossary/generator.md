+++
title = "Generator"

[extra]
category = "arvo"

[glossaryEntry.generator]
name = "generator"
symbol = ""
usage = "arvo"
desc = "A generator is kind of Hoon script you can run from the dojo."

+++

A **generator** is something like a script in [Arvo](/reference/glossary/arvo).
Generators are written in [Hoon](/reference/glossary/hoon) and run from the
[dojo](/reference/glossary/dojo) like `+code`, `|hi ~zod`, `+vats`, etc. They
are usually used for two things: printing system information and passing
commands to the system or apps. Generators are either ordinary
[gates](/reference/glossary/gate) (a "naked generator") or a `%say`/`%ask`
generator with a more particular structure.

#### Further reading

- [Hoon school: gates](/guides/core/hoon-school/D-gates): This lesson on gates
  also introduces generators.
- [Hoon school: text processing](/guides/core/hoon-school/J-stdlib-text#say-generators):
  This lesson includes `%say` generators.
