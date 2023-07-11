+++
title = "API Reference"
weight = 3
+++

## Agent Notes

A `note` is a request to a vane or agent which you initiate. A `note` is
one of:

```hoon
+$  note
  $%  [%agent [=ship name=term] =task]
      [%arvo note-arvo]
      [%pyre =tang]
  ::
      [%grow =spur =page]
      [%tomb =case =spur]
      [%cull =case =spur]
  ==
```

A `note` is always wrapped in a `%pass` `card`, like so:

```hoon
[%pass p=wire q=note]
```

The `wire` is just a `path` like `/foo/bar/baz`. You use it as a tag to
identify responses.

The possible cases of an `%agent` `note` are documented [separately
below](#agent-tasks).

We'll look at the remaining cases here.

### `%arvo`

Pass a vane `task` to a vane (kernel module).

```hoon
[%arvo note-arvo]
```

A `note-arvo` is defined as the following:

```hoon
+$  note-arvo
  $~  [%b %wake ~]
  $%  [%a task:ames]
      [%b task:behn]
      [%c task:clay]
      [%d task:dill]
      [%e task:eyre]
      [%g task:gall]
      [%i task:iris]
      [%j task:jael]
      [%k task:khan]
      [%$ %whiz ~]
      [@tas %meta vase]
  ==
```

The first part is vane letter (`%g` for Gall, `%i` for Iris, etc). The
second part is a `task` belonging to that vane.

---

### `%pyre`

Abort event.

```hoon
[%pyre =tang]
```

This `note` tells Gall to crash with the given `tang` in the stack
trace. You'd use it in `++on-load` or `++on-init` when you wanted the
upgrade/installation to fail under some condition.

---

### `%grow`

Publish remote scry file.

```hoon
[%grow =spur =page]
```

The `spur` is the `path` the file should be published at. The revision
number will be determined implicitly. As an example, if the `spur` was
`/foo`, the agent `%bar`, and it was the first revision, the resulting
remote scry path would be `/g/x/0/bar//foo`

The `page` is the file, a pair of `[p=mark q=noun]`.

---

### `%tomb`

Delete remote scry file.

```hoon
[%tomb =case =spur]
```

The `case` is the file revision, for example `[%ud 3]`. The spur is the
`path` it's bound to, for example `/foo`.

The file at the specified `spur` and specific `case` will be deleted and
replaced by a simple hash.

---

### `%cull`

Delete remote scry file up to the given revision.

```hoon
[%cull =case =spur]
```

All revisions of the remote scry file published at the `path` in `spur`
up to and including the revision specified in `case` will be deleted.
For example, if the `case` is `[%ud 2]`, then revisions `0`, `1`, and
`2` will all be deleted.

---

## Agent Tasks

A `task` is a request to an agent you initiate, as opposed to a
[`gift`](#agent-gifts), which is a response.

Passing an agent `task` looks like so:

```hoon
[%pass p=wire q=[%agent [=ship name=term] =task]]
```

- `wire`: this is just a `path` like `/foo/bar/baz`. You use it as a tag
  to identify any [`gift`](#agent-gifts) that come back in response.
- `ship`: is the ship to pass the `task` to.
- `name`: is the name of the agent on the specified ship that should
  receive the `task`.
- `task`: the `task` itself, as described below.

### `%watch`

Subscribe to a path on an agent for updates.

```hoon
[%watch =path]
```

The `path` is a subscription `path` like `/foo/bar/baz` which the
receiving agent publishes updates on. The publisher's Gall will
automatically respond with a [`%watch-ack`](#watch-ack). The
`%watch-ack` will be positive (an "ack") if the agent did not crash
processing the `%watch`, and will be negative (a "nack") if it crashed.

Assuming the subscription request was successful (and therefore the
`%watch-ack` was positive), the publisher will begin sending updates as
[`%fact`](#fact) `gift`s to the subscriber. The publisher will continue
sending updates until the subscriber [`%leave`](#leave)s or the
publisher [`%kick`](#kick)s them.

---

### `%watch-as`

Subscribe to a path on an agent for updates, asking for the updates to
have a specified `mark`.

```hoon
[%watch-as =mark =path]
```

The `path` is a subscription `path` like `/foo/bar/baz` which the
receiving agent publishes updates on. The `mark` is the `mark` you want
the publisher to use for the data it gives you in the updates.

This behaves the same as an ordinary [`%watch`](#watch) request, except
the publisher's Gall will try to convert from the `mark` of the `%fact`s
the agent produced to the `mark` you specified before sending it off. If
the publisher's Gall is unable to perform the mark conversion, you'll
get [`%kick`](#kick)ed from the subscription, and they'll send
themselves a [`%leave`](#leave) on your behalf.

---

### `%leave`

Unsubscribe from a subscription path on an agent.

```hoon
[%leave ~]
```

The subscription to end is determined by the `wire`, `ship` and agent
`name` in the `%pass` `card` this is wrapped in. That is, if you
originally subscribed to subscription path `/foo/bar/baz` in agent
`%foo` on ship `~zod` using `wire` `/x/y/z`, you'd unsubscribe by
specifying `/x/y/z`, `~zod` and `%foo`.

Once sent, you'll stop receiving `%fact`s from the publisher for the
subscription in question.

---

### `%poke`

A one-off request/datagram to an agent.

```hoon
[%poke =cage]
```

A `%poke` `task` is a one-off, unsolicited delivery of some data. This
is in contrast to a [`%fact`](#fact) `gift`, the other basic method of
passing data between agents, which is ultimately a solicited response to
a past [`%watch`](#watch) request for subscription updates. Unlike a
`%watch` request, the recipient of the `%poke` cannot directly send data
back to the `%poke`-er (though they could conceivably send a new,
separate `%poke` back). The only response you get to a `%poke` is a
[`%poke-ack`](#poke-ack), indicating a simple success/failure result.

The data of the `%poke` is contained in the `cage`, which is a pair of
`[p=mark q=vase]`. It's the basic way to pass around dynamically typed
data.

---

### `%poke-as`

A one-off request/datagram to an agent, asking the recipient's Gall to
convert the data to the specified `mark` before delivering it to the
agent.

```hoon
[%poke-as =mark =cage]
```

This behaves the same as an ordinary [`%poke`](#poke) but with
additional `mark` conversion to the `mark` you specify by the
recipient's Gall.

The `mark` is the `mark` you want the `cage` converted *to* before
delivery to the agent. The `cage` is the data itself, a pair of `[p=mark
q=vase]`. The mark conversion will be performed by the recipient's Gall,
not the sender's.

If the `mark` conversion fails, the sender will be sent a negative
[`%poke-ack`](#poke-ack) (nack). Otherwise, the recipient will receive a
`%poke` with the target `mark` specified.

---

## Agent Gifts

An agent `gift` is ultimately a response to an agent `task`. Sometimes
it's an immediate, direct response, and other times it happens down the
line, or there's an ongoing series of gifts, as in the case of
subscriptions. They do all ultimately arise from an original `task`,
though, be it a a `%watch` subscription request or a `%poke`. A `gift`
cannot be sent out unsolicited to other agents. Where they are routed
to, whether another local agent, an agent on a remote ship, or even to
vanes or a browser-based front-end in some cases, is determined by the
original `task`.

Giving a gift takes the general form of:

```hoon
[%give p=gift]
```

Each possible `gift` is detailed below.

### `%fact`

Produce a subscription update.

```hoon
[%fact paths=(list path) =cage]
```

A `%fact` is a piece of data given to all subscribers on one or more
subscription paths.

The fields are:

- `paths`: a list of subscription paths to send the update on. In
  `+on-watch` alone, if no path is given, then the update is given
  exclusively to the source of the `%watch` request. This is useful for
  giving initial state to new subscribers. In other contexts, one or
  more subscription paths should be provided.
- `cage`: the data. A `cage` is a pair of `[p=mark q=vase]`.

---

### `%kick`

Close subscription.

```hoon
[%kick paths=(list path) ship=(unit ship)]
```

If `ship` is null, all subscribers will be kicked from the specified
subscription `paths` and will stop receiving updates. If `ship` is
non-null, only the specified ship will be kicked from the given `paths`.

It should be noted that `%kick` `gift`s are not *only* emitted
intentionally by the publishing agent. Gall itself will `%kick` remote
subscribers if too many undelivered outbound `%fact`s queue up due to
network connectivity problems. On the subscriber side, their Gall will
`%kick` themselves if they crash while processing an incoming `%fact`.
It should therefore not be assumed the `%kick` was intentional.
Typically agents will be designed to resubscribe on `%kick` with a new
`%watch`, only giving up on negative `%watch-ack`. You should be careful
with automatic resubscribe logic, though, because you can inadvertently
create a network loop of infinite resubscribes and kicks if, for
example, a crash on `%fact` is repeatable.

---

### `%watch-ack`

Acknowledge a subscription request.

```hoon
[%watch-ack p=(unit tang)]
```

A `%watch-ack` is automatically given by Gall in response to a `%watch`
`task`. A `%watch-ack` is either positive (an "ack") or negative (a
"nack"). It's an ack when `p` is null, and a nack when `p` is non-null,
instead containing a stack trace.

A `%watch-ack` is given *automatically* and *implicitly* by Gall itself,
it is unnecessary for an agent to emit one explicitly. An ack will be
given as long as `++on-watch` doesn't crash. A nack will be given if it
*does* crash, with a trace of the crash in `p`. Your agent should
therefore be designed to accept or reject a subscription request by
crashing or not crashing, respectively.

---

### `%poke-ack`

Acknowledge a poke.

```hoon
[%poke-ack p=(unit tang)]
```

A `%poke-ack` is automatically given by Gall in response to a `%poke`
`task`. A `%poke-ack` is either positive (an "ack") or negative (a
"nack"). It's an ack when `p` is null, and a nack when `p` is non-null,
instead containing a stack trace.

A `%poke-ack` is given *automatically* and *implicitly* by Gall itself,
it is unnecessary for an agent to emit one explicitly. An ack will be
given as long as `++on-poke` doesn't crash. A nack will be given if it
*does* crash, with a trace of the crash in `p`. Your agent should
therefore be designed to accept or reject a poke by crashing or not
crashing, respectively.

---

## Vane Tasks

These are the Vane `task`s that can be `%pass`ed to Gall itself in an
`%arvo` `note`. Most of these are only used internally by the kernel,
though some app management `task`s might be of use in userspace.

### `%deal`

Full transmission.

```hoon
[%deal p=sock q=term r=deal]
```

Gall translates agent
[`task:agent`](/reference/arvo/gall/data-types#taskagent)s emitted by
agents into `%deal` tasks, as well as requests from over the network.
This `task` is kernel-level only, it cannot be used directly from
userspace.

Its fields are:

- `p`: A `sock`, a `(pair ship ship)`, the sending and receiving ships.
- `q`: The source agent.
- `r`: A [`deal`](/reference/arvo/gall/data-types#deal) is either a
  [`task:agent`](/reference/arvo/gall/data-types#taskagent) or a
  `%raw-poke`. This is the request itself.

#### Returns

Gall returns no `gift` in response to a `%deal`.

---

### `%sear`

Clear pending queues.

```hoon
[%sear =ship]
```

This `task` clears blocked inbound `move`s from the given ship. Moves
get blocked and queued when sent to an agent that isn't currently
running.

#### Returns

Gall returns no `gift` in response to a `%sear`.

---

### `%jolt`

Restart agent (deprecated).

```hoon
[%jolt =desk =dude]
```

Restart agent `dude` on desk `desk`. This `task` is deprecated and now a
no-op.

#### Returns

Gall returns no `gift` in response to a `%jolt`.

---

### `%idle`

Suspend agent.

```hoon
[%idle =dude]
```

The agent specified in `dude` will be suspended. Note it is usually
better to suspend agents with a
[`%rein`](/reference/arvo/clay/tasks#rein---force-apps) `task` to Clay
rather than an `%idle` `task` to Gall.

#### Returns

Gall returns no `gift` in response to an `%idle`.

---

### `%load`

Load agents.

```hoon
[%load =load]
```

This `task` is given to Gall by Clay. It contains the compiled agents to
be installed or updated. This `task` would not be used from userspace.

See the [`load`](/reference/arvo/gall/data-types#load) entry in the
type reference for more details of the datastructure in this `task`.

#### Returns

Gall returns no `gift` in response to a `%load`.

---

### `%nuke`

Delete agent.

```hoon
[%nuke =dude]
```

The agent in `dude` will be stopped and its state discarded.

{% callout %}

**WARNING:** This will irreversibly erase all data stored in the state
of the agent. Use with care and caution.

{% /callout %}

#### Returns

Gall returns no `gift` in response to a `%nuke`.

---

### `%doff`

Kill old-style subscriptions.

```hoon
[%doff dude=(unit dude) ship=(unit ship)]
```

Kills nonceless outgoing subscriptions. If `dude` is non-null, it only
applies to the specified agent. If the `ship` is non-null, it only
applies to subscriptions to the specified ship. Otherwise, it applies to
all subscriptions.

You're unlikely to use this `task` from userspace.

#### Returns

Gall returns no `gift` in response to a `%doff`.

---

### `%rake`

Reclaim old subscriptions.

```hoon
[%rake dude=(unit dude) all=?]
```

This sends an Ames `%cork` on any old subscription ducts. If `dude` is
null, it applies to all agents, otherwise to the specified one. The
`all` flag should only be set if you want the ship to try and kill an
old subscription at sub-nonce zero.

You are unlikely to use this `task`.

#### Returns

Gall returns no `gift` in response to a `%rake`.

---

### `%spew`

Set verbosity.

```hoon
[%spew veb=(list verb)]
```

This sets verbosity flags for Gall. Currently there's only one
[`verb`](/reference/arvo/gall/data-types#verb), `%odd`, which prints
messages for unusual error cases. This overwrites the existing verbosity
settings: an empty list will turn all verbosity flags off.

#### Returns

Gall returns no `gift` in response to a `%spew`.

---

### `%sift`

Filter verbose debug printing to certain agents.

```hoon
[%sift dudes=(list dude)]
```

The `dudes` are the agents you want verbose debug printing for. An empty
list enables it for all agents. See [`%spew`](#spew) for setting
verbosity.

#### Returns

Gall returns no `gift` in response to a `%sift`.

---

