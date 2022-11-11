+++
title = "The Engine Pattern"
date = "2022-11-18"
description = "Explaining the engine design pattern in Hoon apps."
[extra]
author = "N E Davis"
ship = "~lagrev-nocfep"
image = "https://media.urbit.org/site/posts/essays/blog-engine.png"
+++

![](https://media.urbit.org/site/posts/essays/blog-engine.png)


#   The Engine Design Pattern

TODO some snappy intro
Although of [long standing](https://github.com/urbit/urbit/commit/4caa90c68fc4aeffa926570bfce301a04bdc1f10) in the kernel, the engine pattern has only gradually come to prominence and interest among Urbit's userspace developers.

Many applications store their data in `+$map`s.  The basic engine pattern uses an auxiliary core to manage building state changes.  By convention, an `++abed` arm provides initialization (if any) and an `++abet` arm finalizes the changes and hands back the mutated state.  A number of other semi-standard arms are employed to manage particular state changes.  Core arms are conventionally prefixed with two letters because engine patterns can nest inside of each other.

Thus, a very simple engine core could look like this (from New Groups):

```hoon
++  ca-core
  |_  [=flag:c =chat:c gone=_|]
  ++  ca-core  .
  ++  ca-abet  
    %_  cor
        chats  
      ?:(gone (~(del by chats) flag) (~(put by chats) flag chat))
    ==
  ++  ca-abed
    |=  f=flag:c
    ca-core(flag f, chat (~(got by chats) f))
  ::  * * *
  --
```

In this instance, `++ca-core` is a handle to the door for self-reference (thus a particular chat), `++ca-abed` is an initializer (which here retrieves the door's sample etc.), and `++ca-abet` is used to delete or insert a `map` element in `chat`.  `cor` is an alias for a helper core containing `++ca-core`—here it is used to simplify the Gall agent's internal logic.  `flag` is a tag for a particular chat.

An instance of using the code could look like this:

```hoon
=/  chat-core  (ca-abed:ca-core p.action)  
?:  =(p.p.action our.bowl)  
  ca-abet:(ca-update:chat-core q.action)  
ca-abet:(ca-proxy:chat-core q.action)
```

This code employs the `++abet` engine arm to handle cards.  The engine core accumulates cards (like a cursor focused on a particular aspect of an action), then yields them all at once for evaluation.


##  Engine Cores

Once you are comfortable thinking in terms of cores and doors, the engine pattern is a natural evolution to a more abstract and powerful viewpoint.  Just as a door generalizes certain aspects of a gate to a more general usage, the engine pattern serves to generalize the door by effectively providing a higher-level script for operations.

Engine cores can be nested inside of each other to manage state changes concisely.  An inner core can act like a higher-level script or domain-specific language for the outer core it serves.

One of the challenges of teaching the engine pattern for the first time is that it's a [_design pattern_](https://en.wikipedia.org/wiki/Design_pattern), not a particular instance of code.  Thus there is a fair amount of variation in implementation for solving particular problems.  There are, however, two basic archetypes for building engine patterns:

### Ames

Ames-style engine cores only modify one part of the `map`, one key-value pair.
    
For instance, in `/sys/vane/ames.hoon`, we find the definitions

```hoon
++  event-core  .
++  abet  [(flop moves) ames-state]
++  emit  |=(=move event-core(moves [move moves]))
```

Thus for Ames, the engine pattern largely consists of building a list of particular moves and then pulling them back out:  

```hoon
  ::  if processing succeded, send positive ack packet and exit
  ++  send-ack
    |=  =bone
    ^+  event-core
    =/  cork=?  (~(has in closing.peer-state) bone)
    abet:(run-message-sink:peer-core bone %done ok=%.y cork)
```

You can see the Ames-style pattern illustrated today in many core apps, such as `/app/acme.hoon` which obtains HTTPS `letsencrypt` certificates.

```hoon
::  +abet: finalize transaction
::
++  abet
  ^-  (quip card _state)
  [(flop cards) state]
```

Various arms in `%acme` like `++wake` make calls such as `%-  (slog u.error)  abet` from time to time.

### Clay

Clay-style engine cores focus on modifying one part of the `map` but perhaps have other effects as well.

In `/sys/vane/clay.hoon`, we find a more complicated `++abet`:

```hoon
++  abet
  ^-  [(list move) raft]
  :-  (flop mow)
  ?.  =(our her)
    =/  run  (~(gut by hoy.ruf) her *rung)
    =/  rug  (~(put by rus.run) syd red)
    ruf(hoy (~(put by hoy.ruf) her run(rus rug)))
```

We don't need to worry about inner details of Clay to see that there's more going on here:  a number of internal maps are updated as part of the state change as well as the list of moves accrued to `mow`.

The engine pattern is used elsewhere (notably in Gall and in Hood), but these are the basic patterns.

### Gall

Gall uses two engine cores to manage agents:  `++mo` handles Arvo-level moves, while `++ap` acts as the “agent engine”.  While there are many elements to each, here is a partial glimpse of how `++mo` structures its approach.  (There are many other arms to build particular cards or produce state changes.)

```hoon
::
++  mo-core  .
::  +mo-abed: initialise state with the provided duct
++  mo-abed  |=(hun=duct mo-core(hen hun))
::  +mo-abet: finalize, reversing moves
++  mo-abet  [(flop moves) gall-payload]
::  +mo-give: prepend a standard %give to the current list of moves
++  mo-give  |=(g=gift mo-core(moves [[hen give+g] moves]))
::  +mo-pass: prepend a standard %pass to the current list of moves
++  mo-pass  |=(p=[wire note-arvo] mo-core(moves [[hen pass+p] moves]))
::  +mo-slip: prepend a %slip move to the current list of moves
++  mo-slip  |=(p=note-arvo mo-core(moves [[hen slip+p] moves]))
::  +mo-past: show the 
++  mo-past  |=(=(list [wire note-arvo]) ?~(list mo-core =.(mo-core (mo-pass i.list) $(list t.list))))
::  +mo-jolt: (re)start agent if not already started on this desk
++  mo-jolt  |=([dap=term =ship =desk] (mo-boot dap ship desk))
```

Some of these are “standard” engine pattern arms, while others are particular to `++mo`.

### Generalizing the Engine Pattern

As mentioned, the engine pattern is a pattern rather than a particular example of code.  The tell-tale mark of engine code, above all else, is a core containing an `++abet` finalizer arm.

Here are some common engine pattern arms.  These are not all unique, and many cores will omit all or most of these.

- `++abed`—initialize.   Set up the state of the inner engine core.
- `++yoke`—initialize.  Start from a particular value.
- `++abet`—finalize.  Exit from an inner core to an outer core, taking changes.  Commonly, take a modified valued and overwrite it into the final state with a `++put:by`.
- `++abut`—finalize.  Alternative exit from `++abet` for a deletion.
- `++move`—send a move.  Generalization for `++pass`/`++give`.
- `++pass`—request an action.  Prepend a `%pass` move to the current list of moves.
- `++give`—return a result.  Prepend a standard `%give` to the current list of moves.
- `++emit`—submit a card.  Prepend a card to the current list of cards.
- `++emil`—submit cards.  Prepend a list of cards to the current list of cards.

We recommend reading the following examples which employ the engine pattern:

- `++mo` in `%base`, `/sys/gall.hoon`
- `++ap` in `%base`, `/sys/gall.hoon`
- `++vats` in `%base`, `/lib/hood/kiln.hoon`
- `++ca` in `%groups` (New Groups), `/sys/gall.hoon`
- `++go` in [`%cult`](https://github.com/rabsef-bicrym/cult/blob/master/gora/cult/cult.hoon), `/cult/cult.hoon`

For instance, [Quartus’ `cult` library](https://github.com/rabsef-bicrym/cult/blob/master/gora/cult/cult.hoon) uses the engine pattern in `++go` for a [gossip protocol library](https://en.wikipedia.org/wiki/Gossip_protocol).  Some of the names are different (e.g. `easy` for `abed`), but you can see how the design pattern holds:

```hoon
::  +go-emit - add card to cards
::  +go-emil - add list of cards
::  +go-abet - and state changes
::  +go-dick - inspect the group
::  +go-form - maybe form a cult
::  +go-diff - handle easy diffs
::  +go-easy - start cult engine
```


##  Using the Engine Pattern

To recap at this point:  the engine pattern represents a way of using a helper core to manage complicated state changes and thus encapsulate code away from standard patterns such as the ten-armed Gall agent.  It's useful to think of the engine core as being like a cursor, a local focus of attention to build a particular effect.

How could you use the engine pattern today?  A Gall agent is a door with a sample of the `bowl` and an associated `state`.  `card`s are issued from the agent to Arvo and other agents, while `gift`s and incoming `card`s are handled by the agent.  This means that agents need to compose lists of `card`s—the ubiquitous `(quip card state)` return type.  This pair of `(list card)` and `agent:gall` allow us to produce effects (`card`s) and maintain state.

A Gall agent sometimes needs to issue a lot of state changes using cards.  This can lead to awkward chains of `=^` tisket pins as several cards are aggregated together before resolving.  (Card effects all resolve “at the same time” or in the same event like a `%=` centis resolution, meaning before any mutations are applied to the state, but composing several cards together can be vexing.)  As an alternative, a helper core (the “engine”) can be used to encapsulate complexity with card handling.  When used well, the engine pattern can lead to cleaner code factoring and sequestration of more complex logic.

Your basic approach will be to construct a helper core next to your Gall agent which 
By convention these have been built in the same file as the Gall agent (rather than `/lib`) because they frequently need to access agent state, but as with `/lib/hood/kiln.hoon`, there are elegant ways to avoid this necessity.

Other arms (such as `++set-timer`) then simply construct cards which are inserted into the `++abet` engine's list.


### List pattern

For instance, imagine a chat app.  When a message arrives, a card can be built on the basis of what changes need to be effected:  subscribers need to be notified with a `%gift`.

Classically, a single card would be bundled with any necessary state changes:

```hoon
:_  this(messages ~[text messages])
~[[%give %fact ~[/update] %chat-effect !>(`chat-effect`[text])]]
```

Much like a single card, a list of cards can be produced and returned from an arm in a Gall agent.  Here a Gall agent triggers a thread:

```hoon
:_  this
:~  [%pass wire %agent [our.bowl %spider] %watch /thread-result/[tid]]                        
    [%pass wire %agent [our.bowl %spider] %poke %spider-start !>(args)]
==
```

This pattern works well for single cards or short collections of them, in particular with simple generating logic.

### `=^` tisket pattern

The classic way of composing several cards uses a [`=^` tisket](https://developers.urbit.org/reference/hoon/rune/tis#-tisket) to pin a state and a helper core to process actions.  This allows sequestration of logic into particular arms.

```hoon
=^  cards  state
  `state(allowances (~(put by allowances) +.action))
[cards this]
```

Another advantage (at the cost of more obfuscatory logic) is that code effects can be better ordered, e.g. in this code snippet which registers a token (`++register-api-key`) before using the corresponding token (`++employ-api-key`).

```hoon
=^  cards  state  (register-api-key:main source.action target.action)
=^  cards  state  (employ-api-key:main source.action target.action)
:_  state
^-  (list card)
%+  weld  cards
  %+  give-simple-payload:app:server  id
  (handle-api-request:main source target)
```

In Graph Store, we find `=^` tiskets used in several places, preferring one per arm, as card lists are built systematically:

**`/=landscape=/app/graph-store/hoon`**:

```hoon
++  run-updates
   |=  [=resource:store =update-log:store]
   ^-  (quip card _state)
   ?<  (~(has by archive) resource)
   ?>  (~(has by graphs) resource)
   =/  updates=(list [=time upd=logged-update:store])
     ::  updates are time-ordered with most recent first
     ::  process with earliest first
     (bap:orm-log update-log)
   =|  cards=(list card)
   |-  ^-  (quip card _state)
   ?~  updates
     [cards state]
   =*  update  upd.i.updates
   =^  crds  state
     %-  graph-update
     ^-  update:store
     ?-  -.q.update
       %add-graph          update(resource.q resource)
       %add-nodes          update(resource.q resource)
       %remove-posts       update(resource.q resource)
       %add-signatures     update(resource.uid.q resource)
       %remove-signatures  update(resource.uid.q resource)
     ==
   $(cards (weld cards crds), updates t.updates)
++  poke-import
  |=  arc=*
  ^-  (quip card _state)
  =^  cards  state
    (import:store arc our.bowl)
  [cards state]
```

### Engine pattern

Given an engine core, rather than simply produce `(quip card _state)`, you can close over a list of cards and state using a core, then pull the `++abet` arm on that core to produce the new list of cards and state.

```hoon
++  abet
  ^-  (quip card _state)
  [(flop cards) state]
```

You've seen the basic engine pattern above.  For the case of a chat app with nested engine cores, let's circle back around to New Groups.

```hoon
|_  [=bowl:gall cards=(list card)]
  ++  abet  [(flop cards) state]
  ++  cor   .
  ++  emit  |=(=card cor(cards [card cards]))
  ++  emil  |=(caz=(list card) cor(cards (welp (flop caz) cards)))
  ++  give  |=(=gift:agent:gall (emit %give gift))
  ++  now-id   `id:c`[our now]:bowl
  ::  * * *
  ++  poke
    |=  [=mark =vase]
    |^  ^+  cor
    ?+    mark  ~|(bad-poke/mark !!)
    ::  * * *
    ::
        %chat-leave
      =+  !<(=leave:c vase)
      ?<  =(our.bowl p.leave)  :: cannot leave chat we host
      ca-abet:ca-leave:(ca-abed:ca-core leave)
    ::
        %chat-action
      =+  !<(=action:c vase)
      =.  p.q.action  now.bowl
      =/  chat-core  (ca-abed:ca-core p.action)
      ?:  =(p.p.action our.bowl)
        ca-abet:(ca-update:chat-core q.action)
      ca-abet:(ca-proxy:chat-core q.action)
    ::
        %dm-action
      =+  !<(=action:dm:c vase)
      di-abet:(di-proxy:(di-abed-soft:di-core p.action) q.action)
    ::  * * *
    ==
```

Several interesting features are legible here even without examining the engine cores separately:

1. You can see there is a `++ca` core for chats and a `++di` core for direct messages.
2. There is no `++abed` arm in place here since this core doesn't carry any state it needs to initialize.
3. `++emit`/`++emil`/`++give` handle contributed moves.

### In Conclusion

The `++abet` engine pattern itself is rather simple to construct in userspace.  By sequestering logic, it yields cleaner agent code.  It also enables other arms to construct a list of cards rather than having to produce chained `=^`-style constructions.
