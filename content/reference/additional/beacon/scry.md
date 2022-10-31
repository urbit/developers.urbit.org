+++
title = "Scry Paths"
weight = 13
template = "doc.html"
+++

Below are all the scry paths you can query. All paths are `%x` scries.

## `/proof/[turf]`

Make a [`proof`](/reference/additional/beacon/types#proof) for the given
[`turf`](/reference/additional/beacon/types#turf) (domain). This is put in a
[`manifest`](/reference/additional/beacon/types#manifest) and published at
`<domain>/.well-known/appspecific/org.urbit.beacon.json`. Sentinel uses it to
validate requests.

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

A [`proof`](/reference/additional/beacon/types#proof).

#### Example

```
/proof/example~.com
```

---

## `/all`

Get the complete state of all existing requests.

#### Returns

You'll receive an [`initAll`](/reference/additional/beacon/types#initall) update
containing the current state.

---

## `/all/since/[stamp]`

Get all requests later than the specified
[`stamp`](/reference/additional/beacon/types#stamp), and their statuses.

#### Returns

You'll receive an
[`initAll`](/reference/additional/beacon/types#initall) update containing the
current state of requests later than the one specified.

#### Example

```
/all/since/1666875948253000000
```

---

## `/all/before/[stamp]`

Get all requests before the specified
[`stamp`](/reference/additional/beacon/types#stamp), and their statuses.

#### Returns

You'll receive an [`initAll`](/reference/additional/beacon/types#initall) update
containing the current state of requests earlier than the one specified.

#### Example

```
/all/before/1666875948253000000
```

---

## `/turf/[turf]`

Get the state of all existing requests for the specifed
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

You'll receive an [`initTurf`](/reference/additional/beacon/types#initturf)
update containing all requests for the specified `turf`, and their statuses.

#### Example

```
/turf/example~.com
```

---

## `/turf/[turf]/since/[stamp]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/beacon/types#turf) (domain) later than the
specified [`stamp`](/reference/additional/beacon/types#stamp).

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

You'll receive an [`initTurf`](/reference/additional/beacon/types#initturf)
update containing all entries with `stamp `s later than the one specified.

#### Example

```
/turf/example~.com/since/1666875948253000000
```

---

## `/turf/before/[stamp]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/beacon/types#turf) (domain) earlier than the
specified [`stamp`](/reference/additional/beacon/types#stamp).

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

You'll receive an [`initTurf`](/reference/additional/beacon/types#initturf)
update containing all entries for the specified `turf` (domain) with
[`stamp`](/reference/additional/beacon/types#stamp)s earlier than the one
specified.

#### Example

```
/turf/example~.com/before/1666875948253000000
```

---

## `/ship/[ship]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/beacon/types#turf).

#### Returns

You'll receive an [`initShip`](/reference/additional/beacon/types#initturf)
update containing all requests for the specified `ship`, and their statuses.

#### Example

```
/ship/sampel-palnet
```

---

## `/ship/[ship]/since/[stamp]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/beacon/types#ship) later than the specified
[`stamp`](/reference/additional/beacon/types#stamp).

#### Returns

You'll receive an [`initShip`](/reference/additional/beacon/types#initship)
update containing all entries for the specified `ship` with `stamp `s later than
the one specified.

#### Example

```
/ship/sampel-palnet/since/1666875948253000000
```

---

## `/ship/[ship]/before/[stamp]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/beacon/types#ship) earlier than the specified
[`stamp`](/reference/additional/beacon/types#stamp).

#### Returns

You'll receive an [`initShip`](/reference/additional/beacon/types#initship)
update containing all entries for the specified `ship` with `stamp `s before the
one specified.

#### Example

```
/ship/sampel-palnet/before/1666875948253000000
```

---

## `/stamp/[stamp]`

Get a particular request and its current status.

#### Returns

An [`entry`](/reference/additional/beacon/types#entry) update containing the
request in question and its current status.

#### Example

```
/stamp/1666875948253000000
```

---

## `/stamp/status/[stamp]`

Get the status of a particular request.

#### Returns

A [`status`](/reference/additional/beacon/types#status) update containing the status of the request with the specified [`stamp`](/reference/additional/beacon/types#stamp).

#### Example

```
/stamp/status/1666875948253000000
```

---
