+++
title = "Overview"
weight = 8
template = "doc.html"
+++

Beacon and Sentinel are a pair of Urbit apps that facilitate "login with Urbit"
for external web apps. Users of the site `example.com` can login to their
`example.com` accounts with their Urbit ships using the Sentinel app,
assuming the developers of `example.com` have integrated their site with the
Beacon app.

These docs primarily deal with the API of the Beacon app, but first we'll
quickly go over how the system works.

1. A user tries to login to the site `example.com` by entering their ship
   `~sampel-palnet`.
2. `example.com` sends an authorization request to their ship `~master` running
   Beacon.
3. Beacon on `~master` sends the request to the Sentinel app on `~sampel-palnet`.
4. Sentinel on `~sampel-palnet` gets the request and makes an HTTP request for
   `http://example.com/.well-known/appspecific/org.urbit.beacon.json` and
   retrieves an attestation that `~master` is an agent of `example.com`.
5. Sentinel verifies the signature in the attestation using the pubkey of
   `~master` it got from Azimuth, then displays an authorization request for the
   user that looks like: ![sentinel
   example](https://media.urbit.org/docs/beacon/sentinel-example.png)
6. The user of `~sampel-palnet` clicks "Approve" in Sentinel.
7. Sentinel on `~sampel-palnet` sends an update to Beacon on `~master` saying
   the request was approved.
8. Beacon notififies `example.com` that the request was authorized.
9. `example.com` logs the user in.

## Beacon Basics

Beacon is intended to be used via an Eyre airlock. The most common is the
`@urbit/http-api` NPM package, which is documented
[here](/guides/additional/http-api-guide). There are a few airlocks for other
languages too, some of which are listed
[here](https://github.com/urbit/awesome-urbit#http-apis-airlock). Eyre's
interfaces extend Urbit's [poke](/reference/glossary/poke),
[scry](/reference/arvo/concepts/scry) and
[subscription](/reference/arvo/concepts/subscriptions) mechanics to HTTP
clients. You can read more about Eyre [here](/reference/arvo/eyre/guide).

### Actions

There are two actions you can poke into Beacon: A
[`new`](/reference/additional/beacon/types#new) action to initiate a new
request, and a [`cancel`](/reference/additional/beacon/types#cancel) action to
cancel an existing request. The `new` action looks something like this:

```json
{
  "new": {
    "stamp": 1666795723664000000,
    "request": {
      "ship": "sampel-palnet",
      "turf": "example.com",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1666882123664
    }
  }
}
```

The [`stamp`](/reference/additional/beacon/types#stamp) field is the request ID
and is typically the current time in nanoseconds since the Unix epoch. Note it's
*nanoseconds* - this extra precision is because every request needs a unique
`stamp` and collisions are less likely to occur this way.

The fields in the [`request`](/reference/additional/beacon/types#request) are as
follows:

- `ship`: The ship you're seeking approval from. Note it does not include the
  leading `~`.
- `turf`: Your domain. Note it should not include any path, protocol, port etc.
  Just `foo.bar.baz`.
- `user`: This field is *optional*, and should be `null` if you don't use it. If
  the account username is not merely the ship name, you might like to include it
  here to inform the user.
- `code`: This field is *optional*, and should be `null` if you don't use it.
  The main purpose of this code is so the user can easily visually associate a
  particular request in Sentinel with the particular login request on your site.
  In theory you use it like two-factor authentication and make them type it into
  your site, but you generally shouldn't need to as Urbit networking verifies
  provenance of packets.
- `msg`: This field is *optional*, and should be `null` if you don't use it.
  This is just a general text field where you can include any extra message you
  want. You might like to include things like the IP address of the login
  request and the browser it came from. It's up to you.
- `expire`: This is the time the request should expire, in milliseconds since
  the Unix epoch. Note it's *milliseconds*, not nanoseconds like the `stamp`.
  You can have it expire whenever you want, but setting it unreasonably soon
  (like seconds) may mean the user can't get to it in time, especially if
  there's network latency. At least a few minutes from now is a good idea.

### Updates

There are two main types of updates you'll receive from Beacon: an
[`entry`](/reference/additional/beacon/types#entry) update and a
[`status`](/reference/additional/beacon/types#status) update. An `entry` update
looks like this:

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

It contains the [`stamp`](/reference/additional/beacon/types#stamp) and
[`request`](/reference/additional/beacon/types#request) from the `new` action
above, and additionally shows the initial status in the
[`result`](/reference/additional/beacon/types#result) field. This will normally
be `"sent"`, unless you set the expiry earlier than *now*, in which case it will
immediately be `"expire"` and Beacon won't bother sending it to the user.

After it's been sent you'll get [`status`](/reference/additional/beacon/types#status) updates for it when its status changes. A `status` update looks like:

```json
{
  "status": {
    "stamp": 1667213952904000000,
    "result": "yes"
  }
}
```

Assuming it was initally `"sent"`, you'll get an update with a `"got"`
[`result`](/reference/additional/beacon/types#result) when the user receives it
(but hasn't yet approved or denied it). If they approve it, you'll then get a
`"yes"` update, and if they deny it you'll get `"no"`. If it expires before they
receive it or before they approve/deny it, you'll get an `"expire"` update. If
there was an error in them receiving the request or your Beacon couldn't
subscribe for the result, you'll get an `"error"` update. If you cancelled the
request with a `cancel` action, you'll get an `"abort"` result.

The normal flow is `"sent"` -> `"got"` -> `"yes"`/`"no"`, with
`"expire"`,`"error"` and `"abort"` potentially terminating the flow at any
point. The `"sent"` and `"got"` results are transitional, and the rest are
terminal.

### Subscriptions

Beacon has a number of different subscription paths, but you'd likely only use
one or two. There are two categories of subscription paths:
[`/new/...`](/reference/additional/beacon/subs#new) and
[`/init/...`](/reference/additional/beacon/subs#new). The `/new` paths will
start giving you any updates that occur after you subscribe. The `/init` paths
will do the same, but they'll also give you initial state. For each of these,
there is a path to receive all updates, and there are also sub-paths to filter
by [`turf`](/reference/additional/beacon/types#turf) (domain),
[`ship`](/reference/additional/beacon/types#ship) and
[`stamp`](/reference/additional/beacon/types#stamp). Additionally, for each
sub-path, you can specify a "since" `stamp`, and only receive updates and
initial state for requests with `stamp`s *later* than the one you specify.

If you're only handling a single site in Beacon, you can just subscribe to the
`/init/all` path, retreiving initial state and then further updates as they
occur. If your site loses connection to Beacon, you can just resubscribe to
`/init/all` to resync state, or, if you don't want all historical state, you
could subscribe to `/init/all/since/1666875948253000000` where the `stamp`
specified is the oldest time you think you could reasonably care about.

### Attestations

As described at the beginning, Sentinel checks
`<domain>/.well-known/appspecific/org.urbit.beacon.json` to verify a request
actually comes from the domain it claims. That `.json` file must contain a
[`manifest`](/reference/additional/beacon/types#manifest), which is just an
array of [`proof`](/reference/additional/beacon/types#proof)s. A `proof` looks
like:

```json
{
  "turf": "example.com",
  "life": 1,
  "ship": "zod",
  "sign": "jtvkTK0JMizoY12Kw51R11OSKzmtCt2WHB3ev32R+k32O+Y6rJ7jHtrRizm0/0aKwJIO8X5PbDHwdti296XLCQ=="
}
```

In order to generate a proof, you must make a scry request to the
[`/proof/[turf]`](/reference/additional/beacon/scry#proof[turf]) scry path. The
`turf` in the path is your domain. Note it *must* use `++wood` encoding as
described in the [reference for that
path](/reference/additional/beacon/scry#proof[turf]). Assuming your domain just
contains lowercase letters, numbers and hyphens, it's as simple as prepending
`~` to all dot separators like `foo~.example~.com` for `foo.example.com`.

Once you have the proof you can just put it in an array. The `manifest` is
allowed to contain multiple proofs for the same ship, including different
`live`s (key revisions), as well as for multiple different ships and domains.
Sentinel will try find the best case with the following priority:

1. Valid signature at current life.
2. Invalid signature at current life.
3. Valid signature at previous life.
4. Invalid signature at previous life.
5. Unable to verify it at all.

If it's valid at current life, it will display a green lock icon and say it's
authentic. If it's a valid signature at an old life, it'll show a yellow lock
icon with an alert that it's outdated and may not come from the URL it claims.
Otherwise, it'll show a red unlock icon and a warning that it may not come from
the URL it claims.

If Sentinel successfully validates a domain for a particular ship, it'll
remember it for 30 days and not bother to revalidate requests during that time.
For any other outcome, it won't remember and will try validate it again the next
time.

When trying to retrieve the `manifest`, Sentinel will follow up to 5 redirects,
and will retry up to 3 times if it doesn't get a `20x` status response. If it
gets a `20x` response but the manifest is missing or malformed, it will give up
immediately. If there are too many retries, too many redirects, or a `20x`
response is malformed, the request will be shown to the user with a red unlock
icon and a warning as described above.

{% callout %}

**Important note:**

It cannot follow relative redirect URLs - redirects MUST be absolute URLs
including protocol.

{% /callout %}
