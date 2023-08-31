+++
title = "Overview"
weight = 8
template = "doc.html"
+++

Auth Server and Auth are a pair of Urbit apps that facilitate Urbit
authentication for external web apps. Users of the site `example.com` can login
to their `example.com` accounts with their Urbit ships using the Auth app,
assuming the developers of `example.com` have integrated their site with the
Auth Server app.

These docs primarily deal with the API of the Auth Server app, but first we'll
quickly go over how the system works.

1. A user tries to login to the site `example.com` by entering their ship
   `~sampel-palnet`.
2. `example.com` sends an authorization request to their ship `~master` running
   Auth Server.
3. Auth Server on `~master` sends the request to the Auth Client app on
   `~sampel-palnet`.
4. Auth on `~sampel-palnet` gets the request and makes an HTTP request for
   `http://example.com/.well-known/appspecific/org.urbit.auth.json` and
   retrieves an attestation that `~master` is an agent of `example.com`.
5. Auth Client verifies the signature in the attestation using the pubkey of `~master`
   it got from Azimuth, then displays an authorization request for the user
   that looks like: ![auth example](https://media.urbit.org/docs/auth/auth-example.png)
6. The user of `~sampel-palnet` clicks "Approve" in Auth Client.
7. Auth Client on `~sampel-palnet` sends an update to Auth Server on `~master` saying
   the request was approved.
8. Auth Server notifies `example.com` that the request was authorized.
9. `example.com` logs the user in.

## Auth Server Basics

Auth Server is intended to be used via an Eyre airlock. The most common is the
`@urbit/http-api` NPM package, which is documented
[here](/guides/additional/http-api-guide). There are a few airlocks for other
languages too, some of which are listed
[here](https://github.com/urbit/awesome-urbit#http-apis-airlock). Eyre's
interfaces extend Urbit's [poke](/reference/glossary/poke),
[scry](/reference/arvo/concepts/scry) and
[subscription](/reference/arvo/concepts/subscriptions) mechanics to HTTP
clients. You can read more about Eyre [here](/reference/arvo/eyre/guide).

### Actions

There are two actions you can poke into Auth Server: A
[`new`](/reference/additional/auth-server/types#new) action to initiate a new
request, and a [`cancel`](/reference/additional/auth-server/types#cancel) action to
cancel an existing request. The `new` action looks something like this:

```json
{
  "new": {
    "id": "2321f509-316c-4545-a838-4740eed86584",
    "request": {
      "ship": "sampel-palnet",
      "turf": "example.com",
      "user": "foobar123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1679788361389
      "time": 1679787461389
    }
  }
}
```

The [`id`](/reference/additional/auth-server/types#id) field is a random unique
ID for the request, and must be a v4 UUID (variant 1, RFC 4122/DCE 1.1).

The fields in the [`request`](/reference/additional/auth-server/types#request) are as
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
  particular request in Auth Client with the particular login request on your site.
  In theory you use it like two-factor authentication and make them type it into
  your site, but you generally shouldn't need to as Urbit networking verifies
  provenance of packets.
- `msg`: This field is *optional*, and should be `null` if you don't use it.
  This is just a general text field where you can include any extra message you
  want. You might like to include things like the IP address of the login
  request and the browser it came from. It's up to you.
- `expire`: This is the time the request should expire, in milliseconds since
  the Unix epoch. You can have it expire whenever you want, but setting it
  unreasonably soon (like seconds) may mean the user can't get to it in time,
  especially if there's network latency. At least a few minutes from now is a
  good idea.
- `time`: This is the timestamp of the request in milliseconds since the Unix
  epoch. You would typically just set it to now.

### Updates

There are two main types of updates you'll receive from Auth Server: an
[`entry`](/reference/additional/auth-server/types#entry) update and a
[`status`](/reference/additional/auth-server/types#status) update. An `entry` update
looks like this:

```json
{
  "entry": {
    "id": "2321f509-316c-4545-a838-4740eed86584",
    "request": {
      "ship": "zod",
      "turf": "localhost",
      "user": "@user123",
      "code": 123456,
      "msg": "blah blah blah",
      "expire": 1667213278424,
      "time": 1679787461389
    },
    "result": "sent"
  }
}
```

It contains the [`id`](/reference/additional/auth-server/types#id) and
[`request`](/reference/additional/auth-server/types#request) from the `new` action
above, and additionally shows the initial status in the
[`result`](/reference/additional/auth-server/types#result) field. This will normally
be `"sent"`, unless you set the expiry earlier than *now*, in which case it will
immediately be `"expire"` and Auth Server won't bother sending it to the user.

After it's been sent you'll get [`status`](/reference/additional/auth-server/types#status) updates for it when its status changes. A `status` update looks like:

```json
{
  "status": {
    "id": "2321f509-316c-4545-a838-4740eed86584",
    "result": "yes"
  }
}
```

Assuming it was initally `"sent"`, you'll get an update with a `"got"`
[`result`](/reference/additional/auth-server/types#result) when the user receives it
(but hasn't yet approved or denied it). If they approve it, you'll then get a
`"yes"` update, or if they deny it you'll get `"no"`. If it expires before they
receive it or before they approve/deny it, you'll get an `"expire"` update. If
there was an error in them receiving the request or your Auth Server couldn't
subscribe for the result, you'll get an `"error"` update. If you cancelled the
request with a `cancel` action, you'll get an `"abort"` result.

The normal flow is `"sent"` -> `"got"` -> `"yes"`/`"no"`, with
`"expire"`,`"error"` and `"abort"` potentially terminating the flow at any
point. The `"sent"` and `"got"` results are transitional, and the rest are
terminal.

### Subscriptions

Auth Server has a number of different subscription paths, but you'd likely only use
one or two. There are two categories of subscription paths:
[`/new/...`](/reference/additional/auth-server/subs#new) and
[`/init/...`](/reference/additional/auth-server/subs#new). The `/new` paths will
start giving you any updates that occur after you subscribe. The `/init` paths
will do the same, but they'll also give you initial state. For each of these,
there is a path to receive all updates, and there are also sub-paths to filter
by [`turf`](/reference/additional/auth-server/types#turf) (domain),
[`ship`](/reference/additional/auth-server/types#ship) and
[`id`](/reference/additional/auth-server/types#id). Additionally, for each
sub-path, you can specify a "since" time, and only receive updates and
initial state for requests with `time`s *later* than the one you specify.

If you're only handling a single site in Auth Server, you can just subscribe to the
`/init/all` path, retreiving initial state and then further updates as they
occur. If your site loses connection to Auth Server, you can just resubscribe to
`/init/all` to resync state, or, if you don't want all historical state, you
could subscribe to `/init/all/since/1679787461389 ` where the `time`
specified is the oldest time you think you could reasonably care about.

### Attestations

As described at the beginning, Auth Client checks
`<domain>/.well-known/appspecific/org.urbit.auth.json` to verify a request
actually comes from the domain it claims. That `.json` file must contain a
[`manifest`](/reference/additional/auth-server/types#manifest), which is just an
array of [`proof`](/reference/additional/auth-server/types#proof)s. A `proof` looks
like:

```json
{
  "turf": "example.com",
  "life": 1,
  "ship": "zod",
  "sign": "jtvkTK0JMizoY12Kw51R11OSKzmtCt2WHB3ev32R+k32O+Y6rJ7jHtrRizm0/0aKwJIO8X5PbDHwdti296XLCQ=="
}
```

The Auth Server front-end includes a simple tool to generate a `manifest` for a
single domain and ship. You can access it by clicking on Auth Server's tile in
Landscape.

Alternatively, you can make a scry request to the
[`/proof/[turf]`](/reference/additional/auth-server/scry#proof[turf]) scry path and
then programmatically put resulting proof(s) in a `manifest` array and serve
them on the `/.well-known/...` path. The `turf` in the path is your domain.

{% callout %}

[If your domain contains special characters, see the note at the bottom.](#additional note)

{% /callout %}


The `manifest` is allowed to contain multiple proofs for the same ship,
including different `live`s (key revisions), as well as for multiple different
ships and domains. Auth Client will try find the best case with the following
priority:

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

If Auth Client successfully validates a domain for a particular ship, it'll
remember it for 30 days and not bother to revalidate requests during that time.
For any other outcome, it won't remember and will try validate it again the next
time.

When trying to retrieve the `manifest`, Auth Client will follow up to 5 redirects,
and will retry up to 3 times if it doesn't get a `20x` status response. If it
gets a `20x` response but the manifest is missing or malformed, it will give up
immediately. If there are too many retries, too many redirects, or a `20x`
response is malformed, the request will be shown to the user with a red unlock
icon and a warning as described above.

{% callout %}

Auth Client cannot follow relative redirect URLs - redirects MUST be absolute URLs
including protocol.

{% /callout %}

## Additional note

The manifest generator along with the `/proof/[turf]` scry path and `turf`
subscription paths expect a domain with only lowercase `a-z`, `0-9`, `-` and
`.` separators. If your domain contains other characters, you'll have to use
the altenative `wood` paths with `++wood` encoding.

Here's an example implementation of `++wood` encoding:

```javascript
// encode the string into @ta-safe format, using logic from +wood.
// for example, 'some Chars!' becomes '~.some.~43.hars~21.'
//
export function stringToTa(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let add = "";
    switch (char) {
      case " ":
        add = ".";
        break;
      case ".":
        add = "~.";
        break;
      case "~":
        add = "~~";
        break;
      default:
        const charCode = str.charCodeAt(i);
        if (
          (charCode >= 97 && charCode <= 122) || // a-z
          (charCode >= 48 && charCode <= 57) || // 0-9
          char === "-"
        ) {
          add = char;
        } else {
          // TODO behavior for unicode doesn't match +wood's,
          //     but we can probably get away with that for now.
          add = "~" + charCode.toString(16) + ".";
        }
    }
    out = out + add;
  }
  return out;
}
```

You might also like to look at the Hoon reference for the
`++wood` function [here](/reference/hoon/stdlib/4b#wood).

