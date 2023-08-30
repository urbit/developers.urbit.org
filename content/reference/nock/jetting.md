+++ title = "Fast Hints and Jets" +++

The computational feasibility of practical Nock computation depends upon the run-time "jetting" certain recognized nock computations. Naively, some subset of subject-formula pairs should not be stepped through according to the Nock reductions, but should instead be replaced by more efficient computations, which must return the *same result* as evaluation according to the Nock spec, even if the Sun would die before the Nock evaluation completed.

It is sometimes thought that jets are matched to formulas, however, this is not in general sufficient. Even as simple an arm as as `$:add` will invoke code from its context (`dec` and then `$:dec`).

Thus, we need to fix the subject to be jetted as well. However, we cannot simply specify the subject as a noun, because our inputs are also in the subject (in the sample, `+6`, in the usual case of gates and doors).

The runtime therefore seeks to label cores, that is, pairs of batteries and payloads, whose payloads may contain further cores. Cores are *registered* when they are produced, via a Nock hint (`%fast`). Registering a core means pairing its battery with a label, and linking this pair to the registerization of its "parent" core (the registered core included in its payload).

(Aside: not all cores have a single parent. In particular, the outermost subject of a hoon file with multiple Ford imports will be a consing together of the imports, leading to multiple parents. We will leave this case aside for this document.)

The registerization of cores is stateful. There are three stateful structures:
- Cold state is persistent and a pure function of the Nock execution history of the pier. It contains core registrations from hints.
- Hot state is ephemeral and entirely dependent on the runtime. It maps core labels and arm axes to jets in the runtime.
- Warm state is the join of the mappings of cold and hot state, and should be regenerated whenever either changes.

