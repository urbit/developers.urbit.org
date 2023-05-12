+++
title = "Generators"
weight = 73
+++

Generator files provide a way for users to interact with code "scripts" through the Dojo prompt.  There are
three basic kinds of generators:

1. Bare or naked generators, standalone computations that can accept input and carry out a single calculation.
2. `%say` generators, scripts which can utilize the full system knowledge (`now`, `our`, `eny`) and accept
    optional input arguments.
3. `%ask` generators, scripts driven by interactive prompts.

(Threads have some commonalities with generators, _q.v._)

Generators are a Dojo concept, although they can also be applied to agents (such as `+dbug`).  This guide will
show you how to build and invoke all kinds of generators.


##  Bare Generators

A basic generator is a gate, a core with a `$` buc arm and a sample.

The Dojo will supply the sample directly to the core in the `$` buc arm.

A bare generator must be a gate but can have more complicated internal structure, as with all Hoon code.  It does
not know about entropy `eny`, ship identity `our`, or the timestamp `now`.

**`/gen/add-one.hoon`**

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

Invoke as `+add-one 5`.

You could in principle use a `|*` bartar wet gate as well, but other cores don't pattern-match to what Dojo expects.


##  `%say` Generators

A `%say` generator can have zero, many, or optional arguments, unlike a bare generator.  It can also have access to
system variables like `now`, `our`, and `eny`.

For instance, the following generator can be run with no arguments:

**`/gen/say.hoon`**

```hoon {% copy=true %}
:-  %say
|=  *
:-  %noun
(add 40 2)
```

```hoon
> +say
42
```

A `%say` generator is structurally a head-tagged cell of a gate which returns a head-tagged cell of a mark and a value
(or a `cask`).

The head tag over the entire generator is always `%say`.  The `cask` tag is most commonly `%noun`.

We use `%say` generators when we want to provide something else in Arvo, the Urbit operating system, with metadata about
the generator's output. This is useful when a generator is needed to pipe data to another program, a frequent occurrence.
  
To that end, `%say` generators use `mark`s to make it clear, to other Arvo computations, exactly what kind of data their
output is. A `mark` is akin to a MIME type on the Arvo level. A `mark` describes the data in some way, indicating that
it's an `%atom`, or that it's a standard such as `%json`, or even that it's an application-specific data structure like
`%talk-command`.

The gate sample follows this pattern, with undesired elements stubbed out by `*`:

```hoon
|=  $:                          ::  environment
        $:  now=@da             ::  timestamp
            eny=@uvJ            ::  entropy
            bec=beak            ::  clay beak
        ==
        ::                      ::  unnamed args
        $=  
            $:  arg=@           ::  required arguments
            ==
            ~
        ==
        ::                      ::  named args
        $=
            $:  named-arg=@     ::  optional arguments
            ==
            ~
        ==
    ==
```

The Dojo will modify the sample by inserting `%~` (constant null) at the end of each collection, since the Dojo adapts
the input arguments into a list (either the unnamed/required argument list or the named/optional argument list).

### Zero arguments

`/gen/vats.hoon` is commonly used to check on the status of installed desks.  It can be invoked with optional arguments:

```
> +vats
%base
  /sys/kelvin:           [%zuse 414]
  base hash ends in:     drceb
  %cz hash ends in:      drceb
  app status:            running
  pending updates:       ~::

> +vats, =verb %.n
%base
  /sys/kelvin:           [%zuse 414]
  base hash ends in:     drceb
  %cz hash ends in:      drceb
  app status:            running
  pending updates:       ~

> +vats, =filt %suspended
```

### Optional arguments

Let's look at an example that uses all three parts.

**`/gen/dice.hoon`**

```hoon {% copy=true %}
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] [n=@ud ~] [bet=@ud ~]]
:-  %noun
[(~(rad og eny) n) bet]
```

This is a very simple dice program with an optional betting functionality. In the code, our sample specifies faces on all
of the Arvo data, meaning that we can easily access them. We also require the argument `[n=@ud ~]`, and allow the
_optional_ argument `[bet=@ud ~]`.

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

Notice how the `,` com works to separate arguments and how the name of the optional argument must be included.

We get a different value from the same generator between runs, something that isn't possible with a bare generator. Another
novelty is the ability to choose to not use the second argument.

- [Hoon School, “1.9 Generators”](/guides/core/hoon-school/generators)


##  `%ask` Generators

We use an `%ask` generator when we want to create an interactive program that prompts for inputs as it runs, rather than
expecting arguments to be passed in at the time of initiation.

Like `%say` generators, `%ask` generators are head-tagged cells of gates, but with `%ask`.

The code below is an `%ask` generator that checks if the user inputs `"blue"` when prompted [per a classic Monty Python
scene](https://www.youtube.com/watch?v=L0vlQHxJTp0).

**`/gen/axe.hoon`**

```hoon {% copy=true mode="collapse" %}
/-  sole
/+  generators
=,  [sole generators]
:-  %ask
|=  *
^-  (sole-result (cask tang))
%+  print    leaf+"What is your favorite color?"
%+  prompt   [%& %prompt "color: "]
|=  t=tape
%+  produce  %tang
?:  =(t "blue")
  :~  leaf+"Oh. Thank you very much."
      leaf+"Right. Off you go then."
  ==
:~  leaf+"Aaaaagh!"
    leaf+"Into the Gorge of Eternal Peril with you!"
==                                                                                                                                                                              
```

Run the generator from the Dojo:

```hoon
> +axe

What is your favorite color?
: color:
```

Instead of simply returning something, your Dojo's prompt changed from `~sampel-palnet:dojo>` to `~sampel-palnet:dojo: color:`,
and now expects additional input.  Let's give it an answer:

```hoon
: color: red
Into the Gorge of Eternal Peril with you!
Aaaaagh!
```

`%ask` generators return `sole-effect`s.  For more information on these, consult the [guide on command-line agents](/guides/additional/cli).

`%ask` generators can also accept arguments, although this is uncommon.


##  Generators for Agents

Generators can furthermore interact specifically with agents.

The [`+dbug` agent](/guides/additional/app-workbook/dbug) is invoked against an agent to display internal state.

Any app can implement generators to wrap raw pokes (see [`%ahoy`](/guides/additional/app-workbook/ahoy) for instance).

For instance, `:dojo|wipe` is equivalent to `:dojo +dojo/wipe`.  This pokes the `%dojo` agent with the output from running the generator located at `/gen/dojo/wipe.hoon`.

The Hood/Helm tooling like `|install` are generators automatically routed by Dojo to the correct agent.  `|commit`, for instance, is equivalent to `:hood +hood/commit`.  `%hood` generators are special-cased because it is the system app.
