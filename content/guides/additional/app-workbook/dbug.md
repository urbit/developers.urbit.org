+++
title = "%dbug Debugging Wrapper"
weight = 40
+++


The `/lib/dbug.hoon` agent wrapper adds support to view the state of a Gall agent.  It is applied to an existing Gall agent as a single drop-in line, `%-  agent:dbug`.

Before we look at the code, let's consider the functionality it exposes.  By supplying `%-  agent:dbug`, an associated `+dbug` generator can be invoked against the agent state.

For instance, using the `%azimuth` agent, we can expose the current state of the agent:

```hoon
> :azimuth +dbug
[ %7
  url=~.
  net=%default
  refresh=~m5
  whos={}
  nas=[%0 points={} operators={} dns=<||>]
  own={}
  spo={}
  logs=~
  sap=[%0 id=[hash=0x0 number=0] nas=[%0 points={} operators={} dns=<||>] owners={} sponsors={}]
]

> :azimuth +dbug %bowl
>   [ [our=~zod src=~zod dap=%azimuth]
  [wex={} sup={}]
  act=3
    eny
  0v1rn.n49dr.2u8t5.h7be5.6dcq7.9hon5.6m3pr.3hcb8.u7tmv.qddpq.kent7.1ftc7.9tao6.hfsht.4i0c3.ak3t7.t8d8j.nn4eb.b7eh3.4d5pr.t8ftg
  now=~2023.2.3..20.03.23..f60e
  byk=[p=~zod q=%base r=[%da p=~2023.1.26..02.41.25..926a]]
]

> :azimuth +dbug [%incoming ~]
>   no matching subscriptions

> :azimuth +dbug [%state '(lent whos)']
>   0
```

There are four actions exposed by the wrapper via the `+dbug` generator:

1. `:app +dbug` exposes the entire state, just dumping the current agent state.
2. `:app +dbug %bowl` shows the agent's `bowl`.  The Gall `bowl` consists of:
    
    ```hoon
    +$  bowl              ::  standard app state
      $:  $:  our=ship    ::  host
              src=ship    ::  guest
              dap=term    ::  agent
          ==              ::
          $:  wex=boat    ::  outgoing subs
              sup=bitt    ::  incoming subs
          ==              ::
          $:  act=@ud     ::  change number
              eny=@uvJ    ::  entropy
              now=@da     ::  current time
              byk=beak    ::  load source
      ==  ==              ::
    ```

3. `:app +dbug [%state 'hoon']` exposes data in the state, including evaluated Hoon like `(lent values)`.
4. `:app +dbug [?(%incoming outgoing) specifics]` reveals details about the subscriptions.

##  The Code

**`/gen/dbug.hoon`**:

```hoon {% mode="collapse" %}
/+  *dbug
:-  %say
|=  $:  ::  environment
        *
        ::  inline arguments
        args=?(~ [what=?(%bowl %state) ~] [=poke ~])
        ::  named arguments
        ~
    ==
:-  %dbug
?-  args
  ~          [%state '']
  [@ ~]      ?-(what.args %bowl [%bowl ~], %state [%state ''])
  [[@ *] ~]  poke.args
==
```

**`/lib/dbug.hoon`**:

