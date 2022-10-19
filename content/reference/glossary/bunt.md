+++
title = "Bunt"

[glossaryEntry.bunt]
name = "bunt"
symbol = ""
usage = "hoon-nock"
desc = "Produce the default/example value of a mold"

+++

In [Hoon](/reference/glossary/hoon), **bunting** a
[mold](/reference/glossary/mold) produces its default/example value (or "bunt
value"). For example, the bunt of a null-terminated `list` is `~` (null, an
empty list). The bunt of `@ud` (an unsigned decimal) is `0`. Bunting is done
with the kettar [rune](/reference/glossary/rune) (`^*`), or more commonly its
irregular form: a `*` prefix like `*@ud`, `*(list @t)`, etc.

#### Further reading

- [Kettar rune reference](/reference/hoon/rune/ket#-kettar): Details of the kettar rune.
- [Hoon School: Molds lesson](/guides/additional/threads/input#bowl): This
  lesson discusses bunt values.
