+++
title = "Keywords"

[extra]
category = "hoon-nock"

[glossaryEntry.keywords]
name = "keywords"
symbol = ""
usage = "hoon-nock"
desc = "Reserved words in a programming language."

+++

In programming languages, a **keyword** is a predefined, reserved word with
special meaning to the compiler. Keywords are part of the syntax of a language
and cannot be used as identifiers, like `int` in C.

[Hoon](/reference/glossary/hoon) uses [runes](/reference/glossary/rune) for its
basic operators, so it does not have any reserved alphanumeric keywords.
Additionally, while there are many function names in the standard library, these
can all be shadowed (though this is not always a good idea from a readability
perspective).
