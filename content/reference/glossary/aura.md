+++
title = "Aura"

[glossaryEntry.aura]
name = "aura"
symbol = ""
usage = "hoon-nock"
desc = "Types for atoms."

+++

**Auras** are types of [atoms](/reference/glossary/atom). A generic atom (`@`)
is a non-negative decimal integer. Auras allow such atoms to be defined more
specifically, such as `@t` for little-endian UTF-8 strings, `@ux` for
hexadecimal and `@p` for a [ship](/reference/glossary/ship) name like
`~sampel-palnet`. Auras do three things:

1. Define type nesting logic, such that `@tas` nests under `@`, `@t`, and `@ta`
   but not `@p`.
2. Let the pretty-printer know how to print the values, so a `@t` like `'foo'`
   prints as `'foo'` rather than `7.303.014`.
3. Define literal syntaxes for the various auras, so the parser/compiler can
   understand them.
   
Note that auras do not enforce the validity of an encoding scheme, so you can
type-cast the `@t` `'!!!'` to `@ta` despite `!` not being allowed in an `@ta`
literal. They are ultimately just metadata given to compiler.

#### Further reading

- [Aura reference](/reference/hoon/auras): Additional information about auras.
- [Hoon School: syntax lesson](/guides/core/hoon-school/B-syntax): Includes details of
  atoms and auras.
