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

[Text strings](https://en.wikipedia.org/wiki/String_%28computer_science%29%) are sequences of characters.  At one level, the file containing code is itself a string—at a more fine-grained level, we take strings to mean either byte sequences obtained from literals (like `'Hello Mars'`) or from external APIs.

Setting aside literal syntax, Urbit distinguishes quite a few text representation types:

1. `cord`s (`@t`, [LSB](https://en.wikipedia.org/wiki/Bit_numbering#Least_significant_byte))
2. `knot`s (`@ta`)
3. `term`s (`@tas`)
4. `tape`s (`(list @tD`)
5. UTF-32 strings (`@c`)
6. `tour`s (`(list @c)`)
7. `wain`s (`(list cord)`)
8. `wall`s (`(list tape)`)
9. `tank`s (formatted print trees)
10. `tang`s (`(list tank)`)
11. `path`s (`(list knot)`) (with alias `wire`)
12. `char`s (UTF-8 bytes)
13. JSON-tagged trees
14. Sail (for HTML)

Since Urbit is homoiconic and introspective, you can do neat things like convert arbitrary text into terms or even wings (limb search paths).

ream
cook

Urbit uses `term`s to represent internal data tags throughout the Hoon compiler, the Arvo kernel, and userspace.

But don't confuse `term`s with atom literal syntax!  That's another rabbit hole entirely.

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

Note that the empty `term` is written `%$`, not `%~`.  `%~` is a constant null value, not a `term`.

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

What's the `@tD` doing in `(list @tD)`?  By convention, a suffixed upper-case letter indicates the size of the entry in bits, with `A` for 2⁰ = 1, `B` for 2¹ = 2, `C` for 2² = 4, `D` for 2³ = 8, and so forth.  While the inclusion of `D` isn't coercive, it is advisory:  a `tape` is processed in such a way that multi-byte characters are broken into successive bytes:

```hoon
> `(list @ux)``(list @)`"küßî"  
~[0x6b 0xc3 0xbc 0xc3 0x9f 0xc3 0xae]
```

### `cord` v. `tape`

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

Unicode is a chart of character representations, with each character receiving a unique number or _codepoint_.  This codepoint is then represented in various ways in binary encodings, the most common of which is [UTF-8](https://en.wikipedia.org/wiki/UTF-8).   UTF-8 is a variable-byte encoding scheme which balances the economy of representing common characters like ASCII using only a single byte with the ability to represent characters from more complex character sets like Chinese `漢語` or Cherokee `ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ`.  While something of a pain when processing byte-by-byte, this allows for an adaptively compact way of writing values (rather than the mostly-zeroes [UTF-32](https://en.wikipedia.org/wiki/UTF-32) mode, available in Urbit as `@c`.)

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


### Further Reading

This article may be considered a sister to the Hoon School pages on [“Trees and Addressing (Tapes)”](https://developers.urbit.org/guides/core/hoon-school/G-trees#exercise-tapes-for-text) and [“Text Processing I”](https://developers.urbit.org/guides/core/hoon-school/J-stdlib-text).

You may also find [~wicdev-wisryt’s “Input and Output in Hoon”](https://urbit.org/blog/io-in-hoon) an instructive supplement.

---

```
> %~
~
> %~~
%''
> %~~~~
%'~'
```

=+(-:!>(%~) ?>(?=(%atom -.-) ,.-))

`%~` v. `%0` v. `%~~`

---

This one confuses me. What exactly is being said in each case?

> `@ud`%0 0 > -:!>(%0) #t/%0 > `@ud`%~ 0 > -:!>(%~) #t/%~

~sipfyn-pidmex11:26 AM

i gotchu fam

> `type`[%atom %ud `0] #t/%0 > `type`[%atom %null `0] #t/%~

so 

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨

 i think it's just the term being %null to distinguish it from regular / tas 0

cf.

[https://developers.urbit.org/reference/hoon/stdlib/4o#type](https://developers.urbit.org/reference/hoon/stdlib/4o#type)

hopefully that was useful

![](https://raw.githubusercontent.com/sigilante/pixiesticks/master/lagrev-nocfep-jaguar-small.png)

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨11:37 AM

okay, thanks—basically in "signed zero"-style territory of needing to distinguish types then

~sipfyn-pidmex11:53 AM

yeah probably

another curiosity:

> `@null`2 ~ > =(2 `@null`2) %.y > =(~ `@null`2) %.n > `type`[%atom %null ~] #t/@null > `type`[%atom %null `0] #t/%~

> `type`[%atom %null `1] #t/%~


these aren't terms

you can put % in front of any atom literal

and there is a _lot_ of atom literal syntax

i've never seen ~~abc before

%.3.14%.3.14

that's an @rs _constant_

&c

(i had posted %~zod before the &c, but that one's stayin gray)

4:11

the nest-fail is due to some surprising aura logic in +fuse:ut (combining the types in the success branch after the pattern match)

![](https://raw.githubusercontent.com/sigilante/pixiesticks/master/lagrev-nocfep-jaguar-small.png)

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨4:13 PM

this is cold/warm atom stuff then?

I really am going to write something up on this...

---

  
these aren't terms

you can put % in front of any atom literal

and there is a _lot_ of atom literal syntax

i've never seen ~~abc before

%.3.14%.3.14

that's an @rs _constant_

&c

(i had posted %~zod before the &c, but that one's stayin gray)

the nest-fail is due to some surprising aura logic in +fuse:ut (combining the types in the success branch after the pattern match)

=+(-:!>(%~) ?>(?=(%atom -.-) ,.-))[%atom p=%n q=[~ 0]]

=+(-:!>(%~~) ?>(?=(%atom -.-) ,.-))[%atom p=%t q=[~ 0]]
  
the aura of your "input" (a) is @t, the aura from the pattern is @n, when they are intersected in +fuse:ut the input aura is overriding the pattern aura since they don't nest

if you switch from %~ to %$ this goes away

=/ a-keys ?(%aa %ab %ac %ad %ae %$) `a-keys`(scan "aa" (sear |=(a=tape =/(a (crip a) ?.(?=(a-keys a) ~ (some a)))) (star (shim 'a' 'z'))))%aa

---

![](https://raw.githubusercontent.com/sigilante/pixiesticks/master/lagrev-nocfep-jaguar-small.png)

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨11:54 AM

Is there a good way to parse to a type union without a vase?

`?(%en %dv %ti %fo)``@tas`(crip "en")

Maybe with ream?

~master-morzod12:08 PM

=/(a (crip "en") ?>(?=(?(%en %dv %ti %fo) a) a))%en

![](https://raw.githubusercontent.com/sigilante/pixiesticks/master/lagrev-nocfep-jaguar-small.png)

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨12:12 PM

ah, so assert over the union

ty

~master-morzod12:42 PM

yeah, you could also use ?: and handle the non-matching case yourself

![](https://raw.githubusercontent.com/sigilante/pixiesticks/master/lagrev-nocfep-jaguar-small.png)

𐐝𐐮𐐾𐐮𐑊𐐰𐑌𐐻𐐨3:40 PM

OK, nominally that works. But there's something strange going on when I try to actually use the cast:

> =a-keys $? %aa %ab %ac %ad %ae %~ == > =str "aa" > p.u.+.q:((cook |=(a=tape =/(a (crip a) ?>(?=(a-keys a) a))) (star (shim 'a' 'z'))) [[1 1] str]) %aa > `a-keys`p.u.+.q:((cook |=(a=tape =/(a (crip a) ?>(?=(a-keys a) a))) (star (shim 'a' 'z'))) [[1 1] str]) -need.?(%~ %aa %ab %ac %ad %ae) -have.%~~ nest-fail dojo: hoon expression failed > -:!>(p.u.+.q:((cook |=(a=tape =/(a (crip a) ?>(?=(a-keys a) a))) (star (shim 'a' 'z'))) [[1 1] str])) #t/?(%~~ %aa %ab %ac %ad %ae)

1. where is that %~~ coming from?  
2. why is this mad at enforcing the cast?

which gets into another rabbit hole, which is that %~ and %~~ are valid symbols, but %~~~ is not, and %~~~~ is again

> %~ ~ > %~~ %'' > %~~~~ %'~'

someday I'm gonna write a blog post called "Everything You Know About Terms is Wrong"

I didn't know ~ was escaping values

%~~a%'a'

similar to how =old becomes old=old, =old=vase becomes old-vase=vase

---

~nomryg-nilref

 for some unknown reason, i can't post eval's through landscape:

> ?=([^ ^] [i=1.701.667.182 t=~]) %.n > ?=([^ ^] [[i=29.550 t=~] [i=1.701.667.182 t=~]]) %.y > ?=([^ ^ ^] [[i=29.550 t=~] [i=1.701.667.182 t=~]]) %.n > ?=([^ ^ ^] [[i=25.188 t=~] [i=29.550 t=~] [i=1.701.667.182 t=~]]) %.y > ?=([^ ^ ^] [[i=25.188 t=~] '.' '.' [i=1.701.667.182 t=~]]) %.n > ?=([^ @ ^] [[i=25.188 t=~] '.' '.' [i=1.701.667.182 t=~]]) %.y

you get pretty far with basic noun-shape patterns, especially if you have atoms at certain positions, or list-style null terminators

but it's always best to build specific, discriminable unions from the beginning, with $@, $^, and $%

you can use +stag to make any parser rule tag the output data (for use with $%

> (scan "foo" (jest 'foo')) 'foo' > (scan "foo" (stag %a (jest 'foo'))) [%a 'foo']
