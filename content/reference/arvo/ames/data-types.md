+++
title = "Data Types"
weight = 5
+++

Here are the data types used by Ames, as defined in `lull.hoon`.

## `$address`

```hoon
+$  address  @uxaddress
```

Opaque atomic transport address to or from Unix. For Ames over UDP, it will encode the IP address and port.

## `$verb`

```hoon
+$  verb  ?(%snd %rcv %odd %msg %ges %for %rot)
```

Verbosity flag for Ames. Use with `|ames-verb %flag1 %flag2 ...` and turn off with `|ames-verb`.

- `%snd` - Sending packets.
- `%rcv` - Receiving packets.
- `%odd` - Unusual events.
- `%msg` - Message-level events.
- `%ges` - Congestion control.
- `%for` - Packet forwarding.
- `%rot` - Routing attempts.

## `$blob`

```hoon
+$  blob  @uxblob
```

Raw atom to or from Unix, representing a packet.

## `$error`

```hoon
+$  error  [tag=@tas =tang]
```

Tagged diagnostic trace.

## `$lane`

```hoon
+$  lane  (each @pC address)
```

Ship transport address; either opaque [$address](#address) or galaxy. The runtime knows how to look up galaxies, so we don't need to know their transport addresses.

## `$plea`

```hoon
+$  plea  [vane=@tas =path payload=*]
```

Application-level message, as a `%pass`.

- `vane` - Destination vane on remote ship.
- `path` - Internal route on the receiving ship.
- `payload` - Semantic message contents.

## `$spar`

```hoon
+$  spar  [=ship =path]
```

Instead of a fully qualifying scry path, Ames infers rift and life based on the
ship.

## `$bone`

```hoon
+$  bone  @udbone
```

Message flow index - mapped to `duct`s in the [$ossuary](#ossuary).

The first `bone` is 0. They increment by 4, since each flow includes a bit for each message determining forward vs. backward and a second bit for whether the message is on the normal flow or the associated diagnostic flow (for naxplanations).

The least significant bit of a `bone` is:

- 1 if "forward", i.e. we send `%plea`s on this flow.
- 0 if "backward", i.e. we receive `%plea`s on this flow.

The second-least significant bit is 1 if the `bone` is a naxplanation `bone`, and 0 otherwise. Only naxplanation messages can be sent on a naxplanation `bone`, as `%boon`s.

## `$fragment`

```hoon
+$  fragment  @uwfragment
```

A message fragment.

## `$fragment-num`

```hoon
+$  fragment-num  @udfragmentnum
```

Message fragment count.

## `$message-blob`

```hoon
+$  message-blob  @udmessageblob
```

Unfragmented message blob.

## `$message-num`

```hoon
+$  message-num  @udmessagenum
```

Message count.

## `$public-key`

```hoon
+$  public-key  @uwpublickey
```

A peer's public key.

## `$symmetric-key`

```hoon
+$  symmetric-key  @uwsymmetrickey
```

A symmetric key for encrypting messages to a peer. This is produced by performing an elliptic curve Diffie-Hellman using our private key and the peer's public key.

## `$ack`

```hoon
+$  ack
  $%  [%ok ~]
      [%nack ~]
      [%naxplanation =error]
  ==
```

A message acknowledgement.

- `%ok` - Positive acknowledgement.
- `%nack` - Negative acknowledgement.
- `%naxplanation` - Nack trace.

## `$ship-state`

```hoon
+$  ship-state
  $%  [%alien alien-agenda]
      [%known peer-state]
  ==
```

All Ames knows about a peer.

- `%alien` - No PKI data, so enqueue actions to perform once we learn it.
- `%known` - We know their `life` and public keys, so we have a channel.

## `$alien-agenda`

```hoon
+$  alien-agenda
  $:  messages=(list [=duct =plea])
      packets=(set =blob)
      heeds=(set duct)
      keens=(jug path duct)
  ==
```

What to do when Ames learns a peer's life and keys.

- `messages` - [$plea](#plea)s local vanes have asked Ames to send.
- `packets` - Packets we've tried to send.
- `heeds` - Local tracking requests; passed through into [$peer-state](#peer-state).
- `keens` - Subscribers to remote scry paths.

## `$peer-state`

```hoon
+$  peer-state
  $:  $:  =symmetric-key
          =life
          =rift
          =public-key
          sponsor=ship
      ==
      route=(unit [direct=? =lane])
      =qos
      =ossuary
      snd=(map bone message-pump-state)
      rcv=(map bone message-sink-state)
      nax=(set [=bone =message-num])
      heeds=(set duct)
      closing=(set bone)
      corked=(set bone)
      keens=(map path keen-state)
  ==
```

State for a peer with known life and keys.

- `route` - Transport-layer destination for packets to the peer.
- `qos` - Quality of service; connection status to the peer.
- `ossuary` - [$bone](#bone) to `duct` mapper.
- `snd` - Per-`bone` message pumps to send messages as fragments.
- `rcv` - Per-`bone` message sinks to assemble messages from fragments.
- `nax` - Unprocessed nacks (negative acknowledgments).
- `heeds` - Listeners for `%clog` notifications.
- `closing`: Bones closed on the sender side.
- `corked`: Bones closed on both sender and receiver.
- `keens`: Remote scry state.

## `$keen-state`

```hoon
+$  keen-state
  $:  wan=((mop @ud want) lte)  ::  request packets, sent
      nex=(list want)           ::  request packets, unsent
      hav=(list have)           ::  response packets, backward
      num-fragments=@ud
      num-received=@ud
      next-wake=(unit @da)
      listeners=(set duct)
      metrics=pump-metrics
  ==
```

Remote scry state for a peer.

- `wan`: Request packets, sent.
- `nex`: Request packets, unsent.
- `hav`: Response packets, backwards.
- `num-fragments`: Total fragment count.
- `num-received`: Fragments received.
- `next-wake`: Retry timing.
- `listeners`: Ducts waiting for a response.
- `metrics`: Stats.

## `$want`

```hoon
+$  want
  $:  fra=@ud
      =hoot
      packet-state
  ==
```

Remote scry request fragment.

## `$have`

```hoon
+$  have
  $:  fra=@ud
      meow
  ==
```

Remote scry response fragment.

## `$meow`

```hoon
+$  meow
  $:  sig=@ux
      num=@ud
      dat=@ux
  ==
```

Remote scry response fragment data.

- `sig`: signature.
- `num`: number of fragments.
- `dat`: contents.

## `$peep`

```hoon
+$  peep
  $:  =path
      num=@ud
  ==
```

Remote scry fragment request.

## `$wail`

```hoon
+$  wail
  $%  [%0 peep]
  ==
```

Tagged remote scry request fragment.

## `$roar`

```hoon
+$  roar
  (tale:pki:jael (pair path (unit (cask))))
```

Remote scry response message.

A `tale:pki:jael` is a:

```hoon
++  tale                               ::  urbit-signed *
  |$  [typ]                            ::  payload mold
  $:  dat=typ                          ::  data
      syg=(map ship (pair life oath))  ::  signatures
  ==                                   ::
```

Therefore, a `$roar` looks like:

```
> *roar:ames
[dat=[p=/ q=~] syg=~]
```

In `dat`, for the `(pair path (unit (cask)))`, the `path` is the remote scry
path and the `(unit (cask))` contains the value, or is null if there's no value
at this path and will never be one (equivalent to the `[~ ~]` case of a local
scry).

## `$purr`

```hoon
+$  purr
  $:  peep
      meow
  ==
```

Response packet payload.

## `$qos`

```hoon
+$  qos
  $~  [%unborn *@da]
  [?(%live %dead %unborn) last-contact=@da]
```

Quality of service; how is the connection to a peer doing?

- `%live` - Peer is ok.
- `%dead` - Peer is not responding.
- `%unborn` - Peer is sunken.
- `last-contact` - Last time Ames heard from the peer, or if `%unborn`, the time when we first started tracking then.

## `$ossuary`

```hoon
+$  ossuary
  $:  =next=bone
      by-duct=(map duct bone)
      by-bone=(map bone duct)
  ==
```

[$bone](#bone) to `duct` mapping, `next` is the next `bone` to map to a `duct`.

## `$message-pump-state`

```hoon
+$  message-pump-state
  $:  current=_`message-num`1
      next=_`message-num`1
      unsent-messages=(qeu message-blob)
      unsent-fragments=(list static-fragment)
      queued-message-acks=(map message-num ack)
      =packet-pump-state
  ==
```

Persistent state for a `|message-pump`.

- `current`- Sequence number of earliest message sent or being sent.
- `next` - Sequence number of next message to send.
- `unsent-messages` - Messages to be sent after current message.
- `unsent-fragments` - Fragments of current message waiting for sending.
- `queued-message-acks` - Future message acks to be applied after current.
- `packet-pump-state` - State of corresponding `|packet-pump`.

## `$static-fragment`

```hoon
+$  static-fragment
  $:  =message-num
      num-fragments=fragment-num
      =fragment-num
      =fragment
  ==
```

A packet; a fragment of a message and metadata.

## `$packet-pump-state`

```hoon
+$  packet-pump-state
  $:  next-wake=(unit @da)
      live=(tree [live-packet-key live-packet-val])
      metrics=pump-metrics
  ==
```

Persistent state for a `|packet-pump`.

- `next-wake` - Last timer we've set, or null.
- `live` - Packets in flight; sent but not yet acked.
- `metrics` - Congestion control information.

## `$pump-metrics`

```hoon
+$  pump-metrics
  $:  rto=_~s1
      rtt=_~s1
      rttvar=_~s1
      ssthresh=_10.000
      cwnd=_1
      num-live=@ud
      counter=@ud
  ==
```

Congestion control state for a `|packet-pump`.

- `rto` - Retransmission timeout.
- `rtt` - Roundtrip time estimate, low-passed using EWMA.
- `rttvar` - Mean deviation of `rtt`, also low-passed with EWMA.
- `num-live` - How many packets sent, awaiting ack.
- `ssthresh` - Slow-start threshold.
- `cwnd` - Congestion window; max unacked packets.

## `$live-packet`

```hoon
+$  live-packet
  $:  key=live-packet-key
      val=live-packet-val
  ==
```

A packet in flight, as tracked in the [$packet-pump-state](#packet-pump-state).

## `$live-packet-key`

```hoon
+$  live-packet-key
  $:  =message-num
      =fragment-num
  ==
```

Identifier of a packet in flight.

## `$live-packet-val`

```hoon
+$  live-packet-val
  $:  packet-state
      num-fragments=fragment-num
      =fragment
  ==
```

Content and metadata about a packet in flight.

## `$packet-state`

```hoon
+$  packet-state
  $:  last-sent=@da
      retries=@ud
      skips=@ud
  ==
```

Sending statistics about a packet in flight.

## `$message-sink-state`

```hoon
+$  message-sink-state
  $:  last-acked=message-num
      last-heard=message-num
      pending-vane-ack=(qeu [=message-num message=*])
      live-messages=(map message-num partial-rcv-message)
      nax=(set message-num)
  ==
```

State of a `|message-sink` to assemble received messages.

- `last-acked` - Highest [$message-num](#message-num) Ames has fully acknowledged.
- `last-heard` - Highest `message-num` Ames has heard all fragments for.
- `pending-vane-ack` - Heard but not processed by local vane.
- `live-messages` - Partially received messages.

## `$partial-rcv-message`

```hoon
+$  partial-rcv-message
  $:  num-fragments=fragment-num
      num-received=fragment-num
      fragments=(map fragment-num fragment)
  ==
```

A message for which Ames has received some fragments.

- `num-fragments` - Total number of fragments in the message.
- `num-received` - How many fragments Ames has received so far.
- `fragments` - The received fragments themselves.