## Cold state
Cold state is the assignment of core hierarchies to labels. It is accumulated as a side effect, as computations hinted with `%fast` are evaluated. (This hint is emitted by Hoon's [`~%` sigcen](https://developers.urbit.org/reference/hoon/rune/sig#-sigcen) and [`~/` sigfas](https://developers.urbit.org/reference/hoon/rune/sig#-sigfas) runes).

A cold state has one or more *roots*. In the case of the Hoon standard library, the root is the kelvin version. In our running example, our root will be:

```= hoon
%puny
```
A core or constant is said to be a *parent* of another core if the parent core is in the payload of the child core. A core whose parent is a root is hinted with `~%`, with a `~` (sig) in place of the parent leg. In hoon this means that the parent core is in the subject of the core expression producing the child, since runes which emit cores capture their subject.

```= hoon
=>  %puny
~%  %bar  ~  ~  ::  no parent, core payload is fixed as %puny
|%
++  foo  .+(1.234)
--
```

Normally we will have a trivial core whose only function is to introduce the version as the root of the tree in cold state:

```
=>  puny+314  =>
~%  %puny.314  ~  ~  :: no parent, core payload is fixed as [%puny 314]
|%
++  puny-version  +  :: returns [%puny 314]
--
~%  %bar  +  ~       :: parent is %puny.314
|%
++  foo  .+(1.234)
--
```

Let's have a look at the Nock produced by this Hoon. The `!=` rune returns its child hoon compiled to Nock:

```
> !=
  =>  puny+314  =>
  ~%  %puny.314  ~  ~  :: no parent, core payload is fixed as [%puny 314]
  |%
  ++  puny-version  +  :: returns [%puny 314]
  --
  ~%  %bar  +  ~       :: parent is %puny.314
  |%
  ++  foo  .+(1.234)
  --
[ 7
  [1 2.037.282.160 314]
  7
  [8 [1 0 3] 11 [1.953.718.630 1 [2.037.282.160 314] [1 0] 0] 0 1]
  8
  [1 4 1 1.234]
  11
  [1.953.718.630 1 7.496.034 [0 3] 0]
  0
  1
]
> `@`%fast
1.953.718.630
> `@`%puny
2.037.282.160
> `@`%bar
7.496.034
~zod:dojo> 
```

Let's pick the nock apart.

```
7  +  The outer =>
  [1 2.037.282.160 314]  -  The constant [%puny 314]
  7 +  The inner =>
    8 +  A pin to the subject
      [1 0 3]  - A constant of the formula for puny-version
      11  + A hint
        1.953.718.630 - The constant %fast
        1 + A constant of the clue for this hint
          [2.037.282.160 314]  - %puny.314
          [1 0]  - A constant ~ for the parent
          0      - an empty list of hooks
      [0 1] - the whole %puny.314 core
    8 + A pin to the subject
      [1 4 1 1.234] - A constant of the formula for foo
      11  +  A hint
        1.953.718.630 - %fast
        1 + A constant clue
          7.496.034 - The constant %bar
          [0 3]     - A formula for the axis of the parent (%puny.314)
          0         - Empty list of hooks
        [0 1] - The whole core %bar
```


When the nock is evaluated we will obtain the noun `[[4 1 1.234] [0 3] 2.037.282.160 314]`. This is a core: the head or *battery* is the noun `[4 1 1.234]` which, interpreted as a formula, increments the constant `1.234`. The tail or *payload* is another core: which itself has a battery `[0 3]` and a payload `[2.037.282.160 314]` which is the constant cell at the top of the expression.

Since the expression which produces the result: `[0 1]` (returning the entire subject) is wrapped in the `%fast` hint, its battery (the head of the pair, containing all formulas we might run) will be registered in the cold state. The quoted Nock expression `[1 0]` tells us that our parent is our entire payload and is the root of the cold state.

Let's extend this just a bit:

```
=>  puny+314  =>
~%  %puny.314  ~  ~  :: no parent, core payload is fixed as %puny
|%
++  puny-version  +  :: returns [%puny 314]
--
~%  %bar  +  ~       :: parent is %puny.314
|%
++  foo  .+(1.234)
++  baz
  ~/  %baz  :: what's this?
  |=  a=@
  =|  b=0
  |-  ^-  @
  ?:  =(b foo)  a
  $(a .+(a), b .+(b))
--
```

Sigfas (`~/`) is just syntactic sugar: it expands to a sigcen (`~%`) with no hooks and a parent at axis 7:

```
...
++  baz
  ~%  %baz  +7  ~
  |=  a=@
...
```

So `~/` is just a convenient shorthand for `~%` applied to a gate without any extra context. Arms of a core receive the whole core as their subject. A gate expression first pins the sample and then emits the core:

```
> !=  |=  a=@  4
[8 [1 0] [1 1 4] 0 1]
```

So in the resulting gate, the subject of the gate expression is at axis 7. (Axis 2 has the battery containing the single arm `$` of the gate, and axis 6 contains the bunted sample of the gate). Since the subject of an arm in a core is just the core, if we do not pin any additional nouns to the subject outside the gate, the parent core will be the entire subject of the expression and will be located at axis 7.

Note that this hint is not evaluated until we evaluate the `+baz` arm. This is *not* the same as slamming the resulting gate: evaluating `+baz` produces the gate, slamming it is a further step. When the hint is evaluated, the hint around the parent core necessarily has already been evaluated.

Thus, evaluating `%fast` hints has the *side effect* of updating the cold state. When the inner `%fast` hint (around `+baz`) is evaluated, then axis 7 of the core is matched against stored cold state batteries until a match is found. Note that matching is not equality, batteries are stored in a tree with child to parent links being the axes of parent cores. But a match does mean that the battery of axis 7 (in the `+baz` case) (thus, axis 14) equals a stored battery in the tree, and the payload of the core at axis 7 recursively matches its parents. If we can find such a match, then we can add the hinted core as a child of the core whose batteries we recursively matched.

The result is a forest of trees where paths are denoted by lists of terms (for instance: `%baz` -> `%bar` -> `[%puny 314]`) and nodes are batteries of cores. Child nodes are cores which contain parent cores in their payloads. 

### Cold state in the portable snapshot
The Hoon type of the noun jammed as a portable snapshot is `[%arvo arvo-core %hashboard (list ^)]`. The list at axis 15 is the `tap:by` of the registry map in the runtime. (No type exists for this in the Hoon standard library, but the type is written out in a comment in [`jets.h`](https://github.com/urbit/vere/blob/1384f9d01dc187eaade3a256babdf28ad7dcc312/pkg/noun/jets.h#L13-L38).) An example of traversing the cold state is in [`_cj_ream()`](https://github.com/urbit/vere/blob/develop/pkg/noun/jets.c#L2086). There is a lot of cruft in the current vere representation.

## Hot state

Cold state is entirely a function of the nock execution history of a pier: specifically, all of the `%fast` hints that have been evaluated. It is thus necessarily persistent. Once we evaluate a `%fast` hint we may retain the resulting core indefinitely, and to avoid jet misses we must retain the information provided by the hint. 

Hot state is entirely ephemeral: it is the information about which jets are provided by the runtime. A pier may be shut down and then booted with a slightly different version of a runtime, or an entirely different runtime. The cold state must remain across these transitions, but the hot state is dependent only on which runtime the user executes against their pier.

In general hot state will be hard-coded into the executable. Plug-ins or "jet packs" which provide additional jets may modify the hot state at runtime, but we will not consider this detail for now.

The hot state associates core names, and axes into core batteries, with procedures in the runtime which serve to replace nock computation and thus accelerate it. Conceptually an entry in the hot state is:

- A path into the tree of named cores, i.e. a list of terms (for instance `~[%puny %bar %baz]` in our example)
- An axis into the battery of the named core (2 in our example, since the named core is a gate)
- A function pointer or other identifier of the procedure to invoke in place of interpreting the arm of the core.

## Warm state

Warm state is entirely a function of cold state and hot state, and is not strictly conceptually necessary. Anytime an arm of a core is invoked we could check the cold state for a matching entry, and then check the hot state for an entry corresponding to the tree path, finally checking that the formula we are invoking matches the formula at the hot state's specified axis in the core. This however would be almost intolerably slow.

Any practical interpreter will maintain more direct mappings between cores and the jets which may accelerate them. This state is (re)generated from the hot state and cold state whenever the hot or cold state changes.