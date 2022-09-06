+++
title = "16. Functional Programming"
weight = 26
nodes = [233]
objectives = ["Reel, roll, turn a list.", "Curry, cork functions.", "Change arity of a gate.", "Tokenize text simply using `find` and `trim`.", "Identify elements of parsing:  `nail`, `rule`, etc.", "Use `++scan` to parse `tape` into atoms.", "Construct new rules and parse arbitrary text fields."]
+++

_This module will discuss some gates-that-work-on-gates and other assorted operators that are commonly recognized as functional programming tools._

Given a gate, you can manipulate it to accept a different number of values than its sample formally requires, or otherwise modify its behavior.  These techniques mirror some of the common tasks used in other [functional programming languages](https://en.wikipedia.org/wiki/Functional_programming) like Haskell, Clojure, and OCaml.

Functional programming, as a paradigm, tends to prefer rather mathematical expressions with explicit modification of function behavior.  It works as a formal system of symbolic expressions manipulated according to given rules and properties.  FP was derived from the [lambda calculus](https://en.wikipedia.org/wiki/Lambda_calculus), a cousin of combinator calculi like Nock.  (See also [APL](https://en.wikipedia.org/wiki/APL_%28programming_language%29).)


##  Changing Arity

If a gate accepts only two values in its sample, for instance, you can chain together multiple calls automatically using the [`;:` miccol](/reference/hoon/rune/mic#-miccol) rune.

```hoon
> (add 3 (add 4 5))
12

> :(add 3 4 5)
12

> (mul 3 (mul 4 5))
60

> :(mul 3 4 5)
60
```

This is called changing the [_arity_](https://en.wikipedia.org/wiki/Arity) of the gate.  (Does this work on `++mul:rs`?)


##  Binding the Sample

[_Currying_](https://en.wikipedia.org/wiki/Currying) describes taking a function of multiple arguments and reducing it to a set of functions that each take only one argument.  _Binding_, an allied process, is used to set the value of some of those arguments permanently.

If you have a gate which accepts multiple values in the sample, you can fix one of these.  To fix the head of the sample (the first argument), use [`++cury`](/reference/hoon/stdlib/2n#cury); to bind the tail, use [`++curr`](/reference/hoon/stdlib/2n#curr).

Consider calculating _a x² + b x + c_, a situation we earlier resolved using a door.  We can resolve the situation differently using currying:

```hoon
> =full |=([x=@ud a=@ud b=@ud c=@ud] (add (add (mul (mul x x) a) (mul x b)) c))

> (full 5 4 3 2)
117

> =one (curr full [4 3 2])  

> (one 5)  
117
```

One can also [`++cork`](/reference/hoon/stdlib/2n#cork) a gate, or arrange it such that it applies to the result of the next gate.  This pairs well with `;:` miccol.  (There is also [`++corl`](/reference/hoon/stdlib/2n#corl), which composes backwards rather than forwards.)  This example converts a value to `@ux` then decrements it by corking two molds:

```hoon
> ((cork dec @ux) 20)  
0x13
```

##  Exercise:  Bind Gate Arguments

- Create a gate `++inc` which increments a value in one step, analogous to `++dec`.

##  Exercise:  Chain Gate Values

- Write an expression which yields the parent galaxy of a planet's sponsoring star by composing two gates.

##  Working Across `list`s

The [`++turn`](/reference/hoon/stdlib/2b#turn) function takes a list and a gate, and returns a list of the products of applying each item of the input list to the gate. For example, to add 1 to each item in a list of atoms:

```hoon
> (turn `(list @)`~[11 22 33 44] |=(a=@ +(a)))
~[12 23 34 45]
```
Or to double each item in a list of atoms:

```hoon
> (turn `(list @)`~[11 22 33 44] |=(a=@ (mul 2 a)))
~[22 44 66 88]
```
`++turn` is Hoon's version of Haskell's map.

We can rewrite the Caesar cipher program using turn:

```hoon
|=  [a=@ b=tape]
^-  tape
?:  (gth a 25)
  $(a (sub a 26))
%+  turn  b
|=  c=@tD
?:  &((gte c 'A') (lte c 'Z'))
  =.  c  (add c a)
  ?.  (gth c 'Z')  c
  (sub c 26)
?:  &((gte c 'a') (lte c 'z'))
  =.  c  (add c a)
  ?.  (gth c 'z')  c
  (sub c 26)
c
```

[`++roll`](/reference/hoon/stdlib/2b#roll) and [`++reel`](/reference/hoon/stdlib/2b#reel) are used to left-fold and right-fold a list, respectively.  To fold a list is similar to [`++turn`](/reference/hoon/stdlib/2b#turn), except that instead of yielding a `list` with the values having had each applied, `++roll` and `++reel` produce an accumulated value.

```hoon
> (roll `(list @)`[1 2 3 4 5 ~] add)
q=15

> (reel `(list @)`[1 2 3 4 5 ~] mul)
120
```

##  Exercise:  Calculate a Factorial

- Use `++reel` to produce a gate which calculates the factorial of a number.


##  Aside on Wet Gates

If you've already encountered [wet gates](/guides/core/hoon-school/R-metals) and how they handle their sample, you may eventually circle back around to attempting to write statements which curry a wet gate.  For instance, here is an attempt to curry `++reel` which itself takes a gate (in this case `++add`) as an argument:

```hoon
> (curr (reel add `(list @)`[1 2 3 4 ~]))
mull-grow
-find.,.+13.b
dojo: hoon expression failed
```

Unfortunately, `++cury` and `++curr` don't work with wet gates, and you'll see a `mull-grow` error.

One solution is to “dry out” the wet gate using [`++bake`](https://developers.urbit.org/reference/hoon/stdlib/2b#bake):

```hoon
> ((curr (bake reel ,[(list @) _add]) add) `(list @)`[1 2 3 4 ~])
10
```
