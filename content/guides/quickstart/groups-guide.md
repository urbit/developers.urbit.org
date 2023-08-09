+++
title = "Build a Groups App"
weight = 2
+++

In this lightning tutorial, we're going to build an app to create groups called
Squad. It'll look like this:

![squad screenshot](https://media.urbit.org/guides/quickstart/groups-app/squad-screenshot-reskin.png)

We'll be able to create either public groups or private groups. Private groups
will have a whitelist of allowed ships, and public groups will have a blacklist
of banned ships. Other ships will be able to join groups we create, and we'll be
able to join groups hosted by other ships too. This app isn't terribly useful by
itself, but its API will be used by the other apps we'll build in these
lightning tutorials.

The front-end of the app will be written in
[Sail](/reference/glossary/sail), Urbit's XML language built into the Hoon
compiler. Using Sail means we don't need to create a separate React front-end,
and can instead serve pages directly from our back-end. This works well for
static pages but a full JS-enabled front-end would be preferred for a dynamic
page.

If you'd like to check out the finished app, you can install it from
`~pocwet/squad` by either searching for `~pocwet` in the search bar of your
ship's homescreen, or by running `|install ~pocwet %squad`.

The app source is available in the [`docs-examples` repo on
Github](https://github.com/urbit/docs-examples), in the `groups-app` folder. It
has two folders inside:

1. `bare-desk`: just the hoon files created here without any dependencies.
2. `full-desk`: `bare-desk` plus all dependencies. Note some files are
   symlinked, so if you're copying them you'll need to do `cp -rL`.

Let's get started.

## Install binary

If you've already got the `urbit` CLI runtime installed, you can skip this step.
Otherwise, run one of the commands below, depending on your platform. It will
fetch the binary and save it in the current directory.

#### Linux (`x86_64`)

```shell {% copy=true %}
curl -L https://urbit.org/install/linux-x86_64/latest | tar xzk --transform='s/.*/urbit/g'
```

#### Linux (`aarch64`)

```shell {% copy=true %}
curl -L https://urbit.org/install/linux-aarch64/latest | tar xzk --transform='s/.*/urbit/g'
```

#### macOS (`x86_64`)

```shell {% copy=true %}
curl -L https://urbit.org/install/macos-x86_64/latest | tar xzk -s '/.*/urbit/'
```

#### macOS (`aarch64`)

```shell {% copy=true %}
curl -L https://urbit.org/install/macos-aarch64/latest | tar xzk -s '/.*/urbit/'
```

## Development ship

App development is typically done on a "fake" ship, which can be created with
the `-F` flag. In this case, so we can test it on the live network right away,
we'll do it on a comet instead. To create a comet, we can use the `-c` option,
and specify a name for the *pier* (ship folder):

```shell {% copy=true %}
./urbit -c dev-comet
```

It might take a few minutes to boot up, and will fetch updates for the default
apps. Once that's done it'll take us to the Dojo (Urbit's shell), as indicated
by the `~sampel_samzod:dojo>` prompt.

Note: we'll use `~sampel_samzod` throughout this guide, but this will be
different for you as a comet's ID is randomly generated.

## Dependencies

Our app needs a few standard files. We'll mount a couple of default desks so we
can copy them across. We can do this with the `|mount` command:

```{% copy=true %}
|mount %base
|mount %garden
```

With those mounted, switch back to a normal shell in another terminal window.
We'll create a folder to develop our app in, and then we'll copy a few files
across that our app will depend on:

```shell {% copy=true %}
mkdir -p squad/{app,sur,mar,lib}
cp -r dev-comet/base/mar/{bill*,hoon*,json*,kelvin*,mime*,noun*,ship*,txt*} squad/mar/
cp -r dev-comet/base/lib/{agentio*,dbug*,default-agent*,skeleton*} squad/lib/
cp -r dev-comet/garden/mar/docket-0.hoon squad/mar/
cp -r dev-comet/garden/lib/docket.hoon squad/lib/
cp -r dev-comet/garden/sur/docket.hoon squad/sur/
```

Now we can start working on the app itself.

## Types

The first thing we typically do when developing an app is define:

1. The basic types our app will deal with.
2. The structure of our app's state.
3. The app's interface - the types of requests it will accept and the types of
   updates it will send out to subscribers.

For our app, a group (aka squad) will be identified by a combination of the
host ship and the group name - this structure will be called a `gid` (group ID).
A squad has a changeable title, and may be public or private, so we'll track
these in a `squad` structure. We also need to track the current members of a
group, and the blacklist or whitelist depending if the group is public or
private: these sets of ships will be called `ppl`.

Our app state will contain a map from `gid` to `squad` for the basic groups, called `squads`. We'll also have an access control list called `acl`, mapping `gid` to `ppl`. If the squad is public it will represent a blacklist, and if the squad is private it will represent a whitelist. Lastly, we'll maintain another map from `gid` to `ppl` which tracks who has actually joined, called `members`.

For the actions/requests our app will accept, we'll need the following:

1. Create a new squad.
2. Delete a squad.
3. Whitelist or de-blacklist a ship (depending if the group is private or
   public).
4. De-whitelist or blacklist a ship (depending if the group is private or
   public).
5. Join a squad.
6. Leave a squad.
7. Make a private squad public.
8. Make a public squad private.
9. Change the title of a squad .

These actions will only be allowed to be taken by the host ship.

We also need to be able to send these events/updates out to subscribers in the
following cases:

1. The above action cases.
2. Provide the initial state of a squad for new subscribers.
3. Provide the initial state of all squads for other agents on the local ship.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. We'll therefore save the
following code in `squad/sur/squad.hoon`:

```hoon {% copy=true mode="collapse" %}
|%
::    --basic types for our app--
::
:: a squad (group) ID, comprised of the host ship and a
:: fixed resource name
::
+$  gid  [host=@p name=@tas]
:: the title of a squad - this can be changed and has no
:: character constraints, unlike the underlying $gid name
::
+$  title  @t
:: The members of a group - a simple set of ships
::
+$  ppl  (set @p)
:: the metadata of a squad - its title and whether it's
:: public or private
::
+$  squad  [=title pub=?]
::
::    --the structures that we'll store in our app's state--
::
:: The whole lot of squads we know and their metadata -
:: this is part of the agent's state. A map from $gid
:: to $squad
::
::
+$  squads  (map gid squad)
:: access control lists. A map from $gid to $ppl. Whether
:: it's a whitelist or blacklist depends of whether it's
:: set to public or private in the $squad
::
+$  acls  (jug gid @p)
:: current members - those who have actually joined,
:: rather than those who we've merely whitelisted.
::
+$  members  (jug gid @p)
::
::    --input requests/actions and output events/updater--
::
:: these are all the possible actions like creating a
:: new squad, whitelisting a ship, changing the title, etc
::
+$  act
  $%  [%new =title pub=?]
      [%del =gid]
      [%allow =gid =ship]
      [%kick =gid =ship]
      [%join =gid]
      [%leave =gid]
      [%pub =gid]
      [%priv =gid]
      [%title =gid =title]
  ==
:: these are all the possible events that can be sent
:: to subscribers. They're largely the same as $act actions
:: but with a couple extra to initialize state
::
+$  upd
  $%  [%init-all =squads =acls =members]
      [%init =gid =squad acl=ppl =ppl]
      [%del =gid]
      [%allow =gid =ship]
      [%kick =gid =ship]
      [%join =gid =ship]
      [%leave =gid =ship]
      [%pub =gid]
      [%priv =gid]
      [%title =gid =title]
  ==
::
::    --additional--
::
:: this just keeps track of the target page and section
:: for the front-end, so we can use a post/redirect/get
:: pattern while remembering where to focus
::
+$  page  [sect=@t gid=(unit gid) success=?]
--
```

## Agent

With all the types now defined, we can create the app itself.

The kernel module that manages userspace applications is named Gall. Each
application is called an *agent*. An agent has a state, and it has a fixed set
of event handling functions called *arms*. When Arvo (Urbit's operating system)
receives an event destined for our agent (maybe a message from the network, a
keystroke, an HTTP request, a timer expiry, etc), the event is given to the
appropriate arm for handling.

Most agent arms produce the same two things: a list of effects to be emitted,
and a new version of the agent itself, typically with an updated state. It thus
behaves much like a state machine, performing the function `(events, old-state)
=> (effects, new-state)`.

Squad uses a pub/sub pattern. Remote ships are able to subscribe to a squad we
host and receive updates such as access control list changes or members joining
and leaving. Likewise, we'll be able to subscribe to squads on other ships and
receive their updates. Remember, all Urbit ships are both clients and servers.

There's three main agent arms we use for this:

1. `on-poke`: This arm handles one-off actions/requests (our `act` structure).
   It will also handle requests from the front-end, which we'll create in the
   next section.
2. `on-watch`: This arm handles incoming subscription requests.
3. `on-agent`: This arm handles updates/events (our `upd` structure) from people
   we've subscribed to.
   
Let's look at each part in a little more detail.

#### `on-poke`

For this app, the `on-poke` will only allow pokes from the local ship - either
other agents using Squad's API or Squad's front-end. It will accept pokes with
either a `%squad-do` mark containing an `act` action we defined earlier, or a
`%handle-http-request` mark from the front-end. The latter case will be handles
by the `handle-http` arm. We'll check which URL path the request was sent to
(`/squad/join`, `/squad/new`, etc), extract the key-value pairs from the body of
the request, convert them to an `act` action, and then call the `handle-action`
arm to process. If we get a `%squad-do`, we pass it directly to the
`handle-action` arm.

```hoon
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  ?>  =(our.bol src.bol)
  =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %squad-do             (handle-action !<(act vase))
      %handle-http-request  (handle-http !<([@ta inbound-request:eyre] vase))
    ==
  [cards this]
..........
```

`handle-action` will handle each kind of request as appropriate, updating the
agent's state and sending out updates to subscribers.

#### `on-watch`

When you subscribe to an agent, you subscribe to a *path*. In our app's case, we
use the `gid` (group ID) as the path, like `/~sampel-palnet/my-squad-123`. A
remote ship will send us a subscription request which will arrive in the
`on-watch` arm. We'll check whether the remote ship is whitelisted (or not
blacklisted if public) for the requested `gid`, and then either accept or reject
the subscription request. If accepted, we'll send them the initial state of that
`gid`, and then continue to send them updates as they happen.

All network packets coming in from other ships are encrypted using our ship's
public keys, and signed with the remote ship's keys. The networking keys of all
ships are published on Azimuth, Urbit's identity system on the Ethereum
blockchain. All ships listen for transactions on Azimuth, and keep their local
PKI state up-to-date, so all ships know the keys of all other ships. When each
packet arrives, it's decrypted and checked for a valid signature. This means we
can be sure that all network traffic really comes from who it claims to come
from. Ames, the inter-ship networking kernel module, handles this all
automatically. When the message arrives at our agent, it'll just note the ship
it came from. This means checking permissions can be as simple as `?> =(our
src)` or `?> (~(has in src) allowed)`.

#### `on-agent`

Just as other ships will subscribe to paths via our `on-watch` and then start
receiving updates we send out, we'll do the same to them. Once subscribed, the
updates will start arriving in our `on-agent` arm. In order to know what
subscription the updates relate to, we'll specify a *wire* when we first
subscribe. A wire is like a tag for responses. All updates we receive for a
given subscription will come in on the wire we specified when we opened the
subscription. A wire has the same format as a subscription path, and in this
case we'll make it the same - `/~sampel-palnet/my-squad-123`.


#### The code

Gall agents live in the `/app` directory of a desk, so you can save this code in
`squad/app/squad.hoon`:

```hoon {% copy=true mode="collapse" %}
:: import our /sur/squad.hoon type definitions and expose
:: its contents
::
/-  *squad
:: import a handful of utility libraries: these make it
:: easier to write agents and less boilerplate
::
/+  default-agent, dbug, agentio
:: import our front-end file from /app/squad/index.hoon -
:: don't worry we'll write this in the next section
::
/=  index  /app/squad/index
::
:: We create a $versioned-state so it's easy to upgrade
:: down the line. Our initial state we tag with %0 and
:: call $state-0. It contains the state types we defined
:: earlier. We also define $card just for convenience,
:: so we don't have to type
:: card:agent:gall every time.
::
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =squads =acls =members =page]
+$  card  card:agent:gall
--
:: we wrap the whole thing with the dbug library we
:: imported so we can access debug functionality from
:: the dojo later
::
%-  agent:dbug
:: we initialize the state by pinning the default value
:: of our previously defined $state-0 structure, then we
:: name it simply state for convenience
::
=|  state-0
=*  state  -
:: here the agent core proper starts. We declare its type
:: an agent:gall, then we begin with its sample: the bowl.
:: The bowl contains various data like the current date-time,
:: entropy, the ship the current event came from, etc. It's
:: automatically populated by Gall each time an event comes in.
::
^-  agent:gall
|_  bol=bowl:gall
:: here we define some aliases for convenience: "this" refers
:: to the whole agent, def is the default-agent library we
:: imported, and io is the agentio library
::
+*  this  .
    def   ~(. (default-agent this %.n) bol)
    io    ~(. agentio bol)
::
:: on-init is only called once, when the app is first installed.
:: In our case it binds the /squad URL path for the front-end,
:: and also tries to auto-join the "Hello World" demo squad on
:: ~pocwet
::
++  on-init
  ^-  (quip card _this)
  :_  this
  :-  (~(arvo pass:io /bind) %e %connect `/'squad' %squad)
  ?:  =(~pocwet our.bol)  ~
  ~[(~(watch pass:io /hello) [~pocwet %squad] /hello)]
:: on-save is called whenever an app is upgraded or suspended.
:: It exports the app's state so either an upgrade can be
:: performed or it can be archived while suspended
::
++  on-save  !>(state)
:: on-load is called after every upgrade or when a suspended
:: agent is revived. The previously exported state is re-imported
:: and saved to the state location we pinned in the basic setup
:: section
::
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
:: on-poke: actions/requests from either the front-end or the
:: local ship
::
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  :: assert that only the local ship (and its front-end) can
  :: poke our agent. our.bol is the local ship and src.bol is
  :: the source of the request - it's cryptographically guaranteed
  :: to be correct. We just test for equality here
  ::
  ?>  =(our.bol src.bol)
  :: the mark lets us know whether it's an HTTP request from
  :: the front-end or if it's our %squad-do mark sent directory
  :: from the local ship. We call handle-http or handle-action
  :: depending on which it is.
  ::
  =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %squad-do             (handle-action !<(act vase))
      %handle-http-request  (handle-http !<([@ta inbound-request:eyre] vase))
    ==
  [cards this]
  :: handle-action contains our HTTP request handling logic
  ::
  ++  handle-http
    |=  [rid=@ta req=inbound-request:eyre]
    ^-  (quip card _state)
    :: if the request doesn't contain a valid session cookie
    :: obtained by logging in to landscape with the web logic
    :: code, we just redirect them to the login page
    ::
    ?.  authenticated.req
      :_  state
      (give-http rid [307 ['Location' '/~/login?redirect='] ~] ~)
    :: if it's authenticated, we test whether it's a GET or
    :: POST request.
    ::
    ?+  method.request.req
      :: if it's neither, we give a method not allowed error.
      ::
      :_  state
      %^    give-http
          rid
        :-  405
        :~  ['Content-Type' 'text/html']
            ['Content-Length' '31']
            ['Allow' 'GET, POST']
        ==
      (some (as-octs:mimes:html '<h1>405 Method Not Allowed</h1>'))
    :: if it's a get request, we call our index.hoon file
    :: with the current app state to generate the HTML and
    :: return it. (we'll write that file in the next section)
    ::
        %'GET'
      :_  state(page *^page)
      (make-200 rid (index bol squads acls members page))
    :: if it's a POST request, we first make sure the body
    :: isn't empty, and redirect back to the index if it is.
    ::
        %'POST'
      ?~  body.request.req  [(index-redirect rid '/squad') state]
      :: otherwise, we decode the querystring in the body
      :: of the request. If it fails to parse, we again redirect
      :: to the index.
      ::
      =/  query=(unit (list [k=@t v=@t]))
        (rush q.u.body.request.req yquy:de-purl:html)
      ?~  query  [(index-redirect rid '/squad') state]
      :: now that it's valid, we convert the key-value pair list
      :: from the querystring into a map from key to value so we
      :: can easily randomly access it
      ::
      =/  kv-map=(map @t @t)  (~(gas by *(map @t @t)) u.query)
      :: next, we decode the requested URL to determine the path
      :: they're requesting - we use the path to determine what
      :: kind of request it is
      ::
      =/  =path
        %-  tail
        %+  rash  url.request.req
        ;~(sfix apat:de-purl:html yquy:de-purl:html)
      :: now we switch on the path, handling the different kinds
      :: of requests. If it's not a known path, we again just
      :: redirect to the index.
      ::
      ?+    path  [(index-redirect rid '/squad') state]
        :: if it's a join request, we get the target and decode it
        :: to a gid, redirecting to the index if it fails
        ::
          [%squad %join ~]
        =/  target=(unit @t)  (~(get by kv-map) 'target-squad')
        ?~  target
          :_  state(page ['join' ~ |])
          (index-redirect rid '/squad#join')
        =/  u-gid=(unit gid)
          %+  rush  u.target
          %+  ifix  [(star ace) (star ace)]
          ;~(plug ;~(pfix sig fed:ag) ;~(pfix fas sym))
        ?~  u-gid
          :_  state(page ['join' ~ |])
          (index-redirect rid '/squad#join')
        :: if we're trying to join our own group, disregard
        ::
        ?:  =(our.bol host.u.u-gid)
          :_  state(page ['join' ~ &])
          (index-redirect rid '/squad#join')
        :: otherwise, pass the join request to handle-action
        :: to process, update the target section in the FE
        ::
        =^  cards  state  (handle-action %join u.u-gid)
        :_  state(page ['join' ~ &])
        (weld cards (index-redirect rid '/squad#join'))
      ::
        :: if it's a new group request, make sure it has
        :: the title and public/private setting
        ::
          [%squad %new ~]
        ?.  (~(has by kv-map) 'title')
          :_  state(page ['new' ~ |])
          (index-redirect rid '/squad#new')
        =/  title=@t  (~(got by kv-map) 'title')
        =/  pub=?  (~(has by kv-map) 'public')
        :: otherwise, pass request to handle-action to process
        ::
        =^  cards  state  (handle-action %new title pub)
        :_  state(page ['new' ~ &])
        (weld cards (index-redirect rid '/squad#new'))
      ::
        :: if it's a change title request, make sure it specifies
        :: the gid and the new title, and decode them
        ::
          [%squad %title ~]
        =/  vals=(unit [gid-str=@t =title])
          (both (~(get by kv-map) 'gid') (~(get by kv-map) 'title'))
        ?~  vals
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  gid-str.u.vals
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: otherwise, pass to handle-action to process and redirect
        :: to index, setting the section anchor to the gid in
        :: question
        ::
        =^  cards  state  (handle-action %title u.u-gid title.u.vals)
        :_  state(page ['title' u-gid &])
        (weld cards (index-redirect rid (crip "/squad#{(trip gid-str.u.vals)}")))
      ::
        :: if it's a squad deletion request, make sure the gid
        :: is specified and it can be successfully decoded
        ::
          [%squad %delete ~]
        ?.  (~(has by kv-map) 'gid')
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: make sure it's actually our squad we're deleting
        ::
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: otherwise, pass to handle-action to process
        ::
        =^  cards  state  (handle-action %del u.u-gid)
        :_  state(page ['generic' ~ &])
        (weld cards (index-redirect rid '/squad'))
      ::
        :: if it's a request to leave a squad, make sure
        :: the gid is specified
        ::
          [%squad %leave ~]
        ?.  (~(has by kv-map) 'gid')
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: make sure  we're not trying to join our own squad
        ::
        ?:  =(our.bol host.u.u-gid)
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: pass the request to handle-action to process
        ::
        =^  cards  state  (handle-action %leave u.u-gid)
        :_  state(page ['generic' ~ &])
        (weld cards (index-redirect rid '/squad'))
      ::
        :: if ti's a request to kick a squad member, make
        :: sure the target ship and gid are specified
        ::
          [%squad %kick ~]
        =/  vals=(unit [gid-str=@t ship-str=@t])
          (both (~(get by kv-map) 'gid') (~(get by kv-map) 'ship'))
        ?~  vals
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  gid-str.u.vals
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: make sure it's our squad
        ::
        ?.  =(host.u.u-gid our.bol)
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        =/  u-ship=(unit @p)
          %+  rush  ship-str.u.vals
          %+  ifix  [(star ace) (star ace)]
          ;~(pfix sig fed:ag)
        ?~  u-ship
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        :: make sure we're not trying to kick ourselves
        ::
        ?:  =(u.u-ship our.bol)
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        :: pass to handle-action to process
        ::
        =^  cards  state  (handle-action %kick u.u-gid u.u-ship)
        :_  state(page ['kick' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
      ::
        :: if it's a request to whitelist someone,
        :: make sure the ship and gid are specified
        ::
          [%squad %allow ~]
        =/  vals=(unit [gid-str=@t ship-str=@t])
          (both (~(get by kv-map) 'gid') (~(get by kv-map) 'ship'))
        ?~  vals
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  gid-str.u.vals
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: make sure it's our own squad also
        ::
        ?.  =(host.u.u-gid our.bol)
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        =/  u-ship=(unit @p)
          %+  rush  ship-str.u.vals
          %+  ifix  [(star ace) (star ace)]
          ;~(pfix sig fed:ag)
        ?~  u-ship
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        :: pass to handle-action to process
        ::
        =^  cards  state  (handle-action %allow u.u-gid u.u-ship)
        :_  state(page ['kick' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
      ::
        :: if it's a request to make a squad public,
        :: make sure the gid is specified
        ::
          [%squad %public ~]
        ?.  (~(has by kv-map) 'gid')
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: also make sure it's our own squad
        ::
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['public' `u.u-gid |])
          (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
        :: pass to handle-action to process
        ::
        =^  cards  state  (handle-action %pub u.u-gid)
        :_  state(page ['public' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
      ::
        :: if it's a request to make the squad private,
        :: make sure the gid is specified
        ::
          [%squad %private ~]
        ?.  (~(has by kv-map) 'gid')
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =/  u-gid=(unit gid)
          %+  rush  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        ?~  u-gid
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        :: also make sure it's our squad
        ::
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['public' `u.u-gid |])
          (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
        :: pass to handle-action to process
        ::
        =^  cards  state  (handle-action %priv u.u-gid)
        :_  state(page ['public' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
      ==
    ==
  :: handle-action contains the core logic for handling
  :: the various $act actions
  ::
  ++  handle-action
    |=  =act
    ^-  (quip card _state)
    :: we switch on the kind of action
    ::
    ?-  -.act
      :: if it's a request to create a new squad, we add
      :: the it to $squads in our state and initialize member
      :: and ACL entries too. We then send an %init
      :: update out to local agents to let them know
      ::
        %new
      =/  =gid  [our.bol (title-to-name title.act)]
      =/  =squad  [title.act pub.act]
      =/  acl=ppl  ?:(pub.act *ppl (~(put in *ppl) our.bol))
      =/  =ppl  (~(put in *ppl) our.bol)
      :_  %=  state
            squads   (~(put by squads) gid squad)
            acls     (~(put by acls) gid acl)
            members  (~(put by members) gid ppl)
          ==
      :~  (fact:io squad-did+!>(`upd`[%init gid squad acl ppl]) ~[/local/all])
      ==
    ::
      :: if it's a deletion request, as long as it's our
      :: squad we delete all we know about it, kick all
      :: remote subscribers and tell alert subscribers
      ::
        %del
      ?>  =(our.bol host.gid.act)
      :_  %=  state
            squads   (~(del by squads) gid.act)
            acls     (~(del by acls) gid.act)
            members  (~(del by members) gid.act)
          ==
      :-  (fact:io squad-did+!>(`upd`[%del gid.act]) ~[/local/all])
      (fact-kick:io /[name.gid.act] squad-did+!>(`upd`[%del gid.act]))
    ::
      :: it it's a request to whitelist (or de-blacklist)
      :: a ship, we update the ACL appropriately and update
      :: both local and remote subscribers
      ::
        %allow
      ?>  =(our.bol host.gid.act)
      ?<  =(our.bol ship.act)
      =/  pub=?  pub:(~(got by squads) gid.act)
      ?:  ?|  &(pub !(~(has ju acls) gid.act ship.act))
              &(!pub (~(has ju acls) gid.act ship.act))
          ==
        `state
      :_  state(acls (?:(pub ~(del ju acls) ~(put ju acls)) gid.act ship.act))
      :~  %+  fact:io
            squad-did+!>(`upd`[%allow gid.act ship.act])
          ~[/local/all /[name.gid.act]]
      ==
    ::
      :: if ti's a request to kick someone, we make sure we're
      :: not kicking ourselves and that it's our squad. Then we
      :: add them to the blacklist or remove them from the
      :: whitelist as the case may be, kick them from the
      :: subscription and update local and remote subscribers
      :: about the kick
      ::
        %kick
      ?>  =(our.bol host.gid.act)
      ?<  =(our.bol ship.act)
      =/  pub=?  pub:(~(got by squads) gid.act)
      ?:  ?|  &(pub (~(has ju acls) gid.act ship.act))
              &(!pub !(~(has ju acls) gid.act ship.act))
          ==
        `state
      :_  %=  state
            acls  (?:(pub ~(put ju acls) ~(del ju acls)) gid.act ship.act)
            members  (~(del ju members) gid.act ship.act)
          ==
      :~  %+  fact:io
            squad-did+!>(`upd`[%kick gid.act ship.act])
          ~[/local/all /[name.gid.act]]
          (kick-only:io ship.act ~[/[name.gid.act]])
      ==
    ::
      :: if it's a request to join a squad, if it's our own
      :: or we are already a member, we do nothing. Otherwise,
      :: we send a join request off to the host ship
      ::
        %join
      ?:  |(=(our.bol host.gid.act) (~(has by squads) gid.act))
        `state
      =/  =path  /[name.gid.act]
      :_  state
      :~  (~(watch pass:io path) [host.gid.act %squad] path)
      ==
    ::
      :: if it's a request to leave a squad, we check it's not
      :: our own, delete all we know about it, unsubscribe from
      :: it and let local subscribers know we've unsubscribed
      ::
        %leave
      ?<  =(our.bol host.gid.act)
      ?>  (~(has by squads) gid.act)
      =/  =path  /[name.gid.act]
      :_  %=  state
            squads   (~(del by squads) gid.act)
            members  (~(del by members) gid.act)
            acls     (~(del by acls) gid.act)
          ==
      :~  (~(leave-path pass:io path) [host.gid.act %squad] path)
          (fact:io squad-did+!>(`upd`[%leave gid.act our.bol]) ~[/local/all])
      ==
    ::
      :: if it's a request to make a squad public, we check
      :: it's ours and that it's not already public, then we
      :: clear the whitelist and change the metadata to public,
      :: then alert local and remote subscribers of the change
      ::
        %pub
      ?>  =(our.bol host.gid.act)
      =/  =squad  (~(got by squads) gid.act)
      ?:  pub.squad  `state
      :_  %=  state
            squads  (~(put by squads) gid.act squad(pub &))
            acls    (~(del by acls) gid.act)
          ==
      :~  %+  fact:io
            squad-did+!>(`upd`[%pub gid.act])
          ~[/local/all /[name.gid.act]]
      ==
    ::
      :: if it's a request to make a squad private, we check
      :: it's ours and it's not already private, then we put all
      :: current members in the whitelist and change its metadata
      :: to private. We then alert local and remote subscribers
      :: of the change.
      ::
        %priv
      ?>  =(our.bol host.gid.act)
      =/  =squad  (~(got by squads) gid.act)
      ?.  pub.squad  `state
      =/  =ppl  (~(got by members) gid.act)
      :_  %=  state
            squads  (~(put by squads) gid.act squad(pub |))
            acls    (~(put by acls) gid.act ppl)
          ==
      :~  %+  fact:io
            squad-did+!>(`upd`[%priv gid.act])
          ~[/local/all /[name.gid.act]]
      ==
    ::
      :: if it's a request to rename the squad, we check it's
      :: ours and that the new title is different to the current,
      :: then we update the title and alert local and remote
      :: subscribers
      ::
        %title
      ?>  =(our.bol host.gid.act)
      =/  =squad  (~(got by squads) gid.act)
      ?:  =(title.squad title.act)
        `state
      :_  state(squads (~(put by squads) gid.act squad(title title.act)))
      :~  %+  fact:io
            squad-did+!>(`upd`[%title gid.act title.act])
          ~[/local/all /[name.gid.act]]
      ==
    ==
  :: this function is used to generate a resource name
  :: for the gid from a title when creating a new squad
  :: It makes sure it's unique and replaces illegal
  :: characters in a @tas with hyphens
  ::
  ++  title-to-name
    |=  =title
    ^-  @tas
    =/  new=tape
      %+  scan
        (cass (trip title))
      %+  ifix
        :-  (star ;~(less aln next))
        (star next)
      %-  star
      ;~  pose
        aln
        ;~  less
          ;~  plug
            (plus ;~(less aln next))
            ;~(less next (easy ~))
          ==
          (cold '-' (plus ;~(less aln next)))
        ==
      ==
    =?  new  ?=(~ new)
      "x"
    =?  new  !((sane %tas) (crip new))
      ['x' '-' new]
    ?.  (~(has by squads) [our.bol (crip new)])
      (crip new)
    =/  num=@ud  1
    |-
    =/  =@tas  (crip "{new}-{(a-co:co num)}")
    ?.  (~(has by squads) [our.bol tas])
      tas
    $(num +(num))
  :: this function creates a HTTP redirect response to a
  :: particular location
  ::
  ++  index-redirect
    |=  [rid=@ta path=@t]
    ^-  (list card)
    (give-http rid [302 ['Location' path] ~] ~)
  :: this function makes a status 200 success response.
  :: It's used to serve the index page.
  ::
  ++  make-200
    |=  [rid=@ta dat=octs]
    ^-  (list card)
    %^    give-http
        rid
      :-  200
      :~  ['Content-Type' 'text/html']
          ['Content-Length' (crip ((d-co:co 1) p.dat))]
      ==
    [~ dat]
  :: this function composes the underlying HTTP responses
  :: to successfully complete and close the connection
  ::
  ++  give-http
    |=  [rid=@ta hed=response-header:http dat=(unit octs)]
    ^-  (list card)
    :~  [%give %fact ~[/http-response/[rid]] %http-response-header !>(hed)]
        [%give %fact ~[/http-response/[rid]] %http-response-data !>(dat)]
        [%give %kick ~[/http-response/[rid]] ~]
    ==
  --
:: on-watch is the agent arm that handles subscription
:: requests
::
++  on-watch
  |=  =path
  |^  ^-  (quip card _this)
  :: if it's an HTTP request that's not from the local
  :: ship, disregard
  ::
  ?:  &(=(our.bol src.bol) ?=([%http-response *] path))
    `this
  :: if it's a local request for ALL state, check it's
  :: actually local and fulfill it with an %init-all $upd
  ::
  ?:  ?=([%local %all ~] path)
    ?>  =(our.bol src.bol)
    :_  this
    :~  %-  fact-init:io
        squad-did+!>(`upd`[%init-all squads acls members])
    ==
  :: if the requested subscription path has only one element,
  :: it means it's probably a remote ship trying to subscribe
  :: for updates forking a squad we host
  ::
  ?>  ?=([@ ~] path)
  :: convert the path into a gid
  ::
  =/  =gid  [our.bol i.path]
  :: get the squad metadata from state
  ::
  =/  =squad  (~(got by squads) gid)
  :: if it's public, make sure we haven't blacklisted
  :: the requester.
  :: 
  ?:  pub.squad
    ?<  (~(has ju acls) gid src.bol)
    :: if they're already a member, just give them the initial
    :: squad state
    ::
    ?:  (~(has ju members) gid src.bol)
      [~[(init gid)] this]
    :: if they're not already a member, add them to members,
    :: give them initial state, and then alert other local
    :: and remote subscribers that they've joined
    ::
    :_  this(members (~(put ju members) gid src.bol))
    :~  (init gid)
        %+  fact:io
          squad-did+!>(`upd`[%join gid src.bol])
        ~[/local/all /[name.gid]]
    ==
  :: if it's a private squad, make sure they're in
  :: the whitelist,
  ::
  ?>  (~(has ju acls) gid src.bol)
  :: if they're already a member, just give them the
  :: initial state
  ::
  ?:  (~(has ju members) gid src.bol)
    [~[(init gid)] this]
  :: otherwise add them to members, give them the initial
  :: state and tell other local and remote subscribers
  :: that they've joined
  ::
  :_  this(members (~(put ju members) gid src.bol))
  :~  (init gid)
      %+  fact:io
        squad-did+!>(`upd`[%join gid src.bol])
      ~[/local/all /[name.gid]]
  ==
  :: this function just composes the %init $upd for new
  :: subscribers
  ::
  ++  init
    |=  =gid
    ^-  card
    %+  fact-init:io  %squad-did
    !>  ^-  upd
    :*  %init
        gid
        (~(got by squads) gid)
        (~(get ju acls) gid)
        (~(got by members) gid)
    ==
  --
:: on-agent handles updates from other people or apps
:: we've subscribed to
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  :: decode the wire (response tag) to determine which
  :: squad it pertains to
  ::
  ?>  ?=([@ ~] wire)
  =/  =gid  [src.bol i.wire]
  :: next, we'll handle the different kinds of
  :: responses/updates it might be. We just use the
  :: default handler for anything we don't need to
  :: manually handle
  ::
  ?+  -.sign  (on-agent:def wire sign)
    :: if it's an acknowledgement for a subscription
    :: request we previously sent...
    ::
      %watch-ack
    :: if there's no error, the subscription succeeded
    :: so we do nothing.
    ::
    ?~  p.sign
      [~ this]
    :: otherwise there's an error, the subscription failed,
    :: meaning we've been rejected. We give up and delete
    :: all we know about the squad. We also alert local
    :: subscribers that we've been kicked.
    ::
    :_  %=  this
          squads   (~(del by squads) gid)
          acls     (~(del by acls) gid)
          members  (~(del by members) gid)
        ==
    :~  (fact:io squad-did+!>(`upd`[%kick gid our.bol]) ~[/local/all])
    ==
  ::
    :: if it's a kick alert, it may or may not be intentional,
    :: so we just automaticall try to resubscribe
    ::
      %kick
    ?.  (~(has by squads) gid)  `this
    :_  this
    :~  (~(watch pass:io wire) [host.gid %squad] wire)
    ==
  ::
    :: a %fact is a normal update from the publisher
    ::
      %fact
    :: assert it's the %squad-did mark we expect
    ::
    ?>  ?=(%squad-did p.cage.sign)
    :: extract the update
    ::
    =/  =upd  !<(upd q.cage.sign)
    :: switch on what kind of update it is, passing it to
    :: the default handler if it's one we don't expect
    ::
    ?+  -.upd  (on-agent:def wire sign)
      :: if it's an %init update containing the initial
      :: state of a squad, overwrite what we know about
      :: the squad in our state, and pass it on to other
      :: local subscribers
      ::
        %init
      ?.  =(gid gid.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      %=  this
        squads   (~(put by squads) gid squad.upd)
        acls     (~(put by acls) gid acl.upd)
        members  (~(put by members) gid ppl.upd)
      ==
    ::
      :: if the squad has been deleted, delete all we know
      :: about it from our state, alert local subscribers about
      :: the deletion, then leave the subscription
      ::
        %del
      ?.  =(gid gid.upd)  `this
      :_  %=  this
            squads  (~(del by squads) gid)
            acls  (~(del by acls) gid)
            members  (~(del by members) gid)
          ==
      :~  (fact:io cage.sign ~[/local/all])
          (~(leave-path pass:io wire) [src.bol %squad] wire)
      ==
    ::
      :: if it's telling us the squad has whitelisted
      :: (or de-blacklisted) a ship, update the squad's
      :: metadata and ACL in state, then alert local
      :: subscribers of what happened
      ::
        %allow
      ?.  =(gid gid.upd)  `this
      =/  pub=?  pub:(~(got by squads) gid)
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(acls (?:(pub ~(del ju acls) ~(put ju acls)) gid ship.upd))
    ::
      :: if it's telling us someone's been kicked from
      :: the squad...
      ::
        %kick
      ?.  =(gid gid.upd)  `this
      =/  pub=?  pub:(~(got by squads) gid)
      :: check if it's NOT us who have been kicked. In
      :: this case - blacklist or de-whitelist the ship,
      :: remove them from the squad's member list, and
      :: update local subscribers
      ::
      ?.  =(our.bol ship.upd)
        :-  ~[(fact:io cage.sign ~[/local/all])]
        %=  this
          acls  (?:(pub ~(put ju acls) ~(del ju acls)) gid ship.upd)
          members  (~(del ju members) gid ship.upd)
        ==
      :: if WE'VE been kicked, delete all we know about
      :: the squad and let local subscribers know about
      :: the kick. Then, unsubscribe from further updates.
      ::
      :_  %=  this
            squads   (~(del by squads) gid)
            acls     (~(del by acls) gid)
            members  (~(del by members) gid)
          ==
      :~  (fact:io cage.sign ~[/local/all])
          (~(leave-path pass:io wire) [src.bol %squad] wire)
      ==
    ::
      :: if it's telling us someone joined the squad, update the
      :: member list and alert local subscribers of the join
      ::
        %join
      ?.  =(gid gid.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(members (~(put ju members) gid ship.upd))
    ::
      :: if it's saying someone left the group...
        %leave
      ?.  =(gid gid.upd)  `this
      :: check whether it's US, and do nothing if so
      ::
      ?:  =(our.bol ship.upd)  `this
      :: otherwise, update the member list and and let local
      :: subscribers know
      ::
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(members (~(del ju members) gid ship.upd))
    ::
      :: if it's saying the squad has been made public,
      :: update its metadata and alert local subscribers
      ::
        %pub
      ?.  =(gid gid.upd)  `this
      =/  =squad  (~(got by squads) gid)
      ?:  pub.squad  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      %=  this
        squads  (~(put by squads) gid squad(pub &))
        acls    (~(put by acls) gid *ppl)
      ==
    ::
      :: if it's saying the squad has been made private,
      :: update its metadata, move all existing members
      :: to the whitelist, and alert local subscribers
      ::
        %priv
      ?.  =(gid gid.upd)  `this
      =/  =squad  (~(got by squads) gid)
      ?.  pub.squad  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      %=  this
        squads  (~(put by squads) gid squad(pub |))
        acls    (~(put by acls) gid (~(get ju members) gid))
      ==
    ::
      :: if it's saying the title has changed, update the
      :: squad's title and alert local subscribers
      ::
        %title
      ?.  =(gid gid.upd)  `this
      =/  =squad  (~(got by squads) gid)
      ?:  =(title.squad title.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      %=  this
        squads  (~(put by squads) gid squad(title title.upd))
      ==
    ==
  ==
:: on-leave handles notifications that someone has
:: unsubscribed from us
::
++  on-leave
  |=  =path
  ^-  (quip card _this)
  :: if it's a local subscriber, do nothing
  ::
  ?.  ?=([@ ~] path)  (on-leave:def path)
  :: if it's from us or they're not even a subscriber,
  :: also do nothing
  ::
  ?:  |(=(src.bol our.bol) (~(any by sup.bol) |=([=@p *] =(src.bol p))))
    `this
  :: otherwise, decode the gid, remove them from the member list,
  :: and alert other local or remote subscribers that they've left
  ::
  =/  =gid  [our.bol i.path]
  :_  this(members (~(del ju members) gid src.bol))
  :~  (fact:io squad-did+!>(`upd`[%leave gid src.bol]) ~[/local/all path])
  ==
:: on-peek handles "scry" requests - local read-only requests
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  :: we switch on the scry path, these different "scry
  :: endpoints" produce different information
  ::
  ?+    path  (on-peek:def path)
    :: a request for ALL state
    ::
      [%x %all ~]
    ``noun+!>([squads acls members])
  ::
    :: a request for all squads and their metadata
    ::
      [%x %squads ~]
    ``noun+!>(squads)
  ::
    :: a request for all squad gids (but no metadata)
    ::
      [%x %gids %all ~]
    ``noun+!>(`(set gid)`~(key by squads))
  ::
    :: a request for only the gids of squads we host
    ::
      [%x %gids %our ~]
    =/  gids=(list gid)  ~(tap by ~(key by squads))
    =.  gids  (skim gids |=(=gid =(our.bol host.gid)))
    ``noun+!>(`(set gid)`(~(gas in *(set gid)) gids))
  ::
    :: a request for the metadata of a particular squad
    ::
      [%x %squad @ @ ~]
    =/  =gid  [(slav %p i.t.t.path) i.t.t.t.path]
    ``noun+!>(`(unit squad)`(~(get by squads) gid))
  ::
    :: a request for the blacklist or whitelist for
    :: a particular squad
    ::
      [%x %acl @ @ ~]
    =/  =gid  [(slav %p i.t.t.path) i.t.t.t.path]
    =/  u-squad=(unit squad)  (~(get by squads) gid)
    :^  ~  ~  %noun
    !>  ^-  (unit [pub=? acl=ppl])
    ?~  u-squad
      ~
    `[pub.u.u-squad (~(get ju acls) gid)]
  ::
    :: a request for all current members of a particular
    :: squad
    ::
      [%x %members @ @ ~]
    =/  =gid  [(slav %p i.t.t.path) i.t.t.t.path]
    ``noun+!>(`ppl`(~(get ju members) gid))
  ::
    :: a request for the titles of all squads. This is intended
    :: to be used from a front-end, unlike the others, so it
    :: produces JSON rather than just a noun
    ::
      [%x %titles ~]
    :^  ~  ~  %json
    !>  ^-  json
    :: make a JSON array
    ::
    :-  %a
    :: sort all the titles alphabetically
    ::
    %+  turn
      (sort ~(tap by squads) |=([[* a=@t *] [* b=@t *]] (aor a b)))
    :: convert each one to a JSON object like:
    :: {"gid": {"host": "~zod", "name": "foo"}, "title": "some title"}
    ::
    |=  [=gid =@t ?]
    ^-  json
    %-  pairs:enjs:format
    :~  :-  'gid'
        %-  pairs:enjs:format
        :~  ['host' s+(scot %p host.gid)]
            ['name' s+name.gid]
        ==
        ['title' s+t]
    ==
  ==
:: on-arvo handles kernel responses. The only interaction we
:: have with the kernel directly is when we bind the /squad
:: URL path, so we just take the acknowledgement of that and
:: print an error if it failed
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%bind ~] wire)
    (on-arvo:def [wire sign-arvo])
  ?.  ?=([%eyre %bound *] sign-arvo)
    (on-arvo:def [wire sign-arvo])
  ~?  !accepted.sign-arvo
    %eyre-rejected-squad-binding
  `this
:: on-fail is called when our agent crashes. We'll just leave
:: it to the default handler in default-agent to print the error
::
++  on-fail  on-fail:def
--
```

## Marks

Marks are Urbit's version of filetypes/MIME types (but strongly typed and with
inter-mark conversion methods). We need to define a mark for the `act`ions we'll
send or receive, and the `upd`ates we'll send to subscribers or receive for
subscriptions. These will be very simple since we don't need to do any
conversions to things like JSON.

Mark files are stored in the `/mar` directory of a desk. Save the
`%squad-do` mark in `squad/mar/squad/do.hoon`, and the `%squad-did`
mark in `squad/mar/squad/did.hoon`.

#### `%squad-do`

```hoon {% copy=true %}
:: first we import our /sur/squad.hoon type defs and expose them directly
::
/-  *squad
:: the mark door takes an $act action in in the outbound case
::
|_  a=act
:: the grow arm converts from an $act to other things
::
++  grow
  |%
  :: we just handle the general noun case and return it unchanged
  ::
  ++  noun  a
  --
:: the grab arm handles conversions from other things to an $act
::
++  grab
  |%
  :: we just handle the noun case and mold it to an $act
  ::
  ++  noun  act
  --
:: grad handles revision control functions, we just delegate such
:: functions to the %noun mark
::
++  grad  %noun
--
```

#### `%squad-did`

```hoon {% copy=true %}
:: first we import our /sur/squad.hoon type defs and expose them directly
::
/-  *squad
:: the mark door takes an $upd update in in the outbound case
::
|_  u=upd
:: the grow arm converts from an $upd to other things
::
++  grow
  |%
  :: we just handle the general noun case and return it unchanged
  ::
  ++  noun  u
  --
:: the grab arm handles conversions from other things to an $act
::
++  grab
  |%
  :: we just handle the noun case and mold it to an $upd
  ::
  ++  noun  upd
  --
:: grad handles revision control functions, we just delegate such
:: functions to the %noun mark
::
++  grad  %noun
--
```
## Front-end

We could have put the front-end code directly in our Gall agent, but it tends to
be quite large so it's convenient to have it in a separate file and just import
it. Most of this file consists of Sail code, which is the internal HTML
representation, similar to other server-side renderings like Clojure's Hiccup.

Save the code below in `squad/app/squad/index.hoon`.

```hoon {% copy=true mode="collapse" %}
:: first we import our /sur/squad.hoon type definitions and expose them directly
::
/-  *squad
:: our front-end takes in the bowl from our agent and also our agent's state
::
|=  [bol=bowl:gall =squads =acls =members =page]
:: 5. we return an $octs, which is the encoded body of the HTTP response and its byte-length
::
|^  ^-  octs
:: 4. we convert the cord (atom string) to an octs
::
%-  as-octs:mimes:html
:: 3. we convert the tape (character list string) to a cord (atom string) for the octs conversion
::
%-  crip
:: 2. the XML data structure is serialized into a tape (character list string)
::
%-  en-xml:html
:: 1. we return a $manx, which is urbit's datatype to represent an XML structure
::
^-  manx
:: here begins the construction of our HTML structure. We use Sail, a domain-specific language built
:: into the hoon compiler for this purpose
::
;html
  ;head
    ;title: squad
    ;meta(charset "utf-8");
    ;link(href "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Source+Code+Pro:wght@400;600&display=swap", rel "stylesheet");
    ;style
      ;+  ;/  style
    ==
  ==
  ;body
    ;main
    :: Here we compose the overall body of the page, putting together the different
    :: components defined below
    ::
    ;+  ?.  =('generic' sect.page)
            ;/("")
          %+  success-component
            ?:(success.page "success" "failed")
          success.page
      ;h2: Join
      ;+  join-component
      ;h2: Create
      ;+  new-component
      ;+  ?~  squads
            ;/("")
          ;h2: Squads
      ;*  %+  turn
            %+  sort  ~(tap by squads)
            |=  [a=[* =title *] b=[* =title *]]
            (aor title.a title.b)
          squad-component
    ==
  ==
==
:: this little component just displays whether the previous request succeeded or failed
::
++  success-component
  |=  [txt=tape success=?]
  ^-  manx
  ;span(class ?:(success "success" "failure")): {txt}
:: this creates a form where you can enter the short-code of a squad and join it.
:: The form is POSTed to the /squad/join URL path and handled by the gall agent
::
++  join-component
  ^-  manx
  ;form(method "post", action "/squad/join")
    ;input
      =type         "text"
      =id           "join"
      =name         "target-squad"
      =class        "code"
      =size         "30"
      =required     ""
      =placeholder  "~sampel-palnet/squad-name"
      ;+  ;/("")
    ==
    ;button(type "submit", class "bg-green-400 text-white"): Join
    ;+  ?.  =('join' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "request sent" "failed")
        success.page
  ==
:: this creates a form where you can create a new Squad. You enter the
:: squad title, specify whether it's public or private, then it gets
:: POSTed to the /squad/new URL path and handled by our Gall agent.
::
++  new-component
  ^-  manx
  ;form(class "new-form", method "post", action "/squad/new")
    ;input
      =type         "text"
      =id           "new"
      =name         "title"
      =size         "30"
      =required     ""
      =placeholder  "My squad"
      ;+  ;/("")
    ==
    ;br;
    ;div
      ;input
        =type   "checkbox"
        =id     "new-pub-checkbox"
        =style  "margin-right: 0.5rem"
        =name   "public"
        =value  "true"
        ;+  ;/("")
      ==
      ;label(for "new-pub-checkbox"): Public
    ==
    ;br;
    ;button(type "submit", class "bg-green-400 text-white"): Create
    ;+  ?.  =('new' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
  ==
:: this displays all the information for an individual squad, such as
:: its title, its members, its whitelist or blacklist, etc. It also
:: has buttons to leave it, or if you're the host to do things like
:: change the title, whitelist/blacklist members, etc. These individual
:: components are defined separately below, this particular arm just
:: puts them all together
::
++  squad-component
  |=  [=gid =squad]
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  =/  summary=manx
    ;summary
      ;h3(class "inline"): {(trip title.squad)}
    ==
  =/  content=manx
    ;div
      ;p
        ;span(style "margin-right: 2px;"): id:
        ;span(class "code"): {<host.gid>}/{(trip name.gid)}
      ==
      ;+  ?.  =(our.bol host.gid)
            ;/("")
          (squad-title-component gid squad)
      ;+  (squad-leave-component gid)
      ;+  ?.  =(our.bol host.gid)
            ;/("")
          (squad-public-component gid squad)
      ;+  (squad-acl-component gid squad)
      ;+  (squad-members-component gid squad)
    ==
  ?:  &(?=(^ gid.page) =(gid u.gid.page))
    ;details(id gid-str, open "open")
      ;+  summary
      ;+  content
    ==
  ;details(id gid-str)
    ;+  summary
    ;+  content
  ==
:: this component lets group hosts change the title of a squad. It has
:: a form that takes the new name and POSTs it to the /squad/title URL
:: path. Our gall agent then processes it.
::
++  squad-title-component
  |=  [=gid =squad]
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  ;form(method "post", action "/squad/title")
    ;input(type "hidden", name "gid", value gid-str);
    ;label(for "title:{gid-str}"): title:
    ;input
      =type         "text"
      =id           "title:{gid-str}"
      =name         "title"
      =size         "30"
      =required     ""
      =placeholder  "My Squad"
      ;+  ;/("")
    ==
    ;button(type "submit"): Change
    ;+  ?.  &(=('title' sect.page) ?=(^ gid.page) =(gid u.gid.page))
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
  ==
:: This component lets a group host change whther a squad is private
:: or public. It's a form that POSTs the new state to either the /squad/private
:: or /squad/public URL path, and our Gall agent processes the request.
::
++  squad-public-component
  |=  [=gid =squad]
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  ;form(method "post", action "/squad/{?:(pub.squad "private" "public")}")
    ;input(type "hidden", name "gid", value gid-str);
    ;button(type "submit"): {?:(pub.squad "Make Private" "Make Public")}
    ;+  ?.  &(=('public' sect.page) ?=(^ gid.page) =(gid u.gid.page))
          ;/("")
        %+  success-component
          ?:(success.page "Success!" "Failed!")
        success.page
  ==
:: This component lets a group host delete a squad, and other members leave it.
:: It's a form that POSTs either to the /squad/delete or /squad/leave URL path
:: depending on the case
::
++  squad-leave-component
  |=  =gid
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  ;form
    =class     ?:(=(our.bol host.gid) "delete-form" "leave-form")
    =method    "post"
    =action    ?:(=(our.bol host.gid) "/squad/delete" "/squad/leave")
    =onsubmit  ?.(=(our.bol host.gid) "" "return confirm('Are you sure?');")
    ;input(type "hidden", name "gid", value gid-str);
    ;button(type "submit", class "bg-red text-white"): {?:(=(our.bol host.gid) "Delete" "Leave")}
  ==
:: This component displays the access control list. If it's public, it's the blacklist. If
:: it's private, it's the whitelist. It also lets group hosts manage these lists and has a form
:: that POSTs to the /squad/kick or /squad/allow URL paths as the case may be.
::
++  squad-acl-component
  |=  [=gid =squad]
  ^-  manx
  =/  acl=(list @p)  ~(tap in (~(get ju acls) gid))
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  =/  summary=manx
    ;summary
      ;h4(class "inline"): {?:(pub.squad "Blacklist" "Whitelist")} ({(a-co:co (lent acl))})
    ==
  =/  kick-allow-form=manx
    ;form(method "post", action "/squad/{?:(pub.squad "kick" "allow")}")
      ;input(type "hidden", name "gid", value gid-str);
      ;input
        =type         "text"
        =id           "acl-diff:{gid-str}"
        =name         "ship"
        =size         "30"
        =required     ""
        =placeholder  "~sampel-palnet"
        ;+  ;/("")
      ==
      ;input(type "submit", value ?:(pub.squad "Blacklist" "Whitelist"));
      ;+  ?.  &(=('kick' sect.page) ?=(^ gid.page) =(gid u.gid.page))
            ;/("")
          %+  success-component
            ?:(success.page "success" "failed")
          success.page
    ==
  =/  ships=manx
    ;div(id "acl:{gid-str}")
      ;*  %+  turn
            %+  sort  acl
            |=([a=@p b=@p] (aor (cite:^title a) (cite:^title b)))
          |=(=ship (ship-acl-item-component gid ship pub.squad))
    ==
  ?.  &(=('kick' sect.page) ?=(^ gid.page) =(gid u.gid.page))
    ;details
      ;+  summary
      ;div
        ;+  ?.  =(our.bol host.gid)
              ;/("")
            kick-allow-form
        ;+  ships
      ==
    ==
  ;details(open "open")
    ;+  summary
    ;div
      ;+  ?.  =(our.bol host.gid)
            ;/("")
          kick-allow-form
      ;+  ships
    ==
  ==
:: this is a sub-component of the one above, it renders and individual ship
:: in the whitelist or blacklist and, if you're the host, lets you click
:: on the ship to remove it from the list. The form POSTs to /squad/allow
:: or /squad/kick as the case may be, and our Gall agent handles the request
::
++  ship-acl-item-component
  |=  [=gid =ship pub=?]
  ^-  manx
  ?.  =(our.bol host.gid)
    ;span(class "ship-acl-span"): {(cite:^title ship)}
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  ;form
    =class   "ship-acl-form"
    =method  "post"
    =action  "/squad/{?:(pub "allow" "kick")}"
    ;input(type "hidden", name "gid", value gid-str);
    ;input(type "hidden", name "ship", value <ship>);
    ;input(type "submit", value "{(cite:^title ship)} ×");
  ==
:: this component lists all the current members of a squad
::
++  squad-members-component
  |=  [=gid =squad]
  ^-  manx
  =/  members=(list @p)  ~(tap in (~(get ju members) gid))
  ;details
    ;summary
      ;h4(class "inline"): Members ({(a-co:co (lent members))})
    ==
    ;div
      ;*  %+  turn
            %+  sort  members
            |=([a=@p b=@p] (aor (cite:^title a) (cite:^title b)))
          |=  =ship
          ^-  manx
          ;span(class "ship-members-span"): {(cite:^title ship)}
    ==
  ==
:: lastly we have the stylesheet, which is just
:: a big static block of text
::
++  style
  ^~
  %-  trip
    '''
    body {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      font-family: "Inter", sans-serif;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }
    main {
      width: 100%;
      max-width: 500px;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 1rem;
    }
    button {
      -webkit-appearance: none;
      border: none;
      outline: none;
      border-radius: 100px;
      font-weight: 500;
      font-size: 1rem;
      padding: 12px 24px;
      cursor: pointer;
    }
    button:hover {
      opacity: 0.8;
    }
    button.inactive {
      background-color: #F4F3F1;
      color: #626160;
    }
    button.active {
      background-color: #000000;
      color: white;
    }
    a {
      text-decoration: none;
      font-weight: 600;
      color: rgb(0,177,113);
    }
    a:hover {
      opacity: 0.8;
    }
    .none {
      display: none;
    }
    .block {
      display: block;
    }
    code, .code {
      font-family: "Source Code Pro", monospace;
    }
    .bg-green {
      background-color: #12AE22;
    }
    .bg-green-400 {
      background-color: #4eae75;
    }
    .bg-red {
      background-color: #ff4136;
    }
    .text-white {
      color: #fff;
    }
    h3 {
      font-weight: 600;
      font-size: 1rem;
      color: #626160;
    }
    form {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    form button, button[type="submit"] {
      border-radius: 10px;
    }
    input {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .flex {
      display: flex;
    }
    .col {
      flex-direction: column;
    }
    .align-center {
      align-items: center;
    }
    .justify-between {
      justify-content: space-between;
    }
    .grow {
      flex-grow: 1;
    }
    .inline {
      display: inline;
    }
    @media screen and (max-width: 480px) {
      main {
        padding: 1rem;
      }
    }
    '''
--
```

## Desk config

With our types, agent, mark files and front-end now complete, the last thing we
need are some desk configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `squad` directory:

```shell {% copy=true %}
cd squad
echo "[%zuse 416]" > sys.kelvin
```

We also need to specify which agents to start when our desk is installed. We do
this in a `desk.bill` file:

```shell {% copy=true %}
echo "~[%squad]" > desk.bill
```

Lastly, we need to create a Docket file. Docket is the agent that manages app
front-ends - it fetches & serves them, and it also configures the app tile and
other metadata. Create a `desk.docket-0` file in our `squad` working directory
and add the following:

```hoon {% copy=true %}
:~
  title+'Squad'
  info+'A simple groups app.'
  color+0x4b.c647
  version+[0 1 0]
  website+'https://urbit.org'
  license+'MIT'
  base+'squad'
  site+/squad
==
```

## Put it together

Our app is now complete. In the `squad` working directory, we should have the
following files, as well as the dependencies we copied in at the beginning:

```
squad
├── app
│   ├── squad
│   │   └── index.hoon
│   └── squad.hoon
├── desk.bill
├── desk.docket-0
├── mar
│   └── squad
│       ├── did.hoon
│       └── do.hoon
├── sur
│   └── squad.hoon
└── sys.kelvin
```

Let's now try it out. In the Dojo of our comet,
we'll create a new desk with the `|new-desk` generator:

``` {% copy=true %}
|new-desk %squad
```

Next, we'll mount the desk so we can access it from the host OS:

``` {% copy=true %}
|mount %squad
```

Currently it just contains some skeleton files, but we can just delete those
and add our own instead. In the normal shell, do the following:

```shell {% copy=true %}
rm -r dev-comet/squad/*
cp -r squad/* dev-comet/squad/
```

Back in the Dojo again, we can now commit those files and install the app:

``` {% copy=true %}
|commit %squad
|install our %squad
```

If we open a web browser, go to `localhost:8080` (or `localhost` on a Mac), and
login with the password obtained by running `+code` in the Dojo, we should see
a tile for the Squad app.  If we click on it, it'll open our front-end and we
can start using it.

One thing we can also do is publish the app so others can install it from us. To
do so, just run the following command:

```
:treaty|publish %squad
```

Now our friends will be able to install it directly from us with `|install <our
ship> %squad` or by searching for `<our ship>` on their ship's homescreen.


## Next steps

To learn to create an app like this, the first thing to do is learn Hoon. [Hoon
School](/guides/core/hoon-school/A-intro) is a comprehensive guide to the
language, and the best place to start. After learning the basics of Hoon, [App
School](/guides/core/app-school/intro) will teach you everything you need to
know about app development.

Along with these self-directed guides, we also run regular courses on both Hoon
and app development. You can check the [Courses](/courses) page for details, or
join the `~hiddev-dannut/new-hooniverse` group on Urbit.