```hoon {mode="collapse"}
::  dbug: agent wrapper for generic debugging tools
::
::    usage: %-(agent:dbug your-agent)
::
|%
+$  poke
  $%  [%bowl ~]
      [%state grab=cord]
      [%incoming =about]
      [%outgoing =about]
  ==
::
+$  about
  $@  ~
  $%  [%ship =ship]
      [%path =path]
      [%wire =wire]
      [%term =term]
  ==
::
++  agent
  |=  =agent:gall
  ^-  agent:gall
  !.
  |_  =bowl:gall
  +*  this  .
      ag    ~(. agent bowl)
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card:agent:gall agent:gall)
    ?.  ?=(%dbug mark)
      =^  cards  agent  (on-poke:ag mark vase)
      [cards this]
    =/  dbug
      !<(poke vase)
    =;  =tang
      ((%*(. slog pri 1) tang) [~ this])
    ?-  -.dbug
      %bowl   [(sell !>(bowl))]~
    ::
        %state
      =?  grab.dbug  =('' grab.dbug)  '-'
      =;  product=^vase
        [(sell product)]~
      =/  state=^vase
        ::  if the underlying app has implemented a /dbug/state scry endpoint,
        ::  use that vase in place of +on-save's.
        ::
        =/  result=(each ^vase tang)
          (mule |.(q:(need (need (on-peek:ag /x/dbug/state)))))
        ?:(?=(%& -.result) p.result on-save:ag)
      %+  slap
        (slop state !>([bowl=bowl ..zuse]))
      (ream grab.dbug)
    ::
        %incoming
      =;  =tang
        ?^  tang  tang
        [%leaf "no matching subscriptions"]~
      %+  murn
        %+  sort  ~(tap by sup.bowl)
        |=  [[* a=[=ship =path]] [* b=[=ship =path]]]
        (aor [path ship]:a [path ship]:b)
      |=  [=duct [=ship =path]]
      ^-  (unit tank)
      =;  relevant=?
        ?.  relevant  ~
        `>[path=path from=ship duct=duct]<
      ?:  ?=(~ about.dbug)  &
      ?-  -.about.dbug
        %ship  =(ship ship.about.dbug)
        %path  ?=(^ (find path.about.dbug path))
        %wire  %+  lien  duct
               |=(=wire ?=(^ (find wire.about.dbug wire)))
        %term  !!
      ==
    ::
        %outgoing
      =;  =tang
        ?^  tang  tang
        [%leaf "no matching subscriptions"]~
      %+  murn
        %+  sort  ~(tap by wex.bowl)
        |=  [[[a=wire *] *] [[b=wire *] *]]
        (aor a b)
      |=  [[=wire =ship =term] [acked=? =path]]
      ^-  (unit tank)
      =;  relevant=?
        ?.  relevant  ~
        `>[wire=wire agnt=[ship term] path=path ackd=acked]<
      ?:  ?=(~ about.dbug)  &
      ?-  -.about.dbug
        %ship  =(ship ship.about.dbug)
        %path  ?=(^ (find path.about.dbug path))
        %wire  ?=(^ (find wire.about.dbug wire))
        %term  =(term term.about.dbug)
      ==
    ==
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?.  ?=([@ %dbug *] path)
      (on-peek:ag path)
    ?+  path  [~ ~]
      [%u %dbug ~]                 ``noun+!>(&)
      [%x %dbug %state ~]          ``noun+!>(on-save:ag)
      [%x %dbug %subscriptions ~]  ``noun+!>([wex sup]:bowl)
    ==
  ::
  ++  on-init
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  on-init:ag
    [cards this]
  ::
  ++  on-save   on-save:ag
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-load:ag old-state)
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-watch:ag path)
    [cards this]
  ::
  ++  on-leave
    |=  =path
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-leave:ag path)
    [cards this]
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-agent:ag wire sign)
    [cards this]
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-arvo:ag wire sign-arvo)
    [cards this]
  ::
  ++  on-fail
    |=  [=term =tang]
    ^-  (quip card:agent:gall agent:gall)
    =^  cards  agent  (on-fail:ag term tang)
    [cards this]
  --
--
```

As we examine this code, there are two particularly interesting aspects:

1. How `/lib/dbug.hoon` modifies an agent's arms by adding functionality over the top of them.
2. How `/gen/dbug.hoon` utilizes the modified arms with an elegant and simple invocation.

There is also extensive use of `tank`/`tang` formatted error messaging.

### How the library modifies an agent

By applying this door builder using `%-` censig, the `++on-poke` and `++on-peek` arms can be modified.  (In fact, all of the arms can be modified but most of the arms are pass-throughs to the modified agent.)

#### `++on-poke`

```hoon {% mode="collapse" %}
++  on-poke
    |=  [=mark =vase]
    ^-  (quip card:agent:gall agent:gall)
    ?.  ?=(%dbug mark)
      =^  cards  agent  (on-poke:ag mark vase)
      [cards this]
    =/  dbug
      !<(poke vase)
    =;  =tang
      ((%*(. slog pri 1) tang) [~ this])
    ?-  -.dbug
      %bowl   [(sell !>(bowl))]~
    ::
        %state
      =?  grab.dbug  =('' grab.dbug)  '-'
      =;  product=^vase
        [(sell product)]~
      =/  state=^vase
        ::  if the underlying app has implemented a /dbug/state scry endpoint,
        ::  use that vase in place of +on-save's.
        ::
        =/  result=(each ^vase tang)
          (mule |.(q:(need (need (on-peek:ag /x/dbug/state)))))
        ?:(?=(%& -.result) p.result on-save:ag)
      %+  slap
        (slop state !>([bowl=bowl ..zuse]))
      (ream grab.dbug)
    ::
        %incoming
      =;  =tang
        ?^  tang  tang
        [%leaf "no matching subscriptions"]~
      %+  murn
        %+  sort  ~(tap by sup.bowl)
        |=  [[* a=[=ship =path]] [* b=[=ship =path]]]
        (aor [path ship]:a [path ship]:b)
      |=  [=duct [=ship =path]]
      ^-  (unit tank)
      =;  relevant=?
        ?.  relevant  ~
        `>[path=path from=ship duct=duct]<
      ?:  ?=(~ about.dbug)  &
      ?-  -.about.dbug
        %ship  =(ship ship.about.dbug)
        %path  ?=(^ (find path.about.dbug path))
        %wire  %+  lien  duct
               |=(=wire ?=(^ (find wire.about.dbug wire)))
        %term  !!
      ==
    ::
        %outgoing
      =;  =tang
        ?^  tang  tang
        [%leaf "no matching subscriptions"]~
      %+  murn
        %+  sort  ~(tap by wex.bowl)
        |=  [[[a=wire *] *] [[b=wire *] *]]
        (aor a b)
      |=  [[=wire =ship =term] [acked=? =path]]
      ^-  (unit tank)
      =;  relevant=?
        ?.  relevant  ~
        `>[wire=wire agnt=[ship term] path=path ackd=acked]<
      ?:  ?=(~ about.dbug)  &
      ?-  -.about.dbug
        %ship  =(ship ship.about.dbug)
        %path  ?=(^ (find path.about.dbug path))
        %wire  ?=(^ (find wire.about.dbug wire))
        %term  =(term term.about.dbug)
      ==
    ==
```

