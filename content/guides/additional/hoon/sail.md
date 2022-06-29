+++
title = "Sail (HTML)"
weight = 6
+++

Sail is a domain-specific language for composing HTML (and XML) structures in
Hoon. Like everything else in Hoon, a Sail document is a noun, just one produced
by a specialized markup language within Hoon.

Front-ends for Urbit apps are often created and uploaded separately to the
rest of the code in the desk. Sail provides an alternative approach, where
front-ends can be composed directly inside agents.

This document will walk through the basics of Sail and its syntax.

## Basic example

It’s easy to see how Sail can directly translate to HTML:

{% table %}

- Sail
- HTML

---

- ```
  ;html
    ;head
      ;title = My page
      ;meta(charset "utf-8");
    ==
    ;body
      ;h1: Welcome!
      ;p
        ; Hello, world!
        ; Welcome to my page.
        ; Here is an image:
        ;br;
        ;img@"/foo.png";
      ==
    ==
  ==
  ```
- ```
    <html>
      <head>
        <title>My page</title>
        <meta charset="utf-8" />
      </head>
      <body>
        <h1>Welcome!</h1>
        <p>Hello, world! Welcome to my
          page. Here is an image:
          <br />
          <img src="/foo.png" />
        </p>
      </body>
    </html>
  ```
{% /table %}

## Tags and Closing

In Sail, tag heads are written with the tag name prepended by `;`. Unlike in
HTML, there are different ways of closing tags, depending on the needs of the
tag. One of the nice things about Hoon is that you don’t have to constantly
close expressions; Sail inherits this convenience.

### Empty

Empty tags are closed with a `;` following the tag. For example, `;div;` will be
rendered as `<div></div>`. Non-container tags `;br;` and `;img@"some-url";` in
particular will be rendered as a single tag like `<br />` and `<img src="some-url" />`.

### Filled

Filled tags are closed via line-break. To fill text inside, add `:` after the
tag name, then insert your plain text following a space. Example:

| Sail             | HTML                 |
| ---------------- | -------------------- |
| `;h1: The title` | `<h1>The title</h1>` |

### Nested

To nest tags, simply create a new line. Nested tags need to be closed with `==`,
because they expect a list of sub-tags.

If we nest lines of plain text with no tag, the text will be wrapped in a
`<p>` tag. Additionally, any text with atom auras or `++arm:syntax` in such
plain text lines will be wrapped in `<code>` tags.

Example:

{% table %}

- Sail
- HTML

---

- ```
  ;body
    ;h1: Blog title
    This is some good content.
  ==
  ```
- ```
    <body>
    <h1>Blog title</h1>
    <p>This is some good content.</p>
    </body>
  ```
{% /table %}

If we want to write a string with no tag at all, then we can prepend
those untagged lines with `;` and then a space:

{% table %}

- Sail
- HTML

---

- ```
  ;body
    ;h1: Welcome!
    ; Hello, world!
    ; We’re on the web.
  ==
  ```
- ```
    <body>
      <h1>Welcome!</h1>
      Hello, world!
      We’re on the web.
    </body>
  ```
{% /table %}

## Attributes

Adding attributes is simple: just add the desired attribute between parentheses,
right after the tag name without a space. We separate different attributes of
the same node by using `,`.

Attributes can also be specified in tall form, with each key prefixed by `=`,
followed by two spaces, and then a tape with its value. These two styles are
shown below.

### Generic

{% table %}

- Form
- Example

---

- Wide
- ```
  ;div(title "a tooltip", style "color:red")
    ;h1: Foo
    foo bar baz
  ==
  ```

---

- Tall
- ```
  ;div
    =title  "a tooltip"
    =style  "color:red"
    ;h1: Foo
    foo bar baz
  ==
  ```

---

- HTML
- ```
    <div title="a tooltip" style="color:red">
      <h1>Foo</h1>
      <p>foo bar baz </p>
    </div>
  ```
{% /table %}

### IDs

Add `#` after tag name to add an ID:

| Sail                | HTML                          |
| ------------------- | ----------------------------- |
| `;nav#header: Menu` | `<nav id="header">Menu</nav>` |

### Classes

Add `.` after tag name to add a class:

| Sail                   | HTML                               |
| ---------------------- | ---------------------------------- |
| `;h1.text-blue: Title` | `<h1 class="text-blue">Title</h1>` |

For class values containing spaces, you can add additional `.`s like so:

| Sail                | HTML                              |
| ------------------- | --------------------------------- |
| `;div.foo.bar.baz;` | `<div class="foo bar baz"></div>` |

