+++
title = "14. Subject-Oriented Programming"
weight = 24
nodes = [165, 180]
objectives = ["Review subject-oriented programming as a design paradigm.", "Discuss stateful v. stateless applications and path dependence.", "Enumerate Hoon's tools for dealing with state:  `=.` tisdot, `=^` tisket, `;<` micgal, `;~` micsig.", "Defer a computation."]
+++

_This module discusses how Urbit's subject-oriented programming paradigm structures how cores and values are used and maintain state, as well as how deferred computations and remote value lookups (“scrying”) are handled.  This module does not cover core genericity and variance, which will be explained in [a later module](/guides/core/hoon-school/R-metals)._


##  The Subject

As we've said before:

> The Urbit operating system hews to a conceptual model wherein each expression takes place in a certain context (the _subject_).  While sharing a lot of practicality with other programming paradigms and platforms, Urbit's model is mathematically well-defined and unambiguously specified.  Every expression of Hoon is evaluated relative to its subject, a piece of data that represents the environment, or the context, of an expression.

Subject-oriented programming means that every expression is evaluated with respect to some _subject_.  Every arm of a core is evaluated with its parent core as the subject.

You have also seen how wings work as search paths to identify nouns in the subject, and you have learned three ways to access values by address:  numeric addressing, lark notation, and wing search expressions.

Generally speaking, the following rune families allow you to do certain things to the subject:

- `|` bar runes create cores, i.e. largely self-contained expressions
- `^` ket runes transform cores, i.e. change core properties
- `%` cen runes pull arms in cores
- `=` tis runes modify the subject by introducing or replacing values

Different kinds of cores can expose or conceal functionality (such as their sample) based on their variance model.  We don't need to be concerned about that yet, but if you are building certain kinds of library code or intend to build code expressions directly, you'll need to read [that module](/guides/core/hoon-school/R-metals) as well.

### Accessing the Subject

Usually the subject of a Hoon expression isn't shown explicitly.  In fact, only when using `:`/`.` wing lookup expressions have we made the subject explicit.

An arm is always evaluated with its parent core as its subject.  We've briefly mentioned that one can use helper cores (e.g. for generators) by composing the cores side-by-side using [`=<` tisgal](/reference/hoon/rune/tis#-tisgal) and [`=>` tisgar](/reference/hoon/rune/tis#-tisgar).  This way we can make sure that the arms fall within each other's subject horizon.

Why must an arm have its parent core as the subject, when it's computed?  As stated previously, the payload of a core contains all the data needed for computing the arms of that core.  Arms can only access data in the subject.  By requiring that the parent core be the subject we guarantee that each arm has the appropriate data available to it.  The tail of its subject contains the `payload` and thus all the values therein.  The head of the subject is the `battery`, which allows for making reference to sibling arms of that same core.

In the Dojo, if you use `+1` by itself, you can see the current subject.

```hoon
> +1
[ [ our=~zod
    now=~2022.6.22..18.35.42..da35
      eny
    0vb6.cve93.67frc.2gtoj.jfl3i.odojg.urrce.o53d3.44h4o.sf3o5.va2mh.ra1ec.jrkej.u512k.l4lin.f003v.li030.l2e6t.ah7ge.6t5cg.epuil
  ]
  <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
]
```

`.` does the same thing:  it always refers to the current subject.

