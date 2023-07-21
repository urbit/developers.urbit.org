+++
title = "API Reference"
weight = 2
+++

In this document we describe the public interface for Lick. Namely, we
describe each `task` that Lick can be `pass`ed, and which `gift`(s) Lick
can `give` in return.

The only novel data type is `name`, which is just a `path` representing
the name of a socket.

## Tasks

Lick's `task`s are documented below. Some of them are only used by the
kernel or Vere. The ones you'd use from userspace are [`%spin`](#spin`),
[`%shut`](#shut), and [`%spit`](#spit).

### `%born`

New Unix process.

```hoon
[%born ~]
```

Each time you start your urbit, the Arvo kernel passes a `%born` task to
Lick. When called, Lick will send every IPC port in it state to Vere
and send a `%disconnect` `%soak` to each IPC port owner.

This `task` would not be used from userspace.

#### Returns

Lick may give [`%spin`](#spin-1) gifts to Vere and [`%soak`](#soak-1)
gifts with a `mark` and `noun` of `[%disconnect ~]` to agents.

---

### `%spin`

Open an IPC port.

```hoon
[%spin =name]
```

Lick takes in a `path` and saves the `duct` that sent it as the owner,
then forwards the call to Vere. Vere will open a socket with the given
`name` on the host OS.

#### Returns

Lick sends a [`%spin`](#spin-1) gift to Vere in response to a `%spin`
task.

#### Example

See the [example agent](/reference/arvo/lick/examples).

---

### `%shut`

Close an IPC port.

```hoon
[%shut =name]
```

Lick takes a socket `path` and removes it from its state. It also
forwards the `path` to Vere which disconnects the socket from anything
connected to it and closes it.

#### Returns

Lick gives a [`%shut`](#shut-1) gift to Vere in response to a `%shut`
task.

#### Example

See the [example agent](/reference/arvo/lick/examples).

---

### `%spit`

Send a noun to the IPC port. 

```hoon
[%spit =name =mark =noun]
```

Lick will send the jammed `[mark noun]` cell to the socket `name` if
something is connected to it. If nothing is connected to the port, Lick
will send an `%error` [`%soak`](#soak-1) to the port's owner.

#### Returns

Lick forwards the contents of the task as a [`%soak`](#soak-1) gift to
Vere.

#### Example

See the [example agent](/reference/arvo/lick/examples).

---

### `%trim`

Trim state (no-op).

```hoon
[%trim ~]
```

This `task` is sent by Arvo in order to free up memory. Lick does not do
anything with this `task`, since it is not a good idea to forget your
IPC ports.

#### Returns

Lick does not return any `gift` in response to a `%trim` task.

---

### `%vega`

```hoon
[%vega ~]
```

This `task` informs the vane that the kernel has been upgraded. Lick
does not do anything in response to this.

You would not use this `task` from userspace.

#### Returns

Lick does not return any `gift` in response to a `%vega` task.

---

### `%soak`

Receive data from outside.

```hoon
[%soak =name =mark =noun]
```

This `task` is sent to Lick by the runtime, you would not use it
manually.

The socket `name` is associated with the `duct` that registered it. The
`%soak` is forwarded to it as a [`%soak`](#soak-1) gift.

---

## Gifts

Below are the `gift`s that Lick can give. Only the [`%soak`](#soak-1)
gift would be given to an agent, the rest are only given to Vere.

### `%spin`

Open an IPC port.

```hoon
[%spin =name]
```

Lick gives this `gift` to Vere in order to register a socket with the
`path` specified in `name`.

---

### `%shut`

Close an IPC port.

```hoon
[%shut =name]
```

Lick gives this `gift` to Vere in order to close and remove the socket
with the `path` specified in `name`.

---

### `%spit`

Spit a noun to the IPC port.

```hoon
[%spit =name =mark =noun]
```

Lick converts a [`%spit` task](#spit) to this `gift` and gives it to
Vere.

---

### `%soak`

Soak a noun from the IPC port.

```hoon
[%soak =name =mark =noun]
```

Lick converts a [`%soak` task](#soak) from Vere into this `gift` and
gives it to the agent that registered the `name` socket, representing an
incoming message. It will also give a `%soak` with a `mark` and `noun`
of `[%disconnect ~]` if the socket is closed. This is the only Lick
`gift` an agent would receive.

---
