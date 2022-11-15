+++
title = "What Every Hooner Should Know About Literals on Urbit"
date = "2022-11-14"
description = "Down the rabbit hole of the atom parser."
[extra]
author = "N E Davis"
ship = "~lagrev-nocfep"
image = "https://www.themarginalian.org/wp-content/uploads/2020/01/wilsonbentley_snowflakes0.jpg?fit=1183%2C621&ssl=1"
+++

![](https://www.themarginalian.org/wp-content/uploads/2020/01/wilsonbentley_snowflakes0.jpg?fit=1183%2C621&ssl=1)

#  What Every Hooner Should Know About Literals on Urbit

The Hoon compiler handles value/aura conversions and nesting automatically, and most of the time you shouldn't be surprised once you've satisfied the type checker.  But sometimes you run into something like this which may defy your expectations:

```hoon
> %~  
~  

> %~~  
%''  

> %~~~  :: invalid!

> %~~~~  
%'~'
```

What's going on here?  I thought I had an innocent value like a `@tas` `term`, which starts with a `%` cen.  I didn't have this actually—what happened was my inadvertent stumbling into atom literal syntax, which has its own vagaries and requirements.  In this article, let's take a dive together down the rabbit hole of representing values in Hoon.  It turns out that there is a lot going on!

In this article, I'll walk you through what was going wrong through the lens of a world of constants and literal syntax.

##  Constants

The first hint that something was wrong with my `%~` above should have been that I was using a `~` sig and fooling myself that it was a `term`—it wasn't.  What I was actually doing was specifying null `~` as a [_constant_](https://developers.urbit.org/reference/hoon/rune/constants).  Most of the time when writing code, I haven't bothered to explicitly use constants for anything:  `term`s have sufficed for distinguishing values since they double as molds.

But, sure enough, what I had thought was a `term` was a literal constant of null `~`:

```hoon
> -:!>(%~)
#t/%~

> -:!>(~)
#t/%~
```

When you run into something that doesn't make sense for you in Hoon, you can break out introspection tools from the compiler to figure out what Hoon thinks it's seeing.  [`++ream`](https://developers.urbit.org/reference/hoon/stdlib/5d#ream) is the compiler parser arm, which accepts a `@t` `cord` of text and producing a Hoon abstract syntax tree (AST).  (You can get a similar effect using [`!,` zapcom](https://developers.urbit.org/reference/hoon/rune/zap#-zapcom) as well.)

```hoon
> (ream '%~')
[%rock p=%n q=0]

> (ream '~')
[%bust p=%null]
```

A constant atom (or _cold_ atom) is denoted in the AST as `%rock` while a regular non-constant atom (or _warm_ atom) is `%sand`:

```hoon
> !,(*hoon %1)
[%rock p=%ud q=1]

> !,(*hoon 1)
[%sand p=%ud q=1]

> !,(*hoon %one)  
[%rock p=%tas q=6.647.407]
```

A `term` can consist of only lowercase ASCII letters, `-`, and `0`–`9`, but if the latter two are the first character then it's not actually a `term`:  it's a constant.  (I'll call it a "constant in `%`" in this article for clarity.)

```hoon
> !,(*hoon -1)  
[%sand p=%sd q=1]  

> !,(*hoon %-1)  
[%rock p=%sd q=1]
```

Because a constant in `%` is a mold, the order of comparison matters in expressions:

```hoon
> =/  axn  `@tas`%gain  
 ?=(axn %gain)  
-find.$  
dojo: hoon expression failed  

> =/  axn  `@tas`%gain  
 ?=(%gain axn)  
%.y
```

The empty `term` has a special syntax, `%$`:

```hoon
> `@tas`~
%$

> !,(*hoon %$)
[%rock p=%tas q=0]
```

My mistake was in assuming `%~` would be the same sort of thing as `%$`, when it's not.

```hoon
> !,(*hoon %~)
[%rock p=%n q=0]

> !,(*hoon ~)
[%bust p=%null]
```

All of this is muddied because `++sane` is not currently enforced:  I can cast any `cord` to a `term` and Hoon doesn't balk at the point of conversion:

```hoon
> -:!>((@tas 'Hello Mars'))
#t/@tas

> ((sane %tas) (@tas 'Hello Mars'))  
%.n
```


##  Literal Syntax

As you've encountered if you've worked at all with Hoon, every atom, or base value, has a characteristic form.  This means that the parser which is analyzing a Hoon expression can tell simply by the form of the value what kind of aura it has.  (The salient exception is `@`/`@ud`, which shows up as `@ud` by default.)

Since we're being quite thorough in this article, let's summarize every single atom currently in Hoon (version `%140`) and note how their literal syntax is legible and distinct.  Note that generally leading zeroes are stripped from expressions.

| Aura | Meaning | Literal Syntax | Example | Note |
| ---- | ---- | ---- | ---- | ---- |
| `@` | empty aura | — | — | Has no characteristic form. |
| `@c`  | UTF-32 (used by terminal stack) | `~-_____` | `~-~45fed` |  |
| `@d` | date | — | — | Has no characteristic form. |
| `@da` | absolute date | `~____._.__..__.__.__..____`| `~2018.5.14..22.31.46..1435` |
| `@dr` | relative date (ie, timespan) | `~d_____.h_.m__.s__` | `~h5.m30.s12` |
| `@f` | Loobean | | `&` | For compiler, not castable. |
| `@i` | Internet address | — | — | Has no characteristic form. |
| `@if` | IPv4 address | `.___.___.___.___` |  `.195.198.143.90` | |
| `@is` | IPv6 address | `.___.___.___.___.___.___.___.___` | `.0.0.0.0.0.1c.c3c6.8f5a` | |
| `@n` | nil | — | `~` | For compiler, not castable. |
| `@p` | phonemic base (ship name) | `~______-______-______-______--______-______-______-______` | `~sorreg-namtyv` | |
| `@q` | phonemic base, unscrambled | `~______` (any size) | `.~litsyn-polbel` |
| `@r` | IEEE-754 floating-point | — | — | Has no characteristic form. |
| `@rh` | half precision (16 bits) | `.~~___` | `.~~3.14` | |
| `@rs` | single precision (32 bits) | `.___` | `.6.022141e23` | |
| `@rd` | double precision (64 bits) | `.~___` | `.~6.02214085774e23` | |
| `@rq` | quad precision (128 bits) | `.~~~___` | `.~~~6.02214085774e23` | |
| `@s` | signed integer, sign bit low | — | — | Has no characteristic form. |
| `@sb` | signed binary | `--0b____.____` | `--0b11.1000` | |
| `@sd` | signed decimal | `--___.___` | `--1.000.056` | |
| `@si` | signed decimal | `--_____` | `--0i1000` | |
| `@sv` | signed base32 | `--0v_____._____` | `-0v1df64.49beg` | |
| `@sw` | signed base64 | `--0w_____._____` | `--0wbnC.8haTg` | |
| `@sx` | signed hexadecimal | `--0x____.____` | `-0x5f5.e138` | |
| `@t` | UTF-8 text (cord) | `''` or `~~___` | `'howdy'` | |
| `@ta` | ASCII text (knot) | `~._____` | `~.howdy` | Character restrictions; use `++sane`. |
| `@tas` | ASCII text symbol (term) | `%_____` | `%howdy` | Character restrictions; use `++sane`. |
| `@u` | unsigned integer | — | — | Has no characteristic form. |
| `@ub` | unsigned binary | `0b____.____` | `0b11.1000` | |
| `@ud` | unsigned decimal | `___.___` | `1.000.056` | |
| `@ui` | unsigned decimal | `____` | `0i1000` | |
| `@uv` | unsigned base32 | `0v_____._____` | `0v1df64.49beg` | |
| `@uw` | unsigned base64 | `0w_____._____` | `0wbnC.8haTg` | |
| `@ux` | unsigned hexadecimal | `0x____.____` | `0x5f5.e138` | |

You'll also find some irregular auras in use:  `%lull`, for instance, has a `@uxblob` type.  Nonstandard auras (i.e. those not listed in the table above) render as `@ux` visibly, but are still subject to nesting rules.  In fact, the capital-letter suffixes one occasionally encounters (like `@tD` and `@uvJ`) are programmer annotations to mark the intended bit-width of a value.  (`A` = {% math %}2^0{% /math %}, `B` = {% math %}2^1%{% /math %}, `C` = {% math %}2^2{% /math %}, `D` = {% math %}2^3{% /math %}, `E` = {% math %}2^5{% /math %}, etc.)

We also include two other literal syntaxes which don't resolve to atoms:

- `%blob` represents a raw noun to or from Unix, which processes into an effect.  It is prefixed with `~` sig.

    ```hoon
    > `coin`blob+5
    [%blob p=5]
    
    > ~(rend co `coin`blob+5)
    "~05o"
    
    > ~05o
    5
     
    > `coin`blob+[1 2 3]
    
    > ~(rend co `coin`blob+500)
    "~07q30"
    
    > ~07q30
    500
    
    >  ~(rend co `coin`blob+[1 2 3])
    "~038i3h"
    
    > ~(rend co `coin`blob+[0x1 0x2 0x3])
    "~038i3h"
    ```
    
    You won't typically write these by hand, but may produce them if you were working with the Clay vane internal to the kernel, for instance.

- `%many` represents a compact URL-safe way of writing a tuple of atoms.  Not all atoms can be represented this way:  notably, you can use `@u`, `@s`, and `@tas` with it.  Values are separated with `_` cab like `._^_^_^__`.

    ```hoon
    > ._0__
    0
    
    > ._1_2__
    [1 2]
    
    > ._1_2_3__
    [1 2 3]
    
    > ._0b1_0x2_0v3_0w4__
    [0b1 0x2 0v3 0w4]
    
    > ._one_two_three_four_five__
    [%one %two %three %four %five]
    ```

### Constants Redux

Pretty much anything, prefixed with `%` cen, can become a constant:

```hoon
> %4
%4

> %0b111
%0b111

> %'Hello Mars'
%'Hello Mars'

> !,(*hoon 'Hello Mars')
[%sand p=%t q=545.182.085.650.269.906.691.400]

> !,(*hoon %'Hello Mars')
[%rock p=%t q=545.182.085.650.269.906.691.400]
```

Now we're ready to circle back around to the precipitating instance:

```hoon
> %~  
~  

> %~~  
%''  

> %~~~  :: invalid!

> %~~~~  
%'~'
```

The first of these, `%~`, is the constant null `~`.  The others are a literal syntax for writing `cord`s using an escape:

```hoon
> ~~a
'a'

> ~~~~a
'~a'

> ~~~~~~a
'~~a'
```

These are controlled using a conjunct of related auxiliary arms:

```hoon
> (wack 'a')
~.a

> (wick ~.a)
[~ ~.a]

> (woad ~~a)
'a'

> (wood 'a')
~.a

> (wood 'Hello Mars!')
~.~48.ello.~4d.ars~21.

> (woad ~.~48.ello.~4d.ars~21.)
'Hello Mars!'
```

Thus `%~` and its friends led me down a surprisingly deep rabbit hole into the Hoon parser `++so` and its parsing rules.

---

Header image by [Wilson Bentley](https://www.atlasobscura.com/articles/wilson-bentley-snowflake-photographs), the first photographer of snowflakes.
