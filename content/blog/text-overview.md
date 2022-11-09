+++
title = "What Every Hooner Should Know About Text on Urbit"
date = "2022-11-15"
description = "How many ways can you write a single word?"
[extra]
author = "N E Davis"
ship = "~lagrev-nocfep"
image = "https://media.urbit.org/site/posts/essays/blog-text-bottles.png"
+++

![](https://media.urbit.org/site/posts/essays/blog-text-bottles.png)

#  What Every Hooner Should Know About Text on Urbit

##  Forms of Text

[Text strings](https://en.wikipedia.org/wiki/String_%28computer_science%29%) are sequences of characters.  At one level, the file containing code is itself a string—at a more fine-grained level, we take strings to mean either byte sequences obtained from literals (like `'Hello Mars'`) or from external APIs.  This blog post will expand on [existing docs](https://developers.urbit.org/guides/additional/strings) to explain what is going on with text in various corners of Hoon.

Setting aside [literal syntax](TODO), Urbit distinguishes quite a few text representation types:

1. `cord`s (`@t`, [LSB](https://en.wikipedia.org/wiki/Bit_numbering#Least_significant_byte))
2. `knot`s (`@ta`)
3. `term`s (`@tas`)
4. `tape`s (`(list @tD`)
5. UTF-32 strings (`@c`)
6. `tour`s (`(list @c)`)
7. `tank`s (formatted print trees)
8. `tang`s (`(list tank)`)
9. `wain`s (`(list cord)`)
10. `wall`s (`(list tape)`)
11. `path`s (`(list knot)`) (with alias `wire`)
12. JSON-tagged trees
13. Sail (for HTML)

Let's examine each of these in turn.

###  `cord` (`@t`)

A `cord` is a [UTF-8](https://en.wikipedia.org/wiki/UTF-8) [LSB](https://en.wikipedia.org/wiki/Bit_numbering#Least_significant_byte) atom used to represent text directly.  A `cord` is denoted by single quotes `'surrounding the text'` and has no restrictions other than requiring valid UTF-8 content (thus all Unicode characters).  `cord`s are preferred over `tape`s when text is not being processed.

```hoon
> *@t  
''

> ((sane %t) 'Hello Mars!')
%.y
```

One big difference between `cord`s and strings in other languages is that Urbit uniformly expects escape characters (such as `\n`, newline) to be written as their ASCII value in hexadecimal:  thus, Hoon uses `\0a` for C-style `\n`.

### `knot` (`@ta`)

A `knot` is an atom type that permits only a subset of the URL-safe ASCII characters (thus excluding control characters, spaces, upper-case characters, and ``!"#$%&'()*+,/:;<=>?@[\]^` {|}``).  Stated positively, `knot`s can contain lower-case characters, numbers, and `-._~`.  A `knot` is denoted by starting with the unique prefix `~.` sigdot.  Generally `knot`s are used for paths (as in Clay, for wires, and so forth).

As the Dojo doesn't actually check for atom validity, it is possible to erroneously "cast" a value into a `knot` representation when it is not a valid `knot`.  Use `++sane` to produce a check gate to avoid attempting to parse invalid `knot`s.

```hoon
> *@ta  
~.  

> ((sane %ta) 'Hello Mars!')  
%.n

> ((sane %ta) 'hellomars')  
%.y
```

You can see all ASCII characters checked for their `knot` compatibility using ``(turn (gulf 32 127) |=(a=@ [`@t`a ((sane %ta) a)]))``.  `++wood` is a `cord` escape:  it catches `@ta`-invalid characters in `@t`s and converts them lossily to `@ta`.

### `term` (`@tas`)

A `term` is an atom type intended for marking tags, types, and labels.  A value prefixed with `%` cen such as `%hello` is first a _constant_ (_q.v._) and only possesses `term`-nature if explicitly marked as such with `@tas`.  A term is [defined](https://developers.urbit.org/reference/hoon/basic) as “an atomic ASCII string which obeys symbol rules: lowercase and digit only, infix hyphen, first character must be a lowercase letter.”

Urbit uses `term`s to represent internal data tags throughout the Hoon compiler, the Arvo kernel, and userspace.

(Note that the empty `term` is written `%$`, not `%~`.  `%~` is a constant null value, not a `term`.)

As with `knot`s, values can be incorrectly cast to `@tas` in the Dojo.  Use `++sane` to avoid issues as a result of this behavior.

Here we also use the _type spear_ `-:!>` to extract the type of the values demonstratively.
```hoon
> *@tas  
%$

> -:!>(%hello-mars)
#t/%hello-mars

> -:!>(`@tas`%hello-mars)
#t/@tas

> ((sane %tas) 'Hello Mars!')
%.n

> ((sane %tas) 'hello-mars')
%.y

> -:!>(%~)
#t/%~
```

###  `tape` (`(list @tD)`)

A `tape` is a list of `@tD` 8-bit atoms.  Similar to `cord`s, `tape`s support UTF-8 text and all Unicode characters.  Each byte is represented as its own serial entry, rather than as a whole character.  `tape`s are `list`s not atoms, meaning they can be easily parsed and processed using `list` tools such as `++snag`, `++oust`, and so forth.

```hoon
> ""
""

> `(list @)`""
~

> "Hello Mars!"
"Hello Mars!"

> "Hello \"Mars\"!"
"Hello \"Mars\"!"

> `(list @t)`"Hello \"Mars\"!"
<|H e l l o   " M a r s " !|>
```

The `tape` type is slightly more restrictive than just `(list @t)`, and so `(list @t)` has a slightly different representation yielded to it by the pretty-printer.

```hoon
> "Hello Mars"
"Hello Mars"

> `(list @t)`"Hello Mars"
<|H e l l o   M a r s|>
```

What's the `@tD` doing in `(list @tD)`?  By convention, a suffixed upper-case letter indicates the size of the entry in bits, with `A` for 2⁰ = 1, `B` for 2¹ = 2, `C` for 2² = 4, `D` for 2³ = 8, and so forth.  While the inclusion of `D` isn't coercive, it is advisory:  a `tape` is processed in such a way that multi-byte characters are broken into successive bytes:

```hoon
> `(list @ux)``(list @)`"küßî"  
~[0x6b 0xc3 0xbc 0xc3 0x9f 0xc3 0xae]
```

#### Converting Text to Hoon

There are a few ways to get from a `cord` of text to a Hoon representation.

Most commonly, one has a value as text and needs to get it as an atom, or vice versa.

- [`++scot`](https://developers.urbit.org/reference/hoon/stdlib/4m#scot) takes a Hoon atom and produces a `cord` or `knot`.

```hoon
> (scot %ud 1.000)
~.1.000

> (scot %ux 0xdead.beef)
~.0xdead.beef

> (scot %p ~sampel-palnet)
~.~sampel-palnet

> > (scot %si --1)
~.--0i1
```

This example shows the atom literal syntax we wrote about recently:

```hoon
> (scot %t 'Hello Mars')
~.~~~48.ello.~4d.ars

> ~~~48.ello.~4d.ars
'Hello Mars'
```

- [`++scow`](https://developers.urbit.org/reference/hoon/stdlib/4m#scow) does the same but to a `tape`.

- [`++slaw`](https://developers.urbit.org/reference/hoon/stdlib/4m#slaw) converts a `cord` representation—in Hoon aura notation—into an `unit` of `@` atom.

    ```hoon
    > (slaw %ux '0xdead.beef')
    [~ 3.735.928.559]
    
    > (slaw %p '~sampel-palnet')
    [~ 1.624.961.343]
    
    > (slaw %p '~sample-planet')
    ~
    ```

- [`++ream`](https://developers.urbit.org/reference/hoon/stdlib/5d#ream) accepts a `cord` and shows the resulting abstract syntax tree of Hoon.

```hoon
> (ream '+(2)')
[%dtls p=[%sand p=%ud q=2]]
```

Other methods, such as text to number, are included in the discussion of JSON and MIME type data below.

#### Interpolation

`tape`s support interpolation:  including the result of Hoon expressions as text in the middle of the tape.

Curly braces `{` sel and `}` ser indicate that the result of a calculation has been converted into a `tape` directly.

```hoon
> "There are {(scow %ud (sub (pow 2 128) (pow 2 64)))} comets."
"There are 340.282.366.920.938.463.444.927.863.358.058.659.840 comets."
```

Angle brackers `<` gal and `>` gar employ automatic text conversion:

```hoon
> "There are many ships, but {<our>} is my ship."
"There are many ships, but ~zod is my ship."
```
#### `cord` v. `tape`

Most commonly, developers will represent text using either `tape`s or `cord`s.  Both of these facilitate straightforward direct representation as string literals using either single quotes `'example of cord'` or double quotes `"example of tape"`.

As a practical matter, `tape`s occupy more space than their corresponding `cord`s.  `tape`s are implemented as linked lists in the runtime.  These are easy to work with but consume more memory and can take longer to process in some ways.

Prefer `cord`s for data storage and representation, but `tape`s for data processing.

A `cord` can be transformed into a `tape` using `++trip` (mnemonic "tape rip").  The reverse transformation, from `tape` to `cord`, is accomplished via `++crip` (mnemonic "cord rip").

```hoon
> (trip 'Hello Mars!')  
"Hello Mars!"

> (crip "Hello Mars!")  
'Hello Mars!'
```

#### An Aside on Unicode

Unicode is a chart of character representations, with each character receiving a unique number or _codepoint_.  This codepoint is then represented in various ways in binary encodings, the most common of which is [UTF-8](https://en.wikipedia.org/wiki/UTF-8).   UTF-8 is a variable-byte encoding scheme which balances the economy of representing common characters like ASCII using only a single byte with the ability to represent characters from more complex character sets like Chinese `漢語` or Cherokee `ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ`.  While something of a pain when processing byte-by-byte, this allows for an adaptively compact way of writing values (rather than the mostly-zeroes [UTF-32](https://en.wikipedia.org/wiki/UTF-32) mode, available in Urbit as `@c`.)  A `char` is a self-conscious UTF-8 single byte in Hoon, but it's simply an alias for `@t` and doesn't enforce bitwidth.

Joel Spolsky wrote [a classic article on Unicode](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/) which happily has been partly-superseded by much more extensive software support in the two decades since its publication.

### `@c` & `tour` (`(list @c)`)

As just mentioned, Unicode has several distinct encoding schemes.  [UTF-32](https://en.wikipedia.org/wiki/UTF-32) can represent any Unicode value in four bytes, meaning that index accesses are direct (rather than needing to be calculated as with UTF-8).  Urbit provides UTF-32 `@c` data for the terminal stack to use with terminal cursor position, but otherwise they are not used much.  You never see these in practice in userspace.

You can use `++taft` to convert from a UTF-8 `cord` to a UTF-32 `@c`, and `++tuft` to go the other way.

```hoon
> (taft 'hello')
~-hello

> (taft 'Hello Mars')
~-~48.ello.~4d.ars

> `@ux`(taft 'Hello Mars')
0x73.0000.0072.0000.0061.0000.004d.0000.0020.0000.006f.0000.006c.0000.006c.0000.0065.0000.0048

> (tuft ~-~48.ello.~4d.ars)
'Hello Mars'
```

One library, `l10n`, proposes to handle text as a list of UTF-8 multi-byte characters, `calf` or `(list @t)`, rather than a `tape`, which has each byte as a separate entry.  This eases processing for certain Unicode text operations.

### `tank`s (formatted print trees) & `tang`s ((list tank))

Moving past the simple text types, we find that text alone provides little information about structure or display.  Formatted print trees, or `tank`s, are commonly used to produce error messages and other data displays within the Dojo.

A `tank` is a structure of tagged values.  The tag indicates to the pretty-printer how to convert the final value to a `tape` for output (using `ram:re`).

```hoon
> ~(ram re 'Hello Mars')
"Hello Mars"

> ~(ram re leaf+"Hello Mars")
"Hello Mars"

> ~(ram re rose+[["|" "«" "»"] leaf+"Hello Mars" leaf+"Phobos" leaf+"Deimos" ~])  
"«Hello Mars|Phobos|Deimos»"

> %~  ram  re
  :-  %palm
  :-  ["|" "<" ":" ">"]
  :~  leaf+"Hello Mars"
      rose+[["║" "«" "»"] leaf+"Hello Mars" leaf+"Phobos" leaf+"Deimos" ~]
  ==
"<:Hello Mars|«Hello Mars║Phobos║Deimos»>"
```

Formatted text based on `tank`s is very helpful when working with `%say` generators.

### `wain`s (`(list cord)`) & `wall`s (`(list tape)`)

Collections of `cord`s and `tape`s are occasionally useful when building output.

The `shoe`/`sole` CLI libraries use `wain`s and `wall`s for various aspects of rendering an app at the CLI.

### `path`s (`(list knot)`) (with alias `wire`)

Gall agents and Clay both use `path`s to uniquely identify resources such as noun data on the file system or subscriptions.  Furthermore, a `wire` is an alias for a `path` which particularly denotes the subscriber's identification, preferably unique.  Any valid `@ta` value separated by `/` fas values becomes a `path`, and `=` tis entries in the first three slots are expanded to the Clay `beak`.

```hoon
> /hello/mars
[%hello %mars ~]

> /1/2/3
[~.1 ~.2 ~.3 ~]

> /
~

> /===
[~.~zod ~.base ~.~2022.11.9..19.13.51..efb6 ~]
```

### JSON-style strings

[JSON](https://en.wikipedia.org/wiki/JSON) is a data interchange format based on text.  Web apps and several other platforms use JSON as a fairly concise human-readable way to transmit information, including text.

Hoon represents the equivalent structure of the JSON as a tagged noun.  This requires parsing a JSON string into a tagged noun structure, then reparsing that into particular Hoon values.

For our purposes here, a JSON-style string thus means a tagged string `s+'Hello Mars'`.

```hoon
> =myjson '{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "children": [
      "Catherine",
      "Thomas",
      "Trevor"
  ],
  "spouse": null
}'

> (de-json:html myjson)
[ ~
  [ %o
      p
    { [p='firstName' q=[%s p='John']]
      [p='lastName' q=[%s p='Smith']]
      [ p='children'
        q=[%a p=~[[%s p='Catherine'] [%s p='Thomas'] [%s p='Trevor']]]
      ]
      [ p='address'
          q
        [ %o
            p
          { [p='postalCode' q=[%s p='10021-3100']]
            [p='streetAddress' q=[%s p='21 2nd Street']]
            [p='city' q=[%s p='New York']]
            [p='state' q=[%s p='NY']]
          }
        ]
      ]
      [ p='phoneNumbers'
          q
        [ %a
            p
          ~[
            [ %o
                p
              { [p='type' q=[%s p='home']]
                [p='number' q=[%s p='212 555-1234']]
              }
            ]
            [ %o
                p
              { [p='type' q=[%s p='office']]
                [p='number' q=[%s p='646 555-4567']]
              }
            ]
          ]
        ]
      ]
      [p='spouse' q=~]
      [p='isAlive' q=[%b p=%.y]]
      [p='age' q=[%n p=~.27]]
    }
  ]
]
```

#### Converting Text to Hoon (and Vice Versa)

Notice at this point that most of the values in the `json` data structure are tagged with `%s` string except for a few:  `%a` array, `%b` boolean, `%n` number, and `%o` map.  The tricky part to deal with in reparsing these values back to and from text are the `%n` numbers, since Hoon has several number types.

Thus we must consider how to convert `json` values [to](https://developers.urbit.org/reference/hoon/zuse/2d_6)  and [from](https://developers.urbit.org/reference/hoon/zuse/2d_1-5) Hoon representations.  Fortunately, most gates one would need are already included in the Zuse standard library for handling `json` structures.  The standard JSON-style operations include:

- [`++numb:enjs:format`](https://developers.urbit.org/reference/hoon/zuse/2d_1-5#numbenjsformat) converts from `@u` to a JSON number (as `knot`).

    ```hoon
    > (numb:enjs:format 0xdead.beef)
    [%n p=~.3735928559]
    ```

- [`++ne:dejs:format`](https://developers.urbit.org/reference/hoon/zuse/2d_6#nedejsformat) parses a JSON-style string as a real, or `@rd`.

    ```hoon
    > (ne:dejs:format n+'0.31415e1')
    .~3.1415
    ```

- [`++ni:dejs:format`](https://developers.urbit.org/reference/hoon/zuse/2d_6#nidejsformat) parses a JSON-style string as an integer, or `@ud`.

    ```hoon
    > (ni:dejs:format n+'65536')
    65.536
    ```

- `++ns:dejs:format` parses a JSON-style string as a signed integer, or `@sd`.

    ```hoon
    > (ns:dejs:format n+'-1')
    -1
    ```

- [`++nu:dejs:format`](https://developers.urbit.org/reference/hoon/zuse/2d_6#nudejsformat) parses a JSON-style string as a hexadecimal.

    ```hoon
    > (nu:dejs:format s+'deadbeef')
    0xdead.beef
    ```

There are date format parsers as well, such as [`++du`](https://developers.urbit.org/reference/hoon/zuse/2d_6#dudejsformat).

Another category of converters are the MIME parsers.  These are nominally for webpages serving content, but prove useful in a variety of other situations as well.

- `++en:base16:mimes:html` converts a `@ux` hexadecimal value to a `cord` with zero-padding (while `++de` goes the other way).

    ```hoon
    > (en:base16:mimes:html 8 0x12.3456.7890.abcd)  
    '001234567890abcd'
    
    > (de:base16:mimes:html '012345')
    [~ [p=3 q=74.565]]
    ```

There are base-64 and base-58 (Bitcoin address) parsers as well.

### Sail (for HTML)

Sail is Hoon's internal markup for HTML and XML.  It can support all HTML tags and attributes.  The [Sail guide](https://developers.urbit.org/guides/additional/sail) contains full details on how to work with the markup format, but here I want to briefly demonstrate how text in Sail is handled.

Basically, Sail opens a tag and associates either the rest of the line (`:`) or continuing text until `==`.

```hoon
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
      ;img@"https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg";
    ==
  ==
==
```

The `;` markers open a tag or, within a string like `<p>`'s content, mark subsequent lines.  Since the entire Sail file is a `tape`, we can use `tape` interpolation to inject the results of Hoon expressions.

```hoon
;p
  ; Hello, world!
  ; Welcome to my page.
  ; Today is {<now.bowl>}.
  ; I have {<+(4)>} fingers.
==
```

### Further Reading

This article may be considered a sister to the Hoon School pages on [“Trees and Addressing (Tapes)”](https://developers.urbit.org/guides/core/hoon-school/G-trees#exercise-tapes-for-text) and [“Text Processing I”](https://developers.urbit.org/guides/core/hoon-school/J-stdlib-text).  There are further details on many elements of working with strings in [“Working with Strings”](https://developers.urbit.org/guides/additional/strings), unsurprisingly.

You may also find [~wicdev-wisryt’s “Input and Output in Hoon”](https://urbit.org/blog/io-in-hoon) an instructive supplement.