If `.` is the subject, then `..arm` is the subject of a given `arm` (the second `.` dot being the wing resolution operator).  You can check the details of the parent core using something like `..add`.  This trick is used when producing agents that have highly nested operations (search `..` in the `/app` directory), or when composing [jets](/reference/runtime/jetting#edit-the-hoon-source-code), for instance.

Another use case for the `..arm` syntax is when there is a core in the subject without a face bound to it; i.e., the core might be nameless.  In that case you can use an arm name in that core to refer to the whole core.

```hoon
> ..add
<46.hgz 1.pnw %140>
```

#### Tutorial:  The Core Structure of `hoon.hoon`

Let's take a deeper look at how cores can be combined with `=>` tisgar to build up larger structures.  `=>  p=hoon  q=hoon` yields the product of `q` with the product of `p` taken as the subject; i.e. it composes Hoon statements, like cores.

We use this to set the context of cores.  Recall that the payload of a gate is a cell of `[sample context]`.  For example:

```
> =foo =>([1 2] |=(@ 15))

> +3:foo
[0 1 2]
```

Here we have created a gate with `[1 2]` as its context that takes in an `@` and returns `15`.  `+3:foo` shows the payload of the core to be `[0 [1 2]]`.  Here `0` is the default value of `@` and is the sample, while `[1 2]` is the context that was given to `foo`.

`=>` tisgar (and its reversed version `=<` tisgal) are used extensively to put cores into the context of other cores.

```hoon {% copy=true %}
=>
|%
++  foo
  |=  a=@
  (mul a 2)
--
|%
++  bar
  |=  a=@
  (mul (foo a) 2)
--
```

At the level of arms, `++foo` is in the subject of `++bar`, and so `++bar` is able to call `++foo`. On the other hand, `+bar` is not in the subject of `++foo`, so `++foo` cannot call `++bar` - you will get a `-find.bar` error.

At the level of cores, the `=>` sets the context of the core containing `++bar` to be the core containing `++foo`.  Recall that arms are evaluated with the parent core as the subject.  Thus `++bar` is evaluated with the core containing it as the subject, which has the core containing `++foo` in its context.  This is why `++foo` is in the scope of `++bar` but not vice versa.

Let's look inside `/sys/hoon.hoon`, where the standard library is located, to see how this can be used.

The first core listed here has just one arm.

```hoon
=>  %140  =>
|%
++  hoon-version  +
--
```

This is reflected in the subject of `hoon-version`.

```hoon
> ..hoon-version
<1.pnw %140>
```

After several lines that we'll ignore for pedagogical purposes, we see

```hoon
|%
::  #  %math
::    unsigned arithmetic
+|  %math
++  add
  ~/  %add
  ::  unsigned addition
  ::
  ::  a: augend
  ::  b: addend
  |=  [a=@ b=@]
  ::  sum
  ^-  @
  ?:  =(0 a)  b
  $(a (dec a), b +(b))
::
++  dec
```

and so on, down to

```hoon
++  unit
  |$  [item]
  ::    maybe
  ::
  ::  mold generator: either `~` or `[~ u=a]` where `a` is the
  ::  type that was passed in.
  ::
  $@(~ [~ u=item])
--
```

This core contains the arms in [sections 1a–1c of the standard library documentation](/reference/hoon/stdlib/1a).  If you count them, there are 46 arms in the core from `++  add` down to `++  unit`.  We again can see this fact reflected in the dojo by looking at the subject of `add`.

```hoon
> ..add
<46.hgz 1.pnw %140>
```

Here we see that core containing `hoon-version` is in the subject of the section 1 core.

Next, [section 2](/reference/hoon/stdlib/2a) starts:

```hoon
=>
::                                                      ::
::::  2: layer two                                      ::
```
...
```
|%
::                                                      ::
::::  2a: unit logic                                    ::
  ::                                                    ::
  ::    biff, bind, bond, both, clap, drop,             ::
  ::    fall, flit, lift, mate, need, some              ::
  ::
++  biff                                                ::  apply
  |*  {a/(unit) b/$-(* (unit))}
  ?~  a  ~
  (b u.a)
```

If you counted the arms in this core by hand, you'll come up with 123 arms. This is also reflected in the dojo:

```hoon
> ..biff
<123.zao 46.hgz 1.pnw %140>
```

and we also see the section 1 core and the core containing `hoon-version` in the subject.

We can also confirm that `++add` is in the subject of `++biff`

```hoon
> add:biff
<1.otf [[a=@ b=@] <46.hgz 1.pnw %140>]>
```

and that `++biff` is not in the subject of `++add`.

```hoon
> biff:add
-find.biff
```

Lastly, let's check the subject of the last arm in `hoon.hoon` (as of June 2022):

```hoon
> ..pi-tell
<77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
```

This confirms for us, then, that `hoon.hoon` consists of six nested cores, with one inside the payload of the next, with the `hoon-version` core most deeply nested.

##  Exercise:  Explore `hoon.hoon`

- Pick a couple of arms in `hoon.hoon` and check to make sure that they are only referenced in its parent core or core(s) that have the parent core put in its context via the `=>` or `=<` runes.


### Axes of the Subject

The core Arvo subject exposes several axes (plural of `+$axis` which is the tree address) in the subject.  You've encountered these before:

- `our` is the ship's identity.

    ```hoon
    > -<..
    our=~nec
    ```

- `now` is 128-bit timestamp sourced from the wall clock time, Linux's `gettimeofday()`.

    ```hoon
    > ->-..
    now=~2022.6.22..20.41.18..82f4
    ```

- `eny` is 512 bits of entropy as `@uvJ`, sourced from a [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically-secure_pseudorandom_number_generator) and hash-iterated using [`++shax`](/reference/hoon/stdlib/3d#shax).  (`eny` is shared between vanes during an event, so there are currently limits on how much it should be relied on until the Urbit kernel is security-hardened, but it is unique within each Gall agent activation.)

    ```hoon
    > ->+..
    eny
    0vmr.qobqc.fd9f0.h5hf4.dkurh.b4s37.lt4qf.2k505.j3sir.cnshk.ldpm0.jeppc.ti7gs.vtpru.u09sm.0imu0.cgdln.fvoqc.mt41e.3iga5.qpct7
    ```


##  State and Applications

Default Hoon expressions are stateless.  This means that they don't really make reference to any other transactions or events in the system.  They don't preserve the results of previous calculations beyond their own transient existence.

However, clearly regular applications, such as Gall agents, are stateful, meaning that they modify their own subject regularly.

There are several ways to manage state.  One approach, including `%=` centis, directly modifies the subject using a rune.  Another method is to use the other runes to compose or sequence changes together (e.g. as a pipe of gates).  By and large the `=` tis runes are responsible for modifying the subject, and the `;` mic runes permit chaining deferred computations together.

To act in a stateful manner, a core must mutate itself and then pin the mutated copy in its place.  Most of the time this is handled by Arvo's Gall vane, by the Dojo, or another system service, but we need to explicit modify and manage state for cores as we work within these kinds of applications.

We will use `%say` generators as a bridge concept.  We will produce some short applications that maintain state while carrying out a calculation; they still result in a single return value, but gesture at the big-picture approach to maintaining state in persistent agents.

Here are a couple of new runes for modifying the subject and chaining computations together, aside from `%=` cenhep which you've already seen:

- [`=.` tisdot](/reference/hoon/rune/tis#-tisdot) is used to change a leg in the subject.
- [`=~` tissig](/reference/hoon/rune/tis#-tissig) composes many expressions together serially.

#### Tutorial:  Bank Account

In this section, we will write a door that can act as a bank account with the ability to withdraw, deposit, and check the account's balance.  This door replaces the sample of the door with the new values as each transaction proceeds.

```hoon {% copy=true mode="collapse" %}
:-  %say
|=  *
:-  %noun
=<  =~  new-account
      (deposit 100)
      (deposit 100)
      (withdraw 50)
      balance
    ==
|%
++  new-account
  |_  balance=@ud
  ++  deposit
    |=  amount=@ud
    +>.$(balance (add balance amount))
  ++  withdraw
    |=  amount=@ud
    +>.$(balance (sub balance amount))
  --
--
```

We start with the three boilerplate lines we have in every `%say` generator:

```hoon {% copy=true %}
:-  %say
|=  *
:-  %noun
```

In the above code chunk, we're creating a cell.  The head of this cell is `%say`.  The tail is a gate (`|=  *`) that produces another cell (`:-  %noun`) with a head of the mark of a the kind of data we are going to produce, a `%noun`; the tail of the second cell is the rest of the program.

```hoon {% copy=true %}
=<  =~  new-account
      (deposit 100)
      (deposit 100)
      (withdraw 50)
      balance
    ==
```

In this code above, we're going to compose two runes using `=<`, which has inverted arguments. We use this rune to keep the heaviest twig to the bottom of the code.

The [`=~` tissig](/reference/hoon/rune/tis#-tissig) rune composes multiple expressions together; we use it here to make the code more readable.  We take `new-account` and use that as the subject for the call to `deposit`.  `deposit` and `withdraw` both produce a new version of the door that's used in subsequent calls, which is why we are able to chain them in this fashion.  The final reference is to `balance`, which is the account balance contained in the [core](/reference/glossary/core/) that we examine below.

```hoon {% copy=true %}
|%
++  new-account
  |_  balance=@ud
  ++  deposit
    |=  amount=@ud
    +>.$(balance (add balance amount))
  ++  withdraw
    |=  amount=@ud
    +>.$(balance (sub balance amount))
  --
--
```

We've chosen here to wrap our door in its own core to emulate the style of programming that is used when creating libraries.  `++new-account` is the name of our door.  A door is a core with one or more arms that has a sample.  Here, our door has a sample of one `@ud` with the face `balance` and two arms `++deposit` and `++withdraw`.

Each of these arms produces a gate which takes an `@ud` argument.  Each of these gates has a similar bit of code inside:

```hoon {% copy=true %}
+>.$(balance (add balance amount))
```

`+>` is a kind of wing syntax, lark notation.  This particular wing construction looks for the tail of the tail (the third element) in `$` buc, the subject of the gate we are in.  The `++withdraw` and `++deposit` arms create gates with the entire `new-account` door as the context in their cores' `[battery sample context]`, in the "tail of the tail" slot.  We change `balance` to be the result of adding `balance` and `amount` and produce the door as the result.  `++withdraw` functions the same way only doing subtraction instead of addition.

It's important to notice that the sample, `balance`, is stored as part of the door rather than existing outside of it.

##  Exercise:  Bank Account

- Modify the `%say` generator above to accept a `@ud` unsigned decimal dollar amount and a `?(%deposit %withdraw)` term and returns the result of only that operation on the starting balance of the bank account.  (Note that this will only work once on the door, and the state will not persist between generator calls.)

### Deferred Computations

_Deferred computation_ means that parts of the subject have changes that may be underdetermined at first.  These must be calculated later using the appropriate runes as new or asynchronous information becomes available.

For instance, a network service call may take a while or may fail.  How should the calculation deal with these outcomes?  In addition, the successful result of the network data is unpredictable in content (but should not be unpredictable in format!).

We have some more tools available for managing deferred or chained computations, in addition to `=~` tissig and `=*` tistar:

- [`=^` tisket](/reference/hoon/rune/tis#-tisket) is used to change a leg in the tail of the subject then evaluate against it.  This is commonly used for events that need to be ordered in their resolution e.g. with a `%=` cenhep.  (Used in Gall agents frequently.)
- [`=*` tistar](/reference/hoon/rune/tis#-tistar) defers an expression (rather like a macro).
- [`;<` micgal](/reference/hoon/rune/mic#-micgal) sequences two computations, particularly for an asynchronous event like a remote system call.  (Used in [threads](/reference/arvo/threads/overview).)
- [`;~` micsig](/reference/hoon/rune/mic#-micsig) produces a pipeline, a way of piping the output of one gate into another in a chain.  (This is particularly helpful when parsing text.)

### `++og` Randomness

A _random number generator_ provides a stream of calculable but unpredictable values from some _distribution_.  In [a later lesson](/guides/core/hoon-school/S-math), we explain how random numbers can be generated from entropy; for now, let's see what's necessary to use such a random-number generator.

An RNG emits a sequence of values given a starting _seed_.  For instance, a very simple RNG could emit digits of the number _π_ given a seed which is the number of digits to start from.

- seed 1:  1, 4, 1, 5, 9, 2, 6, 5, 3, 5
- seed 3:  1, 5, 9, 2, 6, 5, 3, 5, 8, 9
- seed 100:  8, 2, 1, 4, 8, 0, 8, 6, 5, 1

Every time you start this “random” number generator with a given seed, it will reproduce the same sequence of numbers.

While RNGs don't work like our _π_-based example, a given seed will reliably produce the same result every time it is run.

The basic RNG core in Hoon is [`++og`](/reference/hoon/stdlib/3d#og).  `++og` is a door whose sample is its seed.  We need to use `eny` to seed it non-deterministically, but we can also pin the state using `=^` tisket.  [`++rads:rng`](/reference/hoon/stdlib/3d#radsog) produces a cell of a random whole number in a given range and a new modified core to continue the random sequence.

```hoon
> =+  rng=~(. og eny)
  [-:(rads:rng 100) -:(rads:rng 100)]
[60 60]
```

Since the `rng` starts from the same seed value every single time, both of the numbers will always be the same.  What we have to do is pin the updated version of the RNG (the tail of `++rads:og`'s return cell) to the subject using `=^` tisket, e.g.,

```hoon
> =/  rng  ~(. og eny)
  =^  r1  rng  (rads:rng 100)
  =^  r2  rng  (rads:rng 100)
  [r1 r2]
[21 47]
```

#### Tutorial:  Magic 8-Ball

The Magic 8-Ball returns one of a variety of answers in response to a call.  In its entirety:

```hoon {% copy=true mode="collapse" %}
!:
:-  %say
|=  [[* eny=@uvJ *] *]
:-  %noun
^-  tape
=/  answers=(list tape)
  :~  "It is certain."
      "It is decidedly so."
      "Without a doubt."
      "Yes - definitely."
      "You may rely on it."
      "As I see it, yes."
      "Most likely."
      "Outlook good."
      "Yes."
      "Signs point to yes."
      "Reply hazy, try again"
      "Ask again later."
      "Better not tell you now."
      "Cannot predict now."
      "Concentrate and ask again."
      "Don't count on it."
      "My reply is no."
      "My sources say no."
      "Outlook not so good."
      "Very doubtful."
  ==
=/  rng  ~(. og eny)
=/  val  (rad:rng (lent answers))
(snag val answers)
```

Zoom in on these lines:

```hoon
=/  rng  ~(. og eny)
=/  val  (rad:rng (lent answers))
```

`~(. og eny)` starts a random number generator with a seed from the current entropy.  A [random number generator](https://en.wikipedia.org/wiki/Random_number_generation) is a stateful mathematical function that produces an unpredictable result (unless you know the algorithm AND the starting value, or seed).  Here we pull the subject of [`++og`](/reference/hoon/stdlib/3d#og), the randomness core in Hoon, to start the RNG.  An RNG like `++og` maintains its own state, but we will find that we have to preserve state changes to continue to produce novel random numbers.

We slam the `++rad:rng` gate which returns a random number from 0 to _n_-1 inclusive.  This gives us a random value from the list of possible answers.

```hoon
> +magic-8
"Ask again later."
```

##  Tutorial:  Dice Roll

Let's look at an example that uses all three parts. Save the code below in a file called `dice.hoon` in the `/gen` directory of your `%base` desk.

```hoon {% copy=true %}
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] [n=@ud ~] [bet=@ud ~]]
:-  %noun
[(~(rad og eny) n) bet]
```

This is a very simple dice program with an optional betting functionality. In the code, our sample specifies faces on all of the Arvo data, meaning that we can easily access them. We also require the argument `[n=@ud ~]`, and allow the _optional_ argument `[bet=@ud ~]`.

We can run this generator like so:

```hoon
> +dice 6, =bet 2
[4 2]

> +dice 6
[5 0]

> +dice 6
[2 0]

> +dice 6, =bet 200
[0 200]

> +dice
nest-fail
```

We get a different value from the same generator between runs, something that isn't possible with a naked generator. Another novelty is the ability to choose to not use the second argument.

##  Scrying (In Brief)

A _peek_ or a _scry_ is a request to Arvo to tell you something about the state of part of the Urbit OS.  Scries are used to determine the state of an agent or a vane.  The [`.^` dotket](/reference/hoon/rune/dot#-dotket) rune sends the scry request to a particular vane with a certain _care_ or type of scry.  The request is then routed to a particular path in that vane.  Scries are discused in detail in [App School](/guides/core/app-school/10-scry).  We will only briefly introduce them here as we can use them later to find out about Arvo's system state, such as file contents and agent state.

### `%c` Clay

The Clay filesystem stores nouns persistently at hierarchical path addresses.  These nouns can be accessed using marks, which are rules for structuring the data.  We call the nouns “files” and the path addresses “folders”.

If we want to retrieve the contents of a file or folder, we can directly ask Clay for the data using a scry with an appropriate care.

For instance, the `%x` care to the `%c` Clay vane returns the noun at a given address as a `@` atom.

```hoon
> .^(@ %cx /===/gen/hood/hi/hoon)
3.548.750.706.400.251.607.252.023.288.575.526.190.856.734.474.077.821.289.791.377.301.707.878.697.553.411.219.689.905.949.957.893.633.811.025.757.107.990.477.902.858.170.125.439.223.250.551.937.540.468.638.902.955.378.837.954.792.031.592.462.617.422.136.386.332.469.076.584.061.249.923.938.374.214.925.312.954.606.277.212.923.859.309.330.556.730.410.200.952.056.760.727.611.447.500.996.168.035.027.753.417.869.213.425.113.257.514.474.700.810.203.348.784.547.006.707.150.406.298.809.062.567.217.447.347.357.039.994.339.342.906
```

There are tools like `/lib/pretty-file/hoon` which will render this legible to you by using formatted text `tank`s:

```hoon
> =pretty-file -build-file %/lib/pretty-file/hoon

> (pretty-file .^(noun %cx /===/gen/hood/hi/hoon))
~[
  [%leaf p="::  Helm: send message to an urbit"]
  [%leaf p="::"]
  [%leaf p="::::  /hoon/hi/hood/gen"]
  [%leaf p="  ::"]
  [%leaf p="/?    310"]
  [%leaf p=":-  %say"]
  [%leaf p="|=([^ [who=ship mez=$@(~ [a=tape ~])] ~] helm-send-hi+[who ?~(mez ~ `a.mez)])"]
]
```

Similarly, you can request the contents at a particular directory path:

```hoon
> .^(arch %cy /===/gen/hood)
[ fil=~
    dir
  { [p=~.resume q=~]
    [p=~.install q=~]
    [p=~.pass q=~]
    [p=~.doze q=~]
    ...
    [p=~.mount q=~]
  }
]
```

There are many more options with Clay than just accessing file and folder data.  For instance, we can also scry all of the desks on our current ship with the `%d` care of `%c` Clay:

```hoon
> .^((set desk) %cd %)
{%bitcoin %base %landscape %webterm %garden %kids}
```

Other vanes have their own scry interfaces, which are well-documented in [the Arvo docs](/reference/arvo).
