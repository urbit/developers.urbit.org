+++
title = "18. Generic and Variant Cores"
weight = 28
nodes = [288, 299]
objectives = ["Distinguish dry and wet cores.", "Describe use cases for wet gates (using genericity).", "Enumerate and distinguish use cases for dry cores (using variance):", "- Covariant (`%zinc`)", "- Contravariant (`%iron`)", "- Bivariant (`%lead`)", "- Invariant (`%gold`)"]
+++

_This module introduces how cores can be extended for different behavioral patterns.  It may be considered optional and skipped if you are speedrunning Hoon School._

Cores can expose and operate with many different assumptions about their inputs and structure.  `[battery payload]` describes the top-level structure of a core, but within that we already know other requirements can be enforced, like `[battery [sample context]]` for a gate, or no `sample` for a trap.  Cores can also expose and operate on their input values with different relationships.  This lesson is concerned with examining [_genericity_](https://en.wikipedia.org/wiki/Generic_programming) including certain kinds of [parametric polymorphism](https://en.wikipedia.org/wiki/Parametric_polymorphism), which allows flexibility in type, and [_variance_](https://en.wikipedia.org/wiki/Covariance_and_contravariance_%28computer_science%29), which allows cores to use different sets of rules as they evaluate.

If cores never changed, we wouldn't need polymorphism.  Of course, nouns are immutable and never change, but we use them as templates to construct new nouns around.

Suppose we take a core, a cell `[battery payload]`, and replace `payload` with a different noun.  Then, we invoke an arm from the battery.

Is this legal?  Does it make sense?  Every function call in Hoon does this, so we'd better make it work well.

The full core stores _both_ payload types:  the type that describes the `payload` currently in the core, and the type that the core was compiled with.

In the [Bertrand Meyer tradition of type theory](https://en.wikipedia.org/wiki/Object-Oriented_Software_Construction), there are two forms of polymorphism:  _variance_ and _genericity_.  In Hoon this choice is per core:  a core can be either `%wet` or `%dry`.  Dry polymorphism relies on variance; wet polymorphism relies on genericity.

This lesson discusses both genericity and variance for core management.  These two sections may be read separately or in either order, and all of this content is not a requirement for working extensively with Gall agents.  If you're just starting off, wet gates (genericity) make the most sense to have in your toolkit now.


##  Genericity

Polymorphism is a programming concept that allows a piece of code to use different types at different times.  It's a common technique in most languages to make code that can be reused for many different situations, and Hoon is no exception.

### Dry Cores

A dry gate is the kind of gate that you're already familiar with:  a one-armed [core](/reference/glossary/core/) with a sample.  A wet gate is also a one-armed [core](/reference/glossary/core/) with a sample, but there is a difference in how types are handled.  With a dry gate, when you pass in an argument and the code gets compiled, the type system will try to cast to the type specified by the gate; if you pass something that does not fit in the specified type, for example a `cord` instead of a `cell` you will get a `nest-fail` error.

A core's payload can change from its original value.  In fact, this happens in the typical function call:  the default sample is replaced with an input value.  How can we ensure that the core's arms are able to run correctly, that the payload type is still appropriate despite whatever changes it has undergone?

There is a type check for each arm of a dry core, intended to verify that the arm's parent core has a payload of the correct type.

When the `$` buc arm of a dry gate is evaluated it takes its parent core—the dry gate itself—as the subject, often with a modified sample value.  But any change in sample type should be conservative; the modified sample value must be of the same type as the default sample value (or possibly a subtype).  When the `$` buc arm is evaluated it should have a subject of a type it knows how to use.

### Wet Gates

When you pass arguments to a wet gate, their types are preserved and type analysis is done at the definition site of the gate rather than at the call site.  In other words, for a wet gate, we ask:  “Suppose this core was actually _compiled_ using the modified payload instead of the one it was originally built with?  Would the Nock formula we generated for the original template actually work for the modified `payload`?”  Basically, wet gates allow you to hot-swap code at runtime and see if it “just works”—they defer the actual substitution in the `sample`.  Wet gates are rather like [macros](https://en.wikipedia.org/wiki/Macro_%28computer_science%29) in this sense.

Consider a function like `++turn` which transforms each element of a list. To use `++turn`, we install a list and a transformation function in a generic core.  The type of the list we produce depends on the type of the list and the type of the transformation function.  But the Nock formulas for transforming each element of the list will work on any function and any list, so long as the function's argument is the list item.

A wet gate is defined by a [`|*` bartar](/reference/hoon/rune/bar#-bartar) rune rather than a `|=` bartis.  More generally, cores that contain wet arms **must** be defined using [`|@` barpat](/reference/hoon/rune/bar#-barpat) instead of `|%` barcen (`|*` expands to a `|@` core with `$` buc arm).  There is also [`|$` barbuc](/reference/hoon/rune/bar#-barbuc) which defines the wet gate mold builder (remember, we like gates that build gates).

In a nutshell, compare these two gates:

```hoon
> =dry |=([a=* b=*] [b a])

> =wet |*([a=* b=*] [b a])

> (dry %cat %dog)
[6.778.724 7.627.107]

> (wet %cat %dog)
[%dog %cat]
```

The dry gate does not preserve the type of `a` and `b`, but downcasts it to `*`; the wet gate does preserve the input types.  It is good practice to include a cast in all gates, even wet gates.  But in many cases the desired output type depends on the input type.  How can we cast appropriately?  Often we can cast by example, using the input values themselves (using `^+` ketlus).

Wet gates are therefore used when incoming type information is not well known and needs to be preserved.  This includes parsing, building, and structuring arbitrary nouns.  (If you are familiar with them, you can think of C++'s templates and operator overloading, and Haskell's typeclasses.)  Wet gates are very powerful; they're enough rope to hang yourself with.  Don't use them unless you have a specific reason to do so.  (If you see `mull-*` errors then something has gone wrong with using wet gates.)

- [~timluc-miptev, “Wet Gates”](https://blog.timlucmiptev.space/wetgates.html)

##  Exercise:  The Trapezoid Rule

The [trapezoid rule](https://en.wikipedia.org/wiki/Trapezoidal_rule) solves a definite integral.  It approximates the area under the curve by a trapezoid or (commonly) a series of trapezoids.  The rule requires a function as one of the inputs, i.e. it applies _for a specific function_.  We will use wet gates to accomplish this without stripping type information of the input gate core.

![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Integration_num_trapezes_notation.svg/573px-Integration_num_trapezes_notation.svg.png)

<img src="https://latex.codecogs.com/svg.image?\large&space;\int_a^b&space;f(x)&space;\,&space;dx&space;\approx&space;\sum_{k=1}^N&space;\frac{f(x_{k-1})&space;&plus;&space;f(x_k)}{2}&space;\Delta&space;x_k&space;=&space;\tfrac{\Delta&space;x}{2}\left(f(x_0)&space;&plus;&space;2f(x_1)&plus;2f(x_2)&plus;&space;2f(x_3)&plus;2f(x_4)&plus;\cdots&plus;2f(x_{N-1})&space;&plus;&space;f(x_N)\right)" title="https://latex.codecogs.com/svg.image?\large \int_a^b f(x) \, dx \approx \sum_{k=1}^N \frac{f(x_{k-1}) + f(x_k)}{2} \Delta x_k = \tfrac{\Delta x}{2}\left(f(x_0) + 2f(x_1)+2f(x_2)+ 2f(x_3)+2f(x_4)+\cdots+2f(x_{N-1}) + f(x_N)\right)" />

<!--
\int_a^b f(x) \, dx \approx \sum_{k=1}^N \frac{f(x_{k-1}) + f(x_k)}{2} \Delta x_k = \tfrac{\Delta x}{2}\left(f(x_0) + 2f(x_1)+2f(x_2)+ 2f(x_3)+2f(x_4)+\cdots+2f(x_{N-1}) + f(x_N)\right)
-->

- Produce a trapezoid-rule integrator which accepts a wet gate (as a function of a single variable) and a list of _x_ values, and yields the integral as a `@rs` floating-point value.  (If you are not yet familiar with these, you may wish to skip ahead to the next lesson.)

```hoon {% copy=true %}
++  trapezint
  |*  [a=(list @rs) b=gate]
  =/  n  (lent a)
  =/  k  1
  =/  sum  .0
  |-  ^-  @rs
  ?:  =(+(k) n)  (add:rs sum (b (snag k a)))
  ?:  =(k 1)
    $(k +(k), sum (add:rs sum (b (snag k a))))
  $(k +(k), sum (mul:rs .2 (add:rs sum (b (snag k a)))))
```

The meat of this gate is concerned with correctly implementing the mathematical equation.  In particular, wetness is required because `b` can be _any_ gate (although it should only be a gate with one argument, lest the whole thing `mull-grow` fail).  If you attempt to create the equivalent dry gate (`|=` bartis), Hoon fails to build it with a `nest-fail` due to the loss of type information from the gate `b`.

#### Tutorial:  `++need`

Wet gates and wet cores are used in Hoon when type information isn't well-characterized ahead of time, as when constructing `++map`s or `++set`s.  For instance, almost all of the arms in `++by` and `++in`, as well as most `++list` tools, are wet gates.

Let's take a look at a particular wet gate from the Hoon standard library, [`++need`](/reference/hoon/stdlib/2a#need).  `++need` works with a `unit` to produce the value of a successful `unit` call, or crash on `~`.  (As this code is already defined in your `hoon.hoon`, you do not need to define it in the Dojo to use it.)

```hoon {% copy=true %}
++  need                                                ::  demand
  |*  a=(unit)
  ?~  a  ~>(%mean.'need' !!)
  u.a
```

Line by line:

```hoon
|*  a=(unit)
```

This declares a wet gate which accepts a `unit`.

```hoon
?~  a  ~<(%mean.'need' !!)
```

If `a` is empty, `~`, then the `unit` cannot be unwrapped.  Crash with [`!!` zapzap](/reference/hoon/rune/zap#-zapzap), but use [`~<` siggal](/reference/hoon/rune/sig#-siggal) to hint to the runtime interpreter how to handle the crash.

```hoon
u.a
```

This returns the value in the `unit` since we now know it exists.

`++need` is wet because we don't want to lose type information when we extract from the `unit`.

### Parametric Polymorphism

We encountered `|$` barbuc above as a wet gate that is a mold builder rune which takes in a list of molds and produces a new mold.  Here we take another look at this rune as an implementation of _parametric polymorphism_ in Hoon.

For example, we have `list`s, `tree`s, and `set`s in Hoon, which are each defined in `hoon.hoon` as wet gate mold builders. Take a moment to see for yourself. Each `++` arm is followed by `|$` and a list of labels for input types inside brackets `[ ]`. After that subexpression comes another that defines a type that is parametrically polymorphic with respect to the input values. For example, here is the definition of `list` from `hoon.hoon`:

```hoon {% copy=true %}
++  list
  |$  [item]
  ::    null-terminated list
  ::
  ::  mold generator: produces a mold of a null-terminated list of the
  ::  homogeneous type {a}.
  ::
  $@(~ [i=item t=(list item)])
```

The `|$` barbuc rune is especially useful for defining containers of various kinds.  Indeed, `list`s, `tree`s, and `set`s are all examples of containers that accept subtypes.  You can have a `(list @)`, a `(list ^)`, a `(list *)`, a `(tree @)`, a `(tree ^)`, a `(tree *)`, etc.  The same holds for `set`.

One nice thing about containers defined by `|$` is that they nest in the expected way.  Intuitively a `(list @)` should nest under `(list *)`, because `@` nests under `*`. And so it does:

```hoon
> =a `(list @)`~[11 22 33]

> ^-((list *) a)
~[11 22 33]
```

Conversely, a `(list *)` should not nest under `(list @)`, because `*` does not nest under `@`:

```hoon
> =b `(list *)`~[11 22 33]

> ^-((list @) b)
nest-fail
```

### Drying Out a Gate

Some functional tools like `++cury` don't work with wet gates.  It is, however, possible to “dry out“ a wet gate using [`++bake`](/reference/hoon/stdlib/2b#bake):

```hoon
> ((curr reel add) `(list @)`[1 2 3 4 ~])
mull-grow
-find.i.a

> ((curr (bake reel ,[(list @) _add]) add) `(list @)`[1 2 3 4 ~])
10
```

Typically it's better to find another way to express your problem than to `++bake` a wet gate, however.  As we said before, wet gates are powerful and for that reason not apt for every purpose.


##  Variance

Dry polymorphism works by substituting cores.  Typically, one core is used as the interface definition, then replaced with another core which does something useful.

For core `b` to nest within core `a`, the batteries of `a` and `b` must have the same tree shape, and the product of each `b` arm must nest within the product of the `a` arm.  Wet arms (described above) are not compatible unless the Hoon expression is exactly the same.  But for dry cores we also apply a payload test that depends on the rules of variance.

There are four kinds of cores: `%gold`, `%iron`, `%zinc`, and `%lead`. You are able to use core-variance rules to create programs which take other programs as arguments. Which particular rules depends on which kind of core your program needs to complete.

Before we embark on the following discussion, we want you to know that [variance](https://en.wikipedia.org/wiki/Covariance_and_contravariance_%28computer_science%29) is a bright-line idea, much like cores themselves, which once you “get” illuminates you further about Hoon-nature.  For the most part, though, you don't need to worry about core variance much unless you are writing kernel code, since it impinges on how cores evaluate with other cores as inputs.  Don't sweat it if it takes a while for core variance to click for you.  (If you want to dig into resources, check out Meyer type theory.  The rules should make sense if you think about them intuitively and don't get hung up on terminology.)  You should read up on the [Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle) if you want to dive deeper.  [Vadzim Vysotski](https://vadzimv.dev/2019/10/01/generic-programming-part-1-introduction.html) and [Jamie Kyle](https://medium.com/@thejameskyle/type-systems-covariance-contravariance-bivariance-and-invariance-explained-35f43d1110f8) explain the theory of type system variance accessibly, while [Eric Lippert](https://archive.ph/QmiqB) provides a more technical description.  There are many wrinkles that particular languages, such as object-oriented programming languages, introduce which we can elide here.

<!--
https://stackoverflow.com/questions/37467882/why-does-c-sharp-use-contravariance-not-covariance-in-input-parameters-with-de
https://docs.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance
--->

Briefly, computer scientist Eric Lippert [clarifies](https://stackoverflow.com/questions/37467882/why-does-c-sharp-use-contravariance-not-covariance-in-input-parameters-with-de) that “variance is a fact about the preservation of an assignment compatibility relationship across a transformation of types.”  What trips learners up about variance is that **variance rules apply to the input and output of a core, not directly to the core itself**.  A core has a _variance property_, but that property doesn't manifest until cores are used together with each other.

Variance describes the four possible relationships that type rules are able to have to each other.  Hoon imaginatively designates these by metals.  Briefly:

1. **Covariance (`%zinc`)** means that specific types nest inside of generic types:  it's like claiming that a core that produces a `%plant` can produce a `%tree`, a subcategory of `%plant`.  Covariance is useful for flexibility in return values.

2. **Contravariance (`%iron`)** means that generic types are expected to nest inside of specific types:  it's like claiming that a core that can accept a `%tree` can accept a `%plant`, the supercategory of `%tree`.  (Contravariance seems counterintuitive for many developers when they encounter it for the first time.)  Contravariance is useful for flexibility in input values (`sample`s).

3. **Bivariance (`%lead`)** means that we can allow both covariant and contravariant behavior.  While bivariance is included for completeness (including a worked example below), it is not commonly used and only a few examples exist in the standard library for building shared data structure cores.

4. **Invariance (`%gold`)** means that types must mutually nest compatibly:  a core that accepts or produces a `%tree` can only accept or produce a `%tree`.  This is the default behavior of cores, so it's the strongest model you have imprinted on.  Cores which allow variance are changing that behavior.

A `%gold` core can be cast or converted to any metal, and any metal can be cast or converted to `%lead`.

<!--
TODO
would be nice to explain similar to aura nesting rules, but at the core level
https://medium.com/@thejameskyle/type-systems-covariance-contravariance-bivariance-and-invariance-explained-35f43d1110f8
-->

### `%zinc` Covariance

Covariance means that specific types nest inside of generic types:  `%tree` nests inside of `%plant`.  Covariant data types are sources, or read-only values.

A zinc core `z` has a read-only sample (payload head, `+6.z`) and an opaque context (payload tail, `+7.z`).  (_Opaque_ here means that the faces and arms are not exported into the namespace, and that the values of faces and arms can't be written to.  The object in question can be replaced by something else without breaking type safety.)  A core `y` which nests within it must be a gold or zinc core, such that `+6.y` nests within `+6.z`.  Hence, **covariant**.

<!-- If type `x` nests within type `xx`, and type `y` nests within type `yy`, then a core accepting `yy` and producing `x` nests within an iron core accepting `y` and producing `xx`. TODO not adjusted yet -->

You can read from the sample of a `%zinc` core, but not change it:

```hoon
> =mycore ^&(|=(a=@ 1))

> a.mycore
0

> mycore(a 22)
-tack.a
-find.a
ford: %slim failed:
ford: %ride failed to compute type:
```

Informally, a function fits an interface if the function has a more specific result and/or a less specific argument than the interface.

The [`^&` ketpam](/reference/hoon/rune/ket#-ketpam) rune converts a core to a `%zinc` covariant core.

### `%iron` Contravariance

Contravariance means that generic types nest inside of specific types.  Contravariant data types are sinks, or write-only values.

An `%iron` core `i` has a write-only sample (payload head, `+6.i`) and an opaque context (payload tail, `+7.i`).  A core `j` which nests within it must be a `%gold` or `%iron` core, such that `+6.i` nests within `+6.j`. Hence, **contravariant**.

If type `x` nests within type `xx`, and type `y` nests within type `yy`, then a core accepting `yy` and producing `x` nests within an iron core accepting `y` and producing `xx`.

Informally, a function fits an interface if the function has a more specific result and/or a less specific argument than the interface.

For instance, the archetypal Gall agents in `/sys/lull.hoon` are composed using iron gates since they will be used as examples for building actual agent cores.  The `++rs` and sister gates in `/sys/hoon.hoon` are built using iron doors with specified rounding behavior so when you actually use the core (like `++add:rs`) the core you are using has been built as an example.

The [`|~` barsig](/reference/hoon/rune/bar#-barsig) rune produces an iron gate.  The [`^|` ketbar](/reference/hoon/rune/ket#-ketbar) rune converts a `%gold` invariant core to an iron core.

### `%lead` Bivariance

Bivariance means that both covariance and contravariance apply.  Bivariant data types have an opaque `payload` that can neither be read or written to.

A lead core `l` has an opaque `payload` which can be neither read nor written to.  There is no constraint on the payload of a core `m` which nests within it.  Hence, **bivariant**.

If type `x` nests within type `xx`, a lead core producing `x` nests within a lead core producing `xx`.

Bivariant data types are neither readable nor writeable, but have no constraints on nesting.  These are commonly used for `/mar` marks and `/sur` structure files.  They are useful as examples which produce types.

Informally, a more specific generator can be used as a less specific generator.

For instance, several archetypal cores in `/sys/lull.hoon` which define operational data structures for Arvo are composed using lead gates.

The [`|?` barwut](/reference/hoon/rune/bar#-barwut) rune produces a lead trap.  The [`^?` ketwut](/reference/hoon/rune/ket#-ketwut) rune converts any core to a `%lead` bivariant core.

### `%gold` Invariance

Invariance means that type nesting is disallowed.  Invariant data types have a read-write `payload`.

A `%gold` core `g` has a read-write payload; another core `h` that nests within it (i.e., can be substituted for it) must be a `%gold` core whose `payload` is mutually compatible (`+3.g` nests in `+3.h`, `+3.h` nests in `+3.g`).  Hence, **invariant**.

By default, cores are `%gold` invariant cores.


### Illustrations

#### Tutorial:  `%gold` Invariant Polymorphism

Usually it makes sense to cast for a `%gold` core type when you're treating a core as a state machine.  The check ensures that the payload, which includes the relevant state, doesn't vary in type.

Let's look at simpler examples here, using the `^+` ketlus rune:

```hoon
> ^+(|=(^ 15) |=(^ 16))
< 1.jcu
  [ [* *]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>

> ^+(|=(^ 15) |=([@ @] 16))
mint-nice
-need.@
-have.*
nest-fail

> ^+(|=(^ 15) |=(* 16))
mint-nice
-need.[* *]
-have.*
nest-fail
```

The first cast goes through because the right-hand gold core has the same sample type as the left-hand gold core. The sample types mutually nest. The second cast fails because the right-hand sample type is more specific than the left-hand sample type. (Not all cells, `^`, are pairs of atoms, `[@ @]`.) And the third cast fails because the right-hand sample type is broader than the left-hand sample type. (Not all nouns, `*`, are cells, `^`.)

Two more examples:

```
> ^+(=>([1 2] |=(@ 15)) =>([123 456] |=(@ 16)))
<1.xqz [@ @ud @ud]>

> ^+(=>([1 2] |=(@ 15)) =>([123 456 789] |=(@ 16)))
nest-fail
```

In these examples, the `=>` rune is used to give each core a simple context. The context of the left-hand core in each case is a pair of atoms, `[@ @]`. The first cast goes through because the right-hand core also has a pair of atoms as its context. The second cast fails because the right-hand core has the wrong type of context -- three atoms, `[@ @ @]`.

#### Tutorial:  `%iron` Contravariant Polymorphism

`%iron` gates are particularly useful when you want to pass gates (having various payload types) to other gates.  We can illustrate this use with a very simple example. Save the following as `/gen/gatepass.hoon` in your `%base` desk:

```hoon {% copy=true %}
|=  a=_^|(|=(@ 15))
^-  @
=/  b=@  (a 10)
(add b 20)
```

This generator is rather simple except for the first line.  The sample is defined as an `%iron` gate and gives it the face `a`.  The function as a whole is for taking some gate as input, calling it by passing it the value `10`, adding `20` to it, and returning the result.  Let's try it out in the Dojo:

```hoon
> +gatepass |=(a=@ +(a))
31

> +gatepass |=(a=@ (add 3 a))
33

> +gatepass |=(a=@ (mul 3 a))
50
```

But we still haven't fully explained the first line of the code.  What does `_^|(|=(@ 15))` mean? The inside portion is clear enough:  `|=(@ 15)` produces a normal (i.e., `%gold`) gate that takes an atom and returns `15`.  The [`^|` ketbar](/reference/hoon/rune/ket#-ketbar) rune is used to turn `%gold` gates to `%iron`.  (Reverse alchemy!)  And the `_` character turns that `%iron` gate value into a structure, i.e. a type.  So the whole subexpression means, roughly:  “the same type as an iron gate whose sample is an atom, `@`, and whose product is another atom, `@`”.  The context isn't checked at all.  This is good, because that allows us to accept gates defined and produced in drastically different environments.  Let's try passing a gate with a different context:

```hoon
> +gatepass =>([22 33] |=(a=@ +(a)))
31
```

It still works.  You can't do that with a gold core sample!

There's a simpler way to define an iron sample. Revise the first line of `/gen/gatepass.hoon` to the following:

```hoon {% copy=true %}
|=  a=$-(@ @)
^-  @
=/  b=@  (a 10)
(add b 20)
```

If you test it, you'll find that the generator behaves the same as it did before the edits.  The [`$-` buchep](/reference/hoon/rune/buc#-buchep) rune is used to create an `%iron` gate structure, i.e., an `%iron` gate type.  The first expression defines the desired sample type, and the second subexpression defines the gate's desired output type.

The sample type of an `%iron` gate is contravariant.  This means that, when doing a cast with some `%iron` gate, the desired gate must have either the same sample type or a superset.

Why is this a useful nesting rule for passing gates?  Let's say you're writing a function `F` that takes as input some gate `G`.  Let's also say you want `G` to be able to take as input any **mammal**.  The code of `F` is going to pass arbitrary **mammals** to `G`, so that `G` needs to know how to handle all **mammals** correctly.  You can't pass `F` a gate that only takes **dogs** as input, because `F` might call it with a **cat**.  But `F` can accept a gate that takes all **animals** as input, because a gate that can handle any **animal** can handle **any mammal**.

`%iron` cores are designed precisely with this purpose in mind.  The reason that the sample is write-only is that we want to be able to assume, within function `F`, that the sample of `G` is a **mammal**.  But that might not be true when `G` is first passed into `F`—the default value of `G` could be another **animal**, say, a **lizard**.  So we restrict looking into the sample of `G` by making the sample write-only.  The illusion is maintained and type safety secured.

Let's illustrate `%iron` core nesting properties:

```hoon
> ^+(^|(|=(^ 15)) |=(^ 16))
< 1|jcu
  [ [* *]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>

> ^+(^|(|=(^ 15)) |=([@ @] 16))
mint-nice
-need.@
-have.*
nest-fail

> ^+(^|(|=(^ 15)) |=(* 16))
< 1|jcu
  [ [* *]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>
```

(As before, we use the `^|` ketbar rune to turn `%gold` gates to `%iron`.)

The first cast goes through because the two gates have the same sample type.  The second cast fails because the right-hand gate has a more specific sample type than the left-hand gate does.  If you're casting for a gate that accepts any cell, `^`, it's because we want to be able to pass any cell to it.  A gate that is only designed for pairs of atoms, `[@ @]`, can't handle all such cases, naturally.  The third cast goes through because the right-hand gate sample type is broader than the left-hand gate sample type.  A gate that can take any noun as its sample, `*`, works just fine if we choose only to pass it cells, `^`.

We mentioned previously that an `%iron` core has a write-only sample and an opaque context.  Let's prove it.

Let's define a trivial gate with a context of `[g=22 h=44 .]`, convert it to `%iron` with `^|`, and bind it to `iron-gate` in the dojo:

```hoon
> =iron-gate ^|  =>([g=22 h=44 .] |=(a=@ (add a g)))

> (iron-gate 10)
32

> (iron-gate 11)
33
```

Not a complicated function, but it serves our purposes.  Normally (i.e., with `%gold` cores) we can look at a context value `p` of some gate `q` with a wing expression: `p.q`. Not so with the iron gate:

```hoon
> g.iron-gate
-find.g.iron-gate
```

And usually we can look at the sample value using the face given in the gate definition. Not in this case:

```hoon
> a.iron-gate
-find.a.iron-gate
```

If you really want to look at the sample you can check `+6` of `iron-gate`:

```hoon
> +6.iron-gate
0
```

… and if you really want to look at the head of the context (i.e., where `g` is located, `+14`) you can:

```hoon
> +14.iron-gate
22
```

… but in both cases all the relevant type information has been thrown away:

```hoon
> -:!>(+6.iron-gate)
#t/*

> -:!>(+14.iron-gate)
#t/*
```

#### Tutorial:  `%zinc` Covariant Polymorphism

As with `%iron` cores, the context of `%zinc` cores is opaque—they cannot be written-to or read-from.  The sample of a `%zinc` core is read-only.  That means, among other things, that `%zinc` cores cannot be used for function calls.  Function calls in Hoon involve a change to the sample (the default sample is replaced with the argument value), which is disallowed as type-unsafe for `%zinc` cores.

We can illustrate the casting properties of `%zinc` cores with a few examples.  The [`^&` ketpam](/reference/hoon/rune/ket#-ketpam) rune is used to convert `%gold` cores to `%zinc`:

```hoon
> ^+(^&(|=(^ 15)) |=(^ 16))
< 1&jcu
  [ [* *]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>

> ^+(^&(|=(^ 15)) |=([@ @] 16))
< 1&jcu
  [ [* *]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>

> ^+(^&(|=(^ 15)) |=(* 16))
mint-nice
-need.[* *]
-have.*
nest-fail
```

The first two casts succeed because the right-hand core sample type is either the same or a subset of the left-hand core sample type.  The last one fails because the right-hand sample type is a superset.

Even though you can't function call a `%zinc` core, the arms of a `%zinc` core can be computed and the sample can be read.  Let's test this with a `%zinc` gate of our own:

```hoon
> =zinc-gate ^&  |=(a=_22 (add 10 a))

> (zinc-gate 12)
payload-block

> a.zinc-gate
22

> $.zinc-gate
32
```

#### Tutorial:  `%lead` Bivariant Polymorphism

`%lead` cores have more permissive nesting rules than either `%iron` or `%zinc` cores.  There is no restriction on which payload types nest.  That means, among other things, that the payload type of a `%lead` core is both covariant and contravariant ( ‘bivariant’).

In order to preserve type safety when working with `%lead` cores, a severe restriction is needed.  The whole payload of a `%lead` core is opaque—the payload can neither be written-to or read-from.  For this reason, as was the case with `%zinc` cores, `%lead` cores cannot be called as functions.

The arms of a `%lead` core can still be evaluated, however. We can use the `^?` rune to convert a `%gold`, `%iron`, or `%zinc` core to lead:

```hoon
> =lead-gate ^?  |=(a=_22 (add 10 a))

> $.lead-gate
32
```

But don't try to read the sample:

```hoon
> a.lead-gate
-find.a.lead-gate
```

#### Tutorial:  `%lead` Bivariant Polymorphism

- Calculate the Fibonacci series using `%lead` and `%iron` cores.

This program produces a list populated by the first ten elements of the `++fib` arm.  It consists of five arms; in brief:

- `++fib` is a trap (core with no sample and default arm `$` buc)
- `++stream` is a mold builder that produces a trap, a function with no argument.  This trap can yield a value or a `~`.
- `++stream-type` is a wet gate that produces the type of items stored in `++stream`.
- `++to-list` is a wet gate that converts a `++stream` to a `list`.
- `++take` is a wet gate that takes a `++stream` and an atom and yields a modified subject (!) and another trap of `++stream`'s type.

**`/gen/fib.hoon`**

```hoon {% copy=true mode="collapse" %}
=<  (to-list (take fib 10))
|%
++  stream
  |*  of=mold
  $_  ^?   |.
  ^-  $@(~ [item=of more=^$])
  ~
++  stream-type
  |*  s=(stream)
  $_  =>  (s)
  ?~  .  !!
  item
++  to-list
  |*  s=(stream)
  %-  flop
  =|  r=(list (stream-type s))
  |-  ^+  r
  =+  (s)
  ?~  -  r
  %=  $
    r  [item r]
    s  more
  ==
++  take
  |*  [s=(stream) n=@]
  =|  i=@
  ^+  s
  |.
  ?:  =(i n)  ~
  =+  (s)
  ?~  -  ~
  :-  item
  %=  ..$
    i  +(i)
    s  more
  ==
++  fib
  ^-  (stream @ud)
  =+  [p=0 q=1]
  |.  :-  q
  %=  .
    p  q
    q  (add p q)
  ==
--
```

Let's examine each arm in detail.

##### `++stream`

```hoon
++  stream
  |*  of=mold
  $_  ^?  |.
  ^-  $@(~ [item=of more=^$])
  ~
```

`++stream` is a mold-builder. It's a wet gate that takes one argument, `of`, which is a `mold`, and produces a `%lead` trap—a function with no `sample` and an arm `$` buc, with opaque `payload`.

`$_` buccab is a rune that produces a type from an example; `^?` ketwut converts (casts) a core to lead; `|.` bardot forms the trap.  So to follow this sequence we read it backwards:  we create a trap, convert it to a lead trap (making its payload inaccessible), and then use that lead trap as an example from which to produce a type.

With the line `^- $@(~ [item=of more=^$])`, the output of the trap will be cast into a new type.  `$@` bucpat is the rune to describe a data structure that can either be an atom or a cell.  The first part describes the atom, which here is going to be `~`.  The second part describes a cell, which we define to have the head of type `of` with the face `item`, and a tail with a face of `more`.  The expression `^$` is not a rune (no children), but rather a reference to the enclosing wet gate, so the tail of this cell will be of the same type produced by this wet gate.

The final `~` here is used as the type produced when initially calling this wet gate.  This is valid because it nests within the type we defined on the previous line.

Now you can see that a `++stream` is either `~` or a pair of a value of some type and a `++stream`.  This type represents an infinite series.

##### `++stream-type`

```hoon
++  stream-type
  |*  s=(stream)
  $_  =>  (s)
  ?~  .  !!
  item
```

`++stream-type` is a wet gate that produces the type of items stored in the `stream` arm.  The `(stream)` syntax is a shortcut for `(stream *)`; a stream of some type.

Calling a `++stream`, which is a trap, will either produce `item` and `more` or it will produce `~`. If it does produce `~`, the `++stream` is empty and we can't find what type it is, so we simply crash with `!!` zapzap.

##### `++take`

```hoon
++  take
  |*  [s=(stream) n=@]
  =|  i=@
  ^+  s
  |.
  ?:  =(i n)  ~
  =+  (s)
  ?~  -  ~
  :-  item
  %=  ..$
    i  +(i)
    s  more
  ==
```

`++take` is another wet gate. This time it takes a `++stream` `s` and an atom `n`. We add an atom to the subject and then make sure that the trap we are creating is going to be of the same type as `s`, the `++stream` we passed in.

If `i` and `n` are equal, the trap will produce `~`.  If not, `s` is called and has its result put on the front of the subject.  If its value is `~`, then the trap again produces `~`.  Otherwise the trap produces a cell of `item`, the first part of the value of `s`, and a new trap that increments `i`, and sets `s` to be the `more` trap which produces the next value of the `++stream`.  The result here is a `++stream` that will only ever produce `n` items, even if the stream otherwise would have been infinite.

##### `++take`

```hoon
++  to-list
  |*  s=(stream)
  %-  flop
  =|  r=(list (stream-type s))
  |-  ^+  r
  =+  (s)
  ?~  -  r
  %=  $
    r  [item r]
    s  more
  ==
```

`++to-list` is a wet gate that takes `s`, a `++stream`, only here it will, as you may expect, produce a `list`.  The rest of this wet gate is straightforward but we can examine it quickly anyway.  As is the proper style, this list that is produced will be reversed, so `flop` is used to put it in the order it is in the stream.  Recall that adding to the front of a list is cheap, while adding to the back is expensive.

`r` is added to the subject as an empty `list` of whatever type is produced by `s`.  A new trap is formed and called, and it will produce the same type as `r`.  Then `s` is called and has its value added to the subject. If the result is `~`, the trap produces `r`.  Otherwise, we want to call the trap again, adding `item` to the front of `r` and changing `s` to `more`.  Now the utility of `take` should be clear.  We don't want to feed `to-list` an infinite stream as it would never terminate.

##### `++fib`

```hoon
++  fib
  ^-  (stream @ud)
  =+  [p=0 q=1]
  |.  :-  q
  %=  .
    p  q
    q  (add p q)
  ==
```

The final arm in our core is `++fib`, which is a `++stream` of `@ud` and therefore is a `%lead` core.  Its subject contains `p` and `q`, which will not be accessible outside of this trap, but because of the `%=` cenhep will be retained in their modified form in the product trap.  The product of the trap is a pair (`:-` colhep) of an `@ud` and the trap that will produce the next `@ud` in the Fibonacci series.

```hoon
=<  (to-list (take fib 10))
```

Finally, the first line of our program will take the first 10 elements of `fib` and produce them as a list.

```unknown
~[1 1 2 3 5 8 13 21 34 55]
```

This example is a bit overkill for simply calculating the Fibonacci series, but it illustrates how you could use `%lead` cores.  Instead of `++fib`, you can supply any infinite sequence and `++stream` will correctly handle it.

##  Exercise:  `%lead` Bivariant Polymorphism

- Produce a `%say` generator that yields another self-referential sequence, like the [Lucas numbers](https://en.wikipedia.org/wiki/Lucas_number) or the [Thue–Morse sequence](https://en.wikipedia.org/wiki/Thue%E2%80%93Morse_sequence).
