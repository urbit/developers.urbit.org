+++
title = "Eyre noun channels"
description = "A low-level overview of talking to Eyre's channel system in noun mode."
weight = 40
+++

So far, developers have typically used JSON to interact with Urbit ships through
Eyre's HTTP interface. As of kernel version `[%zuse 413]`, however, Eyre also
supports sending and received nouns directly. At this stage, there are limited
options for dealing with nouns in other languages, so this guide will only cover
the channel mechanics on a low-level. You may, however, be interested in the
[`@urbit/nockjs`](https://github.com/urbit/nockjs) package and the
work-in-progress [`json-bgon` PR for
`@urbit/js-http-api`](https://github.com/urbit/js-http-api/pull/4).

{% callout %}

If you are not familiar with low-level Eyre channel mechanics, please have a
read through the [Eyre guide](/reference/arvo/eyre/guide) first.

{% /callout %}

Eyre will create a noun channel if a `PUT` request to open a new channel
includes the following HTTP header:

```
content-type: application/x-urb-jam
```

...and the body contains the [`++jam`](/reference/hoon/stdlib/2p#jam) of a
`list` of `$channel-request`s with
[`@uw`](/reference/hoon/auras#table-of-auras) base64 encoding.

A `channel-request` is defined in `eyre.hoon` as:

```hoon
::  channel-request: an action requested on a channel
::
+$  channel-request
  $%  ::  %ack: acknowledges that the client has received events up to :id
      ::
      [%ack event-id=@ud]
      ::  %poke: pokes an application, validating :noun against :mark
      ::
      [%poke request-id=@ud ship=@p app=term mark=@tas =noun]
      ::  %poke-json: pokes an application, translating :json to :mark
      ::
      [%poke-json request-id=@ud ship=@p app=term mark=@tas =json]
      ::  %watch: subscribes to an application path
      ::
      [%subscribe request-id=@ud ship=@p app=term =path]
      ::  %leave: unsubscribes from an application path
      ::
      [%unsubscribe request-id=@ud subscription-id=@ud]
      ::  %delete: kills a channel
      ::
      [%delete ~]
  ==

```
So, given the following (trivial) `(list channel-request)`:

```hoon
[%delete ~]~
```

...it is jammed to the following HEX:

```
0xACAE8CAD8CAC8F805
```

...then encoded in the following `@uw`-style base64 string in the request body:

```
0w2I.HEOJz.aOfw5
```

If the body of the request is not correctly encoded as described above, it will
fail with a `400` status.

If successful, you can then make a `GET` request to open an event stream for the
newly created channel. The `GET` request must include the following header:

```
x-channel-format: application/x-urb-jam
```

If the `GET` request is for an existing channel which is not already in noun
mode, it will fail with a `406` status code. You cannot change the channel mode
once the channel has been established. If the header is missing, Eyre will
assume you're asking for JSON mode, so it will also fail due to the channel mode
mismatch.

If the `GET` request is successful, you'll start receiving SSE events containing `@uw`-encoded jams of the following structure:

```hoon
[request-id=@ud channel-event]
```

See the [`$channel-event`](/reference/arvo/eyre/data-types#channel-event) entry
in the data type reference for more details.
