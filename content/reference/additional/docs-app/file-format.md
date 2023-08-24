+++
title = "File Format"
weight = 5
template = "doc.html"
+++

## `%docu` mark

{% callout %}
**Note**: this section is mostly useful if you're writing a mark conversion
method. For marks that are already supported and you can use directly, see
further down this page.
{% /callout %}

The `%docs` app supports any mark, as long as it has a conversion method to its
`%docu` mark. The `%docu` mark is not expected to be used directly to write
documentation, its purpose is to be a mark conversion target.

The `%docu` mark expects a `$manx`.

A `$manx` is how an XML node structure is represented in hoon. See [Section
5e](/reference/hoon/stdlib/5e#manx) of the standard library reference for
details. A `$manx` is what `++de-xml:html` and `++en-xml:html` decode/encode
raw XML strings from/to.

The `%docu` mark will technically accept any `$manx`, but the `%docs` agent
itself makes some changes and imposes some additional rules:

- The root element must be a `<div>`.
- `<h1>`, `<h2>`, and `<h3>` elements that are direct children of the root
  `<div>` will be used to make the table of contents. Other header levels
  will not be included in the table of contents, but they can still be used.
  `<h1>`, through `<h3>` can also be used at deeper levels, but they also
  won't be included in the table of contents.
- Only these tags are allowed: `<a>`, `<address>`, `<b>`, `<br>`,
  `<blockquote>`, `<code>`, `<del>`, `<div>`, `<em>`, `<h1>`, `<h2>`, `<h3>`,
  `<h4>`, `<h5>`, `<h6>`, `<hr>`, `<i>`, `<img>`, `<ins>`, `<li>`, `<ol>`,
  `<p>`, `<pre>`, `<q>`, `<small>`, `<span>`, `<strong>`, `<sub>`, `<sup>`,
  `<time>`, `<ul>`, `<var>`.
- Inside the `<h1>`, `<h2>`, and `<h3>` headers that are direct children of the
  root `<div>` (and will therefore be used in the table of contents), only a
  subset of the tags listed above are allowed: `<b>`, `<code>`, `<del>`, `<em>`,
  `<i>`, `<ins>`, `<q>`, `<small>`, `<span>`, `<strong>`, `<sub>`, `<sup>`,
  `<time>`, `<var>`.
- All attributes will be stripped from all elements (you can still include them
  but they'll be removed), with the following exceptions:
  - The `src` and `alt` attributes in an `<img>` tag.
  - The `href` attribute in an `<a>` tag.
  - A `class` attribute in a `<pre>` tag beginning with `language-` (e.g.
    `class="language-hoon"`). This is not currently used for anything but will be used
    for syntax highlighting in the future.

{% callout %}
**Note**: table elements are not currently supported but will likely be added
in a future release.
{% /callout %}

---

## Included marks

The following marks are supported by the %docs app and you can use them to
write docs right away.

### `%udon`

Udon is a markdown-like language native to hoon, with a parser built into the
hoon compiler. Here is its syntax in brief:

- The first line of the `.udon` document **must** be a single rune: `;>`.
  This tells the compiler to interpret everything following as udon.
- **Paragraphs**: Content on a single line will be made into a paragraph. Paragraphs
  may be hard-wrapped, so consecutive lines of text will become a single
  paragraph. The paragraph will be ended by an empty line or other block
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
- **Hoon constants**: Udon will automatically render any values with atom aura
  syntax as inline code. It'll also render arms like `++foo:bar`, `+$baz`, and
  `+*foo:bar:baz`, as inline code.
- **Sail**: this is hoon's native XML syntax. Udon will parse it, execute it, and
  include the `+$manx`es produced in the resulting document. This means you
  can embed arbitrary hoon in the document. There is little formal sail
  documentation, but you can refer to the [`;` (mic) rune
  reference](/reference/hoon/rune/mic) for most of its runes and some
  rudimentary examples.

{% callout %}
**Note**: Udon is quite strict on its syntax, and may fail to parse if it's
incorrect.
{% /callout %}

### `%txt`

The `%docs` app supports plain `.txt` files. The file will be rendered as a
preformatted codeblock with wrapping.

### `%html`

Ordinary HTML files may be used, but note the tag and structural restrictions
described in the `%docu` mark description above.

### `%gmi`


Gemtext is an ultra-minimal markup format developed for the [Gemini
project](https://gemini.circumlunar.space/), an internet protocol for serving
light-weight hypertext, inspired by Gopher. Its file extension is `.gmi`.

Gemtext interprets things on a line-by-line basis, and does not support
different types on a single line. Every line is a separate element, with the
exception of fenced codeblocks which may span multiple lines. In brief, here is
the syntax:

- **Paragraphs**: Plain text on a single line constitutes a paragraph. Note
  hard-wrapping is not supported.
- **Links**: lines beginning with `=>` followed by a space create a link. After the
  space, the target URL is given. After the URL, there may optionally be a space
  and then some display text for the link. If no displace text is given, the URL
  itself will be displayed.
- **Codeblocks**: triple-backticks at the beginning of a line begin and end a
  codeblock. All text in between will be rendered verbatim in a monospace font.
  The opening backticks may optionally be followed by some text, which will be
  used as the language tag.
- **Headings**: 1-3 `#`s followed by text create a heading. The number of `#`s
  determine the heading level.
- **Lists**: lines beginning with `*` followed by a space and then text will create
  a list item.
- **Quotes**: lines beginning with `>` followed by a space creates a blockquote.
