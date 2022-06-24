+++
title = "API Reference"
weight = 3
template = "doc.html"
+++

In this document we describe the public interface for Ames. Namely, we describe
each `task` that Ames can be `%pass`ed, and which `gift`(s) Ames can `%give` in return.

Some `task`s appear to have more than one arm associated to them, e.g. there are
four `+on-hear` arms. We denote this where it occurs, but always refer to the
`+on-hear:event-core` arm.

Ames `task`s can be naturally divided into two categories: messaging tasks and
system/lifecycle tasks.

## Messaging Tasks

### `%hear`

```hoon
[%hear =lane =blob]
```

`%hear` handles raw packet receipt.

This `task` only ever originates from Unix. It does the initial processing of a packet, namely by passing the raw packet information to `+decode-packet` which deserializes the packet and giving that data and the origin of the packet to `+on-hear-packet`, which begins the transformation of the packet into a new event in the form of a `+event-core`.

There are multiple `+on-hear` arms in `ames.hoon`. Here we refer to `+on-hear:event-core`, as that is the one called by a `%hear` `task`. The other ones are used primarily for ack and nack processing, or receiving message fragments.

`%hear` takes in a [$blob](/docs/arvo/ames/data-types#blob), which is essentially a large atom (around 1kB or less) that is the raw data of the message, and a [$lane](/docs/arvo/ames/data-types#lane), which is the origin of the message (typically an IP address).

#### Returns

`%hear` can trigger a number of possible returns. It can trigger the release of zero or more additional packets via `%send` `gift`s. It may also trigger a `%boon` or `%plea` `gift` (collectively referred to as a `%memo` within Ames) to a local vane in the case of a completed message.

### `%heed`

```hoon
[%heed =ship]
```

A vane can pass Ames a `%heed` `task` to request Ames track a peer's responsiveness. If our `%boon`s to it start backing up locally, Ames will `give` a `%clog` back to the requesting vane containing the unresponsive peer's Urbit address.

Stop tracking a peer by sending Ames a [%jilt](#jilt) `task`.

The `ship` field specifies the peer to be tracked.

#### Returns

If the `ship` is indeed being unresponsive, as measured by backed up `%boon`s,
Ames will `give` a `%clog` `gift` to the requesting vane containing the
unresponsive peer's urbit address.

### `%jilt`

```hoon
[%jilt =ship]
```

`%jilt` stops tracking a potentially unresponsive peer that was previously being
tracked as a result of the [%heed](#heed) `task`.

There are two `+on-jilt` arms, this `task` utilizes `+on-hear:event-core`.

The `ship` field specifies the peer we want to stop tracking.

#### Returns

This `task` returns no `gift`s.

### `%plea`

```hoon
[%plea =ship =plea:ames]
```

`%plea` is the `task` used to instruct Ames to send a message. It extends the
`%pass`/`%give` semantics across the network. As such, it is the most
fundamental `task` in Ames and the primary reason for its existence.

Ames also `pass`es a `%plea` `note` to another vane when it receives a message on a
"forward flow" from a peer, originally passed from one of the peer's vanes to the
peer's Ames.

Ultimately `%plea` causes `%send` `gift`(s) to be sent to Unix, which tells
Unix to send packets. In terms of `%pass`/`%give` semantics, this is in
response to the `%born` `task`, which came along the Unix `duct`, rather than a
response to the `%plea`.

A `%plea` `task` takes in the `ship` the `plea` is addressed to, and a [$plea](/docs/arvo/ames/data-types.md#plea).

#### Returns

This `task` returns no `gift`s.

## System Tasks

### `%born`

```hoon
[%born ~]
```

Each time you start your Urbit, the Arvo kernel calls the `%born` `task` for Ames.

#### Returns

In response to a `%born` `task`, Ames `%give`s Jael a `%turf` `gift`.

The `duct` along which `%born` comes is Ames' only duct to Unix, so `%send`
`gift`s (which are instructions for Unix to send a packet) are also returned in
response to `%born`.

### `%init`

```hoon
[%init ~]
```

`%init` is called a single time during the very first boot process, immediately
after the [larval stage](/docs/arvo/overview#larval-stage-core)
is completed. This initializes the vane. Jael is initialized first, followed by
other vanes such as Ames.

In response to receiving the `%init` `task`, Ames subscribes to the information
contained by Jael.

#### Returns

```hoon
=~  (emit duct %pass /turf %j %turf ~)
    (emit duct %pass /private-keys %j %private-keys ~)
```

`%init` sends two moves that subscribe to `%turf` and `%private-keys` in Jael.

### `%sift`

```hoon
[%sift ships=(list ship)]
```

This `task` filters debug output by ship. This `task` is used internally when the `|ames-sift` `hood` generator is run from the dojo.

The `ships` field specifies the ships for which debug output is desired.

#### Returns

This `task` returns no `gift`s.

### `%spew`

```hoon
[%spew veb=(list verb)]
```

Sets verbosity toggles on debug output. This `task` is used internally when the `|ames-verb` `hood` generator is run from the dojo.

`%spew` takes in a `list` of [$verb](/docs/arvo/ames/data-types#verb), which are verbosity flags for Ames.

`%spew` flips each toggle given in `veb`.

#### Returns

This `task` returns no `gift`s.

### `%stir`

```hoon
[%stir arg=@t]
```

A `%stir` `task` starts timers for any flows that lack them.

The `arg` field is unused.

#### Returns

This `task` returns no `gift`s.

### `%vega`

```hoon
[%vega ~]
```

`%vega` is called whenever the kernel is updated. Ames currently does not do
anything in response to this.

#### Returns

This `task` returns no `gift`s.
