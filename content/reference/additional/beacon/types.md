+++
title = "Types"
weight = 14
template = "doc.html"
+++

## `logs`

A list of [`request`](#request)s, their [`stamp`](#stamp)s (IDs), and their
current [`result`](#result)s. These are given in the various initialization
[`updates`](#updates).

#### Example

```json
[
  {
    "stamp": 1666795723664000000,
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1666882123664,
    },
    "result": "yes"
  },
  {
    "stamp": 1666799618474000000,
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "xyz",
      "code": 123456,
      "msg": null,
      "expire": 1666886018474,
    },
    "result": "yes"
  },
  {
    "stamp": 1666799624841000000,
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": null,
      "code": null,
      "msg": "blah blah blah",
      "expire": 1666886024841,
    },
    "result": "no"
  }
]
```

---

## `manifest`

An array of [`proof`](#proof)s. This is published at
`<domain>/.well-known/appspecific/org.urbit.beacon.json`, and then Sentinel uses
it to validate requests.

#### Example

```json
[
  {
    "turf": "example.com",
    "life": 1,
    "ship": "zod",
    "sign": "jtvkTK0JMizoY12Kw51R11OSKzmtCt2WHB3ev32R+k32O+Y6rJ7jHtrRizm0/0aKwJIO8X5PbDHwdti296XLCQ=="
  }
]
```

---

## `proof`

An attestation that a ship is an agent of a site. An array of such `proof`s are
published at `<domain>/.well-known/appspecific/org.urbit.beacon.json` in a
[`manifest`](#manifest), and then Sentinel uses them to validate requests.

#### Example

```json
{
  "turf": "example.com",
  "life": 1,
  "ship": "zod",
  "sign": "jtvkTK0JMizoY12Kw51R11OSKzmtCt2WHB3ev32R+k32O+Y6rJ7jHtrRizm0/0aKwJIO8X5PbDHwdti296XLCQ=="
}
```

## `request`

An authorization request. The `user`, `code` and `msg` fields are all optional
and may be `null` if not used. The `expire` field is the date-time that the
request should expire, as milliseconds since the Unix Epoch.

#### Examples

```json
{
  "ship": "zod",
  "turf": "example.com",
  "user": "foo123",
  "code": 1234,
  "msg": "blah blah blah",
  "expire": 1666955338448
}
```

```json
{
  "ship": "zod",
  "turf": "example.com",
  "user": null,
  "code": null,
  "msg": null,
  "expire": 1666955338448
}
```

---

## `result`

The status of an authorization request. It may be one of:

* `"yes"` - The request was approved.
* `"no"` - The request was denied.
* `"expire"` - The request expired without the user approving or denying it.
* `"got"` - The user's ship received the request, but they have not yet approved
  or denied it.
* `"sent"` - Beacon has sent the request; the user's ship has not yet received it.
* `"abort"` - You have given beacon a [`cancel`](#cancel) action, so the request
  has been cancelled.
* `"error"` - The request failed. This will occur if the user's ship rejected
  the request (nack'd the poke) or Beacon was unable to subscribe to their ship
  for the result. This should not normally occur.


The typical flow is `"sent"` -> `"got"` -> `"yes"` or `"no"`. At any point in
that flow, it may expire in which case you'll get `"expire"` and nothing
further. The transitional states are therefore `"sent"` and `"got"`, with the
remaining being terminal.

---

## `ship`

An Urbit ship. The ship is a string and **does not include the leading ~**.

#### Examples

```json
"zod"
```

```json
"sampel-palnet"
```

```json
"livbes-minwyn-sicmev-halner--soplyt-nimfyl-widnyd-difwyx"
```

---

## `sign`

Ed25519 signature of the domain name with the ship's keys, encoded in a string
as Base64.

This is used in a [`proof`](#proof) to attest that a particular ship is an agent
of a particular site.

#### Example

```json
"jtvkTK0JMizoY12Kw51R11OSKzmtCt2WHB3ev32R+k32O+Y6rJ7jHtrRizm0/0aKwJIO8X5PbDHwdti296XLCQ=="
```

---

## `stamp`

A request ID. This is a date-time as the number of **nanoseconds** since the
Unix Epoch. Each request must have a unique `stamp`, and requests are ordered by
this `stamp`. You would typically use the date-time when the request occurred.

Nanoseconds are used rather than milliseconds to make collisions less likely if
two requests occur at roughly the same time. If you don't need or don't have
this much precision you can just multiply the Unix millisecond time by a million
or just fudge the less significant digits. The important thing is that it's
unique for each request.

#### Example

```json
1666953051302000000
```

---

## `turf`

A domain. This must be just the domain like `localhost`, `example.com`,
`foo.bar.baz`, etc, without any protocol, forward slashes, port, paths, etc.

---

## Actions

Ask Beacon to either initiate a new authorization request, or cancel an existing
one. These are given to Beacon as pokes.

### `new`

Initiate a new authorization request. The `new` action contains a
[`request`](#request) structure and a [`stamp`](#stamp) (request ID).

#### Example

```json
{
  "new": {
    "stamp": 1666795723664000000,
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1666882123664
    }
  }
}
```

### `cancel`

Cancel an existing request. The [`stamp`](#stamp) in the ID of the request you
want to cancel.

#### Example

```json
{"cancel": {"stamp": 1666795723664000000}}
```

---

## Updates

The types of event/update that beacon can send back to you.

### `entry`

This will be sent back to you whenever you make a new request with a [`new`](#new) action. It contains the [`stamp`](#stamp) (request ID),
[`request`](#request) and initial [`result`](#result). The initial result will
typically be `sent`, unless you specified an expiration time before the current
time, in which case it'll be `expire`.

#### Example

```json
{
  "entry": {
    "stamp": 1667212978424000000,
    "request": {
      "expire": 1667213278424,
      "code": 123456,
      "turf": "localhost",
      "ship": "zod",
      "msg": "blah blah blah",
      "user": "@user123"
    },
    "result": "sent"
  }
}
```

### `status`

A `status` update will be sent back whenever the status of a request changes,
for example if the user receives the request, the user approves or denies the
request, the request expires, etc. It contains a [`stamp`](#stamp) (request ID)
and a [`result`](#result).

#### Examples

```json
{
  "status": {
    "stamp": 1667213952904000000,
    "result": "yes"
  }
}
```

```json
{
  "status": {
    "stamp": 1667213954564000000,
    "result": "got"
  }
}
```

### `initAll`

This is sent as the inital update when you first subscribe to one of the
`/init/all/...` paths. It's also returned by some of the scry paths. It contains
existing entries, possibly limited to entries before or after a specific
[`stamp`](#stamp).

It contains a [`logs`](#logs) field with the entries themselves, and also
`before` and `after` fields which will either contain [`stamp`](#stamp)s or else
be null if no such limits were specified.

#### Example

```json
{
  "initAll": {
    "since": null,
    "before": null,
    "logs": [
      {
        "stamp": 1666795723664000000,
        "request": {
          "expire": 1666882123664,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123"
        },
        "result": "yes"
      },
      {
        "stamp": 1666799618474000000,
        "request": {
          "expire": 1666886018474,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null
        },
        "result": "no"
      },
    ]
  }
}
```

### `initTurf`

This is sent as the inital update when you first subscribe to one of the
`/init/turf/...` paths. It's also returned by some of the scry paths. It
contains existing entries for a specific [`turf`](#turf) (domain), possibly
limited to entries before or after a specific [`stamp`](#stamp).

It contains a [`turf`](#turf) field showing which domain it's for, a
[`logs`](#logs) field with the entries themselves, and also `before` and `after`
fields which will either contain [`stamp`](#stamp)s or else be null if no such
limits were specified.

#### Example

```json
{
  "initTurf": {
    "turf": "localhost",
    "since": null,
    "before": null,
    "logs": [
      {
        "stamp": 1666795723664000000,
        "request": {
          "expire": 1666882123664,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123"
        },
        "result": "yes"
      },
      {
        "stamp": 1666799618474000000,
        "request": {
          "expire": 1666886018474,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null
        },
        "result": "no"
      },
    ]
  }
}
```

### `initShip`

This is sent as the inital update when you first subscribe to one of the
`/init/ship/...` paths. It's also returned by some of the scry paths. It
contains existing entries for a specific [`ship`](#ship), possibly limited to
entries before or after a specific [`stamp`](#stamp).

It contains a [`ship`](#ship) field showing which ship it's for, a
[`logs`](#logs) field with the entries themselves, and also `before` and `after`
fields which will either contain [`stamp`](#stamp)s or else be null if no such
limits were specified.

#### Example

```json
{
  "initShip": {
    "ship": "zod",
    "since": null,
    "before": null,
    "logs": [
      {
        "stamp": 1666795723664000000,
        "request": {
          "expire": 1666882123664,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123"
        },
        "result": "yes"
      },
      {
        "stamp": 1666799618474000000,
        "request": {
          "expire": 1666886018474,
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null
        },
        "result": "no"
      },
    ]
  }
}
```

---

