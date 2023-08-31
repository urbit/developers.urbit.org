+++
title = "Scry Paths"
weight = 13
template = "doc.html"
+++

Below are all the scry paths you can query. All paths are `%x` scries.

## `/proof/[turf]`

Make a [`proof`](/reference/additional/auth-server/types#proof) for the given
[`turf`](/reference/additional/auth-server/types#turf) (domain). This is put in a
[`manifest`](/reference/additional/auth-server/types#manifest) and published at
`<domain>/.well-known/appspecific/org.urbit.auth.json`. Auth Client uses it to
validate requests.

#### Returns

A [`proof`](/reference/additional/auth-server/types#proof).

#### Example

```
/proof/example.com
```

---

## `/proof/wood/[turf]`

Make a [`proof`](/reference/additional/auth-server/types#proof) for the given
[`++wood`-encoded](/reference/additional/auth-server/overview#additional-note)
[`turf`](/reference/additional/auth-server/types#turf) (domain). This is put in a
[`manifest`](/reference/additional/auth-server/types#manifest) and published at
`<domain>/.well-known/appspecific/org.urbit.auth.json`. Auth Client uses it to
validate requests.

#### Returns

A [`proof`](/reference/additional/auth-server/types#proof).

#### Example

```
/proof/example.com
```

---

## `/all`

Get the complete state of all existing requests.

#### Returns

You'll receive an [`initAll`](/reference/additional/auth-server/types#initall) update
containing the current state.

---

## `/all/since/[time]`

Get all requests later than the specified Unix millisecond time, and their
statuses.

#### Returns

You'll receive an
[`initAll`](/reference/additional/auth-server/types#initall) update containing the
current state of requests later than the one specified.

#### Example

```
/all/since/1678658855227
```

---

## `/all/before/[time]`

Get all requests before the specified Unix millisecond time, and their
statuses.

#### Returns

You'll receive an [`initAll`](/reference/additional/auth-server/types#initall) update
containing the current state of requests earlier than the one specified.

#### Example

```
/all/before/1678658855227
```

---

## `/ship/[ship]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/auth-server/types#ship).

#### Returns

You'll receive an [`initShip`](/reference/additional/auth-server/types#initship)
update containing all requests for the specified `ship`, and their statuses.

#### Example

Note the leading `~` is omitted:

```
/ship/sampel-palnet
```

---

## `/ship/[ship]/since/[time]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/auth-server/types#ship) later than the specified Unix millisecond time.

#### Returns

You'll receive an [`initShip`](/reference/additional/auth-server/types#initship)
update containing all entries for the specified `ship` with `time `s later than
the one specified.

#### Example

```
/ship/sampel-palnet/since/1678658855227
```

---

## `/ship/[ship]/before/[time]`

Get the state of all existing requests for the specifed
[`ship`](/reference/additional/auth-server/types#ship) earlier than the specified Unix millisecond time.

#### Returns

You'll receive an [`initShip`](/reference/additional/auth-server/types#initship)
update containing all entries for the specified `ship` with `time `s before the
one specified.

#### Example

```
/ship/sampel-palnet/before/1678658855227
```

---

## `/turf/[turf]`
    
Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain).

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/turf/wood/[turf]` path instead.

{% /callout %}

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all requests for the specified `turf`, and their statuses.

#### Example

```
/turf/example.com
```

---

## `/turf/[turf]/since/[time]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain) later than the
specified Unix millisecond time.

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/turf/wood/[turf]/since/[time]` path instead.

{% /callout %}

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all entries with timestamps later than the one specified.

#### Example

```
/turf/example.com/since/1678658855227
```

---

## `/turf/[turf]/before/[time]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain) earlier than the
specified Unix millisecond time.

{% callout %}

If your domain contains characters apart from `a-z`, `0-9`, `-` and `.`
separators, see the `/turf/wood/[turf]/before/[time]` path instead.

{% /callout %}

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all entries for the specified `turf` (domain) with timestamps
earlier than the one specified.

#### Example

```
/turf/example.com/before/1678658855227
```

---

## `/turf/wood/[turf]`
    
Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain), with [`++wood` encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all requests for the specified `turf`, and their statuses.

#### Example

```
/turf/wood/example~.com
```

---

## `/turf/wood/[turf]/since/[time]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain) later than the
specified Unix millisecond time. With [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all entries with timestamps later than the one specified.

#### Example

```
/turf/wood/example~.com/since/1678658855227
```

---

## `/turf/wood/[turf]/before/[time]`

Get the state of all existing requests for the specifed
[`turf`](/reference/additional/auth-server/types#turf) (domain) earlier than the
specified Unix millisecond time. With [`++wood`
encoding](/reference/additional/auth-server/overview#additonal-note).

#### Returns

You'll receive an [`initTurf`](/reference/additional/auth-server/types#initturf)
update containing all entries for the specified `turf` (domain) with timestamps
earlier than the one specified.

#### Example

```
/turf/wood/example~.com/before/1678658855227
```

---

## `/id/[uuid]`

Get a particular request and its current status, by UUID.

#### Returns

An [`entry`](/reference/additional/auth-server/types#entry) update containing the
request in question and its current status.

#### Example

```
/id/2321f509-316c-4545-a838-4740eed86584

```

---

## `/id/status/[time]`

Get the status of a particular request.

#### Returns

A [`status`](/reference/additional/auth-server/types#status) update containing the status of the request with the specified [`id`](/reference/additional/auth-server/types#id).

#### Example

```
/x/id/status/01a618cc-0c65-4278-853b-21d9e1289b93
```

---