Otherwise, if your class value does not conform to the allowed `@tas`
characters, you must use the generic attribute syntax:

| Sail                     | HTML                          |
| ------------------------ | ----------------------------- |
| `;div(class "!!! !!!");` | `<div class="!!! !!!"></div>` |

### Images

Add `@` after the tag name to link your source:

| Sail                  | HTML                       |
| --------------------- | -------------------------- |
| `;img@"example.png";` | `<img src="example.png"/>` |

To add attributes to the image, like size specifications, add the desired
attribute after the `"` of the image name and before the final `;` of the `img`
tag like `;img@"example.png"(width "100%");`.

### Links

Add `/` after tag name to start an `href`.

{% table %}

- Sail
- HTML

---

- ```
  ;a/"urbit.org": A link to Urbit.org
  ```
- ```
    <a href="urbit.org">A link to Urbit.org</a>
  ```
{% /table %}

## Interpolation

The textual content of tags, despite not being enclosed in double-quotes, are
actually tapes. This means they support interpolated Hoon expressions in the
usual manner. For example:

{% table %}

- Sail
- HTML

---

- ```
  =|  =time
  ;p: foo {<time>} bar
  ```
- ```
    <p>foo ~2000.1.1 baz</p>
  ```
{% /table %}

Likewise:

{% table .w-full %}

- Sail

---

- ```
    =/  txt=tape  " bananas"
    ;article
      ;b: {(a-co:co (mul 42 789))}
      ; {txt}
      {<our>} {<now>} {<`@ux`(end 6 eny)>}
    ==
  ```
{% /table %}

{% table .w-full %}

- HTML

---

- ```
    <article>
      <b>33138</b> bananas
      <p>~zod ~2022.2.21..09.54.21..5b63 0x9827.99c7.06f4.8ef9</p>
    </article>
  ```
{% /table %}

## A note on CSS

The CSS for a page is usually quite large. The typical approach is to include a
separate arm in your agent (`++style` or the like) and write out the CSS in a
fenced cord block. You can then call `++trip` on it and include it in a style
tag. For example:

```hoon
++  style
  ^~
  %-  trip
  '''
  main {
    width: 100%;
    color: red;
  }
  header {
    color: blue;
    font-family: monospace;
  }
  '''
```

And then your style tag might look like:

```hoon
;style: {style}
```

