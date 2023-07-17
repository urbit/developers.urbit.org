+++
title = "Udon (Markdown-esque)"
description = "Learn the basics of Udon"
weight = 97
+++

Udon is a domain-specific language for composing documents. Udon is very similar
to Markdown, but with some minor variation in syntax and some additional
Urbit-related affordances.

Udon files are compiled to `manx`es (Urbit's XHTML/XML representation), so can
easily be used to publish documents to the browser. Udon also allows you to
embed arbitrary [Sail](/guides/additional/sail) syntax, which itself allows
embedding arbitrary Hoon, so it can be quite powerful for dynamic content when
compiled against an appropriate subject.

This document will walk through the basics of Udon and its syntax.

## Basic example

Here's an example of an Udon file and its various allowed syntax.

````
;>

# H1

## H2

### H3

#### H4

##### H5

###### H6

This is a paragraph with _italics_, *bold* and
`inline code`. Sentences can be hard wrapped.


- unordered
- list

+ ordered
+ list

[link](https://urbit.org)

![image](https://media.urbit.org/guides/additional/dist/wut.svg)

```
fenced codeblock
(note language spec not supported)
```

horizontal rule:
---

> block quotes
  may be hard-wrapped if indented
  
Backslash at end\
of line adds linebreak

Udon syntax may be prefixed with \*backslashes\* to escape.

Hoon atom literals like ~sampel-palnet and ~.foo will
be rendered as inline code.

;table
  ;tr
    ;td: Arbitrary
    ;td: Sail
  ==
  ;tr
    ;td: is
    ;td: allowed
  ==
==
````

## Syntax summary

- The first line of a `.udon` document *must* be a single rune: `;>`. This tells
  the compiler to interpret everything following as udon.
- **Paragraphs**: Content on a single line will be made into a paragraph.
  Paragraphs may be hard-wrapped, so consecutive lines of text will become a
  single paragraph. The paragraph will be ended by an empty line or other block
  element.
- **Headers**: lines beginning with 1-6 `#`s followed by a single space and then
  some content (e.g. `## foo`) will be made into headers. The number of `#`s
  dictates the header level.
- **Italics**: content wrapped in single `_`s (e.g. `_foo_`) will be made italic.
- **Bold**: content wrapped in single `*`s (e.g. `*foo*`) will be made bold.
- **Unordered lists**: lines beginning with `-` followed by a space will be made
  into items in a list. List lines can be hard-wrapped, with two spaces
  beginning each subsequent line to be included in the list. Lists can be nested
  by indenting the `-`s a further two spaces for each level of nesting.
- **Ordered lists**: lines beginning with `+` followed by a space will be made into
  ordered lists, and numbered in the order they appear. These have the same
  wrapping and nesting logic as unordered lists.
- **Links**: this is standard markdown syntax: square bracks containing the display
  content and then parentheses containing the URL, e.g.
  `[foo](http://example.com)`. The URL may also be a relative link or an anchor
  link.
- **Images**: this is also standard markdown; a link with an exclamation mark at the
  beginning, e.g. `![foo](http://example.com/image.png)`. The square brackets
  contain the alt-text and the the parentheses contain the image URL.
- **Inline code**: text wrapped in single backticks will be rendered verbatim in a
  monospace font.
- **Fenced codeblocks**: Triple-backticks on their own line begin and end a
  codeblock. All lines in between will be rendered verbatim in a monospace font.
  Note that udon does not support a language specification after the opening
  backticks like markdown does.
- **Horizontal rules**: Three or more hyphens (`---`) will create a horizontal rule.
- **Block quotes**: a line beginning with `>` creates a block quote. This may be
  hard-wrapped, as long as the next line is indented two spaces. Block quotes
  may contain anything, including other blockquotes.
- **Line breaks**: A line ending in a single backslash will have a line break
  inserted at the end, so it will not flow together with the subsequent line as
  is usually the case.
- **Escape characters**: You may prefix Udon syntax with a backslash to have it
  treated as the literal text.
- **Hoon literals and wings**: Udon will automatically render any values with
  atom aura syntax as inline code. It'll also render arms like `++foo:bar`,
  `+$baz`, and `+*foo:bar:baz, as inline code.`
- **Sail**: this is hoon's native XML syntax. Udon will parse it, execute it, and
  include the `+$manx`es produced in the resulting document. This means you can
  embed arbitrary hoon in the document.

{% callout %}

Note that Udon is quite strict on its syntax, and may fail to parse if it's
  incorrect.
  
{% /callout %}

## Udon Mode

An Udon file has a `.udon` extension (an `%udon` mark).

The first thing in an Udon file must be the `micgar` rune: `;>`

Micgar tells the Hoon compiler to interpret everything afterwards as Udon.
Udon-mode ends at the end of the file; there's no way to terminate micgar before
that. Udon is therefore useful for whole documents rather than embedding
snippets in other Hoon files.

The Hoon compiler will produce a `manx` as a result.

To scry out a file, compile it against the standard library, and stringify the
resulting XHTML, you can do:

```
%-  crip
%-  en-xml:html
!<  manx
%+  slap  !>(..zuse)
%-  ream
.^(@t %cx /=the-desk=/the-file/udon)
```

Note you may want to provide more than just `..zuse` in the subject (like a
`bowl`), or if you're automatically building untrusted code, you may want to
provide less. It depends on your use case.

You can alternatively import and build udon files at compile time with a [`/*`
(fastar) Ford rune](/reference/hoon/rune/fas#-fastar) specifying an `%elem` mark
(which produces a `manx`), although note it compiles the Udon against an empty
subject, so Hoon in embedded Sail won't have access to standard library
functions. A mark conversion gate from `%udon` to `%elem` is another option.

## Examples

The [Docs App](https://urbit.org/applications/~pocwet/docs) includes a [a few
files written in
Udon](https://github.com/tinnus-napbus/docs-app/tree/main/bare-desk/doc) which
are useful as a reference.
