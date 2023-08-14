+++
title = "Strandio"
weight = 60
template = "doc.html"
+++

Documented below are the many useful functions in the
`/lib/strandio.hoon` helper library. 

## Send Cards

### `send-raw-cards`

Send a list of `card`s.

#### Accepts

A `(list card:agent:gall)`.

#### Produces

`~`

#### Source

```hoon
++  send-raw-cards
  |=  cards=(list =card:agent:gall)
  =/  m  (strand ,~)
  ^-  form:m
  |=  strand-input:strand
  [cards %done ~]
```

#### Example

```hoon
;~  now=@da  bind:m  get-time
=/  cards=(list card)
  :~  [%pass /foo %agent [~zod %foo] %poke %noun !>(~)]
      [%pass /bar %arvo %b %wait now]
  ==
;<  ~  bind:m  (send-raw-cards cards)
```

---

### `send-raw-card`

Send a single `card`.

#### Accepts

A `card:agent:gall`

#### Produces

`~`

#### Source

```hoon
++  send-raw-card
  |=  =card:agent:gall
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-cards card ~)
```

#### Example

```hoon
=/  card  [%pass /foo %agent [~zod %foo] %poke %noun !>(~)]
;<  ~  bind:m  (send-raw-card card)
```

---

## Bowl

### `get-bowl`

Get the bowl.

#### Accepts

Nothing.

#### Produces

A `bowl:rand`.

#### Source

```hoon
++  get-bowl
  =/  m  (strand ,bowl:strand)
  ^-  form:m
  |=  tin=strand-input:strand
  `[%done bowl.tin]
```

#### Example

```hoon
;<  =bowl:rand  bind:m  get-bowl
```

---

### `get-beak`

Get the beak.

#### Accepts

Nothing.

#### Produces

A `beak`.

#### Source

```hoon
++  get-beak
  =/  m  (strand ,beak)
  ^-  form:m
  |=  tin=strand-input:strand
  `[%done [our q.byk da+now]:bowl.tin]
```

#### Example

```hoon
;<  =beak  bind:m  get-beak
```

---

### `get-time`

Get the current date-time.

#### Accepts

Nothing.

#### Produces

A `@da`.

#### Source

```hoon
++  get-time
  =/  m  (strand ,@da)
  ^-  form:m
  |=  tin=strand-input:strand
  `[%done now.bowl.tin]
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
```

---

### `get-our`

Get our ship.

#### Accepts

Nothing.

#### Produces

A `@p`.

#### Source

```hoon
++  get-our
  =/  m  (strand ,ship)
  ^-  form:m
  |=  tin=strand-input:strand
  `[%done our.bowl.tin]
```

#### Example

```hoon
;<  our=@p  bind:m  get-our
```

---

### `get-entropy`

Get some entropy.

#### Accepts

Nothing.

#### Produces

A `@uvJ`.

#### Source

```hoon
++  get-entropy
  =/  m  (strand ,@uvJ)
  ^-  form:m
  |=  tin=strand-input:strand
  `[%done eny.bowl.tin]
```

#### Example

```hoon
;<  eny=@uvJ  bind:m  get-entropy
```

---

## Misc

### `install-domain`

Install a domain in Eyre, triggering the setup of an SSL certificate.

#### Accepts

A `turf`.

#### Produces

`~`

#### Source

```hoon
++  install-domain
  |=  =turf
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass / %arvo %e %rule %turf %put turf)
```

#### Example

```hoon
;<  ~  bind:m  (install-domain 'com' 'example' ~)
```

---

### `check-online`

Require that a peer respond before timeout.

The peer is pinged with a "hi" and must ack the poke before the timeout.

#### Accepts

A pair of `[ship @dr]`. The `@dr` is the amount of time the peer has to
respond before failure.

#### Produces

`~`

#### Source

```hoon
++  check-online
  |=  [who=ship lag=@dr]
  =/  m  (strand ,~)
  ^-  form:m
  %+  (map-err ,~)  |=(* [%offline *tang])
  %+  (set-timeout ,~)  lag
  ;<  ~  bind:m
    (poke [who %hood] %helm-hi !>(~))
  (pure:m ~)
```

#### Example

```hoon
;<  ~  bind:m  (check-online ~zod ~s10)
```

---

### `take-sign-arvo`

Wait for a sign from Arvo.

#### Accepts

Nothing.

#### Produces

A pair of `[wire sign-arvo]`.

#### Source

```hoon
++  take-sign-arvo
  =/  m  (strand ,[wire sign-arvo])
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~
    `[%wait ~]
  ::
      [~ %sign *]
    `[%done [wire sign-arvo]:u.in.tin]
  ==
```

#### Example

```hoon
;<  [=wire =sign-arvo]  bind:m  take-sign-arvo
```

---

## Pokes

### `poke`

Poke an agent, then await a positive ack.

#### Accepts

A pair of `[dock cage]`, where the `dock` is the ship and agent you want
to poke, and the `cage` is the data.

#### Produces

`~`

#### Source

```hoon
++  poke
  |=  [=dock =cage]
  =/  m  (strand ,~)
  ^-  form:m
  =/  =card:agent:gall  [%pass /poke %agent dock %poke cage]
  ;<  ~  bind:m  (send-raw-card card)
  (take-poke-ack /poke)
