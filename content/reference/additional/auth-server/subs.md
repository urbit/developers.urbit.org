+++
title = "Subscriptions"
weight = 12
template = "doc.html"
+++

Below are all the paths you can subscribe to in Auth Server.

## `/new/...`

Subscription paths beginning with `/new` will not give you any initial state,
you'll just get events that happen after you've subscribed.

### `/new/all`

Subscribe for all new updates.

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur.

---

### `/new/all/since/[time]`

Subscribe for all new updates since the given Unix millisecond time.

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
the occur, but only for those with timestamps later than the one specified.

#### Example

```
/new/all/since/1678658855227
```

---

### `/new/turf/[turf]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/auth-server/types#turf) (domain).

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/new/turf/wood/[turf]` path instead.

{% /callout %}

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
they occur, as long as they're for the specified `turf`.

#### Example

For `example.com`:

```
/new/turf/example.com
```

For `foo.bar-baz.com`:

```
/new/turf/foo.bar-baz.com
```

---

### `/new/turf/[turf]/since/[time]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/auth-server/types#turf) (domain), since the given Unix millisecond time.

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/new/turf/wood/[turf]/since/[time]` path instead.

{% /callout %}

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
they occur, as long as they're for the specified `turf` and their timestamp is
sooner than the one specified in the path.

#### Example

```
/new/turf/example.com/since/1678658855227
```

---

### `/new/turf/wood/[turf]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/auth-server/types#turf) (domain), with [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).


#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
they occur, as long as they're for the specified `turf`.

#### Example

For `example.com`:

```
/new/turf/example~.com
```

For `foo.bar-baz.com`:

```
/new/turf/foo~.bar-baz~.com
```

---

### `/new/turf/wood/[turf]/since/[time]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/auth-server/types#turf) (domain), since the given Unix
millisecond time. With [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
they occur, as long as they're for the specified `turf` and their timestamp is
sooner than the one specified in the path.

#### Example

```
/new/turf/example~.com/since/1678658855227
```

---

### `/new/ship/[ship]`

Subscribe for all new updates for the given
[`ship`](/reference/additional/auth-server/types#ship).

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
the occur, but only for those that pertain to the specified ship.

#### Example

Note that the ship does not include the leading `~`:

```
/new/ship/sampel-palnet
```

---

### `/new/ship/[ship]/since/[time]`

Subscribe for all new updates for the given
[`ship`](/reference/additional/auth-server/types#ship), since the given Unix millisecond time.

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates for requests as
they occur, as long as they're for the specified `ship` and their timestamp is
sooner than the one specified in the path.

#### Example


Note that the ship does not include the leading `~`:

```
/new/ship/sampel-palnet/since/1678658855227
```

---

### `/new/id/[uuid]`

Subscribe for all new updates for the given
[`id`](/reference/additional/auth-server/types#id).

#### Returns

You'll receive [`entry`](/reference/additional/auth-server/types#entry) updates and
any [`status`](/reference/additional/auth-server/types#status) updates for the
request with the given `id` as they occur.

#### Example

```
/new/id/01a618cc-0c65-4278-853b-21d9e1289b93
```

---

## `/init/...`

Subscription paths beginning with `/init` do the same as [`/new`](#new) except
they also give you initial state when you first subscribe.

### `/init/all`

Subscribe for all new updates, and get the complete existing state of all
requests.

#### Returns

You'll initially receive an
[`initAll`](/reference/additional/auth-server/types#initall) update containing the
current state, and then you'll continue to receive
[`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur.

---

### `/init/all/since/[time]`

Subscribe to updates for requests that occurred after the specified Unix
millisecond time, and get the existing state of all requests with
timestamps later than the one specified.

#### Returns

You'll initially receive an
[`initAll`](/reference/additional/auth-server/types#initall) update containing the
current state of requests later than the one specified. After that, you'll
continue to receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for requests whose timestamps are later than the one given.

#### Example

```
/init/all/since/1678658855227

```

---

### `/init/turf/[turf]`

Get existing request state and subscribe to updates pertaining to the given
[`turf`](/reference/additional/auth-server/types#turf).

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/init/turf/wood/[turf]` path instead.

{% /callout %}

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/auth-server/types#initturf) update containing the
current state of requests for the given `turf`. After that, you'll continue to
receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `turf`.

#### Example

```
/init/turf/example.com
```

---

### `/init/turf/[turf]/since/[time]`

Get existing request state and subscribe to updates pertaining to the given
[`turf`](/reference/additional/auth-server/types#turf), for requests whose timestamps
are later than the Unix millisecond time given.

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/init/turf/wood/[turf]/since/[time]` path instead.

{% /callout %}

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/auth-server/types#initturf) update containing the
current state of requests for the given `turf` with times later than the
given one. After that, you'll continue to receive
[`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `turf` and have timestamps later than the one
specified.

#### Example

```
/init/turf/example.com/since/1678658855227
```

---

### `/init/turf/wood/[turf]`

Get existing state request state and subscribe to updates pertaining to the
given [`turf`](/reference/additional/auth-server/types#turf).  With [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/auth-server/types#initturf) update containing the
current state of requests for the given `turf`. After that, you'll continue to
receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `turf`.

#### Example

```
/init/turf/wood/example~.com
```

---

### `/init/turf/wood/[turf]/since/[time]`

Get existing request state and subscribe to updates pertaining to the given
[`turf`](/reference/additional/auth-server/types#turf), for requests whose timestamps
are later than the Unix millisecond time given.  With [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/auth-server/types#initturf) update containing the
current state of requests for the given `turf` with timestamps later than the
given one. After that, you'll continue to receive
[`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `turf` and have timestamps later than the one
specified.

#### Example

```
/init/turf/example~.com/since/1678658855227
```

---
### `/init/ship/[ship]`

Subscribe to updates for requests pertaining to the given
[`ship`](/reference/additional/auth-server/types#ship), and get the existing state of
all requests pertaining to that `ship`.

#### Returns

You'll initially receive an
[`initShip`](/reference/additional/auth-server/types#initship) update containing the
current state of requests for the given `ship`. After that, you'll continue to
receive [`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `ship`.

#### Example

```
/init/ship/sampel-palnet
```

---

### `/init/ship/[ship]/since/[time]`

Subscribe to updates for requests pertaining to the given
[`ship`](/reference/additional/auth-server/types#ship), and get the existing state of
all requests pertaining to that `ship`, as long as the timestamp is later than
the Unix millisecond time given.

#### Returns

You'll initially receive an
[`initShip`](/reference/additional/auth-server/types#initship) update containing the
current state of requests for the given `ship` with `stamp`s later than the
`stamp` given. After that, you'll continue to receive
[`entry`](/reference/additional/auth-server/types#entry) and
[`status`](/reference/additional/auth-server/types#status) updates as they occur, as
long as they're for that `ship` and have timestamps later than the one
specified.

#### Example

```
/init/ship/sampel-palnet/since/1678658855227
```

---
