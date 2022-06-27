+++
title: Cores
nodes: [130, 133]
objectives: ["Employ a trap to produce a reentrant block of code.", "Produce a recursive gate.", "Distinguish head and tail recursion.", "Consider Hoon structures as cores.", "Identify the special role of the `$` buc arm in many cores.", "Order neighboring cores within the subject for addressibility.", "Produce a type arm."]
+++

#   Cores

_This module will introduce the key Hoon data structure known as the **core**, as well as ramifications._

The Hoon subject is a noun.  One way to look at this noun is to denote each fragment of is as either a computation or data.  By strictly separating these two kinds of things, we derive the data structure known within Hoon as a _core_.

Cores are the most important data structure in Hoon.  They allow you to solve many coding problems by identifying a pattern and supplying a proper data structure apt to the challenge.  You have already started using cores with `|=` bartis gate construction and use.

This lesson will introduce another core to solve a specific use case, then continue with a general discussion of cores.  Getting cores straight will be key to understanding why Hoon has the structure and internal logic it does.


##  Repeating Yourself Using a Trap

Computers were built and designed to carry out tasks which were too dainty and temperamental for humans to repeat consistently, or too prodigiously numerous for humans to ever complete.  At this point, you know how to build code that can make a decision between two branches, two different Hoon expressions.  Computers can decide between alternatives, but they also need to carry out a task until some condition is met.  (We can think of it as a recipe step, like “crack five eggs into a bowl”.  Until that process is complete, we as humans continue to carry out the equivalent action again and again until the process has been completed.)

In programming, we call this behavior a “loop”.  A loop describes the situation in which we set up some condition, and repeat a process over and over until something we do meets that condition.  _Most_ of the time, this means counting once for each item in a collection, like a list.