A cord is used rather than a tape so you don't need to escape braces. The
[ketsig](/reference/hoon/rune/ket#-ketsig) (`^~`) rune means `++trip` will
be run at compile time rather than call time.

## Types and marks

So far we've shown rendered HTML for demonstrative purposes, but Sail syntax
doesn't directly produce HTML text. Instead, it produces a
[$manx](/reference/hoon/stdlib/5e#manx). This is a Hoon type used to
represent an XML hierarchical structure with a single root node. There are six
XML-related types defined in the standard library:

```hoon
+$  mane  $@(@tas [@tas @tas])                    ::  XML name+space
+$  manx  $~([[%$ ~] ~] [g=marx c=marl])          ::  dynamic XML node
+$  marl  (list manx)                             ::  XML node list
+$  mars  [t=[n=%$ a=[i=[n=%$ v=tape] t=~]] c=~]  ::  XML cdata
+$  mart  (list [n=mane v=tape])                  ::  XML attributes
+$  marx  $~([%$ ~] [n=mane a=mart])              ::  dynamic XML tag
```

More information about these can be found in [section 5e of the standard library
reference](/reference/hoon/stdlib/5e).

You don't need to understand these types in order to write Sail. The main thing
to note is that a `$manx` is a node (a single tag) and its contents is a
[$marl](/reference/hoon/stdlib/5e#marl), which is just a `(list manx)`.

### Rendering

A `$manx` can be rendered as HTML in a tape with the `++en-xml:html` function in
`zuse.hoon`. For example:

```
> ;p: foobar
[[%p ~] [[%$ [%$ "foobar"] ~] ~] ~]

> =x ;p: foobar

> (en-xml:html x)
"<p>foobar</p>"

> (crip (en-xml:html x))
'<p>foobar</p>'
```

### Sanitization

The `++en-xml:html` function will sanitize the contents of both attributes and
elements, converting characters such as `>` to HTML entities. For example:

```
> =z ;p(class "\"><script src=\"example.com/xxx.js"): <h1>FOO</h1>

> (crip (en-xml:html z))
'<p class="&quot;&gt;<script src=&quot;example.com/xxx.js"><h1&gt;FOO</h1&gt;</p>'
```

### Marks

There are a few different HTML and XML related marks, so it can be a bit
confusing. We'll look at the ones you're most likely to use.

#### `%html`

- Type: `@t`

This mark is used for HTML that has been printed as text in a cord. You may wish
to return this mark when serving pages to the web. To do so, you must run the
`$manx` produced by your Sail expressions through `++en-xml:html`, and then run
the resulting `tape` through `++crip`.

#### `%hymn`

- Type: `$manx`

The `%hymn` mark is intended to be used for complete HTML documents - having an
`<html>` root element, `<head>`, `<body>`, etc. This isn't enforced on
the type level but it is assumed in certain mark conversion pathways. Eyre can
automatically convert a `%hymn` to printed `%html` if it was requested through
Eyre's scry interface.

#### `%elem`

- Type: `$manx`

The type of the `%elem` mark is a `$manx`, just like a `%hymn`. While `%hymn`s
are intended for complete HTML documents, `%elem`s are intended for more general
XML structures. You may wish to use an `%elem` mark if you're producing smaller
fragments of XML or HTML rather than whole documents. Like a `%hymn`, Eyre can
automatically convert it to `%html` if requested through its scry interface.

#### Summary

In general, if you're going to be composing web pages and serving them to web
clients, running the result of your Sail through `++en-xml:html`, `++crip`ping
it and producing `%html` is the most straight-forward approach. If you might
want to pass around a `$manx` to other agents or ships which may wish to
manipulate it futher, a `%hymn` or `%elem` is better.

## Sail Runes

In addition to the syntax so far described, there are also a few Sail-specific
runes:

### `;+` Miclus

The [miclus rune](/reference/hoon/rune/mic#-miclus) makes a `$marl` from a
complex hoon expression that produces a single `$manx`. Its main use is nesting
tall-form hoon logic in another Sail element. For example:

```hoon
;p
  ;b: {(a-co:co number)}
  ; is an
  ;+  ?:  =(0 (mod number 2))
        ;b: even
      ;b: odd
  ; number.
==
```

Produces one of these depending on the value of `number`:

```
<p><b>2 </b>is an <b>even </b>number.</p>
```

```
<p><b>12345 </b>is an <b>odd </b>number.</p>
```

### `;*` Mictar

The [mictar rune](/reference/hoon/rune/mic#-mictar) makes a `$marl` (a list
of XML nodes) from a complex hoon expression. This rune lets you add many
elements inside another Sail element. For example:

{% table %}

- Sail
- HTML

---

- ```
  =/  nums=(list @ud)  (gulf 1 9)
  ;p
    ;*  %+  turn  nums
        |=  n=@ud
        ?:  =(0 (mod n 2))
          ;sup: {(a-co:co n)}
        ;sub: {(a-co:co n)}
  ==
  ```
- ```
    <p>
      <sub>1</sub><sup>2</sup>
      <sub>3</sub><sup>4</sup>
      <sub>5</sub><sup>6</sup>
      <sub>7</sub><sup>8</sup>
      <sub>9</sub>
    </p>
  ```
{% /table %}

### `;=` Mictis

The [mictis rune](/reference/hoon/rune/mic#-mictis) makes a `$marl` (a list
of XML nodes) from a series of `$manx`es. This is mostly useful if you want to
make the list outside of an element and then be able to insert it afterwards.
For example:

{% table %}

- Sail
- HTML

---

- ```
  =/  paras=marl
    ;=  ;p: First node.
        ;p: Second node.
        ;p: Third node.
    ==
  ;main
    ;*  paras
  ==
  ```
- ```
    <main>
      <p>First node.</p>
      <p>Second node.</p>
      <p>Third node.</p>
    </main>
  ```
{% /table %}

### `;/` Micfas

The [micfas rune](/reference/hoon/rune/mic#-micfas) turns an ordinary tape
into a `$manx`. For example:

```
> %-  en-xml:html  ;/  "foobar"
"foobar"
```

In order to nest it inside another Sail element, it must be preceeded with a
`;+` rune or similar, it cannot be used directly. For example:

```hoon
;p
  ;+  ;/  ?:  =(0 (mod eny 2))
            "even"
          "odd"
==
```

## Good examples

Here's a couple of agents that make use of Sail, which you can use as a
reference:

- [Pals by ~palfun-foslup][pals]
- [Gora by ~rabsef-bicrym][gora]

[pals]: https://github.com/Fang-/suite/blob/master/app/pals/webui/index.hoon
[gora]: https://github.com/dalten-collective/gora/blob/master/sail/app/gora/goraui/index.hoon