```

#### Example

```hoon
;<  ~  bind:m  (poke [~zod %foo] %noun !>(~))
```

---

### `raw-poke`

Poke an agent then await a (n)ack.

This doesn't care whether the ack is positive or negative, unlike the
ordinary [poke](#poke).

#### Accepts

A pair of `[dock cage]`, where the `dock` is the ship and agent to poke,
and the `cage` is the data.

#### Produces

`~`

#### Source

```hoon
++  raw-poke
  |=  [=dock =cage]
  =/  m  (strand ,~)
  ^-  form:m
  =/  =card:agent:gall  [%pass /poke %agent dock %poke cage]
  ;<  ~  bind:m  (send-raw-card card)
  =/  m  (strand ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~
    `[%wait ~]
  ::
      [~ %agent * %poke-ack *]
    ?.  =(/poke wire.u.in.tin)
      `[%skip ~]
    `[%done ~]
  ==
```

#### Example

```hoon
;<  ~  bind:m  (raw-poke [~zod %foo] %noun !>(~))
```

---

### `raw-poke-our`

Poke a local agent then await a (n)ack.

This doesn't care whether the ack is positive or negative, unlike the
ordinary [poke-our](#poke-our).

#### Accepts

A pair of `[app=term =cage]`, where `app` is the local agent to poke and
`cage` is the data.

#### Produces

`~`

#### Source

```hoon
++  raw-poke-our
  |=  [app=term =cage]
  =/  m  (strand ,~)
  ^-  form:m
  ;<  =bowl:spider  bind:m  get-bowl
  (raw-poke [our.bowl app] cage)
```

#### Example

```hoon
;<  ~  bind:m  (raw-poke-our %foo %noun !>(~))
```

---

### `poke-our`

Poke a local agent then await an ack.

Note this fails if it gets a nack back.

#### Accepts

A pair of `[=term =cage]` where `term` is the name of a local agent and
`cage` is the data.

#### Produces

`~`

#### Source

```hoon
++  poke-our
  |=  [=term =cage]
  =/  m  (strand ,~)
  ^-  form:m
  ;<  our=@p  bind:m  get-our
  (poke [our term] cage)
```

#### Example

```hoon
;<  ~  bind:m  (poke-our %foo %noun !>(~))
```

---

### `take-poke-ack`

Take a poke ack on the given wire.

If the ack is a nack, the strand fails.

#### Accepts

A `wire`.

#### Produces

`~`

#### Source

```hoon
++  take-poke-ack
  |=  =wire
  =/  m  (strand ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %agent * %poke-ack *]
    ?.  =(wire wire.u.in.tin)
      `[%skip ~]
    ?~  p.sign.u.in.tin
      `[%done ~]
    `[%fail %poke-fail u.p.sign.u.in.tin]
  ==
```

#### Example

```hoon
;<  ~  bind:m  (take-poke-ack /foo)
```

---

### `take-poke`

Wait for a poke with a particular mark.

#### Accepts

A `mark`.

#### Produces

A `vase`.

#### Source

```hoon
++  take-poke
  |=  =mark
  =/  m  (strand ,vase)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~
    `[%wait ~]
  ::
      [~ %poke @ *]
    ?.  =(mark p.cage.u.in.tin)
      `[%skip ~]
    `[%done q.cage.u.in.tin]
  ==
```

#### Example

```hoon
;<  =vase  bind:m  (take-poke %noun)
```

---

## Subscriptions

### `watch`

Watch a subscription path on an agent, then await a positive watch ack.

Note this fails if it gets a watch nack back.

#### Accepts

A triple of `[=wire =dock =path]` where `dock` is the ship and agent,
and `path` is the subscription path.

#### Produces

`~`

#### Source

```hoon
++  watch
  |=  [=wire =dock =path]
  =/  m  (strand ,~)
  ^-  form:m
  =/  =card:agent:gall  [%pass watch+wire %agent dock %watch path]
  ;<  ~  bind:m  (send-raw-card card)
  (take-watch-ack wire)
```

#### Example

```hoon
;<  ~  bind:m  (watch /foo [~zod %foo] /some/path)
```

---

### `watch-one`

Subscribe to a watch path on an agent, take a single fact, then await a
kick.

#### Accepts

A triple of `[=wire =dock =path]` where `dock` is a ship and agent, and
`path` is the subscription path.

#### Produces

The `cage` of the received fact.

#### Source

```hoon
++  watch-one
  |=  [=wire =dock =path]
  =/  m  (strand ,cage)
  ^-  form:m
  ;<  ~  bind:m  (watch wire dock path)
  ;<  =cage  bind:m  (take-fact wire)
  ;<  ~  bind:m  (take-kick wire)
  (pure:m cage)
```

#### Example

```hoon
;<  [=mark =vase]  bind:m  (watch-one /foo [~zod %foo] /some/path)
```

---

### `watch-our`

Subscribe to a watch path on a local agent, then wait for a positive
ack.

This will fail if it gets a watch nack.

#### Accepts

A triple of `[=wire =term =path]` where `term` is the name of the agent
and `path` is the subscription path.

#### Produces

`~`

#### Source

```hoon
::
++  watch-our
  |=  [=wire =term =path]
  =/  m  (strand ,~)
  ^-  form:m
  ;<  our=@p  bind:m  get-our
  (watch wire [our term] path)
```

#### Example

```hoon
;<  ~  bind:m  (watch-our /foo %foo /some/path)
```

---

### `leave`

Leave a subscription.

#### Accepts

A pair of `[=wire =dock]` where `dock` is the ship and agent in question.

#### Produces

`~`

#### Source

```hoon
++  leave
  |=  [=wire =dock]
  =/  m  (strand ,~)
  ^-  form:m
  =/  =card:agent:gall  [%pass watch+wire %agent dock %leave ~]
  (send-raw-card card)
```

#### Example

```hoon
;<  ~  bind:m  (leave /foo ~zod %foo)
```

---

### `leave-our`

Unsubscribe from a local agent.

#### Accepts

A pair of `[=wire =term]` where `term` is the local agent.

#### Produces

`~`

#### Source

```hoon
++  leave-our
  |=  [=wire =term]
  =/  m  (strand ,~)
  ^-  form:m
  ;<  our=@p  bind:m  get-our
  (leave wire [our term])
```

#### Example

```hoon
;<  ~  bind:m  (leave-our /foo %foo)
```

---

### `rewatch`

Resubscribe on kick.

This waits for a kick on a given wire, then rewatches the given ship,
agent and path on the same wire. It then waits for a positive watch ack.

#### Accepts

A triple of `[=wire =dock =path]` where `dock` is the ship and agent,
and `path` is the subscription path.

#### Produces

`~`

#### Source

```hoon
++  rewatch
  |=  [=wire =dock =path]
  =/  m  (strand ,~)
  ;<  ~  bind:m  ((handle ,~) (take-kick wire))
  ;<  ~  bind:m  (flog-text "rewatching {<dock>} {<path>}")
  ;<  ~  bind:m  (watch wire dock path)
  (pure:m ~)
```

#### Exmaple

```hoon
;<  ~  bind:m  (rewatch /foo [~zod %foo] /some/path)
```

---

### `take-fact-prefix`

Wait for a subscription update on a wire.

#### Accepts

A `wire` as the *prefix* of what you expect. E.g. if `/foo` is given, a
fact with a wire of `/foo`, `/foo/bar`, `/foo/bar/baz`, etc, will be
accepted.

#### Produces

A cell of `[wire cage]`.

#### Source

```hoon
++  take-fact-prefix
  |=  =wire
  =/  m  (strand ,[path cage])
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %agent * %fact *]
    ?.  =(watch+wire (scag +((lent wire)) wire.u.in.tin))
      `[%skip ~]
    `[%done (slag (lent wire) wire.u.in.tin) cage.sign.u.in.tin]
  ==
```

#### Example

```hoon
;<  [=wire =mark =vase]  bind:m  (take-fact-prefix /foo)
```

---

### `take-fact`

Wait for a subscription update on a wire.

#### Accepts

The `wire` you want to listen on.

#### Produces

A `cage`.

#### Source

```hoon
++  take-fact
  |=  =wire
  =/  m  (strand ,cage)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %agent * %fact *]
    ?.  =(watch+wire wire.u.in.tin)
      `[%skip ~]
    `[%done cage.sign.u.in.tin]
  ==
```

#### Example

```hoon
;<  [=mark =vase]  bind:m  (take-fact /foo)
```

---

### `take-kick`

Wait for a subscription close.

#### Accepts

The `wire` you want to listen on.

#### Produces

`~`

#### Source

```hoon
++  take-kick
  |=  =wire
  =/  m  (strand ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %agent * %kick *]
    ?.  =(watch+wire wire.u.in.tin)
      `[%skip ~]
    `[%done ~]
  ==
```

#### Example

```hoon
;<  ~  bind:m  (take-kick /foo)
```

---

### `take-watch-ack`

Take a watch ack on a given wire.

If the watch ack is a nack, the strand fails.

#### Accepts

A `wire`.

#### Produces

`~`

#### Source

```hoon
++  take-watch-ack
  |=  =wire
  =/  m  (strand ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %agent * %watch-ack *]
    ?.  =(watch+wire wire.u.in.tin)
      `[%skip ~]
    ?~  p.sign.u.in.tin
      `[%done ~]
    `[%fail %watch-ack-fail u.p.sign.u.in.tin]
  ==
```

#### Example

```hoon
;<  ~  bind:m  (take-watch-ack /foo)
```

---

### `take-watch`

Wait for a subscription request.

#### Accepts

Nothing.

#### Produces

The subscription `path`.

#### Source

```hoon
++  take-watch
  =/  m  (strand ,path)
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %watch *]
    `[%done path.u.in.tin]
  ==
```

#### Example

```hoon
;<  =path  bind:m  take-watch
```

---

## Scries

### `scry`

Scry an agent or vane.

#### Accepts

A pair of `[=mold =path]` where `mold` is the type returned and `path`
has the following format:

```hoon
/[vane letter and care]/[desk]/[rest of path after beak]
```

The strand implicitly fills in `our` and `now` in the beak.

#### Produces

Data of the type produced by the mold you specified.

#### Source

```hoon
++  scry
  |*  [=mold =path]
  =/  m  (strand ,mold)
  ^-  form:m
  ?>  ?=(^ path)
  ?>  ?=(^ t.path)
  ;<  =bowl:spider  bind:m  get-bowl
  %-  pure:m
  .^(mold i.path (scot %p our.bowl) i.t.path (scot %da now.bowl) t.t.path)
```

#### Example

```hoon
;<  has=?  bind:m  (scry ? %cu %base /gen/vats/hoon)
```

---

### `keen`

Make a remote scry request.

Note this doesn't wait for a response, you'd have to use a separate
[take-tune](#take-tune) strand to receive the result.

#### Accept

A pair of `[=wire =spar:ames]`.

#### Produces

`~`

#### Source

```hoon
++  keen
  |=  [=wire =spar:ames]
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass wire %arvo %a %keen spar)
```

#### Example

```hoon
;<  ~  bind:m  (keen /foo ~sampel /c/x/4/base/sys/hoon/hoon)
```

---

### `take-tune`

Wait for a remote scry result on a particular wire.

#### Accepts

A `wire`.

#### Produces

A `[spar:ames (unit roar:ames)]`

#### Source

```hoon
++  take-tune
  |=  =wire
  =/  m  (strand ,[spar:ames (unit roar:ames)])
  ^-  form:m
  |=  tin=strand-input:strand
  ?+    in.tin  `[%skip ~]
      ~  `[%wait ~]
    ::
      [~ %sign * %ames %tune ^ *]
    ?.  =(wire wire.u.in.tin)
      `[%skip ~]
    `[%done +>.sign-arvo.u.in.tin]
  ==
```

#### Example

```hoon
;<  [spar roar=(unit roar)]  bind:m  (take-tune /foo)
```

---

## Time

### `wait`

Send a `%wait` to Behn and wait for the `%wake`.

Note there's also [sleep](#sleep) to wait for a relative amount of time
rather than having to specify an absolute time.

#### Accepts

A `@da` of when the timer should fire.

#### Produces

`~`

#### Source

```hoon
++  wait
  |=  until=@da
  =/  m  (strand ,~)
  ^-  form:m
  ;<  ~  bind:m  (send-wait until)
  (take-wake `until)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  ~  bind:m  (wait (add now ~s2))
```

---

### `sleep`

Wait for a relative amount of time.

#### Accepts

A `@dr`.

#### Produces

`~`

#### Source

```hoon
++  sleep
  |=  for=@dr
  =/  m  (strand ,~)
  ^-  form:m
  ;<  now=@da  bind:m  get-time
  (wait (add now for))
```

#### Example

```hoon
;<  ~  bind:m  (sleep ~s2)
```

---

### `send-wait`

Send Behn a `%wait` but don't wait for the `%wake`.

#### Accepts

A `@da`.

#### Produces

`~`

#### Source

```hoon
++  send-wait
  |=  until=@da
  =/  m  (strand ,~)
  ^-  form:m
  =/  =card:agent:gall
    [%pass /wait/(scot %da until) %arvo %b %wait until]
  (send-raw-card card)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  ~  bind:m  (send-wait (add ~s2 now))
```

---

### `set-timeout`

Make a strand fail if it takes too long.

#### Accepts

This takes the `mold` produced but the strand you're timing, and
produces a gate. The gate takes a pair of the `@dr` timeout and the
strand being timed.

#### Produces

Data of the type produced by the strand being timed.

#### Source

```hoon
++  set-timeout
  |*  computation-result=mold
  =/  m  (strand ,computation-result)
  |=  [time=@dr computation=form:m]
  ^-  form:m
  ;<  now=@da  bind:m  get-time
  =/  when  (add now time)
  =/  =card:agent:gall
    [%pass /timeout/(scot %da when) %arvo %b %wait when]
  ;<  ~        bind:m  (send-raw-card card)
  |=  tin=strand-input:strand
  =*  loop  $
  ?:  ?&  ?=([~ %sign [%timeout @ ~] %behn %wake *] in.tin)
          =((scot %da when) i.t.wire.u.in.tin)
      ==
    `[%fail %timeout ~]
  =/  c-res  (computation tin)
  ?:  ?=(%cont -.next.c-res)
    c-res(self.next ..loop(computation self.next.c-res))
  ?:  ?=(%done -.next.c-res)
    =/  =card:agent:gall
      [%pass /timeout/(scot %da when) %arvo %b %rest when]
    c-res(cards [card cards.c-res])
  c-res
```

#### Example

```hoon
;<  ~  bind:m  ((set-timeout ,~) ~s10 (poke-our %foo %noun !>(~)))
```

---

### `take-wake`

Wait for a wake from Behn.

This is meant for internal use by [wait](#wait), you'd not typically
use it directly.

#### Accepts

A `(unit @da)`. If the unit is non-null, it'll only accept a `%wake`
whose wire is of the form `/wait/(scot %da the-given-time)`. If the unit
is null, it'll accept a `%wake` with a wire of `/wait/(scot %da
any-time)`.

#### Produces

`~`

#### Source

```hoon
::
++  take-wake
  |=  until=(unit @da)
  =/  m  (strand ,~)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %sign [%wait @ ~] %behn %wake *]
    ?.  |(?=(~ until) =(`u.until (slaw %da i.t.wire.u.in.tin)))
      `[%skip ~]
    ?~  error.sign-arvo.u.in.tin
      `[%done ~]
    `[%fail %timer-error u.error.sign-arvo.u.in.tin]
  ==
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
=/  card=card:agent:gall  [%pass /wait/(scot %da now) %arvo %b %wait now]
;<  ~  bind:m  (send-raw-card card)
;<  ~  bind:m  (take-wake `now)
```

---

## Errors

### `retry`

Retry a strand that produces a `unit` if the `unit` is null, with a backoff.

#### Accepts

`retry` first takes a `result=mold` of the return type and produces a gate.
That gate takes two arguments:

- `crash-after=(unit @ud)`: the number of tries before failing.
- `computation`: A strand that produces a `(unit result)`.

#### Produces

The type of `result`.

#### Source

```hoon
++  retry
  |*  result=mold
  |=  [crash-after=(unit @ud) computation=_*form:(strand (unit result))]
  =/  m  (strand ,result)
  =|  try=@ud
  |-  ^-  form:m
  =*  loop  $
  ?:  =(crash-after `try)
    (strand-fail %retry-too-many ~)
  ;<  ~                  bind:m  (backoff try ~m1)
  ;<  res=(unit result)  bind:m  computation
  ?^  res
    (pure:m u.res)
  loop(try +(try))
```

#### Example

```hoon
=/  =hiss:eyre  [(need (de-purl:html 'http://example.com')) %get ~ ~]
;<  =httr:eyre  bind:m  ((retry httr:eyre) `3 (hiss-request hiss))
```
---

### `backoff`

Wait for increasing amounts of time with each try.

#### Accepts

A pair of `[try=@ud limit=@dr]`, specifying the current try count and
the maximum amount of time to wait.

#### Produces

`~`

#### Source

```hoon
++  backoff
  |=  [try=@ud limit=@dr]
  =/  m  (strand ,~)
  ^-  form:m
  ;<  eny=@uvJ  bind:m  get-entropy
  %-  sleep
  %+  min  limit
  ?:  =(0 try)  ~s0
  %+  add
    (mul ~s1 (bex (dec try)))
  (mul ~s0..0001 (~(rad og eny) 1.000))
```

---

### `map-err`

Rewrite a strand failure error.

#### Accepts

This function takes the return `mold` of the strand in question as its
argument and returns a gate that takes two arguments:

- `f`: a gate that takes a `[term tang]` and produces a `[term tang]`.
  This is the `%error-tag` and stack trace of the failure you're
  rewriting.
- `computation`: the strand whose errors you're rewriting.

See the example below for usage.

#### Produces

Data of the type produced by the strand in question.

#### Source

```hoon
++  map-err
  |*  computation-result=mold
  =/  m  (strand ,computation-result)
  |=  [f=$-([term tang] [term tang]) computation=form:m]
  ^-  form:m
  |=  tin=strand-input:strand
  =*  loop  $
  =/  c-res  (computation tin)
  ?:  ?=(%cont -.next.c-res)
    c-res(self.next ..loop(computation self.next.c-res))
  ?.  ?=(%fail -.next.c-res)
    c-res
  c-res(err.next (f err.next.c-res))
```

#### Example

```hoon
;<  ~  bind:m
  %+  (map-err ,~)
    |=  [=term =tang]
    ?:  =(%poke-fail term)
      [%foo tang]
    [term tang]
  (poke-our %foo %noun !>(~))
```

---

## HTTP

### `send-request`

Make an HTTP request via Iris, but don't wait for the response.

#### Accepts

A [`request:http`](/reference/arvo/eyre/data-types#requesthttp).

#### Produces

`~`

#### Source

```hoon
++  send-request
  |=  =request:http
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass /request %arvo %i %request request *outbound-config:iris)
```

#### Example

```hoon
;<  ~  bind:m  (send-request %'GET' 'http://example.com' ~ ~)
```

---

### `send-cancel-request`

Cancel a previous Iris HTTP request.

This sends it on the `/request` wire used by
[`send-request`](#send-request). It won't work if the original request
was on a different wire.

#### Accepts

Nothing.

#### Produces

`~`

#### Source

```hoon
++  send-cancel-request
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass /request %arvo %i %cancel-request ~)
```

#### Example

```hoon
;<  ~  bind:m  send-cancel-request
```

---

### `take-client-response`

Take the HTTP response from a previous HTTP request made with
[`send-request`](#send-request).

This listens on the `/request` wire, it won't work if you're made a
request on a different wire.

#### Accepts

Nothing.

#### Produces

A [`client-response:iris`](/reference/arvo/iris/data-types#client-response).

#### Source

```hoon
++  take-client-response
  =/  m  (strand ,client-response:iris)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
    ::
      [~ %sign [%request ~] %iris %http-response %cancel *]
    ::NOTE  iris does not (yet?) retry after cancel, so it means failure
    :-  ~
    :+  %fail
      %http-request-cancelled
    ['http request was cancelled by the runtime']~
    ::
      [~ %sign [%request ~] %iris %http-response %finished *]
    `[%done client-response.sign-arvo.u.in.tin]
  ==
```

#### Example

```hoon
;<  res=client-response:iris  bind:m  take-client-response
```

---

### `take-maybe-sigh`

Take a unitized raw HTTP response.

#### Accepts
 
Nothing

#### Produces

A `(unit httr:eyre)`. The `unit` is null if we failed to receive a
response.

#### Source

```hoon
++  take-maybe-sigh
  =/  m  (strand ,(unit httr:eyre))
  ^-  form:m
  ;<  rep=(unit client-response:iris)  bind:m
    take-maybe-response
  ?~  rep
    (pure:m ~)
  ::  XX s/b impossible
  ::
  ?.  ?=(%finished -.u.rep)
    (pure:m ~)
  (pure:m (some (to-httr:iris +.u.rep)))
```

#### Example

```hoon
;<  res=(unit httr:eyre)  bind:m  take-maybe-sigh
```

---

### `take-maybe-response`

Take a unitized HTTP response.

#### Accepts

Nothing

#### Produces

A `(unit client-response:iris)`. The `unit` is null if we failed to
receive a response.

#### Source

```hoon
++  take-maybe-response
  =/  m  (strand ,(unit client-response:iris))
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %sign [%request ~] %iris %http-response %cancel *]
    `[%done ~]
      [~ %sign [%request ~] %iris %http-response %finished *]
    `[%done `client-response.sign-arvo.u.in.tin]
  ==
```

#### Example

```hoon
;<  res=(unit client-response:iris)  bind:m  take-maybe-response
```

---

### `extract-body`

Extract body from an HTTP response.

#### Accepts

A `client-response:iris`

#### Produces

A `cord`.

#### Source

```hoon
++  extract-body
  |=  =client-response:iris
  =/  m  (strand ,cord)
  ^-  form:m
  ?>  ?=(%finished -.client-response)
  %-  pure:m
  ?~  full-file.client-response  ''
  q.data.u.full-file.client-response
```

---

### `fetch-cord`

Get the HTTP response body from a URL.

#### Accepts

The URL in a `tape`.

#### Produces

A `cord` of the response body.

#### Source

```hoon
++  fetch-cord
  |=  url=tape
  =/  m  (strand ,cord)
  ^-  form:m
  =/  =request:http  [%'GET' (crip url) ~ ~]
  ;<  ~                      bind:m  (send-request request)
  ;<  =client-response:iris  bind:m  take-client-response
  (extract-body client-response)
```

#### Example

```hoon
;<  bod=@t  bind:m  (fetch-cord "http://example.com")
```

---

### `fetch-json`

Get some JSON from a URL.

#### Accepts

The URL as a `tape`.

#### Produces

A `json` structure.

#### Source

```hoon
++  fetch-json
  |=  url=tape
  =/  m  (strand ,json)
  ^-  form:m
  ;<  =cord  bind:m  (fetch-cord url)
  =/  json=(unit json)  (de-json:html cord)
  ?~  json
    (strand-fail %json-parse-error ~)
  (pure:m u.json)
```

#### Example

```hoon
;<  =json  bind:m  (fetch-json "http://example.com")
```

---

### `hiss-request`

Make a raw HTTP request, take a raw response.

#### Accepts

`hiss:eyre`

#### Produces

A `(unit httr:eyre)`. The `unit` is null if we failed to receive a
response.

#### Source

```hoon
::
++  hiss-request
  |=  =hiss:eyre
  =/  m  (strand ,(unit httr:eyre))
  ^-  form:m
  ;<  ~  bind:m  (send-request (hiss-to-request:html hiss))
  take-maybe-sigh
```

#### Example

```hoon
=/  =hiss:eyre  [(need (de-purl:html 'http://example.com')) %get ~ ~]
;<  res=(unit httr:eyre)  bind:m  (hiss-request hiss)
```

---

## Build

### `build-file`

Build a source file at the specified `beam`.

#### Accepts

A `beam`.

#### Produces

A `(unit vase)`. The `vase` contains the compiled file, the `unit` is
null if it failed.

#### Source

```hoon
++  build-file
  |=  [[=ship =desk =case] =spur]
  =*  arg  +<
  =/  m  (strand ,(unit vase))
  ^-  form:m
  ;<  =riot:clay  bind:m
    (warp ship desk ~ %sing %a case spur)
  ?~  riot
    (pure:m ~)
  ?>  =(%vase p.r.u.riot)
  (pure:m (some !<(vase q.r.u.riot)))
```

#### Example

```hoon
;<  now=@da          bind:m  get-time
;<  res=(unit vase)  bind:m  (build-file [~zod %base da+now] /gen/hood/hi/hoon)
```

---

### `build-file-hard`

Build a source file at the specified `beam`, crashing if it fails.

#### Accepts

A `beam`.

#### Produces

A `vase`.

#### Source

```hoon
++  build-file-hard
  |=  [[=ship =desk =case] =spur]
  =*  arg  +<
  =/  m  (strand ,vase)
  ^-  form:m
  ;<    =riot:clay
      bind:m
    (warp ship desk ~ %sing %a case spur)
  ?>  ?=(^ riot)
  ?>  ?=(%vase p.r.u.riot)
  (pure:m !<(vase q.r.u.riot))
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  =vase    bind:m  (build-file-hard [~zod %base da+now] /gen/hood/hi/hoon)
```

---

### `build-mark`

Build a dynamic mark core from file.

#### Accepts

A pair of `[beak mark]`.

#### Produces

A `dais:clay`

#### Source

```hoon
++  build-mark
  |=  [[=ship =desk =case] mak=mark]
  =*  arg  +<
  =/  m  (strand ,dais:clay)
  ^-  form:m
  ;<  =riot:clay  bind:m
    (warp ship desk ~ %sing %b case /[mak])
  ?~  riot
    (strand-fail %build-mark >arg< ~)
  ?>  =(%dais p.r.u.riot)
  (pure:m !<(dais:clay q.r.u.riot))
```

#### Example

```hoon
;<  now=@da     bind:m  get-time
;<  =dais:clay  bind:m  (build-mark [~zod %base da+now] %noun)
```

---

### `build-tube`

Build a dynamic mark conversion gate from file.

#### Accepts

A pair of `[beak mars:clay]`. A `mars` is a pair of the *from* and *to*
mark.

#### Produces

A `tube:clay`

#### Source

```hoon
++  build-tube
  |=  [[=ship =desk =case] =mars:clay]
  =*  arg  +<
  =/  m  (strand ,tube:clay)
  ^-  form:m
  ;<  =riot:clay  bind:m
    (warp ship desk ~ %sing %c case /[a.mars]/[b.mars])
  ?~  riot
    (strand-fail %build-tube >arg< ~)
  ?>  =(%tube p.r.u.riot)
  (pure:m !<(tube:clay q.r.u.riot))
```

#### Example

```hoon
;<  now=@da     bind:m  get-time
;<  =tube:clay  bind:m  (build-tube [~zod %base da+now] %mime %txt)
```

---

### `build-nave`

Build a static mark core from file.

#### Accepts

A pair of `[beak mark]`.

#### Produces

A `vase`.

#### Source

```hoon
++  build-nave
  |=  [[=ship =desk =case] mak=mark]
  =*  arg  +<
  =/  m  (strand ,vase)
  ^-  form:m
  ;<  =riot:clay  bind:m
    (warp ship desk ~ %sing %e case /[mak])
  ?~  riot
    (strand-fail %build-nave >arg< ~)
  ?>  =(%nave p.r.u.riot)
  (pure:m q.r.u.riot)
```

#### Example

```hoon
;<  now=@da     bind:m  get-time
;<  =nave:clay  bind:m  (build-nave [~zod %base da+now] %txt)
```

---

### `build-cast`

Build a static mark conversion gate from file.

#### Accepts

A pair of `[beak mars:clay]`. A `mars` is a pair of the *from* mark and
*to* mark.

#### Source

```hoon
++  build-cast
  |=  [[=ship =desk =case] =mars:clay]
  =*  arg  +<
  =/  m  (strand ,vase)
  ^-  form:m
  ;<  =riot:clay  bind:m
    (warp ship desk ~ %sing %f case /[a.mars]/[b.mars])
  ?~  riot
    (strand-fail %build-cast >arg< ~)
  ?>  =(%cast p.r.u.riot)
  (pure:m q.r.u.riot)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  =vase    bind:m  (build-cast [~zod %base da+now] %mime %txt)
```

---

### `eval-hoon`

Evaluate some hoon and produce the result.

#### Accepts

A pair of `[gen=hoon bez=(list beam)]`. The `gen` argument is the hoon
to be evaluated. If `bez` is empty, it will be evaluated against the
standard `..zuse` subject. If a list of `beam`s are provided in `bez`,
each one will be read from Clay, build, and pinned to the head of the
subject, before `gen` is evaluated against it.

#### Produces

A `vase` of the result.

#### Source

```hoon
++  eval-hoon
  |=  [gen=hoon bez=(list beam)]
  =/  m  (strand ,vase)
  ^-  form:m
  =/  sut=vase  !>(..zuse)
  |-
  ?~  bez
    (pure:m (slap sut gen))
  ;<  vax=vase  bind:m  (build-file-hard i.bez)
  $(bez t.bez, sut (slop vax sut))
```

#### Example

```hoon
;<  =vase  bind:m  (eval-hoon !,(*hoon (add 1 1)))
```

---

## Clay

### `warp`

Raw read from Clay.

#### Accepts

A pair of `ship` and [`riff:clay`](/reference/arvo/clay/data-types#riff).

#### Produces

A [`riot:clay`](/reference/arvo/clay/data-types#riot).

#### Source

```hoon
++  warp
  |=  [=ship =riff:clay]
  =/  m  (strand ,riot:clay)
  ;<  ~  bind:m  (send-raw-card %pass /warp %arvo %c %warp ship riff)
  (take-writ /warp)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  =riot:clay  bind:m  (warp %base ~ %sing %x da+now /foo/txt)
```

---

### `read-file`

Read a file from Clay.

#### Accepts

A `beam`.

#### Produces

A `cage`.

#### Source

```hoon
++  read-file
  |=  [[=ship =desk =case] =spur]
  =*  arg  +<
  =/  m  (strand ,cage)
  ;<  =riot:clay  bind:m  (warp ship desk ~ %sing %x case spur)
  ?~  riot
    (strand-fail %read-file >arg< ~)
  (pure:m r.u.riot)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  =cage    bind:m  (read-file [~zod %base da+now] /foo/txt)
```

---

### `check-for-file`

Check for the existence of a file in Clay.

#### Accepts

A `beam`.

#### Produces

A `?` which is `%.y` if the file exists, and `%.n` if not.

#### Source

```hoon
++  check-for-file
  |=  [[=ship =desk =case] =spur]
  =/  m  (strand ,?)
  ;<  =riot:clay  bind:m  (warp ship desk ~ %sing %x case spur)
  (pure:m ?=(^ riot))
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  has=?    bind:m  (check-for-file [~zod %base da+now] /foo/txt)
```

---

### `list-tree`

Get a list of all files in the given Clay directory.

#### Accepts

A `beam`.

#### Produces

A `(list path)`.

#### Source

```hoon
++  list-tree
  |=  [[=ship =desk =case] =spur]
  =*  arg  +<
  =/  m  (strand ,(list path))
  ;<  =riot:clay  bind:m  (warp ship desk ~ %sing %t case spur)
  ?~  riot
    (strand-fail %list-tree >arg< ~)
  (pure:m !<((list path) q.r.u.riot))
```

#### Example

```hoon
;<  now=@da            bind:m  get-time
;<  paths=(list path)  bind:m  (list-tree [~zod %base da+now] /sys)
```

---

### `take-writ`

Take a Clay read result.

#### Accepts

The `wire` to listen on.

#### Produces

A [`riot:clay`](/reference/arvo/clay/data-types#riot)

#### Source

```hoon
++  take-writ
  |=  =wire
  =/  m  (strand ,riot:clay)
  ^-  form:m
  |=  tin=strand-input:strand
  ?+  in.tin  `[%skip ~]
      ~  `[%wait ~]
      [~ %sign * ?(%behn %clay) %writ *]
    ?.  =(wire wire.u.in.tin)
      `[%skip ~]
    `[%done +>.sign-arvo.u.in.tin]
  ==
```

#### Example

```hoon
;<  =riot-clay  bind:m  (take-writ /warp)
```

---

## Main Loop

### `ignore`

Try next on failure.

This produces a failure with an `%ignore` status, which
[main-loop](#main-loop) uses to skip the strand and try the next one.
This is of little use outside the context of a `main-loop`.

#### Accepts

Nothing.

#### Produces

Nothing.

#### Source

```hoon
++  ignore
  |=  tin=strand-input:strand
  `[%fail %ignore ~]
```

---

### `handle`

Convert skips to `%ignore` failures.

This tells [main-loop](#main-loop) to try the next strand on skips.
This would not be used outside of a `main-loop`.

#### Accepts

`+handle` takes a mold and produces a gate that takes another strand.

#### Produces

Data of the type produced by the given mold.

#### Source

```hoon
++  handle
  |*  a=mold
  =/  m  (strand ,a)
  |=  =form:m
  ^-  form:m
  |=  tin=strand-input:strand
  =/  res  (form tin)
  =?  next.res  ?=(%skip -.next.res)
    [%fail %ignore ~]
  res
```

#### Example

```hoon
;<  =vase  bind:m  ((handle ,vase) (take-poke %foo))
```

---

### `main-loop`

A `main-loop` can be used for three things:

1. create a loop.
2. try the same input against multiple strands.
3. Queue input on `%skip` and then dequeue from the beginning on `%done`.

#### Accepts

It first accepts a `mold`, specifying the return type, and produces a
gate. The gate produced takes a `list` of gates that take an argument of
the specified `mold`, and produce the `form` of a `strand` of that mold.

#### Produces

Data of the type produced by the given `mold`.

#### Source

```hoon {% mode="collapse" %}
++  main-loop
  |*  a=mold
  =/  m  (strand ,~)
  =/  m-a  (strand ,a)
  =|  queue=(qeu (unit input:strand))
  =|  active=(unit [in=(unit input:strand) =form:m-a forms=(list $-(a form:m-a))])
  =|  state=a
  |=  forms=(lest $-(a form:m-a))
  ^-  form:m
  |=  tin=strand-input:strand
  =*  top  `form:m`..$
  =.  queue  (~(put to queue) in.tin)
  |^  (continue bowl.tin)
  ::
  ++  continue
    |=  =bowl:strand
    ^-  output:m
    ?>  =(~ active)
    ?:  =(~ queue)
      `[%cont top]
    =^  in=(unit input:strand)  queue  ~(get to queue)
    ^-  output:m
    =.  active  `[in (i.forms state) t.forms]
    ^-  output:m
    (run bowl in)
  ::
  ++  run
    ^-  form:m
    |=  tin=strand-input:strand
    ^-  output:m
    ?>  ?=(^ active)
    =/  res  (form.u.active tin)
    =/  =output:m
      ?-  -.next.res
          %wait  `[%wait ~]
          %skip  `[%cont ..$(queue (~(put to queue) in.tin))]
          %cont  `[%cont ..$(active `[in.u.active self.next.res forms.u.active])]
          %done  (continue(active ~, state value.next.res) bowl.tin)
          %fail
        ?:  &(?=(^ forms.u.active) ?=(%ignore p.err.next.res))
          %=  $
            active  `[in.u.active (i.forms.u.active state) t.forms.u.active]
            in.tin  in.u.active
          ==
        `[%fail err.next.res]
      ==
    [(weld cards.res cards.output) next.output]
  --
```
#### Example

See the [separate `main-loop`
example](/reference/arvo/threads/examples/main-loop) or the
[`echo`](#echo) example below.

---

### `echo`

Echo a given message to the terminal every 2 seconds until told to stop.

#### Accepts

This strand takes nothing directly, but expects a poke with a `mark` of
`%echo` and vase containing a `tape` with the message to echo. To
finish, it expects a poke with a `mark` of `%over`.

#### Produces

`~`

#### Source

```hoon
++  echo
  =/  m  (strand ,~)
  ^-  form:m
  %-  (main-loop ,~)
  :~  |=  ~
      ^-  form:m
      ;<  =vase  bind:m  ((handle ,vase) (take-poke %echo))
      =/  message=tape  !<(tape vase)
      %-  (slog leaf+"{message}..." ~)
      ;<  ~      bind:m  (sleep ~s2)
      %-  (slog leaf+"{message}.." ~)
      (pure:m ~)
  ::
      |=  ~
      ^-  form:m
      ;<  =vase  bind:m  ((handle ,vase) (take-poke %over))
      %-  (slog leaf+"over..." ~)
      (pure:m ~)
  ==
```

---

## Printing

### `flog`

Send a wrapped Dill task to Dill.

#### Accepts

A [`flog:dill`](/reference/arvo/dill/data-types#flog)

#### Produces

`~`

#### Source

```hoon
++  flog
  |=  =flog:dill
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass / %arvo %d %flog flog)
```

#### Example

```hoon
;<  ~  bind:m  (flog %text "foo")
```

---

### `flog-text`

Print a message to the terminal via Dill.

#### Accepts

A `tape`.

#### Produces

`~`

#### Source

```hoon
++  flog-text
  |=  =tape
  =/  m  (strand ,~)
  ^-  form:m
  (flog %text tape)
```

#### Example

```hoon
;<  ~  bind:m  (flog-text "foo")
```

---

### `flog-tang`

Print a `tang` to the terminal via Dill.

#### Accepts

A `tang`

#### Produces

`~`

#### Source

```hoon
++  flog-tang
  |=  =tang
  =/  m  (strand ,~)
  ^-  form:m
  =/  =wall
    (zing (turn (flop tang) (cury wash [0 80])))
  |-  ^-  form:m
  =*  loop  $
  ?~  wall
    (pure:m ~)
  ;<  ~  bind:m  (flog-text i.wall)
  loop(wall t.wall)
```

#### Example

```hoon
;<  ~  bind:m  (flog-tang 'foo' 'bar' 'baz' ~)
```

---

### `trace`

Slog a `tang` to the terminal.

#### Accepts

A `tang`.

#### Produces

`~`

#### Source

```hoon
++  trace
  |=  =tang
  =/  m  (strand ,~)
  ^-  form:m
  (pure:m ((slog tang) ~))
```

#### Example

```hoon
;<  ~  bind:m  (trace 'foo' 'bar' 'baz' ~)
```

---

### `app-message`

Print a message to the terminal tagged with an app name, like:

```
my-app: foo bar baz
```

Then, optionally, print a `tang`.

#### Accepts

A triple of `[term cord tang]`. The `term` is the app name, the `cord`
is the message, and the `tang` is any traceback.

#### Produces

`~`

#### Source

```hoon
++  app-message
  |=  [app=term =cord =tang]
  =/  m  (strand ,~)
  ^-  form:m
  =/  msg=tape  :(weld (trip app) ": " (trip cord))
  ;<  ~  bind:m  (flog-text msg)
  (flog-tang tang)
```

#### Example

```hoon
;<  ~  bind:m  (app-message %foo 'foo bar baz' ~)
```

---

## Threads

### `send-thread`

Run an inline thread via Khan.

#### Accepts

A triple of:

- `bear:khan`: desk or beak.
- `shed:khan`: the thread itself.
- `wire`: the wire for responses from Khan.

#### Produces

`~`

#### Source

```hoon
++  send-thread
  |=  [=bear:khan =shed:khan =wire]
  =/  m  (strand ,~)
  ^-  form:m
  (send-raw-card %pass wire %arvo %k %lard bear shed)
```

---

### `start-thread`

Start a child thread.

#### Accepts

A `term`, the name of a thread in `/ted` of this desk.

#### Produces

A `tid:spider`, the ID of the child thread.

#### Source

```hoon
++  start-thread
  |=  file=term
  =/  m  (strand ,tid:spider)
  ;<  =bowl:spider  bind:m  get-bowl
  (start-thread-with-args byk.bowl file *vase)
```

#### Example

```hoon
;<  ~  bind:m  (start-thread %foo)
```

---

### `start-thread-with-args`

Start a child thread with arguments.

#### Accepts

A triple of:

- `beak`: the ship/desk/case where the thread is located.
- `term`: the name of the thread in `/ted` of the given desk.
- `vase`: the start argument.

#### Produces

A `tid:spider`, the ID of the child thread.

#### Source

```hoon
++  start-thread-with-args
  |=  [=beak file=term args=vase]
  =/  m  (strand ,tid:spider)
  ^-  form:m
  ;<  =bowl:spider  bind:m  get-bowl
  =/  tid
    (scot %ta (cat 3 (cat 3 'strand_' file) (scot %uv (sham file eny.bowl))))
  =/  poke-vase  !>(`start-args:spider`[`tid.bowl `tid beak file args])
  ;<  ~  bind:m  (poke-our %spider %spider-start poke-vase)
  ;<  ~  bind:m  (sleep ~s0)  ::  wait for thread to start
  (pure:m tid)
```

#### Example

```hoon
;<  now=@da  bind:m  get-time
;<  ~        bind:m  (start-thread-with-args [~zod %base da+now] %foo !>(~))
```

---

### `thread-result`

Type definition of a thread result.

#### Source

```hoon
+$  thread-result
  (each vase [term tang])
```

---

### `await-thread`

Start a thread with an argument, then await its result.

#### Accepts

A pair of `[term vase]` where `term` is the name of a thread in `/ted`
of this desk, and `vase` contains the start argument.

#### Produces

A [`thread-result`](#thread-result)

#### Source

```hoon
++  await-thread
  |=  [file=term args=vase]
  =/  m  (strand ,thread-result)
  ^-  form:m
  ;<  =bowl:spider  bind:m  get-bowl
  =/  tid  (scot %ta (cat 3 'strand_' (scot %uv (sham file eny.bowl))))
  =/  poke-vase  !>(`start-args:spider`[`tid.bowl `tid byk.bowl file args])
  ;<  ~      bind:m  (watch-our /awaiting/[tid] %spider /thread-result/[tid])
  ;<  ~      bind:m  (poke-our %spider %spider-start poke-vase)
  ;<  ~      bind:m  (sleep ~s0)  ::  wait for thread to start
  ;<  =cage  bind:m  (take-fact /awaiting/[tid])
  ;<  ~      bind:m  (take-kick /awaiting/[tid])
  ?+  p.cage  ~|([%strange-thread-result p.cage file tid] !!)
    %thread-done  (pure:m %& q.cage)
    %thread-fail  (pure:m %| ;;([term tang] q.q.cage))
  ==
```

#### Example

```hoon
;<  =thread-result  bind:m  (await-thread %foo !>(~))
```

---
