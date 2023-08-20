+++
title = "Types"
weight = 14
template = "doc.html"
+++

## `logs`

A list of [`request`](#request)s, their [`id`](#id)s, and their current
[`result`](#result)s. These are given in the various initialization
[`updates`](#updates).

#### Example

```json
[
  {
    "id": "7e16a2f5-b955-47c3-b921-da349c0e2c24",
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1679820698574,
      "time": 1679819798574
    },
    "result": "yes"
  },
  {
    "id": "d63971cc-453f-49a8-868f-02e2ff768ed2",
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "xyz",
      "code": 123456,
      "msg": null,
      "expire": 1679820699556,
      "time": 1679819799556
    },
    "result": "yes"
  },
  {
    "id": "587f6be9-1dca-4310-9239-ea541943f0e0",
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": null,
      "code": null,
      "msg": "blah blah blah",
      "expire": 1679820700233,
      "time": 1679819800233
    },
    "result": "no"
  }
]
```

---

## `manifest`

An array of [`proof`](#proof)s. This is published at
`<domain>/.well-known/appspecific/org.urbit.auth.json`, and then Auth uses
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
published at `<domain>/.well-known/appspecific/org.urbit.auth.json` in a
[`manifest`](#manifest), and then Auth uses them to validate requests.

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
request should expire, as milliseconds since the Unix Epoch. The `time` field
is the timestamp of the request - you'd typically use now.

#### Examples

```json
{
  "ship": "zod",
  "turf": "example.com",
  "user": "foo123",
  "code": 1234,
  "msg": "blah blah blah",
  "expire": 1679820700233,
  "time" 1679819800233,
}
```

```json
{
  "ship": "zod",
  "turf": "example.com",
  "user": null,
  "code": null,
  "msg": null,
  "expire": 1679820700233,
  "time" 1679819800233,
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
* `"sent"` - Auth Server has sent the request; the user's ship has not yet confirmed
  receipt.
* `"abort"` - You have given Auth Server a [`cancel`](#cancel) action, so the request
  has been cancelled.
* `"error"` - The request failed. This will occur if the user's ship rejected
  the request (nack'd the poke) or Auth Server was unable to subscribe to their ship
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

## `id`

A request ID. The [`id`](/reference/additional/auth-server/types#id) field is a
random unique ID for the request, and must be a v4 UUID (variant 1, RFC
4122/DCE 1.1).

Note this is decoded into a 122-bit `@ux` atom by `%auth-server` - the UUID form is
only used in JSON, scry paths and subscription paths.

#### Example

```json
"6360904f-7645-4747-91a1-8d7844f11d18"
```

---

## `turf`

A domain. This must be just the domain like `localhost`, `example.com`,
`foo.bar.baz`, etc, without any protocol, forward slashes, port, paths, etc.

---

## Actions

Ask Auth Server to either initiate a new authorization request, or cancel an existing
one. These are given to Auth Server as pokes.

### `new`

Initiate a new authorization request. The `new` action contains a
[`request`](#request) structure and a request [`id`](#id).

#### Example

```json
{
  "new": {
    "id": "6360904f-7645-4747-91a1-8d7844f11d18",
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1679820700233,
      "time" 1679819800233
    }
  }
}
```

### `cancel`

Cancel an existing request. The [`id`](#id) in the ID of the request you
want to cancel.

#### Example

```json
{"cancel": {"id": "6360904f-7645-4747-91a1-8d7844f11d18"}}
```

---

## Updates

The types of event/update that Auth Server can send back to you.

### `entry`

This will be sent back to you whenever you make a new request with a
[`new`](#new) action. It contains the request [`id`](#id),
[`request`](#request) and initial [`result`](#result). The initial result will
typically be `sent`, unless you specified an expiration time before the current
time, in which case it'll be `expire`.

#### Example

```json
{
  "entry": {
    "id": "6360904f-7645-4747-91a1-8d7844f11d18",
    "request": {
      "code": 123456,
      "turf": "localhost",
      "ship": "zod",
      "msg": "blah blah blah",
      "user": "@user123",
      "expire": 1679820700233,
      "time" 1679819800233
    },
    "result": "sent"
  }
}
```

### `status`

A `status` update will be sent back whenever the status of a request changes,
for example if the user receives the request, the user approves or denies the
request, the request expires, etc. It contains a request [`id`](#id) and a
[`result`](#result).

#### Examples

```json
{
  "status": {
    "id": "6360904f-7645-4747-91a1-8d7844f11d18",
    "result": "yes"
  }
}
```

```json
{
  "status": {
    "id": "6360904f-7645-4747-91a1-8d7844f11d18",
    "result": "got"
  }
}
```

### `initAll`

This is sent as the inital update when you first subscribe to one of the
`/init/all/...` paths. It's also returned by some of the scry paths. It
contains existing entries, possibly limited to entries before or after a
specific timestamp.

It contains a [`logs`](#logs) field with the entries themselves, and also
`before` and `after` fields which will either contain Unix millisecond times or
else be null if no such limits were specified.

#### Example

```json
{
  "initAll": {
    "since": null,
    "before": null,
    "logs": [
      {
        "id": "0782ebea-e8d3-4c6a-bf1c-5c336c82a0d3",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123",
          "expire": 1679827515744,
          "time": 1679826615744
        },
        "result": "yes"
      },
      {
        "id": "4c54c5d9-6584-4d3b-ab62-e55f5f2033c4",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null,
          "expire": 1679827571421,
          "time": 1679826671421
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
limited to entries before or after a specific timestamp.

It contains a [`turf`](#turf) field showing which domain it's for, a
[`logs`](#logs) field with the entries themselves, and also `before` and
`after` fields which will either contain Unix millisecond timestamps or else be
null if no such limits were specified.

#### Example

```json
{
  "initTurf": {
    "turf": "localhost",
    "since": null,
    "before": null,
    "logs": [
      {
        "id": "0782ebea-e8d3-4c6a-bf1c-5c336c82a0d3",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123",
          "expire": 1679827515744,
          "time": 1679826615744
        },
        "result": "yes"
      },
      {
        "id": "4c54c5d9-6584-4d3b-ab62-e55f5f2033c4",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null,
          "expire": 1679827571421,
          "time": 1679826671421
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
entries before or after a specific timestamp.

It contains a [`ship`](#ship) field showing which ship it's for, a
[`logs`](#logs) field with the entries themselves, and also `before` and
`after` fields which will either contain Unix millisecond timestamps or else be
null if no such limits were specified.

#### Example

```json
{
  "initShip": {
    "ship": "zod",
    "since": null,
    "before": null,
    "logs": [
      {
        "id": "0782ebea-e8d3-4c6a-bf1c-5c336c82a0d3",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "blah blah",
          "user": "foobar123",
          "expire": 1679827515744,
          "time": 1679826615744
        },
        "result": "yes"
      },
      {
        "id": "4c54c5d9-6584-4d3b-ab62-e55f5f2033c4",
        "request": {
          "code": 123456,
          "turf": "localhost",
          "ship": "zod",
          "msg": "foo bar baz",
          "user": null,
          "expire": 1679827571421,
          "time": 1679826671421
        },
        "result": "no"
      },
    ]
  }
}
```

---

