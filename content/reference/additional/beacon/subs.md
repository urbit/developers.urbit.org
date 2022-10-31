+++
title = "Subscriptions"
weight = 12
template = "doc.html"
+++

Below are all the paths you can subscribe to in Beacon.

## `/new/...`

Subscription paths beginning with `/new` will not give you any initial state,
you'll just get events that happen after you've subscribed.

### `/new/all`

Subscribe for all new updates.

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur.

---

### `/new/all/since/[stamp]`

Subscribe for all new updates since the given
[`stamp`](/reference/additional/beacon/types#stamp).

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates for requests as
the occur, but only for those with `stamp`s later than the one specified.

#### Example

```
/new/all/since/1666875948253000000
```

---

### `/new/turf/[turf]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/beacon/types#turf) (domain).

{% callout %}

**Important**

When encoding a `turf` (domain) in a subscription or scry path, you **must** use
`++wood` encoding as described in [this
function](https://github.com/urbit/urbit/blob/master/pkg/npm/api/lib/lib.ts#L207-L242),
except without the leading `~.`. If your domain does not contain unusual
characters, just lowercase letters, numbers and hyphens, you can just put a
tilde (`~`) before each dot separator rather than using the full function above.

{% /callout %}

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates for requests as
they occur, as long as they're for the specified `turf`.

#### Example

For `example.com`:

```
/new/turf/example~.com
```

For `foo.bar-baz.com`:

```
/new/turf/foo~.bar-baz.com
```

---

### `/new/turf/[turf]/since/[stamp]`

Subscribe for all new updates for the given
[`turf`](/reference/additional/beacon/types#turf) (domain), since the given [`stamp`](/reference/additional/beacon/types#stamp).

{% callout %}

**Important**

When encoding a `turf` (domain) in a subscription or scry path, you **must** use
`++wood` encoding as described in [this
function](https://github.com/urbit/urbit/blob/master/pkg/npm/api/lib/lib.ts#L207-L242),
except without the leading `~.`. If your domain does not contain unusual
characters, just lowercase letters, numbers and hyphens, you can just put a
tilde (`~`) before each dot separator rather than using the full function above.

{% /callout %}

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates for requests as
they occur, as long as they're for the specified `turf` and their `stamp` is
sooner than the one specified in the path.

#### Example

```
/new/turf/example~.com/since/1666875948253000000
```

---

### `/new/ship/[ship]`

Subscribe for all new updates for the given
[`ship`](/reference/additional/beacon/types#ship).

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates for requests as
the occur, but only for those that pertain to the specified ship.

#### Example

Note that the ship does not include the leading `~`:

```
/new/ship/sampel-palnet
```

---

### `/new/ship/[ship]/since/[stamp]`

Subscribe for all new updates for the given
[`ship`](/reference/additional/beacon/types#ship), since the given [`stamp`](/reference/additional/beacon/types#stamp).

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates for requests as
they occur, as long as they're for the specified `ship` and their `stamp` is
sooner than the one specified in the path.

#### Example


Note that the ship does not include the leading `~`:

```
/new/ship/sampel-palnet/since/1666875948253000000
```

---

### `/new/stamp/[stamp]`

Subscribe for all new updates for the given
[`stamp`](/reference/additional/beacon/types#stamp).

#### Returns

You'll receive [`entry`](/reference/additional/beacon/types#entry) updates and
any [`status`](/reference/additional/beacon/types#status) updates for the
request with the given [`stamp`] as they occur.

#### Example

```
/new/stamp/1666875948253000000
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
[`initAll`](/reference/additional/beacon/types#initall) update containing the
current state, and then you'll continue to receive
[`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur.

---

### `/init/all/since/[stamp]`

Subscribe to updates for requests that occurred after the specified
[`stamp`](/reference/additional/beacon/types#stamp), and get the existing state
of all requests with `stamp`s later than the one specified.

#### Returns

You'll initially receive an
[`initAll`](/reference/additional/beacon/types#initall) update containing the
current state of requests later than the one specified. After that, you'll
continue to receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur, as
long as they're for requests whose `stamp`s are later than the one given.

#### Example

```
/init/all/since/1666875948253000000
```

---

### `/init/turf/[turf]`

Subscribe to updates for requests pertaining to the given
[`turf`](/reference/additional/beacon/types#turf), and get the existing state of
all requests pertaining to that `turf`.

{% callout %}

**Important**

When encoding a `turf` (domain) in a subscription or scry path, you **must** use
`++wood` encoding as described in [this
function](https://github.com/urbit/urbit/blob/master/pkg/npm/api/lib/lib.ts#L207-L242),
except without the leading `~.`. If your domain does not contain unusual
characters, just lowercase letters, numbers and hyphens, you can just put a
tilde (`~`) before each dot separator rather than using the full function above.

{% /callout %}

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/beacon/types#initturf) update containing the
current state of requests for the given `turf`. After that, you'll continue to
receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur, as
long as they're for that `turf`.

#### Example

```
/init/turf/example~.com
```

---

### `/init/turf/[turf]/since/[stamp]`

Subscribe to updates for requests pertaining to the given
[`turf`](/reference/additional/beacon/types#turf), and get the existing state of
all requests pertaining to that `turf`, as long as the
[`stamp`](/reference/additional/beacon/types#stamp) is later than the one given.

{% callout %}

**Important**

When encoding a `turf` (domain) in a subscription or scry path, you **must** use
`++wood` encoding as described in [this
function](https://github.com/urbit/urbit/blob/master/pkg/npm/api/lib/lib.ts#L207-L242),
except without the leading `~.`. If your domain does not contain unusual
characters, just lowercase letters, numbers and hyphens, you can just put a
tilde (`~`) before each dot separator rather than using the full function above.

{% /callout %}

#### Returns

You'll initially receive an
[`initTurf`](/reference/additional/beacon/types#initturf) update containing the
current state of requests for the given `turf` with `stamp`s later than the
`stamp` given. After that, you'll continue to receive
[`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur, as
long as they're for that `turf` and have `stamp`s later than the one specified.

#### Example

```
/init/turf/example~.com/since/1666875948253000000
```

---

### `/init/ship/[ship]`

Subscribe to updates for requests pertaining to the given
[`ship`](/reference/additional/beacon/types#ship), and get the existing state of
all requests pertaining to that `ship`.

#### Returns

You'll initially receive an
[`initShip`](/reference/additional/beacon/types#initship) update containing the
current state of requests for the given `ship`. After that, you'll continue to
receive [`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur, as
long as they're for that `ship`.

#### Example

```
/init/ship/sampel-palnet
```

---

### `/init/ship/[ship]/since/[stamp]`

Subscribe to updates for requests pertaining to the given
[`ship`](/reference/additional/beacon/types#ship), and get the existing state of
all requests pertaining to that `ship`, as long as the
[`stamp`](/reference/additional/beacon/types#stamp) is later than the one given.

#### Returns

You'll initially receive an
[`initShip`](/reference/additional/beacon/types#initship) update containing the
current state of requests for the given `ship` with `stamp`s later than the
`stamp` given. After that, you'll continue to receive
[`entry`](/reference/additional/beacon/types#entry) and
[`status`](/reference/additional/beacon/types#status) updates as they occur, as
long as they're for that `ship` and have `stamp`s later than the one specified.

#### Example

```
/init/ship/sampel-palnet/since/1666875948253000000
```

---
