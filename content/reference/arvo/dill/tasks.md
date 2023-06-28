+++
title = "API Reference"
weight = 2
+++

In this document we describe the public interface for Dill. Namely, we
describe each `task` that Dill can be `pass`ed, and which `gift`(s) Dill
can `give` in return.

Dill's `task`s are organized into three categories: [Session
`task`s](#session-tasks) for interacting with a particular session,
[Told `task`s](#told-tasks) for basic terminal printing, and
[system/miscellaneous `task`s](#system-misc-tasks) which are a combination of
general system `task`s and Dill `task`s which don't fit in the previous
two categories.

## System & Misc. Tasks

These are the Dill `task`s not otherwise categorized as [session
tasks](#session-tasks) or [told tasks](#told-tasks). Most of them are
interfaces for Vere or Arvo and do thing like toggle verbose mode,
defragment state, etc. The most notable Dill-specific `task` is
[`%shot`](#shot), which is used as a wrapper for the [session
tasks](#session-tasks) to specify the session. The [`%logs`](#logs)
`task` is also useful, letting you subscribe to all system output.

### `%boot`

```hoon
[%boot lit=? p=*]
```

This `task` is used only once, when Arvo first enters the [adult
stage](/reference/arvo/overview#structural-interface-core). Dill is
technically the first vane to be activated, via the `%boot` `task`,
which then sends Jael (considered the "true" first vane) the `%dawn` or
`%fake` `task` wrapped in the `%boot` `task`. Jael then goes on to call
`%init` `task`s for other vanes (including Dill).

`lit` specifies whether to boot in lite mode. `p` is either a
[%dawn](/reference/arvo/jael/tasks#dawn) or
[%fake](/reference/arvo/jael/tasks#fake) `task:jael`. `%dawn` is for an
ordinary boot and `%fake` is for booting a fake ship.

This `task` would not be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%boot` `task`, but it will
`%pass` the wrapped `%dawn` or `%fake` `task` to Jael.

---

### `%crop`

Trim kernel state.

```hoon
[%crop p=@ud]
```

This `task` is the same as the `%trim` vane `task`. Like `%trim`, Dill
does nothing with it.

#### Returns

Dill returns no `gift` in response to a `%crop` `task`.

---

### `%flog`

```hoon
[%flog p=flog]
```

A `%flog` `task` is a wrapper over a `task` sent by another vane. Dill
removes the wrapper and sends the bare `task` to itself over the default
`duct`.

A `%flog` `task` takes a [$flog](/reference/arvo/dill/data-types#flog)
as its argument. A `$flog` is a subset of Dill's `task`s.

#### Returns

Dill does not return a `gift` in response to a `%flog` `task`.

---

### `%heft`

Produce memory report.

```hoon
[%heft ~]
```

When Dill receives a `%heft` `task` it passes Arvo a `%whey` `waif` to
obtain a memory report and prints it to the terminal.

#### Returns

Dill does not return a `gift` in response to a `%heft` `task`.

---

### `%logs`

Watch system output.

```hoon
[%logs p=(unit ~)]
```

A non-null `p` subscribes to system output, and a null `p` unsubscribes.
While subscribed, you'll receive each piece of output in a `%logs` gift
as it occurs.

#### Returns

Dill does not immediately return anything, but will give you a `%logs`
gifts each time system output occurs. A `%logs` gift looks like:

```hoon
[%logs =told]
```

A `$told` is either a [`%crud`](#crud), [`%talk`](#talk) or
[`%text`](#text) task. See the
[`$told`](/reference/arvo/dill/data-types#dill-belt) entry in the data
types reference for more details.

---

### `%meld`

Deduplicate persistent state.

```hoon
[%meld ~]
```

Dill asks the runtime to perform the memory deduplication.

#### Returns

Dill does not return a `gift` in response to a `%meld` `task`.

---

### `%pack`

Defragment persistent state.

```hoon
[%pack ~]
```

Dill asks the runtime to perform the defragmentation.

#### Returns

Dill does not return a `gift` in response to a `%meld` `task`.

---

### `%seat`

Install desk.

```hoon
[%seat =desk]
```

This indirectly pokes `%hood` with a `%kiln-install` `mark` to install
the specified `desk`. You should just poke `%hood` directly rather than
using this.

#### Returns

Dill does not return a `gift` in response to a `%seat` `task`.

---

### `%shot`

Task for session.

```hoon
[%shot ses=@tas task=session-task]
```

A `$session-task` is one of these `task`s: [`%belt`](#belt),
[`%blew`](#blew), [`%flee`](#flee), [`%hail`](#hail), [`%open`](#open),
[`%shut`](#shut), [`%view`](#view). See the
[`$session-task`](/reference/arvo/dill/data-types#session-task) entry in
the data types reference.

---

### `%verb`

Toggle Arvo verbose mode.

```hoon
[%verb ~]
```

This `task` toggles verbose mode for all of Arvo, which is located here
since Dill is the vane that prints errors. To be precise, `%verb`
toggles the laconic bit `lac` in the [Arvo
state](/reference/arvo/overview#the-state) by passing a `%verb` `waif`
to Arvo.

#### Returns

Dill does not return a `gift` in response to a `%verb` `task`.

---

## Session Tasks

These `task`s are for interacting with a particular session. These all
would normally be wrapped in a [`%shot`](#shot) `task` to specify the
session, rather than sent directly.

This subset of Dill's `task`s are defined in the [`$session-task`
type](/reference/arvo/dill/data-types#session-task).

### `%belt`

Terminal input.

```hoon
[%belt p=belt]
```

The [$belt](/reference/arvo/dill/data-types#belt) in `p` contains the
input such as which key was pressed. Dill will convert the `$belt` into
a [$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke` it
into the session handler agent for the session in question.

This `task` should be wrapped in a [`%shot`](#shot) `task` to specify
the session. Without the `%shot` wrapper, it will use the default
session (`%$`).

#### Returns

Dill returns no `gift` in response to a `%belt` `task`.

---

### `%blew`

Terminal resized.

```hoon
[%blew p=blew]
```

The [$blew](/reference/arvo/dill/data-types#blew) specifies the new
dimensions.

Dill will convert the `$blew` into a `%rez`
[$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke`s the
session handler (typically `drum`) with it.

This `task` would not typically be used from userspace. Instead, it
would come in from the runtime for the default session (`%$`) when the
actual terminal were resized. If in an odd scenario it were used from
userspace, it would need to be wrapped in a [`%shot`](#shot) `task` to
specify a session other than `%$`.

#### Returns

Dill returns no `gift` in response to a `%blew` `task`.

---

### `%flee`

Unwatch a session to which you've previously subscribed with
[%view](#view).

```hoon
[%flee ~]
```

This `task` must be wrapped in a [`%shot`](#shot) `task` in order to
specify the session. Without that, it will default to the default
session (`%$`). The subscription to end will be determined implicitly by
the `duct`.

#### Returns

Dill does not return a `gift` in response to a `%flee` `task`.

---

### `%hail`

Refresh.

```hoon
[%hail ~]
```

Dill converts a `%hail` `task` into a `%hey`
[$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke`s the
session handler (typically `%drum`) with it.

This `task` would not typically be used from userspace. If in an odd
scenario it were used from userspace, it would need to be wrapped in a
[`%shot`](#shot) `task` to specify a session other than `%$`.

#### Returns

Dill returns no `gift` in response to a `%hail` `task`.

---

### `%open`

Setup session.

```hoon
[%open p=dude:gall q=(list gill:gall)]
```

This `task` is always wrapped in a [`%shot`](#shot) `task`, and creates
the new session specified in that wrapper. If it's not wrapped in a
`%shot` task, it will default to the default session (`%$`) and fail
because it already exists. This `task` is designed to be used by a
userspace session handler like `%drum` that multiplexes terminal
interfaces for multiple userspace applications, but could also be used
by a stand-alone application that talks to Dill directly.

The Gall agent specified in `p` is the session handler or stand-alone
application. The `q` field contains a list of `gill:gall`, which are
pairs of `[ship term]`, representing an app on a ship. The `gill`s in
`q` are the list of apps being managed by the session handler `q` that
should be notified of being connected to this session. If `p` were a
stand-alone application, `q` could be empty, or else just contain that
one app.

Dill will poke every agent listed in  `q` (local or remote) with a
[`%yow` `$dill-belt`](/reference/arvo/dill/data-types#dill-belt), to let
it know it's been connected. It will also `%watch` the agent `p` for
[`$dill-blit`](/reference/arvo/dill/data-types#dill-blit)s in `%fact`s
with a `%dill-blit` `mark` on the `path` `/dill/[ses]` where `ses` is
the session specified in the [`%shot`](#shot) wrapper.

Additionally, the source of the `%open` request (as determined by the
`duct`, typically the agent in `p`) will begin receiving terminal output
gifts for the session in question. Essentially, it behaves as though you
also passed it a [`%view`](#view) task.

#### Returns

Dill does not give a `gift` in direct response to an `%open` `task`. It
will, however, start giving terminal output `%blit` `gift`s to the
requester as the occur for the session. A `%blit` `gift` looks like:

```hoon
[%blit p=(list blit)]
```

See the [`$blit`](/reference/arvo/dill/data-types#blit) entry in the
data type reference for details of what it can contain.

This subscription for `$blit`s can be stopped with a [`%flee`](#flee)
`task` at any time.

---

### `%shut`

Close session.

```hoon
[%shut ~]
```

This `task` needs to be wrapped in [`%shot`](#shot) `task` to specify
the session to close. Otherwise, it will default to the default session
(`%$`).

The session handler will be passed a `%leave`. Subscribers for `$blit`s
will not be notified, they'll just stop receiving `$blit`s.

#### Returns

Dill does not give a `gift` in response to a `%shut` `task`. It will,
however, pass a `%leave` to the session handler agent.

---

### `%view`

Watch session.

```hoon
[%view ~]
```

A `%view` `task` subscribes for a copy of all `%blit` `gift`s which Dill
`%give`s for the session in question. This `task` must be wrapped in a
[`%shot`](#shot) `task` which specifies the session if you want to
subscribe to anything other than the default session (`%$`).

#### Returns

Dill will begin giving a copy of all `%blit`s for the session specified
in the [`%shot`](#shot) wrapper, or the default session (`%$`) if a
`%shot` wrapper is not used. A `%blit` `gift` is:

```hoon
[%blit p=(list blit)]
```

See the [`$blit`](/reference/arvo/dill/data-types#blit) entry in the
data type reference for more details.

The subscription can be ended with a [`%flee`](#flee) `task`.

---

## Told Tasks

This subset of Dill `task`s are for printing things. They are defined in
the [`$told` type](/reference/arvo/dill/data-types#told).

### `%crud`

Print error.

```hoon
[%crud p=@tas q=tang]
```

Dill prints the given error to the terminal.

#### Returns

Dill does not return a `gift` in response to a `%crud` `task`.

---

### `%talk`

Print `tang` to terminal.

```hoon
[%talk p=(list tank)]
```

The `tank`s in `p` will be printed to the terminal, first to last.

#### Returns

Dill does not return a `gift` in response to a `%talk` `task`.

---

### `%text`

Print `tape` to terminal.

```hoon
[%text p=tape]
```

The `tape` in `p` will be printed to the terminal.

#### Returns

Dill does not return a `gift` in response to a `%text` `task`.

---

