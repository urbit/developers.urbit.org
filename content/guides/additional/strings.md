+++
title = "Strings"
description = "Learn about Hoon's two main string types"
weight = 99
+++

This document discusses hoon's two main string types: `cord`s (as well as its
subsets `knot` and `term`) and `tape`s. The focus of this
document is on their basic properties, syntax and the most common text-related
functions you'll regularly encounter. In particular, it discusses conversions
and the encoding/decoding of atom auras in strings.

Hoon has a system for writing more elaborate functional parsers, but that is not
touched on here. Instead, see the [Parsing](/guides/additional/parsing) guide.
Hoon also has a type for UTF-32 strings, but those are rarely used and not
discussed in this document.

There are a good deal more text manipulation functions than are discussed here.
See the [Further Reading](#further-reading) section for details.

## `tape`s vs. text atoms

As mentioned, urbit mainly deals with two kinds of strings: `tape`s and
`cord`/`knot`/`term`s. The former is a list of individual UTF-8 characters.
The latter three encode UTF-8 strings in a single atom.

Cords may contain any UTF-8 characters, while `knot`s and `term`s only allow a
smaller subset. Each of these are discussed below in the [Text
atoms](#text-atoms) section.

Text atoms like `cord`s are more efficient to store and move around. They are
also more efficient to manipulate with simple bitwise operations. Their downside
is that UTF-8 characters vary in their byte-length. ASCII characters are all
8-bit, but others can occupy up to four bytes. Accounting for this variation in
character size can complicate otherwise simple functions. Tapes, on the other
hand, don't have this problem because each character is a separate item in the
list, regardless of it byte-length. This fact makes it much easier to process
tapes in non-trivial ways with simple list functions.

In light of this, a general rule of thumb is to use cords for simple things like
storing chat messages or exchanging them over the network. If text requires
complex processing on the other hand, it is generally easier with tapes. Note
there _are_ cord manipulation functions in the standard library, so you needn't
always convert cords to tapes for processing, it just depends on the case.

Next we'll look at these different types of strings in more detail.

## Text atoms

### `cord`

A [`cord`](/reference/hoon/stdlib/2q#cord) has an aura of `@t`. It denotes
UTF-8 text encoded in an atom, little-endian. That is, the first character in
the text is the least-significant byte. A cord may contain any UTF-8 characters,
there are no restrictions.

The `hoon` syntax for a cord is some text wrapped in single-quotes like:

```hoon
'This is a cord!'
```

single-quotes and backslashes must be escaped with a backslash like:

```hoon
'\'quotes\' \\backslashes\\'
```

Characters can also be entered as hex, they just have to be escaped by a
backslash. For example, `'\21\21\21'` will render as `'!!!'`. This is useful for
entering special characters such as line breaks like `'foo\0abar'`.

Cords divided over multiple lines are allowed. There are two ways to do this.
The first is to start and end with three single-quotes like:

```hoon
'''
foo
bar
baz
'''
```

The line endings will be encoded Unix-style as line feed characters like:

```hoon
'foo\0abar\0abaz'
```

The second is to begin with a single-quote like usual, then break the line by
ending it with a backslash and start the next line with a forward-slash like:

```hoon
'foo\
/bar\
/baz'
```

This will be parsed to:

```hoon
'foobarbaz'
```

### `knot`

A [`knot`](/reference/hoon/stdlib/2q#knot) has an aura of `@ta`, and is a
subset of a [`cord`](#cord). It allows lower-case letters, numbers, and four
special characters: Hyphen, tilde, underscore and period. Its restricted set of
characters is intended to be URL-safe.

The `hoon` syntax for a knot is a string containing any of the aforementioned
characters prepended with `~.` like:

```hoon
~.abc-123.def_456~ghi
```

### `term`

A [`term`](/reference/hoon/stdlib/2q#term) has an aura of `@tas`, and is a
subset of a [`knot`](#knot). It only allows lower-case letters, numbers, and
hyphens. Additionally, the first character cannot be a hyphen or number. This is
a very restricted text atom, and is intended for naming data structures and the
like.

The `hoon` syntax for a term is a string conforming to the prior description,
prepended with a `%` like:

```hoon
%foo-123
```

#### A note about `term` type inference

There is actually an even more restricted text atom form with the same `%foo`
syntax as a term, where the type of the text is the text itself. For example, in
the dojo:

```
> `%foo`%foo
%foo
```

The hoon parser will, by default, infer the type of `%foo`-style syntax this
way. If we try with the dojo type printer:

```
> ? %foo
  %foo
%foo
```

This type-as-itself is used for many things, such as unions like:

```hoon
?(%foo %bar %bas)
```

In order to give `%foo` the more generic `@tas` aura, it must be explicitly
upcast like:

```
> ? `@tas`%foo
  @tas
%foo
```

This is something to be wary of. For example, if you wanted to form a `(set @tas)` you might think to do:

```hoon
(silt (limo ~[%foo %bar %baz]))
```

However, this will actually form a set of the union `?(%foo %bar %baz)` due to
the specificity of type inference:

```
> ? (silt (limo ~[%foo %bar %baz]))
?(%~ [?(n=%bar n=%baz n=%foo) l=nlr(?(%bar %baz %foo)) r=nlr(?(%bar %baz %foo))])
[n=%baz l={%bar} r={%foo}]
```

One further note about the type-as-itself form: Ocassionally you may wish to
form a union of strings which contain characters disallowed in `term`s. To get
around this, you can enclose the text after the `%` with single-quotes like
`%'HELLO!'`.

### Aura type validity

The hoon parser will balk at `cord`s, `knot`s and `term`s containing invalid
characters. However, because they're merely auras, any atom can be cast to them.
When cast (or clammed), they will **not** be validated in terms of whether the
characters are allowed in the specified aura.

For example, you can do this:

```
> `@tas`'!%* $@&'
%!%* $@&
```

This means you cannot rely on mere aura-casting if you need the text to conform
to the specified aura's restrictions. Instead, there are a couple of function in
the standard library to check text aura validity:
[`+sane`](/reference/hoon/stdlib/4b#sane) and
[`+sand`](/reference/hoon/stdlib/4b#sane).

The `+sane` function takes an argument of either `%ta` or `%tas` to validate
`@ta` and `@tas` respectively (you can technically give it `%t` for `@t` too but
there's no real point). It will return `%.y` if the given atom is valid for the
given aura, and `%.n` if it isn't. For example:

```
> ((sane %tas) 'foo')
%.y
> ((sane %tas) 'foo!')
%.n
```

The `+sand` function does the same thing, but rather than returning a `?` it
returns a `unit` of the given atom, or `~` if validation failed. For example:

```
> `(unit @tas)`((sand %tas) 'foo')
[~ %foo]
> `(unit @tas)`((sand %tas) 'foo!')
~
```

## `tape`

A [`tape`](/reference/hoon/stdlib/2q#tape) is the other
main string type in hoon. Rather than a single atom, it's instead a list of
individual `@tD` characters (the `D` specifies a bit-length of 8, see the
[Auras](/reference/hoon/auras#bitwidth) documentation for
details). The head of the list is the first character in the string.

The `hoon` syntax for a tape is some text wrapped in double-quotes like:

```hoon
"This is a tape!"
```

Double-quotes, backslashes and left-braces must be escaped by a backslash
character:

```hoon
"\"double-quotes\" \\backslash\\ left-brace:\{"
```

Like with `cord`s, characters can also be entered as hex escaped by a backslash
so `"\21\21\21"` renders as `"!!!"`.

Tapes divided over multiple lines are allowed. Unlike [`cord`](#cord)s, there is
only one way to do this, which is by starting and ending with three
double-quotes like:

```hoon
"""
foo
bar
baz
"""
```

The line endings will be encoded Unix-style as line feed characters like:

```hoon
"foo\0abar\0abaz"
```

As mentioned earlier, tapes are lists of single characters:

```
> `tape`~['f' 'o' 'o']
"foo"
```

This means they can be manipulated with ordinary list functions:

```
> `tape`(turn "foobar" succ)
"gppcbs"
```

### Interpolation

Tapes, unlike cords, allow string interpolation. Arbitrary `hoon` may be
embedded in the tape syntax and its product will be included in the resulting
tape. There are two ways to do it:

#### Manual

In the first case, the code to be evaluated is enclosed in braces. The type of
the product of the code must itself be a tape. For example, if the `@p` of our
ship is stored in `our`, simply doing `"{our}"` will fail because its type will
be `@p` rather than `tape`. Instead, we must explicitly use the
[`+scow`](/reference/hoon/stdlib/4m#scow) function to
render `our` as a tape:

```
> "{(scow %p our)}"
"~zod"
```

Another example:

```
> "[{(scow %p our)} {(scow %da now)}]"
"[~zod ~2021.10.3..08.59.10..2335]"
```

#### Automatic

Rather than having to manually render data as a `tape`, angle brackets _inside_
the braces tell the interpreter to automatically pretty-print the product of the
expression as a tape. This way we needn't use functions like `+scow` and can
just reference things like `our` directly:

```
> "{<our>}"
~zod
```

Another example:

```
> "{<(add 1 2)>}"
"3"
```

And another:

```
> "{<our now>}"
"[~zod ~2021.10.3..09.01.14..1654]"
```

## Conversions

Tapes can easily be converted to cords and vice versa. There are two stdlib
functions for this purpose: [`+crip`](/reference/hoon/stdlib/4b#crip) and
[`+trip`](/reference/hoon/stdlib/4b#trip). The former converts a `tape` to
a `cord` and the latter does the opposite. For example:

```
> (crip "foobar")
'foobar'
> (trip 'foobar')
"foobar"
```

Knots and terms can also be converted to tapes with `+trip`:

```
> (trip %foobar)
"foobar"
> (trip ~.foobar)
"foobar"
```

Likewise, the output of `+crip` can be cast to a knot or term:

```
> `@tas`(crip "foobar")
%foobar
> `@ta`(crip "foobar")
~.foobar
> `@tas`(need ((sand %tas) (crip "foobar")))
%foobar
```

## Encoding in text

It's common to encode atoms in cords or knots, particularly when constructing a
[scry](/reference/arvo/concepts/scry) [`path`](/reference/hoon/stdlib/2q#path)
or just a `path` in general. There are two main functions for this purpose:
[`+scot`](/reference/hoon/stdlib/4m#scot) and
[`+scow`](/reference/hoon/stdlib/4m#scow). The former produces a `knot`,
and the latter produces a `tape`. Additionally, there are two more functions for
encoding `path`s in cords and tapes respectively:
[`+spat`](/reference/hoon/stdlib/4m#spat) and
[`+spud`](/reference/hoon/stdlib/4m#spud).

### `+scot` and `+spat`

`+scot` encodes atoms of various auras in a `knot` (or `cord`/`term` with
casting). It takes two arguments: the aura in a `@tas` and the atom to be
encoded. For example:

```
> (scot %p ~zod)
~.~zod

> (scot %da now)
~.~2021.10.4..07.35.54..6d41

> (scot %ux 0xaa.bbbb)
~.0xaa.bbbb
```

Note the aura of the atom needn't actually match the specified aura:

```
> (scot %ud ~zod)
~.0
```

Hoon can of course be evaluated in its arguments as well:

```
> (scot %ud (add 1 1))
~.2
```

You'll most commonly see this used in constructing a `path` like:

```
> /(scot %p our)/garden/(scot %da now)/foo/(scot %ud 123.456)
[~.~zod %garden ~.~2021.10.4..07.43.14..a556 %foo ~.123.456 ~]

> `path`/(scot %p our)/garden/(scot %da now)/foo/(scot %ud 123.456)
/~zod/garden/~2021.10.4..07.43.23..9a0f/foo/123.456
```

`+spat` simply encodes a `path` in a cord like:

```
> (spat /foo/bar/baz)
'/foo/bar/baz'
```

### `+scow` and `+spud`

`+scow` is the same as [`+scot`](#scot-and-spat) except it produces a tape
rather than a knot. For example:

```
> (scow %p ~zod)
"~zod"

> (scow %da now)
"~2021.10.4..07.45.25..b720"

> (scow %ux 0xaa.bbbb)
"0xaa.bbbb"
```

`+spud` simply encodes a `path` in a tape:

```
> (spud /foo/bar/baz)
"/foo/bar/baz"
```

## Decoding from text

For decoding atoms of particular auras encoded in cords, there are three
functions: [`+slat`](/reference/hoon/stdlib/4m#slat),
[`+slav`](/reference/hoon/stdlib/4m#slav), and
[`+slaw`](/reference/hoon/stdlib/4m#slaw). Additionally, there is
[`+stab`](/reference/hoon/stdlib/4m#stab) for decoding a cord to a path.

`+slav` parses the given cord with the aura specified as a `@tas`, crashing if
the parsing failed. For example:

```
> `@da`(slav %da '~2021.10.4..11.26.54')
~2021.10.4..11.26.54

> `@p`(slav %p '~zod')
~zod

> (slav %p 'foo')
dojo: hoon expression failed
```

`+slaw` is like `+slav` except it produces a `unit` which is null if parsing
failed, rather than crashing. For example:

```
> `(unit @da)`(slaw %da '~2021.10.4..11.26.54')
[~ ~2021.10.4..11.26.54]

> `(unit @p)`(slaw %p '~zod')
[~ ~zod]

> (slaw %p 'foo')
~
```

`+slat` is a curried version of `+slaw`, meaning it's given the aura and
produces a new gate which takes the actual cord. For example:

```
> `(unit @da)`((slat %da) '~2021.10.4..11.26.54')
[~ ~2021.10.4..11.26.54]

> `(unit @p)`((slat %p) '~zod')
[~ ~zod]

> ((slat %p) 'foo')
~
```

Finally, `+stab` parses a cord containing a path to a `path`. For example:

```
> (stab '/foo/bar/baz')
/foo/bar/baz
```

## Further reading

- [Parsing](/guides/additional/parsing) - A guide to writing fully-fledged
  functional parsers in hoon.
  
- [Developer Blog, "What Every Hooner Should Know About Text on Urbit"](/blog/text-overview)

- [Auras](/reference/hoon/auras) - Details of auras in hoon.

- [stdlib 2b: List logic](/reference/hoon/stdlib/2b) - Standard library
  functions for manipulating lists, which are useful for dealing with tapes.

- [stdlib 2q: Molds and Mold-builders](/reference/hoon/stdlib/2q) - Several
  text types are defined in this section of the standard library.

- [stdlib 4b: Text processing](/reference/hoon/stdlib/4b) - Standard
  library functions for manipulating and converting tapes and strings.

- [stdlib 4m: Formatting functions](/reference/hoon/stdlib/4m) - Standard
  library functions for encoding and decoding atom auras in strings.