The `++on-poke` arm has several branches added to it after a check to see whether it is being used through the `+dbug` generator.  If it isn't (as determined by the associated `mark`), then the poke is passed through to the base agent.

```hoon
?.  ?=(%dbug mark)
  =^  cards  agent  (on-poke:ag mark vase)
  [cards this]
```

The following `?-` wuthep handles the input arguments:  `%state` is the most interesting code in this library.  The code first checks whether the base agent has a `/dbug/state` peek endpoint already (in which case it passes it through), otherwise it evaluates the requested Hoon expression against the agent's state (obtained via `++on-save:ag`).

```hoon
  %state
=?  grab.dbug  =('' grab.dbug)  '-'
=;  product=^vase
  [(sell product)]~
=/  state=^vase
  ::  if the underlying app has implemented a /dbug/state scry endpoint,
  ::  use that vase in place of +on-save's.
  ::
  =/  result=(each ^vase tang)
    (mule |.(q:(need (need (on-peek:ag /x/dbug/state)))))
  ?:(?=(%& -.result) p.result on-save:ag)
%+  slap
  (slop state !>([bowl=bowl ..zuse]))
(ream grab.dbug)
```

This branch includes the use of a rare [`=?` tiswut](https://developers.urbit.org/reference/hoon/rune/tis#-tiswut) conditional leg change and the reversed `=/` tisfas, [`=;` tismic](https://developers.urbit.org/reference/hoon/rune/tis#-tismic).  There is also some direct compilation of `cord`s taking place:

- [`++sell`](https://developers.urbit.org/reference/hoon/stdlib/5c#sell) is a `vase` pretty-printer.
- [`++slop`](https://developers.urbit.org/reference/hoon/stdlib/5c#slop) conses two `vase`s together as a cell. 
- [`++slap`](https://developers.urbit.org/reference/hoon/stdlib/5c#slap) compiles a Hoon expression and produces a `vase` of the result.
- [`++ream`](https://developers.urbit.org/reference/hoon/stdlib/5d#ream) parses a `cord` to a Hoon expression.

#### `++on-peek`

```hoon {mode="collapse"}
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?.  ?=([@ %dbug *] path)
      (on-peek:ag path)
    ?+  path  [~ ~]
      [%u %dbug ~]                 ``noun+!>(&)
      [%x %dbug %state ~]          ``noun+!>(on-save:ag)
      [%x %dbug %subscriptions ~]  ``noun+!>([wex sup]:bowl)
    ==
```

The `++on-peek` arm adds several peek endpoints which expose the state (via `++onsave:ag`) and the subscriptions.

```hoon
> .^(noun %gx /(scot %p our)/azimuth/(scot %da now)/dbug/subscriptions/noun)
[0 0]
```

### How the generator works

The generator explicitly injects the `%dbug` mark in its return `cask` (`[mark noun]`).  This is a valid if uncommon operation, and it works here because the mark is never used as a transforming gate but only as a marker to see whether the arms need to pass through the values.  The no-argument input is routed through the `%state` with an empty `cord`.

```hoon
:-  %dbug
?-  args
  ~          [%state '']
  [@ ~]      ?-(what.args %bowl [%bowl ~], %state [%state ''])
  [[@ *] ~]  poke.args
==
```

Library authors should consider augmenting developer capabilities by exposing appropriate functionality using a wrapper agent similar to `/lib/dbug`.
