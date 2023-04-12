+++
title = "Build a Voting App"
weight = 4
+++

In this lightning tutorial, we're going to build a voting app for groups called
Tally, which uses [linkable ring
signatures](https://en.wikipedia.org/wiki/Ring_signature). If the group host has
Tally installed, members may make proposals, and other members may vote yea or
nay on them. Linkable ring signatures allow votes to be anonymous - each vote
can be verified to have come from a group member and duplicate votes can be
detected, but it cannot be determined who voted for what. The finished app will
look like this:

![tally screenshot](https://media.urbit.org/guides/quickstart/voting-app-guide/tally-screenshot-reskin.png)

The front-end of the app will be written in
[Sail](/reference/glossary/sail), Urbit's XML language built into the Hoon
compiler. Using Sail means we don't need to create a separate React front-end,
and can instead serve pages directly from our back-end. This works well for
static pages but a full JS-enabled front-end would be preferred for a dynamic
page.

This app depends on the groups app
[Squad](https://urbit.org/applications/~pocwet/docs), which we wrote in [another
lightning tutorial](/guides/quickstart/groups-guide). If you'd like to check out
the finished app, you can install it from `~pocwet/tally` with the `|install
~pocwet %tally` command in your ship's Dojo, or else install it from your ship's
homescreen. Before installing Tally, you should first install Squad from
`~pocwet/squad`.

The app source is available in the [`docs-examples` repo on
Github](https://github.com/urbit/docs-examples), in the `voting-app` folder. It
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
the `-F` flag. In this case, since our chat app will depend on the separate
Squad app, we'll do it on a comet instead, so we can easily install that
dependency. To create a comet, we can use the `-c` option, and specify a name
for the *pier* (ship folder):

```shell {% copy=true %}
./urbit -c dev-comet
```

It might take a few minutes to boot up, and will fetch updates for the default
apps. Once that's done it'll take us to the Dojo (Urbit's shell), as indicated
by the `~sampel_samzod:dojo>` prompt.

Note: we'll use `~sampel_samzod` throughout this guide, but this will be
different for you as a comet's ID is randomly generated.

## Dependencies

Once in the Dojo, let's first install the Squad app:

```{% copy=true %}
|install ~pocwet %squad
```

It'll take a minute to retrieve the app, and will say `gall: installing %squad`
once complete.

Next, we'll mount a couple of desks so we can grab some of their files, which
our new app will need. We can do this with the `|mount` command:

```{% copy=true %}
|mount %squad
|mount %base
|mount %garden
```

With those mounted, switch back to a normal shell in another terminal window.
We'll create a folder to develop our app in, and then we'll copy a few files
across that our app will depend on:

```shell {% copy=true %}
mkdir -p tally/{app,sur,mar,lib}
cp -r dev-comet/squad/mar/{bill*,hoon*,json*,kelvin*,mime*,noun*,ship*,txt*,docket-0*} tally/mar/
cp -r dev-comet/squad/lib/{agentio*,dbug*,default-agent*,skeleton*,docket*} tally/lib/
cp -r dev-comet/squad/sur/{docket*, squad*} tally/sur/
cp -r dev-comet/base/sur/ring.hoon tally/sur/
cp -r dev-comet/garden/lib/mip.hoon tally/lib/
```

Now we can start working on the app itself.

## Types

The first thing we need to do is define the data types our app will use. We'll
define the basic types for polls, votes, poll IDs, etc. We'll also define the
types of actions/requests we might send or receive, and the types of
updates/events we might send to subscribers or receive from subscriptions.

The basic data type will be a `poll`. It will include a `ring-group` is a
structure from `/sur/ring.hoon`, containing the set of all participants, their
key revisions, and a "linkage scope", which is used to associate votes with a
particular poll and detect duplicates. We'll just set the linkage scope to the
poll ID (`pid`).

We'll define an `action` structure, which will be the kinds of requests that can
be sent or received in *pokes* (one-off messages):

- `%new`: create a new poll.
- `%vote`: vote "yea" or "nay" on an existing poll.
- `%watch`: subscribe to polls for a particular squad.
- `%leave`: unsubscribe from polls for a particular squad.
- `%withdraw`: delete a poll.


We'll also define an `update` structure, which wil be the kinds of events that
subscribers may be notified about:

- `%init`: given the intial polls and their state to a new subscriber.
- `%vote`: someone has voted on a poll.
- `%new`: someone has created a new poll.
- `%withdraw`: someone has withdrawn an existing poll.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. Save the following code in
`tally/sur/tally.hoon`:

```hoon {% copy=true mode="collapse" %}
:: first we import both the type definitions for ring
:: signatures and also for the squad app
::
/-  *ring, *squad
:: we also import the mip library, which is for maps of maps
::
/+  *mip
|%
:: a pid is a poll id, and is just a plain atom
::
+$  pid  @
:: this structure contains all the details of a poll:
:: - creator: the authoring ship
:: - proposal: the text of the proposal
:: - expiry: when voting closes
:: - gid: the group id (squad) it's for
:: - ring-group: this is used to sign and validate 
::   ring signature votes
::
+$  poll
  $:  creator=@p
      proposal=@t
      expiry=@da
      =gid
      =ring-group
  ==
:: a boolean value representing the vote and the ring
:: signature for validation
::
+$  vote  (pair ? raw-ring-signature)
:: all votes for a particular poll. The @udpoint is
:: a unique hash for linked ring signatures used
:: to identify duplicate votes (it'll be the same
:: every time the same ship votes)
::
+$  votes  (map @udpoint vote)
:: a mip is a map of maps, so it's a map from gid
:: (squad id) to a map from pid (poll id) to the
:: poll and its votes. This structure is how
:: everything is stored in the agent's state
::
+$  by-group  (mip gid pid [=poll =votes])
:: these are requests/actions either the local ship
:: or remote ships can initiate
::
+$  action
  $%  [%new proposal=@t days=@ud =gid]
      [%vote =gid =pid =vote]
      [%watch =gid]
      [%leave =gid]
      [%withdraw =gid =pid]
  ==
:: these are events/updates that can be sent out
:: to subscribers when events occur. The init structure
:: is sent when someone first subscribes to initialize
:: the state for the gid in question
::
+$  update
  $%  [%init polls=(map pid [=poll =votes])]
      [%vote =pid =vote]
      [%new =pid =poll]
      [%withdraw =pid]
  ==
--
```

## Ring Library

The `%base` desk of ship includes a `ring.hoon` library for ring signatures.
This implementation verifies signatures against a ship's most recent keys, which
may cause problems verifying old polls if group members rotate their keys. To
solve this, here is a slightly modified version that takes a ship's `life` (key
revision) as an additional argument:

- [ring.hoon](https://github.com/urbit/docs-examples/blob/main/voting-app/bare-desk/lib/ring.hoon)

Save that file in the `tally/lib/` directory.

## Agent

Now we'll write the main app.

Gall is the userspace application management vane (kernel module). Userspace
applications are called *agents*.

Our agent imports the structure file we created, some structures for dealing with
Squad groups, some utility libraries including the ring signature library, and
our `index.hoon` front-end file (we'll write this in the next section).

The agent's state will be defined as:

```hoon
+$  state-1  $:  %1
                 =by-group
                 voted=(set pid)
                 withdrawn=(set pid)
                 section=?(%subs %new %groups)
             ==
```

The `by-group` structure is `mip`, which is a map of map. The first set of keys
is the group ID, and then for each group there is a map from poll ID to the
poll and associated votes. We additionally have `voted`, `withdrawn` and
`section` to keep track of actions we've taken so the front-end will update
instantly and load the right sections.

A Gall agent has ten event handler *arms*. Most agent arms produce the same two
things: a list of effects to be emitted, and a new version of the agent itself,
typically with an updated state. It thus behaves much like a state machine,
performing the function `(events, old-state) => (effects, new-state)`. We'll
look at some of our agent's significant arms.

#### `on-init`

This arm is called exactly once, when the agent is first installed. Our
`on-init` does two things:

- Pass a `task` to Eyre, the web-server vane, to bind the `/tally` URL path so
visiting that will load our front-end.
- Send a subscription request to the `%squad` agent so we can keep up-to-date
  with the state of our groups.

#### `on-poke`

This arm handles *pokes*, which will either contain `action`s or HTTP requests
from the web interface. Our `on-poke` tests the mark to see which it is, and
then calls either `handle-http` or `handle-action` as the case may be.

`handle-action` tests what kind of request it is (new poll, vote, etc) and
handles it appropriately (check permissions, update state, send out updates to
subscribers, etc). If it's a vote, it makes sure the ring signature is valid by
calling the `verify` function in the `ring.hoon` library.

For `handle-http`, if it's a GET request, it calls `index.hoon` to produce the
web page and returns it to Eyre on the subscription path specified by the
request ID. If it's a POST request, it first checks the URL path to see which
kind of request it is (`/tally/watch`, `/tally/vote`, `/tally/new`, etc). It
then retrieves the key-value pairs of data from the body of the request and
converts the request into an `action`, calls `handle-action` to process it, and
then sends a 302 redirect back to the index to reload the page.

Updates will also be sent out to our subscribers when the events occur to inform
them of the changes.

#### `on-watch`

This arm handles subscription requests, which will either come from Eyre when
waiting for a response to an HTTP request, or from other ships who want to
subscribe to polls for a group we host. In the latter case, we make sure they're
a member and then send them out the current state of the polls for that group.

#### `on-agent`

This arm handles updates from people we've subscribed to, which will be other
groups we're a member of. It additionally handles group updates from the
`%squad` agent. In the former case, the events we'll receive will contain
`update`s, which we'll process in a similar manner to the `action`s in
`on-poke`. All incoming votes will be validated here also. In the latter case,
we'll receive `%squad` `upd` updates, such as members joining or leave groups,
and we'll handle them as appropriate.

We differentiate between these two cases by testing the `wire`, which is a
message tag we set when we initially subscribed. For `%squad` updates it will be
`/squad`, and for the rest it'll be the group ID we've subscribe to.

#### The code

Gall agents live in the `/app` directory of a desk, so save this code in
`tally/app/tally.hoon`:

```hoon {% copy=true mode="collapse" %}
:: first we import the type definitions we need, in this case
:: for our app as well as ring signatures and squads
::
/-  *tally, *ring, *squad
:: next we import the libraries we need. Mip is for working with
:: maps of maps, ring is for ring signatures, and the others are
:: convenient utilities to reduce boilerplate and provide a
:: debugging interface
::
/+  *mip, ring, default-agent, dbug, agentio
:: we additionally import the separate index.hoon file which
:: contains our Sail front-end. We'll write this in the next
:: section
::
/=  index  /app/tally/index
:: here we define the state of our app. We use a versioned state
:: structure so it's easy to upgrade the state down the line.
:: note we have two state types, state-0 and state-1, because
:: some changes to the front-end after initial publication
:: necessitated a slight change.
::
|%
+$  versioned-state
  $%  state-0
      state-1
  ==
+$  state-0  [%0 =by-group voted=(set pid) withdrawn=(set pid)]
+$  state-1  $:  %1
                 =by-group
                 voted=(set pid)
                 withdrawn=(set pid)
                 section=?(%subs %new %groups)
             ==
+$  card  card:agent:gall
--
:: we wrap the whole agent in this function from the dbug library
:: we imported so we can debug it from the dojo if needed.
::
%-  agent:dbug
:: we then initialize the state-0 state and then give it the alias
:: of "state" so we can easily reference it
::
=|  state-1
=*  state  -
:: we cast everything below to the type of an agent core
::
^-  agent:gall
:: we have a handful of separate utility functions, so we define them
:: separate below the main agent and reverse-compose them into its
:: subject (its context)
::
=<
:: here the actual agent core begins. The bowl contains useful
:: information like the source of an event, the current date-time,
:: some entropy, etc. Gall automatically populates it every time
:: an event comes in
::
|_  bol=bowl:gall
:: here we define a few convenient aliases. "this" refers to the
:: entire agent and its state, def is the default-agent library we
:: imported, io is "agentio" another utility library, and hc is the
:: "helper core" defined below our agent core that we reverse-composed
:: into its subject
::
+*  this  .
    def   ~(. (default-agent this %.n) bol)
    io    ~(. agentio bol)
    hc    ~(. +> bol)
:: this is the first proper agent arm. On-init is only called once, when
:: an agent is first installed. It performs any initialization logic we
:: need, in this case binding the /tally URL path for the front-end and
:: subscribing to the %squad agent for updates about squads
::
++  on-init
  ^-  (quip card _this)
  :_  this
  :~  (~(arvo pass:io /bind) %e %connect `/'tally' %tally)
      (~(watch-our pass:io /squad) %squad /local/all)
  ==
:: on-save is called during upgrades or when an agent is suspended. It
:: exports the agent's current state so either an upgrade can be performed
:: or it can be archived.
::
++  on-save  !>(state)
:: on-load is called when a previously exported state is reimported, either
:: when the agent has been unsuspended or when an upgrade has been
:: completed. We include some logic here to upgrade state-0 to state-1
:: due to the change mentioned earlier, but basically it just puts the
:: imported state back into the agent's state
::
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-vase)
  ?-  -.old
    %1  `this(state old)
    %0  `this(state [%1 by-group.old voted.old withdrawn.old %subs])
  ==
:: on-poke handles "pokes", which are one-off requests/actions intiated
:: locally or by remote ships. If it's a %tally-action we call
:: a handle-action function, and if it's a %handle-http-request from the
:: front-end we call the handle-http function
::
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %tally-action        (handle-action !<(action vase))
      %handle-http-request  (handle-http !<([@ta inbound-request:eyre] vase))
    ==
  [cards this]
  :: this handles http requests from the front-end
  ::
  ++  handle-http
    |=  [rid=@ta req=inbound-request:eyre]
    ^-  (quip card _state)
    :: if the front-end didn't have a session token cookie (obtained by
    :: logging in with the web login code), we just redirect them to the
    :: login page
    ::
    ?.  authenticated.req
      :_  state(section %subs)
      (give-http:hc rid [307 ['Location' '/~/login?redirect='] ~] ~)
    :: otherwise, switch on the method, prodicing a 405 response for
    :: unhandled methods
    ::
    ?+  method.request.req
      :_  state(section %subs)
      %^    give-http:hc
          rid
        :-  405
        :~  ['Content-Type' 'text/html']
            ['Content-Length' '31']
            ['Allow' 'GET, POST']
        ==
      (some (as-octs:mimes:html '<h1>405 Method Not Allowed</h1>'))
    ::
      :: if it's a GET request, produce our index page
      ::
        %'GET'
      [(make-index:hc rid) state(section %subs)]
    ::
      :: if it's a POST request, fist make sure the body is
      :: not empty
      ::
        %'POST'
      ?~  body.request.req
        [(redirect:hc rid "/tally") state(section %subs)]
      :: decode the query string in the body, redirect to
      :: index if parsing failed
      ::
      =/  query=(unit (list [k=@t v=@t]))
        (rush q.u.body.request.req yquy:de-purl:html)
      ?~  query
        [(redirect:hc rid "/tally") state(section %subs)]
      :: put the key-value pairs from the query string
      :: in a map
      ::
      =/  kv-map  (~(gas by *(map @t @t)) u.query)
      :: make sure the gid (squad id) is specified
      ::
      ?.  (~(has by kv-map) 'gid')
        [(redirect:hc rid "/tally") state(section %subs)]
      :: determine the url path queries
      ::
      =/  =path
        %-  tail
        %+  rash  url.request.req
        ;~(sfix apat:de-purl:html yquy:de-purl:html)
      :: switch on the path - each request goes to a different
      :: sub-path, so we handle each separately. If it's an
      :: if it's an unexpected path we redirect back to
      :: the index
      ::
      ?+    path  [(redirect:hc rid "/tally") state(section %subs)]
        :: if it's a request to subscribe to polls for a particular
        :: squad, decode the gid and pass the request to handle-action
        ::
          [%tally %watch ~]
        =/  =gid
          %+  rash  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =^  cards  state  (handle-action %watch gid)
        [(weld cards (redirect:hc rid "/tally")) state(section %subs)]
      ::
        :: if it's a request to unsubscribe, decode the gid and
        :: pass the request to handle-action
        ::
          [%tally %leave ~]
        =/  =gid
          %+  rash  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =^  cards  state  (handle-action %leave gid)
        [(weld cards (redirect:hc rid "/tally")) state(section %subs)]
      ::
        :: if it's a request to create a new poll, decode the gid,
        :: duration and proposal text and give to handle-action
        ::
          [%tally %new ~]
        =/  =gid
          %+  rash  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =/  days=@ud  (rash (~(got by kv-map) 'days') dem)
        =/  proposal=@t  (~(got by kv-map) 'proposal')
        =/  location=tape
          "/tally#{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
        =^  cards  state  (handle-action %new proposal days gid)
        [(weld cards (redirect:hc rid location)) state(section %groups)]
      ::
        :: a request to withdraw a poll
        ::
          [%tally %withdraw ~]
        =/  =gid
          %+  rash  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =/  =pid  (rash (~(got by kv-map) 'pid') dem)
        =^  cards  state  (handle-action %withdraw gid pid)
        =/  location=tape
          "/tally#{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
        [(weld cards (redirect:hc rid location)) state(section %groups)]
      ::
        :: a request to vote on a poll. The ring signature group for
        :: the poll is retrieved from state and used to produce a
        :: ring signature. This is then passed to handle-action
        ::
          [%tally %vote ~]
        =/  =gid
          %+  rash  (~(got by kv-map) 'gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =/  =pid  (rash (~(got by kv-map) 'pid') dem)
        =/  choice=?
          %+  rash  (~(got by kv-map) 'choice')
          ;~  pose
            (cold %.y (jest 'yea'))
            (cold %.n (jest 'nay'))
          ==
        =/  [=poll =votes]  (~(got bi by-group) gid pid)
        =/  raw=raw-ring-signature
          =<  raw
          %:  sign:ring
            our.bol
            now.bol
            eny.bol
            choice
            `pid
            participants.ring-group.poll
          ==
        =^  cards  state  (handle-action %vote gid pid choice raw)
        :_  state(section %groups)
        (weld cards (redirect:hc rid "/tally#{(a-co:co pid)}"))
      ==
    ==
  :: handle-action handles the different $actions
  :: we previously defined
  ::
  ++  handle-action
    |=  act=action
    ^-  (quip card _state)
    :: we switch on which kind of action it is
    ::
    ?-    -.act
      :: create a new poll
      ::
        %new
      =/  =path  /(scot %p host.gid.act)/[name.gid.act]
      :: if the squad isn't ours, we make sure it's a request
      :: from the local ship and then pass it to the squad host
      ::
      ?.  =(our.bol host.gid.act)
        ?>  =(our.bol src.bol)
        :_  state
        :~  %+  ~(poke pass:io path)
              [host.gid.act %tally]
            tally-action+!>(`action`[%new proposal.act days.act gid.act])
        ==
      :: if it is ours, make sure the voter is a member of the squad.
      :: 
      ?>  (is-allowed:hc gid.act src.bol)
      :: make a set of poll participants and their key revision numbers
      ::
      =/  members=(set [=ship =life])  (make-ring-members:hc gid.act)
      ?>  ?=(^ members)
      :: calculate the expiry data
      ::
      =/  expiry=@da  (add now.bol (yule days.act 0 0 0 ~))
      :: retreive all polls from state for this gid
      ::
      =/  polls=(map pid [=poll =votes])
        (fall (~(get by by-group) gid.act) *(map pid [=poll =votes]))
      :: generate a random unique pid (poll id)
      ::
      =/  =pid
        =/  rng  ~(. og eny.bol)
        |-
        =^  n  rng  (rads:rng (bex 256))
        ?.  (~(has by polls) n)
          n
        $(rng rng)
      :: create the ring-group (this is used to sign and validate
      :: votes)
      ::
      =/  =ring-group  [members ~ pid]
      :: assemble the poll
      ::
      =/  =poll  [src.bol proposal.act expiry gid.act ring-group]
      :: send the new poll to subscribers and save it in our state
      ::
      :-  :~  (fact:io tally-update+!>(`update`[%new pid poll]) ~[path])
          ==
      %=  state
        by-group  (~(put bi by-group) gid.act pid [poll *votes])
      ==
    ::
      :: vote on a poll
      ::
        %vote
      :: retreive the target poll from state
      ::
      =/  [=poll =votes]  (~(got bi by-group) gid.act pid.act)
      :: make sure it hasn't expired
      ::
      ?>  (gte expiry.poll now.bol)
      =/  =path  /(scot %p host.gid.act)/[name.gid.act]
      :: if the squad's not ours, make sure it's us who's trying
      :: to vote then pass it to the squad host
      ::
      ?.  =(our.bol host.gid.act)
        ?>  =(our.bol src.bol)
        :_  state(voted (~(put in voted) pid.act))
        :~  %+  ~(poke pass:io path)
              [host.gid.act %tally]
            tally-action+!>([%vote gid.act pid.act vote.act])
        ==
      :: if we're the squad host, verify the signature
      ::
      ?>  %:  verify:ring
            our.bol
            now.bol
            p.vote.act
            participants.ring-group.poll
            link-scope.ring-group.poll
            q.vote.act
          ==
      :: make sure this person hasn't already voted
      ::
      ?<  (~(has by votes) (need y.q.vote.act))
      :: update the by-group mip with the new vote
      ::
      =.  by-group
        %^    ~(put bi by-group)
            gid.act
          pid.act
        [poll (~(put by votes) (need y.q.vote.act) vote.act)]
      :: update state and notify subscribers of the vote
      ::
      :_  ?.  =(our.bol src.bol)
            state
          state(voted (~(put in voted) pid.act))
      :~  (fact:io tally-update+!>(`update`[%vote pid.act vote.act]) ~[path])
      ==
    ::
      :: if it's a request to subscribe to polls for a squad,
      :: make sure we made the request and then pass it on
      :: to the squad host
      ::
        %watch
      ?>  =(our.bol src.bol)
      ?>  !=(our.bol host.gid.act)
      =/  =path  /(scot %p host.gid.act)/[name.gid.act]
      :_  state
      :~  (~(watch pass:io path) [host.gid.act %tally] path)
      ==
    ::
      :: if it's a request to unsubscribe, make sure we
      :: made the request, delete all polls for that squad
      :: from state, and unsubscribe from the squad host
      ::
        %leave
      ?>  =(our.bol src.bol)
      ?<  =(our.bol host.gid.act)
      =/  =path  /(scot %p host.gid.act)/[name.gid.act]
      :_  state(by-group (~(del by by-group) gid.act))
      :~  (~(leave-path pass:io path) [host.gid.act %tally] path)
      ==
    ::
      :: withdraw a poll
      ::
        %withdraw
      =/  [=poll =votes]  (~(got bi by-group) gid.act pid.act)
      =/  =path  /(scot %p host.gid.act)/[name.gid.act]
      :: if we're not the host, make sure we requested it
      :: then pass it to the squad host
      ::
      ?.  =(our.bol host.gid.poll)
        ?>  =(our.bol src.bol)
        :_  state(withdrawn (~(put in withdrawn) pid.act))
        :~  %+  ~(poke pass:io path)
              [host.gid.act %tally]
            tally-action+!>(`action`[%withdraw gid.act pid.act])
        ==
      :: otherwise, make sure either we requested it or the
      :: original author requested it AND it hasn't expired
      ::
      ?>  ?|  =(our.bol src.bol)
              &(=(src.bol creator.poll) (gte expiry.poll now.bol))
          ==
      :: update state and notify subscribers of the withdrawl
      ::
      :_  %=  state
            by-group   (~(del bi by-group) gid.act pid.act)
            voted      (~(del in voted) pid.act)
            withdrawn  (~(del in withdrawn) pid.act)
          ==
      :~  (fact:io tally-update+!>(`update`[%withdraw pid.act]) ~[path])
      ==
    ==
  --
:: on-watch handles subscription requests
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  :: if it's a request from our web server, accept it
  :: and do nothing
  ::
  ?:  &(=(our.bol src.bol) ?=([%http-response *] path))
    `this
  :: otherwise, make decode the gid (squad id) from the path
  ::
  ?>  ?=([@ @ ~] path)
  =/  =gid  [(slav %p i.path) i.t.path]
  :: make sure we're the host
  ::
  ?>  =(our.bol host.gid)
  :: make sure the subscribers is a member of the squad
  ::
  ?>  (is-allowed:hc gid src.bol)
  :: give them all the polls for the squad in question
  ::
  :_  this
  :~  %+  fact-init:io  %tally-update
      !>  ^-  update
      :-  %init
      (fall (~(get by by-group) gid) *(map pid [=poll =votes]))
  ==
:: on-agent handles either responses to requests we've
:: initated or subscription updates from people or agents
:: to which we've previously subscribed
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  :: if it's an update from the local squad agent
  ::
  ?:  ?=([%squad ~] wire)
    :: switch on the type of event
    ::
    ?+    -.sign  (on-agent:def wire sign)
      :: if we've been kicked, automatically resubscribe
      ::
        %kick
      :_  this
      :~  (~(watch-our pass:io /squad) %squad /local/all)
      ==
    ::
      :: if our subscription request has been rejected,
      :: try again in 15 minutes
      ::
        %watch-ack
      ?~  p.sign  `this
      :_  this
      :~  (~(wait pass:io /behn) (add now.bol ~m15))
      ==
    ::
      :: if it's a norm subscription update, extract the update
      :: and switch on the kind of update
      ::
        %fact
      ?>  ?=(%squad-did p.cage.sign)
      =/  =upd  !<(upd q.cage.sign)
      ?+    -.upd  `this
        :: if it's a state initialisation message...
          %init-all
        :: diff the current squads with those we have polls for in state,
        :: making a list of ones we have but squad doesn't anymore
        :: (either we've been kicked or they've been deleted)
        ::
        =/  to-rm=(list gid)
          ~(tap in (~(dif in ~(key by by-group)) ~(key by squads.upd)))
        :: remove the entries for those squads in state
        ::
        =.  by-group
          |-
          ?~  to-rm  by-group
          $(to-rm t.to-rm, by-group (~(del by by-group) i.to-rm))
        :: get a list of current subscribers to us
        ::
        =/  watchers=(list [=gid =ship])
          %+  turn  ~(val by sup.bol)
          |=  [=ship =path]
          ^-  [gid @p]
          ?>  ?=([@ @ ~] path)
          [[(slav %p i.path) i.t.path] ship]
        :: iterate over those subscribers and generate a kick
        :: for any who are subscribed to squads we've removed
        :: OR who have been kicked from that squad
        ::
        =/  cards=(list card)
          %+  roll  watchers
          |=  [[=gid =ship] cards=(list card)]
          ?.  (~(has by squads.upd) gid)
            :_  cards
            (kick-only:io ship /(scot %p host.gid)/[name.gid] ~)
          =/  =squad  (~(got by squads.upd) gid)
          ?.  ?|  &(pub.squad (~(has ju acls.upd) gid ship))
                  &(!pub.squad !(~(has ju acls.upd) gid ship))
              ==
            cards
          :_  cards
          (kick-only:io ship /(scot %p host.gid)/[name.gid] ~)
        :: also generate unsubscribe requests for any
        :: subscriptions we've made for polls for squads
        :: we're no longer a member of
        ::
        =.  cards
          %+  weld  cards
          %+  turn  to-rm
          |=  =gid
          ^-  card
          =/  =path  /(scot %p host.gid)/[name.gid]
          (~(leave-path pass:io path) [host.gid %tally] path)
        :: update state and send off all the kicks and
        :: unsubscribe requests
        ::
        [cards this(by-group by-group)]
      ::
        :: if a squad has been deleted, delete its polls,
        :: kick subscribers and also unsubscribe
        ::
          %del
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :_  this(by-group (~(del by by-group) gid.upd))
        :~  (kick:io path ~)
            (~(leave-path pass:io path) [host.gid.upd %tally] path)
        ==
      ::
        :: if someone has been kicked from a squad...
          %kick
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :: if it's not us, kick them from their subscription
        ::
        ?.  =(our.bol ship.upd)
          :_  this
          :~  (kick-only:io ship.upd path ~)
          ==
        :: if it is us, delete polls for that squad, kick
        :: subscribers and unsubscribe from the host
        ::
        :_  this(by-group (~(del by by-group) gid.upd))
        :~  (kick:io path ~)
            (~(leave-path pass:io path) [host.gid.upd %tally] path)
        ==
      ::
        :: if a member has left a squad...
          %leave
        :: if it's not us, do nothing
        ::
        ?.  =(our.bol ship.upd)
          `this
        :: if it is us, delete all polls for the squad,
        :: kick all subscribers and unsubscribe ourselves
        ::
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :_  this(by-group (~(del by by-group) gid.upd))
        :~  (kick:io path ~)
            (~(leave-path pass:io path) [host.gid.upd %tally] path)
        ==
      ==
    ==
  :: otherwise, assume it's for a subscription for polls for
  :: a particular squad
  ::
  ?>  ?=([@ @ ~] wire)
  :: decode the gid (squad id)
  ::
  =/  =gid  [(slav %p i.wire) i.t.wire]
  :: switch on the kind of event
  ::
  ?+    -.sign  (on-agent:def wire sign)
    :: if it's a subscription acknowledgement...
    ::
      %watch-ack
    :: if it was successful, do nothing
    ::
    ?~  p.sign  `this
    :: if it was unsuccessful, delete its polls
    ::
    `this(by-group (~(del by by-group) gid))
  ::
    ::if we've been kicked, automatically resubscribe
    ::
      %kick
    :_  this
    :~  (~(watch pass:io wire) [host.gid %tally] wire)
    ==
  ::
    :: if it's a normal subscription update, extract
    :: the update and switch on what kind of update
    :: it is
    ::
      %fact
    ?>  ?=(%tally-update p.cage.sign)
    =/  upd  !<(update q.cage.sign)
    ?-    -.upd
      :: if it's an initialized update, validate
      :: all polls and add them to by-groups
      ::
        %init
      =;  by-group  `this(by-group by-group)
      %+  ~(put by by-group)  gid
      %-  ~(rep by polls.upd)
      |=  [[=pid =poll =votes] acc=(map pid [=poll =votes])]
      ?.  =(gid gid.poll)  acc
      ?.  =(pid (fall link-scope.ring-group.poll 0^0))  acc
      %+  ~(put by acc)  pid
      :-  poll
      %-  ~(rep by votes)
      |=  [[y=@udpoint =vote] acc=(map @udpoint vote)]
      ?.  =(y (fall y.q.vote 0^0))  acc
      ?.  %:  verify:ring
            our.bol
            now.bol
            p.vote
            participants.ring-group.poll
            link-scope.ring-group.poll
            q.vote
          ==
        acc
      (~(put by acc) y vote)
    ::
      :: if someone has voted, validate the vote and
      :: then add it to the votes for the poll in
      :: question
      ::
        %vote
      ?.  (~(has bi by-group) gid pid.upd)  `this
      =/  [=poll =votes]  (~(got bi by-group) gid pid.upd)
      ?:  (gte now.bol expiry.poll)  `this
      ?~  y.q.vote.upd  `this
      ?:  (~(has by votes) u.y.q.vote.upd)  `this
      ?.  %:  verify:ring
            our.bol
            now.bol
            p.vote.upd
            participants.ring-group.poll
            link-scope.ring-group.poll
            q.vote.upd
          ==
        `this
      =.  votes  (~(put by votes) u.y.q.vote.upd vote.upd)
      `this(by-group (~(put bi by-group) gid pid.upd [poll votes]))
    ::
      :: if a new poll has been created, add it to the list of
      :: polls for the squad in question
      ::
        %new
      ?:  (~(has bi by-group) gid pid.upd)  `this
      ?.  =(gid gid.poll.upd)  `this
      ?.  =(pid.upd (fall link-scope.ring-group.poll.upd 0^0))  `this
      `this(by-group (~(put bi by-group) gid pid.upd poll.upd *votes))
    ::
      :: if a poll has been withdrawn, delete it from state
      ::
        %withdraw
      :-  ~
      %=  this
        by-group   (~(del bi by-group) gid pid.upd)
        voted      (~(del in voted) pid.upd)
        withdrawn  (~(del in withdrawn) pid.upd)
      ==
    ==
  ==
:: on-arvo handles responses from the kernel
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  :: if it's the web server vane responding to the
  :: request to bind the /tally url path, either
  :: do nothing or print an error if it failed
  ::
  ?:  ?=([%bind ~] wire)
    ?.  ?=([%eyre %bound *] sign-arvo)
      (on-arvo:def [wire sign-arvo])
    ~?  !accepted.sign-arvo
      %eyre-rejected-tally-binding
    `this
  :: if the timer's telling us to retry subscribing to
  :: the squad app, retry
  ::
  ?.  ?=([%behn ~] wire)
    (on-arvo:def [wire sign-arvo])
  ?>  ?=([%behn %wake *] sign-arvo)
  ?~  error.sign-arvo
    :_  this
    :~  (~(watch-our pass:io /squad) %squad /local/all)
    ==
  :_  this
  :~  (~(wait pass:io /behn) (add now.bol ~m15))
  ==
:: we don't need anything from the remaining agent
:: arms so we'll just leave it to default-agent to
:: handle
::
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-fail   on-fail:def
--
:: here is our helper core that we reverse composed
:: into the subject (context) of the agent itself.
:: It contains some useful functions. It takes the
:: same bowl that the main agent takes
::
|_  bol=bowl:gall
:: generate the http response to 302 redirect to a location
::
++  redirect
    |=  [rid=@ta path=tape]
    (give-http rid [302 ['Location' (crip path)] ~] ~)
:: fill an HTTP GET request by calling our separate index
:: file (written in the next section) to generate the HTML
:: and then put it in an HTTP response
::
++  make-index
  |=  rid=@ta
  ^-  (list card)
  %+  make-200
    rid
  %-  as-octs:mimes:html
  %-  crip
  %-  en-xml:html
  (index bol by-group voted withdrawn section)
:: make a status 200 HTTP response
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
:: put together the raw HTTP response data and headers, and close
:: the connection afterwards.
::
++  give-http
  |=  [rid=@ta hed=response-header:http dat=(unit octs)]
  ^-  (list card)
  :~  [%give %fact ~[/http-response/[rid]] %http-response-header !>(hed)]
      [%give %fact ~[/http-response/[rid]] %http-response-data !>(dat)]
      [%give %kick ~[/http-response/[rid]] ~]
  ==
:: generate the members for a ring signature signing group...
++  make-ring-members
  |=  =gid
  ^-  (set [=ship =life])
  :: get the members of the squad in question
  ::
  =/  invited=(list @p)  ~(tap in (get-members gid))
  :: recursively iterate over the members, retrieving their
  :: key revision numbers from jael (the PKI vane)
  ::
  =|  participants=(set [=ship =life])
  |-
  ?~  invited
    participants
  =/  lyfe
    .^  (unit @ud)
      %j
      (scot %p our.bol)
      %lyfe
      (scot %da now.bol)
      /(scot %p i.invited)
    ==
  ?~  lyfe
    $(invited t.invited)
  %=  $
    invited       t.invited
    participants  (~(put in participants) [i.invited u.lyfe])
  ==
:: check whether a ship is allowed to subscribe for a squad
::
++  is-allowed
  |=  [=gid =ship]
  ^-  ?
  :: scry the squad app for the access control list and
  :: check whether the ship in question is allowed
  ::
  =/  u-acl
    .^  (unit [pub=? acl=ppl])
      %gx
      (scot %p our.bol)
      %squad
      (scot %da now.bol)
      %acl
      (scot %p host.gid)
      /[name.gid]/noun
    ==
  ?~  u-acl  |
  ?:  pub.u.u-acl
    !(~(has in acl.u.u-acl) ship)
  (~(has in acl.u.u-acl) ship)
:: get a set of all the members of a squad who can
:: participate in voting (only planets or higher)
::
++  get-members
  |=  =gid
  ^-  ppl
  :: scry the squad app for members, then filter
  :: them by their rank. Finally, put them in a set
  :: and return them
  ::
  %-  ~(gas in *ppl)
  %+  skim
    %~  tap  in
    .^  ppl
      %gx
      (scot %p our.bol)
      %squad
      (scot %da now.bol)
      %members
      (scot %p host.gid)
      name.gid
      /noun
    ==
  |=  =ship
  ?|  =(our.bol ship)
      ?=(?(%czar %king %duke) (clan:title ship))
  ==
--
```

## Marks

Marks are Urbit's version of filetypes/MIME types (but strongly typed and with
inter-mark conversion methods). We need to define a mark for the `action`s we'll
send or receive, and the `update`s we'll send to subscribers or receive for
subscriptions. These will be very simple since we don't need to do any
conversions to things like JSON.

Mark files are stored in the `/mar` directory of a desk. Save the
`%tally-action` mark in `tally/mar/tally/action.hoon`, and the `%tally-update`
mark in `tally/mar/tally/update.hoon`.

#### `%tally-action`

```hoon {% copy=true %}
:: first we import our /sur/tally.hoon type defs and expose them directly
::
/-  *tally
:: the mark door takes an $action in the outbound case
::
|_  act=action
:: the grow arm converts from an $action to other things
::
++  grow
  |%
  :: we just handle the general noun case and return it unchanged
  ::
  ++  noun  act
  --
:: the grab arm handles conversions from other things to an $action
::
++  grab
  |%
  :: we just handle the noun case and mold it to an $action
  ::
  ++  noun  action
  --
:: grad handles revision control functions, we just delegate such
:: functions to the %noun mark
::
++  grad  %noun
--
```

#### `%tally-update`

```hoon {% copy=true %}
:: first we import our /sur/tally.hoon type defs and expose them directly
::
/-  *tally
:: the mark door takes an $update in the outbound case
::
|_  upd=update
:: the grow arm converts from an $update to other things
::
++  grow
  |%
  :: we just handle the general noun case and return it unchanged
  ::
  ++  noun  upd
  --
:: the grab arm handles conversions from other things to an $update
::
++  grab
  |%
  :: we just handle the noun case and mold it to an $update
  ::
  ++  noun  update
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

Save the code below in `tally/app/tally/index.hoon`.

```hoon {% copy=true mode="collapse" %}
:: first we import the type definitions tally.hoon and squad.hoon from /sur
::
/-  *tally, *squad
:: we start with a gate that takes the following arguments:
:: - the bowl: containing various metadata from Gall
:: - by-group: containing all the polls for all squads
:: - voted: the set of polls we've already voted on in the FE,
::   this is used for FE responsiveness purposes
:: - withdrawn: the polls we've withdrawn in FE, this is used
::   for FE responsiveness purposes
:: - sect: the section of the front-end being requested
::
|=  $:  bol=bowl:gall
        =by-group
        voted=(set pid)
        withdrawn=(set pid)
        section=?(%subs %new %groups)
    ==
:: we return a $manx, which is urbit's datastructure to represent
:: an XML tree
::
^-  manx
:: we check that the squad app is installed, and return an error
:: page if it's not, with instructions to install it
::
?.  .^(? %gu /(scot %p our.bol)/squad/(scot %da now.bol))
  ;html
    ;head
      ;title: Tally
      ;meta(charset "utf-8");
      ;link
        =href  "https://fonts.googleapis.com/css2?family=Inter:wght@400;".
               "600&family=Source+Code+Pro:wght@400;600&display=swap"
        =rel   "stylesheet"
        ;+  ;/("")
      ==
      ;style
        ;+  ;/
            ^~
            ^-  tape
            %-  trip
            '''
            body {width: 100%; height: 100%; margin: 0;}
            * {font-family: "Inter", sans-serif;}
            div {
              border: 1px solid #ccc;
              border-radius: 5px;
              padding: 1rem;
              position: relative;
              top: 50%;
              left: 50%;
              transform: translateX(-50%) translateY(-50%);
              width: 40ch;
            }
            '''
      ==
    ==
    ;body
      ;div
        ;h3: Squad app not installed
        ;p
          ;+  ;/  "Tally depends on the Squad app. ".
                  "You can install it from "
          ;a/"web+urbitgraph://~pocwet/squad": ~pocwet/squad
        ==
      ==
    ==
  ==
:: we retreive a list of all squads and sort them
:: alphabetically by title
::
=/  all-squads=(list (pair gid squad))
  %+  sort
    %~  tap  by
    .^  (map gid squad)
      %gx
      (scot %p our.bol)
      %squad
      (scot %da now.bol)
      %squads
      /noun
    ==
  |=  [a=(pair gid squad) b=(pair gid squad)]
  (aor title.q.a title.q.b)
:: we filter those down to the ones that
:: actually have polls
::
=/  has-polls
  %+  skim  all-squads
  |=  (pair gid squad)
  (~(has by by-group) p)
:: we also retrieve our current key revision number
::
=/  our-life
  .^  life
    %j
    (scot %p our.bol)
    %life
    (scot %da now.bol)
    /(scot %p our.bol)
  ==
:: now we start the main HTML structure
::
|^
;html
  ;head
    ;title: Tally
    ;meta(charset "utf-8");
    ;link
      =href  "https://fonts.googleapis.com/css2?family=Inter:wght@400;".
             "600&family=Source+Code+Pro:wght@400;600&display=swap"
      =rel   "stylesheet"
      ;+  ;/("")
    ==
    ;style
      ;+  ;/  style
    ==
  ==
  :: we put together the whole interface here. Most of its parts
  :: are defined in separate components further down
  ::
  ;body
    ;main
      ;header
        ;h1: Tally
        :: the menu to switch between subscription management,
        :: new poll creation, and the page to view existing
        :: polls
        ::
        ;div
          ;button
            =id       "sub-button"
            =class    ?:(?=(%subs section) "active" "inactive")
            =onclick  sub-button
            ;+  ;/    "Subscriptions"
          ==
          ;button
            =id       "new-button"
            =class    ?:(?=(%new section) "active" "inactive")
            =onclick  new-button
            ;+  ;/    "New"
          ==
          ;button
            =id      "group-button"
            =class    ?:(?=(%groups section) "active" "inactive")
            =onclick  group-button
            ;+  ;/  "Groups"
          ==
        ==
      ==
      :: the subscription management forms. It lets you watch/unwatch
      :: squads for polls. They either POST to /tally/watch or
      :: /tally/leave - the main agent handles the POSTed requests
      ::
      ;div(id "sub", class ?:(?=(%subs section) "flex col" "none"))
        ;form(method "post", action "/tally/watch")
          ;select
            =name      "gid"
            =required  ""
            ;*  (group-options-component %.n %.n)
          ==
          ;input(id "s", type "submit", value "Watch");
        ==
        ;form(method "post", action "/tally/leave")
          ;select
            =name      "gid"
            =required  ""
            ;*  (group-options-component %.n %.y)
          ==
          ;input(id "u", type "submit", value "Leave");
        ==
      ==
      :: the form to create a new poll. It POSTs to /tally/new, the
      :: main agent handles the POSTed request
      ::
      ;div(id "new", class ?:(?=(%new section) "flex col" "none"))
        ;form(method "post", action "/tally/new", class "col align-start")
          ;div
            ;label(for "n-gid"): Group:
            ;select
              =id        "n-gid"
              =name      "gid"
              =style     "margin-left: 1rem"
              =required  ""
              ;*  (group-options-component %.y %.y)
            ==
          ==
          ;br;
          ;label(for "days"): Duration:
          ;input
            =type         "number"
            =id           "days"
            =name         "days"
            =min          "1"
            =step         "1"
            =required     ""
            =placeholder  "days"
            ;+  ;/("")
          ==
          ;br;
          ;label(for "proposal"): Proposal:
          ;input
            =type      "text"
            =id        "proposal"
            =name      "proposal"
            =size      "50"
            =required  ""
            ;+  ;/("")
          ==
          ;br;
          ;input
            =id     "submit"
            =type   "submit"
            =class  "bg-green-400 text-white"
            =value  "Submit"
            ;+  ;/("")
          ==
        ==
      ==
      ;div(id "group", class ?:(?=(%groups section) "flex col scroll" "none"))
        ;*  ?~  has-polls
              ~[;/("")]
            (turn has-polls group-component)
      ==
    ==
  ==
==
:: this component creates the list of squads for use in a drop-down menu.
:: It selects different subsets of the squads depending on whether
:: "our" and "in-subs" are true or false, so it works for the subscription
:: management page and also the new poll creation page
::
++  group-options-component
  |=  [our=? in-subs=?]
  ^-  marl
  =/  subs=(set gid)
    %-  ~(gas in *(set gid))
    %+  turn
      %+  skim  ~(tap by wex.bol)
      |=  [[=wire *] *]
      ?=([@ @ ~] wire)
    |=  [[=wire *] *]
    ^-  gid
    ?>  ?=([@ @ ~] wire)
    [(slav %p i.wire) i.t.wire]
  =?  all-squads  &(our in-subs)
    (skim all-squads |=((pair gid squad) |(=(our.bol host.p) (~(has in subs) p))))
  =?  all-squads  &(!our in-subs)
    (skim all-squads |=((pair gid squad) (~(has in subs) p)))
  =?  all-squads  &(!our !in-subs)
    (skip all-squads |=((pair gid squad) |(=(our.bol host.p) (~(has in subs) p))))
  %+  turn  all-squads
  |=  (pair gid squad)
  ^-  manx
  ;option(value "{=>(<host.p> ?>(?=(^ .) t))}_{(trip name.p)}"): {(trip title.q)}
:: this component renders the details of a single squad and all its polls
::
++  group-component
  |=  (pair gid squad)
  ^-  manx
  =/  polls=(list [=pid =poll =votes])
    ~(tap by (~(got by by-group) p))
  =/  open=@ud
    %-  lent
    %+  skim  polls
    |=  [* =poll *]
    (gth expiry.poll now.bol)
  =/  title=tape
    %+  weld  (trip title.q)
    ?:  =(0 open)
      ""
    " ({(a-co:co open)})"
  ;details(id "{=>(<host.p> ?>(?=(^ .) t))}_{(trip name.p)}", open "open")
    ;summary
      ;h3(class "inline"): {title}
    ==
    ;*  (group-polls-component p polls)
  ==
:: this component renders a list of polls for a squad
::
++  group-polls-component
  |=  [=gid =(list [=pid =poll =votes])]
  ^-  marl
  %+  turn
    %+  sort  list
    |=  [a=[* =poll *] b=[* =poll *]]
    (gth expiry.poll.a expiry.poll.b)
  (cury poll-component gid)
:: this component renders a single poll for a squad
::
++  poll-component
  |=  [=gid =pid =poll =votes]
  ^-  manx
  ;table(id (a-co:co pid))
    ;tr
      ;th: proposal:
      ;td: {(trip proposal.poll)}
    ==
    ;+  ?.  ?|  =(our.bol host.gid)
                &(=(our.bol creator.poll) (gte expiry.poll now.bol))
            ==
          ;/("")
        ?:  (~(has in withdrawn) pid)
          ;tr
            ;th: withdraw:
            ;td: pending
          ==
        ;tr
          ;th: withdraw:
          ;td
            :: this form lets either squad hosts or poll authors withdraw
            :: a poll
            ::
            ;form(class "inline-form", method "post", action "/tally/withdraw")
              ;input
                =type  "hidden"
                =name  "gid"
                =value  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
                ;+  ;/("")
              ==
              ;input(type "hidden", name "pid", value (a-co:co pid));
              ;input(type "submit", value "withdraw", class "bg-red text-white");
            ==
          ==
        ==
    ;tr
      ;th: creator:
      ;td: {<creator.poll>}
    ==
    ;tr
      ;th
        ;+  ?:  (lte expiry.poll now.bol)
              ;/  "closed:"
            ;/  "closes:"
      ==
      ;+  (expiry-component expiry.poll)
    ==
    ;*  (result-component votes expiry.poll)
    ;+  ?:  ?|  (lte expiry.poll now.bol)
                (~(has in voted) pid)
                !(~(has in participants.ring-group.poll) [our.bol our-life])
            ==
          ;/  ""
        ;tr
          ;th: vote:
          ;td
            :: this form lets people vote on a poll. It's only displayed
            :: if they've not already voted and they're allowed to.
            :: It POSTs the vote to /tally/vote, and the main Gall
            :: agent handles it
            ::
            ;form(class "inline-form", method "post", action "/tally/vote")
              ;input
                =type   "hidden"
                =name   "gid"
                =value  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
                ;+  ;/("")
              ==
              ;input(type "hidden", name "pid", value (a-co:co pid));
              ;input(id "yea", type "submit", name "choice", value "yea");
              ;input(id "nay", type "submit", name "choice", value "nay");
            ==
          ==
        ==
  ==
:: this component renders the current results of a poll:
:: the current votes and whether it's passed or not
:: (if closed)
::
++  result-component
  |=  [=votes expiry=@da]
  |^  ^-  marl
  =/  [yea=@ud nay=@ud]
    %+  roll  ~(val by votes)
    |=  [(pair ? *) y=@ud n=@ud]
    ?:  p  [+(y) n]  [y +(n)]
  =/  [y-per=@ud n-per=@ud]
    :-  (percent yea (add yea nay))
    (percent nay (add yea nay))
  :~  ^-  manx
      ;tr
        ;th: yea:
        ;td: {(a-co:co yea)} ({(a-co:co y-per)}%)
      ==
      ^-  manx
      ;tr
        ;th: nay:
        ;td: {(a-co:co nay)} ({(a-co:co n-per)}%)
      ==
      ^-  manx
      ?:  (gth expiry now.bol)
        ;/  ""
      ;tr
        ;th: passed:
        ;td
          ;+  ?:  (gth yea nay)
                ;/  "yes"
              ;/  "no"
        ==
      ==
  ==
  :: this sub-function calculates the percentage
  :: of yea vs nay votes
  ::
  ++  percent
    |=  (pair @ud @ud)
    ^-  @ud
    ?:  =(0 p)
      0
    %-  div
    :_  2
    %-  need
    %-  toi:fl
    %+  mul:fl
      (sun:fl 100)
    (div:fl (sun:fl p) (sun:fl q))
  --
:: this component renders the time left
:: for a poll
::
++  expiry-component
  |=  d=@da
  ^-  manx
  ;td
    ;+  ?:  (lte d now.bol)
          =/  =tarp  (yell (sub now.bol d))
          ?:  (gte d.tarp 1)
            ;/  "{(a-co:co d.tarp)} days ago"
          ?:  (gte h.tarp 1)
            ;/  "{(a-co:co h.tarp)} hours ago"
          ;/  "{(a-co:co m.tarp)} minutes ago"
        =/  =tarp  (yell (sub d now.bol))
        ?:  (gte d.tarp 1)
          ;/  "{(a-co:co d.tarp)} days"
        ?:  (gte h.tarp 1)
          ;/  "{(a-co:co h.tarp)} hours"
        ;/  "{(a-co:co m.tarp)} minutes"
  ==
:: subscription management button display logic
::
++  sub-button
  """
  document.getElementById('new').classList = 'none';
  document.getElementById('group').classList = 'none';
  document.getElementById('sub').classList = 'flex col';
  document.getElementById('sub-button').classList = 'active';
  document.getElementById('new-button').classList = 'inactive';
  document.getElementById('group-button').classList = 'inactive';
  """
:: new poll button display logic
::
++  new-button
  """
  document.getElementById('new').classList = 'flex col';
  document.getElementById('group').classList = 'none';
  document.getElementById('sub').classList = 'none';
  document.getElementById('sub-button').classList = 'inactive';
  document.getElementById('new-button').classList = 'active';
  document.getElementById('group-button').classList = 'inactive';
  """
:: view groups/polls button display logic
::
++  group-button
  """
  document.getElementById('new').classList = 'none';
  document.getElementById('group').classList = 'flex col';
  document.getElementById('sub').classList = 'none';
  document.getElementById('sub-button').classList = 'inactive';
  document.getElementById('new-button').classList = 'inactive';
  document.getElementById('group-button').classList = 'active';
  """
:: This is all the CSS for the app. It's just a big
:: block of text
::
++  style
  ^~
  ^-  tape
  %-  trip
  '''
    body {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: flex-start;
      font-family: "Inter", sans-serif;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }
    main {
      width: 100%;
      max-width: 500px;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 0 1rem 1rem 1rem;
      margin-top: 15vh;
      min-height: 0;
      max-height: min(80vh, 800px);
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
    }
    header {
      flex: 0 0 auto;
      padding-bottom: 2rem;
    }
    #group {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
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
    a:hover, input[type="submit"]:hover {
      opacity: 0.8;
      cursor: pointer;
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
    .inline-form {
      display: flex;
      align-items: center;
      flex-direction: horizontal;
      justify-content: start;
      margin: 0;
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
    table {
      margin: 2rem 0;
    }
    th {
       padding-right: 1ch;
    }
    select {
      min-width: 10ch;
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
    .align-start {
      align-items: flex-start;
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
    .scroll {
      overflow-y: auto;
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
this by adding a `sys.kelvin` file to the root of our `tally` directory:

```shell {% copy=true %}
cd tally
echo "[%zuse 414]" > sys.kelvin
```

We also need to specify which agents to start when our desk is installed. We do
this in a `desk.bill` file:

```shell {% copy=true %}
echo "~[%tally]" > desk.bill
```

Lastly, we need to create a Docket file. Docket is the agent that manages app
front-ends - it fetches & serves them, and it also configures the app tile and
other metadata. Create a `desk.docket-0` file in the `tally` directory and add the
following:

```shell {% copy=true %}
:~
  title+'Tally'
  info+'Ring signature voting for groups.'
  color+0xc4.251a
  version+[0 1 0]
  website+'https://urbit.org'
  license+'MIT'
  base+'tally'
  site+/tally
==
```

## Put it together

Our app is now complete, so let's try it out. In the Dojo of our comet, we'll
create a new desk with the `|new-desk` generator:

```{% copy=true %}
|new-desk %tally
```

Next, we'll mount the desk so we can access it from the host OS:

```{% copy=true %}
|mount %tally
```

Currently it just contains some skeleton files, but we can delete those and add
our own instead. In the normal shell, do the following:

```shell {% copy=true %}
rm -r dev-comet/tally/*
cp -r tally/* dev-comet/tally/*
```

Back in the Dojo again, we can now commit those files and install the app:

```{% copy=true %}
|commit %tally
|install our %tally
```

If we open a web browser, go to `localhost:8080` (or `localhost` on a Mac), and
login with the password obtained by running `+code` in the Dojo, we should see
a tile for the Tally app.  If we click on it, it'll open our front-end and we
can start using it.

One thing we can also do is publish the app so others can install it from us. To
do so, just run the following command:

```
:treaty|publish %tally
```

Now our friends will be able to install it directly from us with `|install <our
ship> %tally` or by searching for `<our ship>` on their ship's homescreen.

## Next steps

To learn to create an app like this, the first thing to do is learn Hoon. [Hoon
School](/guides/core/hoon-school/A-intro) is a comprehensive guide to the
language, and the best place to start. After learning the basics of Hoon, [App
School](/guides/core/app-school/intro) will teach you everything you need to
know about app development.

Along with these self-directed guides, we also run regular courses on both Hoon
and app development. You can check the [Courses](/courses) page for details, or
join the `~hiddev-dannut/new-hooniverse` group on Urbit.
