+++
title = "Vases"
description = "Learn about dynamically typed data"
weight = 115
+++

## Overview

A [`$vase`](/reference/hoon/stdlib/4o#vase) is a pair of
[`$type`](/reference/hoon/stdlib/4o#type) and
[`$noun`](/reference/hoon/stdlib/2q#noun), where the type describes the noun.
They're used all over Urbit to represent data whose type we can't know ahead of
time. This often comes up when being asked to compile and run other Hoon code.
It's also used to store data that could be any type, but where we want to know
the type, so we tag the value with its type to form a vase.

- The [Arvo](/reference/glossary/arvo) kernel uses vases to build itself and run
  [vanes](/reference/glossary/vane) (kernel modules).
- The [Gall](/reference/glossary/gall) vane used to use vases to run userspace
  [agents](/reference/glossary/agent), and probably will again in the future.
- The Ford build system (in the [Clay](/reference/glossary/clay) vane) uses
  vases to build Hoon code and store typed files.
- The [Dojo](/reference/glossary/dojo) shell uses vases to compile and run shell
  expressions and to run generators.
- The [Spider](/reference/glossary/spider) agent uses vases to run
  [threads](/reference/glossary/thread) (scripts written in an IO monad).

## Types and Molds

A Hoon `$type` is a data structure that specifies a set of nouns. Remember,
everything in Urbit is a noun, so a `$type` can be thought of as a way of
representing a boolean predicate that determines whether some noun is within the
set.

Types are not just used for this purpose, though. They're also used to represent
the type of the "subject", which is the "scope" or "environment" that some Hoon
code can access. This means that Hoon's equivalent of a symbol table lives in
the type.

The programmer can name parts of a type, including the type of the subject. Once
part of a type has a name, Hoon code can refer to any named field within that
type. Since the subject of any Hoon expression always has a known type at
compile time, a reference (a [wing](/reference/glossary/wing), like
`foo.+<.bar.|3.baz`) to a field within that subject is compiled to a Nock 0
operation (subtree lookups) at a known constant
[axis](/reference/hoon/stdlib/2q#axis) (tree slot).

A Hoon `$type` is defined by this (pronounced "buc type", also called "the type
of type"):

```hoon
+$  type  $~  %noun                                     ::
          $@  $?  %noun                                 ::  any nouns
                  %void                                 ::  no noun
              ==                                        ::
          $%  [%atom p=term q=(unit @)]                 ::  atom / constant
              [%cell p=type q=type]                     ::  ordered pair
              [%core p=type q=coil]                     ::  object
              [%face p=$@(term tune) q=type]            ::  namespace
              [%fork p=(set type)]                      ::  union
              [%hint p=(pair type note) q=type]         ::  annotation
              [%hold p=type q=hoon]                     ::  lazy evaluation
          ==                                            ::
```

This is a union, meaning a type can be one of several different things. It's a
discriminable union, meaning a piece of code can tell which kind of thing a type
is by inspecting it.

If an instance of `$type` is an atom, it's either the value `%noun`, referring
to any noun (the set of all nouns), or `%void`, referring to nothing (the empty
set, so no noun will ever be part of this set). `%void` is mostly there for
mathematical completeness, so the compiler can represent the null set internally
-- any "inhabited" type will not be `%void`.

Otherwise, an instance of `$type` is a cell, in which case the head is a tag
(e.g. `%atom`, `%cell`, or `%core`) that says what kind of type this is. The
values to the right of the tag contain the information used to specify the
variable lookup namespace for this type (i.e. the mapping from wing to axis, or
axis and core arm) and constraints that limit the set of nouns described by this
type.

An `%atom` type describes a set of numbers. The `p=term` in an atom type is its
[aura](/reference/glossary/aura), a name for a kind of value that can be stored
as an atom -- `%da` for date, `%ux` for hexadecimal number, `%t` for text, etc.
The `q=(unit @)` is either `~`, meaning any value, or `[~ value]`, in which case
this type has only a single member. The type `%foo` refers to the set whose only
instance is the atom `%foo`.

The `%cell` type refers to cells whose heads have type `p` and tails have type
`q`.

When working with types, `%hold` types are particularly important to understand.
A `%hold` is a lazily evaluated type. This is used for recursive types and
polymorphism (wetness). A hold contains a `p=type`, referring to a subject type,
and a `q=hoon`, a hoon expression intended to be run on a value of that type.

One can "evaluate" a hold by asking the compiler to "play" the hoon against the
subject type, meaning to infer what type of value would result from running that
hoon against a value of the subject type. For a recursive type, this result type
refers to the same hold, usually in one or more of the cases of a `%fork`.

Consider the type `(list @ud)`. This is a hold. Just as any instance of this
list type is either `~` or a non-null list `[i=@ud t=(list @ud)]`, when you
evaluate the list's hold, you get a fork of `[%atom %n [~ ~]]` and `[%cell
[%face %i [%atom %ud ~]] [%face %t [%hold ...]]]`, where the hold is the same as
the original hold.

### Cores

All executable Hoon code is found in a [core](/reference/glossary/core). This
core stores a map from [arm](/reference/glossary/arm) name (like an OOP getter
function) to result type, along with some other information about the core. If
the core is a [door](/reference/glossary/door) (like an OOP object) or a
[gate](/reference/glossary/gate) (like an anonymous function), then slot 6 (the
head of the tail) of the core is a "sample" slot, which is overwritten with
instance data or function argument, respectively. Whether this core expects a
sample, and if so, what the sample's type is, is represented in the `$type` data
structure for cores of that type.

Core types are more complex than this simplified explanation, but this
description is hopefully enough detail to be able to work with cores from vase
mode.

## "Slap'n'Slop" Vase Algebra

The vase operations form a relatively simple algebra. This algebra can be
thought of as a dynamically typed programming language. Each value in the
language is a vase (a dynamically typed datum), and the basic operations are
[`+slap`](/reference/hoon/stdlib/5c#slap) and
[`+slop`](/reference/hoon/stdlib/5c#slop).

For example, the Hoon expression `(slap (slop v1 (slop v2 (slap v3 h1)) v4) h2)`
takes in four vases and two hoon expressions, and produces a vase. A pseudocode
version of this would be `h2([v1 v2 h1(v3)])`

### Introduction Forms

The primary introduction form for a vase is the
[`!>`](/reference/hoon/rune/zap#-zapgar) rune, which produces a vase of its
input. A vase can also be constructed manually as a cell whose head nests in
`$type`, like `[[%atom %ud ~] 3]`.

### Elimination Forms

An elimination form for a vase is something that converts a vase to a statically
typed value.

One unsafe elimination form is the [`!<`](/reference/hoon/rune/zap#-zapgal)
rune, which takes a mold and a value and (unsafely) converts the value to a
typed value. The more traditional elimination form has no syntactic support, but
involves pattern-matching on the type data structure, e.g. dispatching based on
whether the type is atom, cell, or something else, and coercing the value to a
specific type using a mold function.

The lack of a safe general-purpose elimination form stems from the fact that
Hoon's structural type system cannot guarantee that the value in a vase's tail
is an instance of the type in the vase's head, i.e. is an instance of that type.
If not, the vase is said to be "evil".

Despite this limitation, it's relatively straightforward to convert vases to
statically typed outputs safely, and plenty of Hoon code does it, in both
kernelspace and userspace.

### Fundamental Operations

The `+slap` gate runs a hoon expression against a vase, producing a vase of the
result. The `+slop` gate combines a pair of vases into a vase of a pair. These
operations can be composed arbitrarily, and higher-level operations can be built
out of them.

```hoon
::  in /sys/hoon/hoon
::
++  slop                                                ::  cons two vases
  |=  [hed=vase tal=vase]
  ^-  vase
  [[%cell p.hed p.tal] [q.hed q.tal]]
::
++  slap
  |=  [vax=vase gen=hoon]  ^-  vase                     ::  untyped vase .*
  =+  gun=(~(mint ut p.vax) %noun gen)
  [p.gun .*(q.vax q.gun)]
```

`+slop` is the simplest vase operation. It converts a cell of vases into a vase
of a cell. It does this by making a pair `[q.hed q.tal]` of the values of the
two input vases, and it constructs the type of the output vase as `[%cell p.hed
p.tal]`, i.e. a cell whose head has the type as the first vase and whose tail
has the same type as the second vase.

`+slap` first compiles a parsed Hoon expression (`gen`) using `+mint:ut`, with
the type of the subject.

#### Examples

```
> (slop !>('foo') !>('bar'))
[#t/[@t @t] q=[7.303.014 7.496.034]]

> !<  [@t @t]  (slop !>('foo') !>('bar'))
['foo' 'bar']
```

```
> (slap !>(.) !,(*hoon (add 1 1)))
[#t/@ q=2]
```

### Higher-Level Operations

There are a lot of higher-level operations on vases, mostly in `/sys/hoon/hoon`
and some in `/sys/arvo/hoon`. Here's a sampling for instructional purposes.

#### `+slam`

Slam a gate with a sample

```hoon
++  slam
  |=  [gat=vase sam=vase]  ^-  vase
  =+  :-  ^=  typ  ^-  type
          [%cell p.gat p.sam]
      ^=  gen  ^-  hoon
      [%cnsg [%$ ~] [%$ 2] [%$ 3] ~]
  =+  gun=(~(mint ut typ) %noun gen)
  [p.gun (slum q.gat q.sam)]
```

#### `+slot`

Got noun at axis (tree address)

```hoon
++  slot
  |=  [axe=@ vax=vase]  ^-  vase
  [(~(peek ut p.vax) %free axe) .*(q.vax [0 axe])]
```

#### Examples

```
> (slam !>(add) !>([1 1]))
[#t/@ q=2]
```

```
> (slot 6 !>([1 2 3 4]))
[#t/@ud q=2]
```

## Further Reading

- [Standard library section 5c](/reference/hoon/stdlib/5c): This contains most
  of the vase functions in the standard library.