Hoon effects the concept of a loop using recursion, return to a particular point in an expression (presumably with some different values).  One way to do this is using the [`|-` barhep](/reference/hoon/rune/bar#barhep) rune, which creates a structure called a _trap_.  (Think of the “trap” in the bottom of your sink.)  It means a point to which you can return again, perhaps with some key values (like a counter) changed.  Then you can repeat the calculation inside the trap again.  This continues until some single value, some noun, results, thereby handing a value back out of the expression.  (Remember that every Hoon expression results in a value.)

This program adds 1+2+3+4+5 and returns the sum:

```hoon
=/  counter  1
=/  sum  0
|-
?:  (gth counter 5)
  sum
%=  $
  counter  (add counter 1)
  sum      (add sum counter)
==
```

(The last two lines happen simultaneously, so make sure to refer to the _current_ version of any variables.)

Let's unroll it:

0.  `counter = 1`
    `sum = 0`

1.  `(gth counter 5) = %.n`
    `counter ← (add counter 1) = 2`
    `sum ← (add sum counter) = 0 + 1 = 1`

2.  `(gth counter 5) = %.n`
    `counter ← (add counter 1) = 3`
    `sum ← (add sum counter) = 1 + 2 = 3`

3.  `(gth counter 5) = %.n`
    `counter ← (add counter 1) = 4`
    `sum ← (add sum counter) = 3 + 3 = 6`

4.  `(gth counter 5) = %.n`
    `counter ← (add counter 1) = 5`
    `sum ← (add sum counter) = 6 + 4 = 10`

5.  `(gth counter 5) = %.n`
    `counter ← (add counter 1) = 6`
    `sum ← (add sum counter) = 10 + 5 = 15`

6.  `(gth counter 5) = %.y`

And thus `sum` yields the final value of `15`.

It is frequently helpful, when constructing these, to be able to output the values at each step of the process.  Use the [`~&` sigpam](/reference/hoon/rune/sig#sigpam) rune to create output without changing any values:

```hoon
=/  counter  1
=/  sum  0
|-
~&  "counter:"
~&  counter
~&  "sum:"
~&  sum
?:  (gth counter 5)
  sum
%=  $
  counter  (add counter 1)
  sum      (add sum counter))
==
```

You can do even better using _interpolation_:

```hoon
=/  counter  1
=/  sum  0
|-
~&  "counter: {<counter>}"
~&  "sum: {<sum>}"
?:  (gth counter 5)
  sum
%=  $
  counter  (add counter 1)
  sum      (add sum counter))
==
```

#### Exercise:  Calculate a Factorial

- Let's calculate a [factorial](https://mathworld.wolfram.com/Factorial.html).  The factorial of a number _n_ is _n_×(_n_-1)×...×2×1.  We will introduce a couple of new bits of syntax and a new gate (`++dec`).  Make this into a generator `factorial.hoon`:

    ```hoon
    |=  n=@ud
    |-
    ~&  n
    ?:  =(n 1)
      1
    %+  mul
    n
    %=  $
      n  (dec n)
    ==
    ```

    - We are using the `=` irregular syntax for the [`.=` dottis](/reference/hoon/rune/dot#dottis) rune, which tests for the equality of two expressions.

    - We are using the `+` irregular syntax for the [`.+` dotlus](/reference/hoon/rune/dot#dotlus) rune, which increments a value (adds one).

    ```hoon
    > +factorial 5
    120
    ```

    Let's visualize the operation of this gate using pseudocode (fake code that's explanatory but may not be operational).  Here's basically what's happening when `factorial` receives the value `5`:

    ```hoon
    (factorial 5)
    (mul 5 (factorial 4))
    (mul 5 (mul 4 (factorial 3)))
    (mul 5 (mul 4 (mul 3 (factorial 2))))
    (mul 5 (mul 4 (mul 3 (mul 2 (factorial 1)))))
    (mul 5 (mul 4 (mul 3 (mul 2 1))))
    (mul 5 (mul 4 (mul 3 2)))
    (mul 5 (mul 4 6))
    (mul 5 24)
    120
    ```

    We're “floating” gate calls until we reach the final iteration of such calls that only produces a value.  The `mul n` component of the gate leaves `mul 5` waiting for the final series of terms to be operated upon.  The `%=($ n (dec n)))` component expands the expression outwards, as illustrated by `(factorial 4)`.  This continues until the expression is not expanded further, at which point the operations work backwards, successively feeding values into the `mul` functions behind them.

    The pyramid-shaped illustration approximates what's happening on the _call stack_, a memory structure that tracks the instructions of the program.  In this code, every time a parent gate calls another gate, the gate being called is "pushed" to the top of the stack in the form of a frame.  This process continues until a value is produced instead of a function, completing the stack.

    - Why do we return the result (`product` in Hoon parlance) at 1 instead of 0?

#### Exercise:  Tracking Expression Structure

As we write more complicated programs, it is helpful to learn to read the runes by identifying which daughter expressions attach to which runes, e.g.:

```
=/
  n
  15
  |-
    ~&
      n
      ?:
        =(n 1)      :: .=  n  1
        1
      %+
        mul
        n
        %=
          $
          n
          (dec n)   :: %-  dec  n
        ==
```

Recall that the `::` digraph tells the compiler to ignore the rest of the text on the line.  Such text is referred to as a "comment" because, instead of performing a computation, it exists to explain things to human readers of the source code.  Here, we have also explicitly marked the expansion of the irregular forms.

We will revert to the irregular form more and more.  If you would like to see exactly how an expression is structured, you can use the [`!,` zapcom](/reference/hoon/rune/zap#zapcom) rune.  `!,` zapcom produces an annotated _abstract syntax tree_ (AST) which labels every value and expands any irregular syntax into the regular runic form.

```hoon
> !,  *hoon  (add 5 6)
[%cncl p=[%wing p=~[%add]] q=~[[%sand p=%ud q=5] [%sand p=%ud q=6]]]
```

```hoon
> !,  *hoon  |=  n=@ud  
 |-  
 ~&  n  
 ?:  =(n 1)  
   n 1
 %+  mul  
 n  
 %=  $  
   n  (dec n)  
 ==  
[ %brts  
 p=[%bcts p=term=%n q=[%base p=[%atom p=~.ud]]]  
   q  
 [ %brhp  
     p  
   [ %sgpm  
     p=0  
     q=[%wing p=~[%n]]  
       r  
     [ %wtcl  
       p=[%dtts p=[%wing p=~[%n]] q=[%sand p=%ud q=1]]  
       q=[%wing p=~[%n]]  
         r  
       [ %cnls  
         p=[%wing p=~[%mul]]  
         q=[%wing p=~[%n]]  
         r=[%cnts p=~[%$] q=~[[p=~[%n] q=[%cncl p=[%wing p=~[%dec]] q=~[[%wing p=~[%n]]]]]]]  
       ]  
     ]  
   ]  
 ]  
]
```

(_There's a lot going on in there._  Focus on the four-letter runic identifiers:  `%sgpm` for `~&` sigpam, for instance.)

####  Exercise:  Calculate a sequence of numbers

Produce a gate (generator) which accepts a `@ud` value and calculates the series where the *i*th term in the series is given by the equation

![](https://latex.codecogs.com/png.image?\large%20\dpi{110}n_{i}%20=%20i^{2}\textrm{,})

<!--
$$
n_{i} = i^{2}
\textrm{,}
$$
-->

that is, the first numbers are 0, 1, 4, 9, 16, 25, etc.

For this exercise, you do not need to store these values in a list.  Calculate each one but only return the final value.

####  Exercise:  Output each letter in a `tape`

Produce a gate (generator) which accepts a `tape` value and returns a `(list @ud)` containing the ASCII value of each character.  Use a `|-` barhep trap.

The previous code simply modified a value by addition.  You can generalize this to other arithmetic processes, like multiplication, but you can also grow a data structure like a list.

For example, given the `tape` `"hello"`, the generator should return the list `~[104 101 108 108 111]`.

Two tools that may help:

- You can retrieve the _n_-th element in a `tape` using the [`++snag`](/reference/hoon/stdlib/2b#snag) gate, e.g. `(snag 3 `(list @ud)`~[1 2 3 4 5])` yields `4` (so `++snag` is zero-indexed; it counts from zero).
- You can join an element to a list using the [`++snoc`](/reference/hoon/stdlib/2b#snoc) gate, e.g. `(snoc `(list @ud)`~[1 2 3] 4)` yields `~[1 2 3 4]`.

```hoon
|=  [input=tape]
=/  counter  0
=/  results  *(list @ud)
|-
?:  =(counter (lent input))
  results
=/  ascii  `@ud`(snag counter input)
%=  $
  counter  (add counter 1)
  results  (snoc results ascii)
==
```


##  Cores

So far we have introduced and worked with a few key structures:

1. Nouns
2. Molds (types)
3. Gates
4. Traps

Some of them are _data_, like raw values:  `0x1234.5678.abcd` and `[5 6 7]`.  Others are _code_, programs that do something.  What unifies all of these under the hood?

A core is a cell pairing operations to data.  Formally, we'll say a core is a cell `[battery payload]`, where `battery` describes the things that can be done (the operations) and `payload` describes the data on which those operations rely.  (For many English speakers, the word “battery” evokes a [voltaic pile](https://en.wikipedia.org/wiki/Voltaic_pile) more than a bank of guns, but the artillery metaphor is a better mnemonic for `[battery payload]`.)

**Cores are the most important structural concept for you to grasp in Hoon.**  Everything nontrivial is a core.  Some of the runes you have used already produce cores, like the gate.  That is, a gate marries a `battery` (the operating code) to the `payload` (the input values AND the “subject” or operating context).

Urbit adopts an innovative programming paradigm called _subject-oriented programming_.  By and large, Hoon (and Nock) is a functional programming language in that running a piece of code twice will always yield the same result, and because runs cause a program to explicitly compose various subexpressions in a somewhat mathematical way.

Hoon (and Nock) very carefully bounds the known context of any part of the program as the _subject_.  Basically, the subject is the noun against which any arbitrary Hoon code is evaluated.

For instance, when we first composed generators, we made what are called “naked generators”:  that is, they do not have access to any information outside of the base subject (Arvo, Hoon, and `%zuse`) and their sample (arguments).  Other generators (such as `%say` generators, described below) can have more contextual information, including random number generators and optional arguments, passed to them to form part of their subject.

Cores have two kinds of values attached:  arms and legs, both called limbs.  Arms describe known labeled addresses (with `++` luslus or `+$` lusbuc) which carry out computations.  Legs are limbs which store data (with e.g. `/=` tisfas).

### Arms

So legs are for data and arms are for computations.  But what _specifically_ is an arm, and how is it used for computation?  Let's begin with a preliminary explanation that we'll refine later.

An _arm_ is some expression of Hoon encoded as a noun.  (By 'encoded as a noun' we literally mean: 'compiled to a Nock formula'.  But you don't need to know anything about Nock to understand Hoon.)  You virtually never need to treat an arm as raw data, even though technically you can—it's just a noun like any other.  You almost always want to think of an arm simply as a way of running some Hoon code.

Every expression of Hoon is evaluated relative to a subject.  An [_arm_](/reference/glossary/arm) is a Hoon expression to be evaluated against the core subject (i.e. its parent core is its subject).

#### Arms for Gates

Within a core, we label arms as Hoon expressions (frequently `|=` bartis gates) using the [`++` luslus](/reference/hoon/rune/lus#luslus) digraph.  (`++` isn't formally a rune because it doesn't actually change the structure of a Hoon expression, it simply marks a name for an expression or value.  The `--` hephep limiter digraph is used because `|%` barcen can have any number of arms attached.  Like `++`, it is not formally a rune.)

```hoon
|%
++  add-one
  |=  a=@ud
  ^-  @ud
  (add a 1)
++  sub-one
  |=  a=@ud
  ^-  @ud
  (sub a 1)
--
```

Give the name `adder` to the above, and use it thus:

```hoon
> (add-one:adder 5)
6

> (sub-one:adder 5)
4
```

Notice here that we read the arm resolution from right-to-left.  This isn't the only way to address an arm, but it's the most common one.

#### Exercise:  Produce a Gate Arm

- Compose a core which contains arms for multiplying a value by two and for dividing a value by two.

#### Arms for Types

We can define custom types for a core using [`+$` lusbuc](/reference/hoon/rune/lus#lusbuc) digraphs.  We won't do much with these yet but they will come in handy for custom types later on.

This core defines a set of types intended to work with playing cards:

```hoon
|%
+$  suit  ?(%hearts %spades %clubs %diamonds)
+$  rank  ?(1 2 3 4 5 6 7 8 9 10 11 12 13)
+$  card  [sut=suit val=rank]
+$  deck  (list card)
--
```

#### Cores in Generators

When we write generators, we can include helpful tools as arms either before the main code (with `=>` tisgar) or after the main code (with `=<` tisgal):

```hoon
|=  n=@ud
=<
(add-one n)
|%
++  add-one
  |=  a=@ud
  ^-  @ud
  (add a 1)
--
```

A library (a file in `/lib`) is typically structured as a `|%` barcen core.

### Legs

A _leg_ is a data value.  They tend to be trivial but useful ways to pin constants.  `=/` tisfas values are legs, for instance.

```hoon
> =/  a  1
  +(a)
2
```

Under the hood, legs and arms are distinguished by the Nock instructions used in each case.  A leg is evaluated by Nock 0, while an arm is evaluated by Nock 9.

### Recalculating a Limb

Arms and legs are both _limbs_.  Either one can be replaced in a given subject.  This turns out to be very powerful, and permits Hoon to implement gates (functions) in a mathematically rigorous way, among other applications.

Often a leg of the subject is produced with its value unchanged. But there is a way to produce a modified version of the leg as well. To do so, we use the `%=` cenhep rune:

```hoon
%=  subject-limb
  leg-1  new-leg-1
  leg-2  new-leg-2
  ...
==
```

`%=` cenhep is frequently used in its irregular form, particularly if the expression within it fits on a single line.  The irregular form prepends the arm (often `$`) to parentheses `()`.  In its irregular form, the above would be:

```hoon
subject-limb(leg-1 new-leg-1, leg-2 new-leg-2, ...)
```

In the first example, we saw the expression

```hoon
%=  $
  counter  (add counter 1)
  sum      (add sum counter)
==
```

which can equivalently be expressed as

```hoon
$(counter (add counter 1), sum (add sum counter))
```

This statement means that we recalculate the `$` buc arm of the current subject with the indicated changes.  But what is `$` buc?  `$` buc is the _default arm_ for many core structures, including `|=` bartis gate cores and `|-` barhep trap cores.

### What is a Gate?

A core is a cell:  `[battery payload]`.

A gate is a core with two distinctive properties:

1.  The **battery** of a gate contains an arm which has the special name `$` buc.  The `$` buc arm contains the instructions for the function in question.
2.  The **payload** of a gate consists of a cell of `[sample context]`.
    1.  The **sample** is the part of the payload that stores the "argument" (i.e., input value) of the function call.
    2.  The **context** contains all other data that is needed for computing the `$` buc arm of the gate correctly.

As a tree, a gate looks like the following:

```
[$ [sample context]]

       gate
      /    \
     $      .
           / \
     sample   context
```

Like all arms, `$` buc is computed with its parent core as the subject.  When `$` buc is computed, the resulting value is called the “product” of the gate.  No other data is used to calculate the product other than the data in the gate itself.

We will always call the values supplied to the gate the “sample” since we will later discover that this technical meaning (`[battery [sample context]]`) holds throughout more advanced cores.

#### Exercise:  Another Way to Calculate a Factorial

Let's revisit our factorial code from above:

```hoon
|=  n=@ud
|-
?:  =(n 1)
  1
%+  mul
n
%=  $
  n  (dec n)
==
```

We can write this code in several ways using the `%=` cenhep plus `$` buc structure.

For instance, we can eliminate the trap by recursing straight back to the gate:

```hoon
|=  n=@ud
?:  =(n 1)
  1
%+  mul
n
%=  $
  n  (dec n)
==
```

Even more compactly, `(add counter 1)` can be replaced by the Nock increment rune, [`.+` dotlus](/reference/hoon/rune/dot#dotlus), for the equivalent version:

```hoon
|=  n=@ud
?:  =(n 1)
  1
(mul n $(n (dec n)))
```

(Remember that sugar syntax like `$()` does not affect code efficiency, merely visual layout.)

#### The `$` Buc Arm

The (only) arm of a gate encodes the instructions for the Hoon function in question.

```hoon
> =inc |=(a=@ (add 1 a))

> (inc 5)
6
```

The pretty printer represents the `$` buc arm of `inc` as `1.yop`.  To see the actual noun of the `$` buc arm, enter `+2:inc` into the Dojo:

```hoon
> +2:inc
[8 [9 36 0 8.191] 9 2 10 [6 [7 [0 3] 1 1] 0 14] 0 2]
```

This is un-computed Nock. You don't need to understand any of this, except that code and data are homoiconic—they are in a sense the same for Urbit programs.

It's worth pointing out that the arm named `$` buc can be used like any other name.  We can compute `$` buc directly with `$:inc` in the Dojo:

```hoon
> $:inc
1
```

This result may seem a bit strange.  We didn't call `inc` or in any other way pass it a number.  Yet using `$` buc to evaluate `inc`'s arm seems to work—sort of, anyway.  Why is it giving us `1` as the return value?  We can answer this question after we understand gate samples a little better.

#### The Sample

The sample of a gate is the address reserved for storing the argument(s) to the Hoon function.  Although we don't know about addressing yet, you saw above that `+2` referred to the battery.  The sample is always at the head of the gate's tail, `+6`.  (We'll look at addressing in more depth in [the next module](./G-trees.md).)

Let's look at the gate for inc again, paying particular attention to its sample:

```hoon
> inc
< 1.mgz
  [ a=@
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
>
```

We see `a=@`.  This may not be totally clear, but at least the `@` should make a little sense.  This is the pretty-printer's way of indicating an atom with the face `a`.  Let's take a closer look:

```hoon
> +6:inc
a=0
```

We see now that the sample of `inc` is the value `0`, and has `a` as a face.  This is a placeholder value for the function argument.  If you evaluate the `$` buc arm of `inc` without passing it an argument the placeholder value is used for the computation, and the return value will thus be `0+1`:

```hoon
> $:inc
1
```

The placeholder value, as you saw in the previous module, is sometimes called the bunt value.  The bunt value is determined by the input type; for `@` atoms the bunt value is typically `0`.

The face value of `a` comes from the way we defined the gate above:  `|=(a=@ (add 1 a))`.  This was so we can use `a` to refer to the sample to generate the product with `(add 1 a)`.

#### The Context

The context of a gate contains other data that may be necessary for the `$` buc arm to evaluate correctly.  The context is always located at the tail of the tail of the gate, i.e., `+7` of the gate.  There is no requirement for the context to have any particular arrangement, though often it does.

Let's look at the context of inc:

```hoon
> +7:inc
[ [ our=~nec
    now=~2022.6.21..19.26.59..9016
      eny
    0v304.vhjvs.406g0.bn6ph.ggd02.buadd.2lot0.va6q0.fiqb1.a96gj.9jmb2.6kk07.5d75s.thpbg.9idrt.vmg9j.e748l.fea0l.7ckcf.ieesj.7q6lr
  ]
  <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
]
```

This is the default Dojo subject from before we put `inc` into the subject. The `|=` bartis expression defines the context as whatever the subject is.  This guarantees that the context has all the information it needs to have for the `$` buc arm to work correctly.

#### Gates Define Functions of the Sample

The value of a function's output depends solely upon the input value.  This is one of the features that make functions desirable in many programming contexts.  It's worth going over how Hoon function calls implement this feature.

In Hoon, one can use `(gate arg)` syntax to make a function call. For example:

```hoon
> (inc 234)
235
```

The name of the gate is `inc`.  How is the `$` buc arm of inc evaluated?  When a function call occurs, a copy of the `inc` gate is created, but with one modification:  the sample is replaced with the function argument.  Then the `$` buc arm is computed against this modified version of the `inc` gate.

Remember that the default or “bunt” value of the sample of inc is `0`.  In the function call above, a copy of the `inc` gate is made but with a sample value of `234`.  When `$` buc is computed against this modified core, the product is `235`.

Notice that neither the arm nor the context is modified before the arm is evaluated.  That means that the only part of the gate that changes before the arm evaluation is the sample.  Hence, we may understand each gate as defining a function whose argument is the sample.  If you call a gate with the same sample, you'll get the same value returned to you every time.

Let's unbind inc to keep the subject tidy:

```hoon
> =inc

> inc
-find.inc
```

#### Modifying the Context of a Gate

It is possible to modify the context of a gate when you make a function call; or, to be more precise, it's possible to call a _mutant copy_ of the gate in which the context is modified.  To illustrate this let's use another example gate.  Let's write a gate which uses a value from the context to generate the product.  Bind `b` to the value 10:

```hoon
> =b 10

> b
10
```

Now let's write a gate called `ten` that adds `b` to the input value:

```hoon
> =ten |=(a=@ (add a b))

> (ten 10)
20

> (ten 20)
30

> (ten 25)
35
```

We can unbind `b` from the Dojo subject, and `ten` works just as well because it's using a copy of `b` stored its context:

```hoon
> =b

> (ten 15)
25

> (ten 35)
45

> b.+14.ten
10
```

We can use `ten(b 25)` to produce a variant of `ten`.  Calling this mutant version of ten causes a different value to be returned than we'd get with a normal `ten` call:

```hoon
> (ten(b 25) 10)
35

> (ten(b 1) 25)
26

> (ten(b 75) 100)
175
```

Before finishing the lesson let's unbind ten:

```hoon
> =ten
```

### Recursion

_Recursion_ refers to a return to the same logical point in a program again and again.  It's a common pattern for solving certain problems in most programming languages, and Hoon is no exception.

In the following code, the `|-` barhep trap serves as the point of recursion, and the return to that point (with changes) is indicated by the `%=` cenhep.  All this code does is count to the given number, then return that number.

```hoon
|=  n=@ud
=/  index  0
|-
?:  =(index n)
  index
%=($ index +(index))
```

In a formal sense, we have to make sure that there is always a base case, a way of actually ending the recursion—if there isn't, we end up with an [infinite loop](https://en.wikipedia.org/wiki/Infinite_loop)!  Some children's songs like [“Yon Yonson”](https://en.wikipedia.org/wiki/Yon_Yonson) or [“The Song That Never Ends”](https://en.wikipedia.org/wiki/The_Song_That_Never_Ends) rely on such recursive humor.

> This is the song that never ends
> Yes, it goes on and on, my friends
> Some people started singing it not knowing what it was
> And they′ll continue singing it forever just because—
>
> This is the song that never ends
> . . .

You need to make sure when you compose a trap that it has a base case which returns a noun.  The following trap results in an infinite loop:

```hoon
=/  index  1
|-
?:  (lth index 1)  ~
$(index +(index))
```

If you find yourself caught in such a loop, press `Ctrl`+`C` to stop execution.

Recursion can be set up different ways.  A full treatment requires thinking about [algorithmic complexity and efficiency](https://en.wikipedia.org/wiki/Big_O_notation), but we can highlight some good rules of thumb here.

#### Tutorial:  The Fibonacci Sequence

For instance, let's talk about calculating the [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence), which is a sequence of numbers wherein each is formed by adding the two previous numbers together.  Thus 1, 1, 1+1→2, 1+2→3, 2+3→5, and so forth.  We may write the _n_th Fibonacci number in a generic way as:

<img src="https://latex.codecogs.com/gif.image?\large&space;\dpi{110}F_n&space;=&space;F_{n-1}&space;&plus;&space;F_{n-2}" title="https://latex.codecogs.com/gif.image?\large \dpi{110}F_n = F_{n-1} + F_{n-2}" />

<!--
F_n = F_{n-1} + F_{n-2}
-->

and verify that our program correctly produces the sequence of numbers 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ….

- Compose a Fibonacci sequence program which produces a `list` of the appropriate values.

    We can elide some details of working with `list`s until the next lesson; simply recall that they are a way of storing multiple values in a cell of cells of cells….

    The most naïve version of this calculation simply calculates all previous numbers in the sequence every time they are needed.

    ```hoon
    |=  n=@ud
    ^-  @ud
    ?:  =(n 1)  1
    ?:  =(n 2)  1
    (add $(n (dec n)) $(n (dec (dec n))))
    ```

    We can use _two_ recursion points for `%=` cenhep.  The first calculate _F_ for _n_-1; the second calculate _F_ for _n_-2.  These are then added together.  If we diagram what's happening, we can see that each additional number costs as much as the previous numbers:

    ```
    (fibonacci 5)
    (add (fibonacci 4) (fibonacci 3))
    (add (add (fibonacci 3) (fibonacci 2)) (add (fibonacci 2) (fibonacci 1)))
    (add (add (add (fibonacci 2) (fibonacci 1)) (fibonacci 2)) (add (fibonacci 2) (fibonacci 1)))
    (add (add (add 1 1) 1) (add 1 1))
    5
    ```

    ```
    (fibonacci 6)
    (add (fibonacci 5) (fibonacci 4))
    ...
    (add (add (add (add (fibonacci 2) (fibonacci 1)) (fibonacci 2)) (add (fibonacci 2) (fibonacci 1))) (add (add (fibonacci 2) (fibonacci 1)) (fibonacci 2)))
    (add (add (add (add 1 1) 1) (add 1 1)) (add (add 1 1) 1))
    8
    ```

    This fully recursive version of the Fibonacci calculation is very wasteful because it keeps no intermediate results.

    An improved version stores each value in the sequence as an element in a list so that it can be used rather than re-calculated.  We use the [`++snoc`](/reference/hoon/stdlib/2b#snoc) gate to append a noun to a `list`.

    ```hoon
    |=  n=@ud
    =/  index  0
    =/  p  0
    =/  q  1
    =/  r  *(list @ud)
    |-  ^-  (list @ud)
    ?:  =(index n)  r
    ~&  >  [index p q r]
    %=  $
      index  +(index)
      p      q
      q      (add p q)
      r      (snoc r q)
    ==
    ```

    This version is a little more complicated to compare using a diagram because of the trap, but yields something like this:

    ```
    (fibonacci 5)
    ~[1]
    ~[1 1]
    ~[1 1 2]
    ~[1 1 2 3]
    ~[1 1 2 3 5]
    ```

    The program can be improved somewhat again by appending to the head of the cell (rather than using `++snoc`).  This builds a list in a backwards order, so we apply the [`++flop`](/reference/hoon/stdlib/2b#flop) gate to flip the order of the list before we return it.

    ```hoon
    |=  n=@ud
    %-  flop
    =/  index  0
    =/  p  0
    =/  q  1
    =/  r  *(list @ud)
    |-  ^-  (list @ud)
    ?:  =(i n)  r
    %=  $
      i  +(i)
      p  q
      q  (add p q)
      r  [q r]
    ==
    ```

    Why are we building the list backwards instead of just producing the list in the order we want it in the first place?  Because with lists, adding an element to the end is a computationally expensive operation that gets more expensive the longer the list is, due to the fact that you need to traverse to the end of the tree.  Adding an element to the front, however, is cheap.  In Big-O notation, adding to the end of a list is _O_(_n_) while adding to the front is _O_(1).

    Here's our diagram:

    ```
    (fibonacci 5)
    ~[1]
    ~[1 1]
    ~[2 1 1]
    ~[3 2 1 1]
    ~[5 3 2 1 1]
    ~[1 1 2 3 5]
    ```

    Finally (and then we'll move along) here's a very efficient implementation, which starts with a `0` but builds the list entirely from cells, then appends the `~` `0` at the end:

    ```hoon
    |=  n=@ud
    ^-  (list @ud)
    =/  f0  *@ud
    =/  f1=@ud  1
    :-  0
    |-  ^-  (list @ud)
    ?:  =(n 0)
      ~
    [f1 $(f0 f1, f1 (add f0 f1), n (dec n))]
    ```

    - Produce a diagram of how this last implementation yields a Fibonacci sequence for _F_₅, `(fibonacci 5)`.

#### Tutorial:  Tail-Call Optimization of the Factorial Gate

The last factorial gate we produced looked like this:

```hoon
|=  n=@ud
?:  =(n 1)
  1
(mul n $(n (dec n)))
```

This example isn't a very efficient use of computing resources.  The pyramid-shaped illustration from up above approximates what's happening on the _call stack_, a memory structure that tracks the instructions of the program.  In our example code, every time a parent gate calls another gate, the gate being called is "pushed" to the top of the stack in the form of a frame.  This process continues until a value is produced instead of a function, completing the stack.

```
                  Push order      Pop order
(fifth frame)         ^               |
(fourth frame)        |               |
(third frame)         |               |
(second frame)        |               |
(first frame)         |               V
```

Once this stack of frames is completed, frames "pop" off the stack starting at the top.  When a frame is popped, it executes the contained gate and passes produced data to the frame below it.  This process continues until the stack is empty, giving us the gate's output.

When a program's final expression uses the stack in this way, it's considered to be **not tail-recursive**.  This usually happens when the last line of executable code calls more than one gate, our example code's `(mul n $(n (dec n)))` being such a case.  That's because such an expression needs to hold each iteration of `$(n (dec n)` in memory so that it can know what to run against the `mul` function every time.

To reiterate:  if you have to manipulate the result of a recursion as the last expression of your gate, as we did in our example, the function is not tail-recursive, and therefore not very efficient with memory.  A problem arises when we try to recurse more times than we have space on the stack.  This will result in our computation failing and producing a stack overflow.  If we tried to find the factorial of `5.000.000`, for example, we would almost certainly run out of stack space.

But the Hoon compiler, like most compilers, is smart enough to notice when the last statement of a parent can reuse the same frame instead of needing to add new ones onto the stack.  If we write our code properly, we can use a single frame that simply has its values replaced with each recursion.

- Change the order of the aspects of the call in such a way that the compiler can produce a more [tail-recursive](https://en.wikipedia.org/wiki/Tail_call) program.

    With a bit of refactoring, we can write a version of our factorial gate that is tail-recursive and can take advantage of this feature:

    ```hoon
    |=  n=@ud
    =/  t=@ud  1
    |-
    ^-  @ud
    ?:  =(n 1)  t
    $(n (dec n), t (mul t n))
    ```

    The above code should look familiar.  We are still building a gate that takes one argument a `@ud` unsigned decimal integer `n`.  The `|-` here is used to create a new gate with one [arm](/reference/glossary/arm) `$` and immediately call it.  As before, think of `|-` as the recursion point.

    We then evaluate `n` to see if it is 1. If it is, we return the value of `t`. In case that `n` is anything other than 1, we perform our recursion:

    ```hoon
    $(n (dec n), t (mul t n))
    ```

    All we are doing here is recursing our new gate and modifying the values of `n` and `t`. `t` is used as an accumulator variable that we use to keep a running total for the factorial computation.

    Let's use more of our pseudo-Hoon to illustrate how the stack is working in this example for the factorial of 5.

    ```
    (factorial 5)
    (|- 5 1)
    (|- 4 5)
    (|- 3 20)
    (|- 2 60)
    (|- 1 120)
    120
    ```

    We simply multiply `t` and `n` to produce the new value of `t`, and then decrement `n` before repeating. Since this `$` call is the final and solitary thing that is run in the default case and since we are doing all computation before the call, this version is properly tail-recursive. We don't need to do anything to the result of the recursion except recurse it again. That means that each iteration can be replaced instead of held in memory.

#### Tutorial:  The Ackermann Function

The [Ackermann function](https://en.wikipedia.org/wiki/Ackermann_function) is one of the earliest examples of a function that is both totally computable—meaning that it can be solved—and not primitively recursive—meaning it can not be rewritten in an iterative fashion.

<img src="https://latex.codecogs.com/svg.image?\large&space;\begin{array}{lcl}\operatorname{A}(0,&space;n)&space;&&space;=&space;&&space;n&space;&plus;&space;1&space;\\\operatorname{A}(m&plus;1,&space;0)&space;&&space;=&space;&&space;\operatorname{A}(m,&space;1)&space;\\\operatorname{A}(m&plus;1,&space;n&plus;1)&space;&&space;=&space;&&space;\operatorname{A}(m,&space;\operatorname{A}(m&plus;1,&space;n))\end{array}" title="https://latex.codecogs.com/svg.image?\large \begin{array}{lcl}\operatorname{A}(0, n) & = & n + 1 \\\operatorname{A}(m+1, 0) & = & \operatorname{A}(m, 1) \\\operatorname{A}(m+1, n+1) & = & \operatorname{A}(m, \operatorname{A}(m+1, n))\end{array}" />

<!--
\begin{array}{lcl}
\operatorname{A}(0, n) & = & n + 1 \\
\operatorname{A}(m+1, 0) & = & \operatorname{A}(m, 1) \\
\operatorname{A}(m+1, n+1) & = & \operatorname{A}(m, \operatorname{A}(m+1, n))
\end{array}
-->

- Compose a gate that computes the Ackermann function.

    ```hoon
    |=  [m=@ n=@]
    ^-  @
    ?:  =(m 0)  +(n)
    ?:  =(n 0)  $(m (dec m), n 1)
    $(m (dec m), n $(n (dec n)))
    ```

    This gate accepts two arguments of `@` atom type and yields an atom.

    There are three cases to consider:

    1.  If `m` is zero, return the increment of `n`.
    2.  If `n` is zero, decrement `m`, set `n` to 1 and recurse.
    3.  Else, decrement `m` and set `n` to be the value of the Ackermann function with `n` and the decrement of `n` as arguments.

The Ackermann function is not terribly useful in and of itself, but it has an interesting history in mathematics.  When running this function the value grows rapidly even for very small input.  The value of computing this where `m` is `4` and `n` is `2` is an integer with 19,729 digits.

- Calculate some of the _m_/_n_ pairs given in [the table](https://en.wikipedia.org/wiki/Ackermann_function#Table_of_values).

#### Exercise:  The Sudan Function

The [Sudan function](https://en.wikipedia.org/wiki/Sudan_function) is related to the Ackermann function.

<img src="https://latex.codecogs.com/svg.image?\large&space;\begin{array}{lll}F_0&space;(x,&space;y)&space;&&space;=&space;x&plus;y&space;\\F_{n&plus;1}&space;(x,&space;0)&space;&&space;=&space;x&space;&&space;\text{if&space;}&space;n&space;\ge&space;0&space;\\F_{n&plus;1}&space;(x,&space;y&plus;1)&space;&&space;=&space;F_n&space;(F_{n&plus;1}&space;(x,&space;y),&space;F_{n&plus;1}&space;(x,&space;y)&space;&plus;&space;y&space;&plus;&space;1)&space;&&space;\text{if&space;}&space;n\ge&space;0&space;\\\end{array}" title="https://latex.codecogs.com/svg.image?\large \begin{array}{lll}F_0 (x, y) & = x+y \\F_{n+1} (x, 0) & = x & \text{if } n \ge 0 \\F_{n+1} (x, y+1) & = F_n (F_{n+1} (x, y), F_{n+1} (x, y) + y + 1) & \text{if } n\ge 0 \\\end{array}" />

<!--
\begin{array}{lll}
F_0 (x, y) & = x+y \\
F_{n+1} (x, 0) & = x & \text{if } n \ge 0 \\
F_{n+1} (x, y+1) & = F_n (F_{n+1} (x, y), F_{n+1} (x, y) + y + 1) & \text{if } n\ge 0 \\
\end{array}
-->

- Implement the Sudan function as a gate.
