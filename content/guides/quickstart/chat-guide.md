+++
title = "Build a Chat App"
weight = 3
+++

In this lightning tutorial, we're going to build a simple chat app named Hut. It'll
look like this:

![hut screenshot](https://media.urbit.org/guides/quickstart/chat-guide/hut-screenshot-reskin.png)

We'll be able to create private chat rooms with members of our
[Squad](https://urbit.org/applications/~pocwet/squad) groups, and communicate
instantly and securely. Hut will be quite simple, it'll have a very basic UI and
only store the last 50 messages in each chat, but it's a good demonstration of
app development, networking, and front-end integration on Urbit.

If you'd like to check out the finished app, you can install it from
`~pocwet/hut` by either searching for `~pocwet` in the search bar of your ship's
homescreen, or by running `|install ~pocwet %hut`. Hut depends on the
[Squad](https://urbit.org/applications/~pocwet/squad) app, which we wrote in
[another lightning tutorial](/guides/quickstart/groups-guide), so you should
install that first with `|install ~pocwet %squad`.

The app source is available in the [`docs-examples` repo on
Github](https://github.com/urbit/docs-examples), in the `chat-app` folder. It
has three folders inside:

1. `bare-desk`: just the hoon files created here without any dependencies.
2. `full-desk`: `bare-desk` plus all dependencies. Note some files are
   symlinked, so if you're copying them you'll need to do `cp -rL`.
3. `ui`: the React front-end files.

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
|mount %garden
```

With those mounted, switch back to a normal shell in another terminal window.
We'll create a folder to develop our app in, and then we'll copy a few files
across that our app will depend on:

```shell {% copy=true %}
mkdir -p hut/{app,sur,mar,lib}
cp -r dev-comet/squad/mar/{bill*,hoon*,json*,kelvin*,mime*,noun*,ship*,txt*,docket-0*} hut/mar/
cp dev-comet/squad/lib/{agentio*,dbug*,default-agent*,skeleton*,docket*} hut/lib/
cp dev-comet/squad/sur/{docket*,squad*} hut/sur/
cp dev-comet/garden/lib/mip.hoon hut/lib/
```

Now we can start working on the app itself.

## Types

The first thing we typically do when developing an app is define:

1. The basic types our app will deal with.
2. The structure of our app's state.
3. The app's interface - the types of requests it will accept and the types of
   updates it will send out to subscribers.

We're making a chat app, so a message (`msg`) needs to contain the author and
the text. A chat room (`hut`) will be identified by the Squad `gid` (group ID)
it belongs to, as well as a name for the hut itself.

Our app state will contain a map from `gid` to `hut`s for that group. It will
also contain a map from `hut` to that hut's `msgs`. We also need to keep track
of who has actually joined, so we'll add a map from `gid` to a `(set ship)`.

For the actions/requests our app will accept, we'll need the following:

1. Create a new hut.
2. Post a message to a hut.
3. Subscribe to huts for a group.
4. Unsubscribe.
5. Delete an individual hut if we're the host.

Remote ships will only be able to do #2, while our own ship and front-end will
be able to perform any of these actions. The structure for these actions will be
a `hut-act`.

We also need to be able to send these events/updates out to subscribers:

1. The initial state of the huts for a particular group.
2. The state of all huts (this is for our front-end only).
3. Any of the actions above.

This structure for these updates is called `hut-upd`.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. We'll therefore save the
following code in `hut/sur/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
:: first we import the type definitions of
:: the squad app and expose them
::
/-  *squad
|%
:: an individual chat message will be a pair
:: of the author and the message itself as
:: a string
::
+$  msg      [who=@p what=@t]
:: an individual hut will contain an ordered
:: list of such messages
::
+$  msgs     (list msg)
:: the name of a hut
::
+$  name     @tas
:: the full identifier of a hut - a pair of
:: a gid (squad id) and the name
::
+$  hut      [=gid =name]
:: huts will be how we store all the names
:: of huts in our state. It will be a map
:: from gid (squad id) to a set of hut names
::
+$  huts     (jug gid name)
:: this will contain the messages for all huts.
:: it's a map from hut to msgs
::
+$  msg-jar  (jar hut msg)
:: this tracks who has actually joined the huts
:: for a particular squad
::
+$  joined   (jug gid @p)
:: this is all the actions/requests that can
:: be initiated. It's one half of our app's
:: API. Things like creating a new hut,
:: posting a new message, etc.
::
+$  hut-act
  $%  [%new =hut =msgs]
      [%post =hut =msg]
      [%join =gid who=@p]
      [%quit =gid who=@p]
      [%del =hut]
  ==
:: this is the other half of our app's API:
:: the kinds of updates/events that can be
:: sent out to subscribers or our front-end.
:: It's the $hut-act items plus a couple of
:: additional structure to initialize the
:: state for new subscribers or front-ends.
::
+$  hut-upd
  $%  [%init =huts =msg-jar =joined]
      [%init-all =huts =msg-jar =joined]
      hut-act
  ==
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

Hut uses a [pub/sub
pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern).
Remote ships are able to subscribe to the huts for a group on our ship and
receive updates such as new messages. They're also able to post new messages to
a hut by poking our agent with a `%post` action. Likewise, we'll be able to
subscribe to huts for groups on other ships and poke them to post messages.
Remember, all Urbit ships are both clients and servers.

There's three main agent arms we use for this:

1. `on-poke`: This arm handles one-off actions/requests, such as posting a
   message to a hut.
2. `on-watch`: This arm handles incoming subscription requests.
3. `on-agent`: This arm handles updates/events from people we've subscribed to.

When you subscribe to an agent, you subscribe to a *path*. In our app's case, we
use the `gid` (Squad group ID) as the path, like `/~sampel-palnet/my-squad-123`.
A remote ship will send us a subscription request which will arrive in the
`on-watch` arm. We'll check with `%squad` whether the remote ship is whitelisted
for the requested `gid`, and then either accept or reject the subscription
request. If accepted, we'll send them the initial state of huts for that `gid`,
and then continue to send them updates as they happen (such as new messages
being posted).

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

Just as other ships will subscribe to paths via our `on-watch` and then start
receiving updates we send out, we'll do the same to them. Once subscribed, the
updates will start arriving in our `on-agent` arm. In order to know what
subscription the updates relate to, we'll specify a *wire* when we first
subscribe. A wire is like a tag for responses. All updates we receive for a
given subscription will come in on the wire we specified when we opened the
subscription. A wire has the same format as a subscription path, and in this
case we'll make it the same - `/~sampel-palnet/my-hut-123`. The `on-agent` arm
will also handle updates from our `%squad` app installed locally, such as
changes to group whitelists/blacklists.

The last thing to note here is communications with the front-end. The web-server
kernel module Eyre exposes the same poke and subscription mechanics to the
front-end as JSON over a SSE (server-sent event) stream. Our front-end will
therefore interact with our agent just like any other ship would. When pokes and
subscription requests come in from the front-end, they'll have our own ship as
the source. This means differentiating the front-end from other ships is as
simple as checking that the source is us, like `?: =(our src) ...`. On Urbit,
interacting with a remote ship is just as easy as interacting with the local
ship.

Gall agents live in the `/app` directory of a desk, so you can save this code in
`hut/app/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
:: first we import the type defs for hut and also
:: for the squad app
::
/-  *hut, *squad
:: we also import some utility libraries to
:: reduce boilerplate
::
/+  default-agent, dbug, agentio
:: next, we define the type of our agent's state.
:: We create a versioned-state structure so it's
:: easy to upgrade down the line, then we define
:: state-0 as the type of our state
::
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =huts =msg-jar =joined]
+$  card  card:agent:gall
--
:: we wrap our agent in the dbug library so we
:: can easily debug it from the dojo if needed
::
%-  agent:dbug
:: we pin the default value of our $state-0
:: structure and give it the alias of "state"
::
=|  state-0
=*  state  -
:: we cast our agent to an agent type
::
^-  agent:gall
:: we reverse-compose in a separate helper core
:: defined below the main agent. This contains a
:: few useful functions
::
=<
:: we then start the agent core proper. It takes
:: a bowl containing metadata like the current time,
:: some entropy, the source of the current request, etc.
:: Gall automatically populates this every time there's
:: an event
::
|_  bol=bowl:gall
:: we define a few aliases for convenience. "This" is
:: the entire agent core including its state. "Def" is
:: the default-agent library. "IO" is the agentio
:: library and "hc" is our helper core.
::
+*  this  .
    def   ~(. (default-agent this %.n) bol)
    io    ~(. agentio bol)
    hc    ~(. +> bol)
:: this is the first proper agent arm. On-init is called
:: exactly once, when an agent is first installed. We just
:: subscribe to the %squad app for squad updates.
::
++  on-init
  ^-  (quip card _this)
  :_  this
  :~  (~(watch-our pass:io /squad) %squad /local/all)
  ==
:: on-save exports the state of the agent, and is called
:: either when an upgrade occurs or when the agent is suspended
::
++  on-save  !>(state)
:: on-load imports a previously exported agent state. It's called
:: after an upgrade has completed or when an agent has been
:: unsuspended. It just puts the state back in its proper location.
::
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
:: on-poke handles "pokes", one-off requests/actions intiated either
:: by our local ship, the front-end or other ships on the network.
::
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  :: we assert it's a %hut-do mark containing the $action type we
  :: previously defined
  ::
  ?>  ?=(%hut-do mark)
  :: we check whether the request came from our ship (and its front-end),
  :: or another ship on the network. If it's from us we call ++local, if
  :: it's from someone else we call ++remote
  ::
  ?:  =(our.bol src.bol)
    (local !<(hut-act vase))
  (remote !<(hut-act vase))
  :: ++local handles requests from our local ship and its front-end
  ::
  ++  local
    :: it takes a $hut-action
    ::
    |=  act=hut-act
    ^-  (quip card _this)
    :: we switch on the type of request
    ::
    ?-    -.act
      :: posting a new message
      ::
        %post
      =/  =path
        /(scot %p host.gid.hut.act)/[name.gid.hut.act]
      :: if it's a remote hut, we pass the request to the host ship
      ::
      ?.  =(our.bol host.gid.hut.act)
        :_  this
        :~  (~(poke pass:io path) [host.gid.hut.act %hut] [mark vase])
        ==
      :: if it's our hut, we add the message to the hut
      ::
      =/  =msgs  (~(get ja msg-jar) hut.act)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.act msgs]
        [msg.act (snip msgs)]
      :: we update the msgs in state and send an update to
      :: all subscribers
      ::
      :_  this(msg-jar (~(put by msg-jar) hut.act msgs))
      :~  (fact:io hut-did+vase path /all ~)
      ==
    ::
      :: a request to subscribe to a squad's huts
      ::
        %join
      :: make sure it's not our own
      ::
      ?<  =(our.bol host.gid.act)
      :: pass the request along to the host
      ::
      =/  =path
        /(scot %p host.gid.act)/[name.gid.act]
      :_  this
      :~  (~(watch pass:io path) [host.gid.act %hut] path)
      ==
    ::
      :: unsubscribe from huts for a squad
      ::
        %quit
      =/  =path
        /(scot %p host.gid.act)/[name.gid.act]
      :: get the squad's huts from state
      ::
      =/  to-rm=(list hut)
        %+  turn  ~(tap in (~(get ju huts) gid.act))
        |=(=name `hut`[gid.act name])
      :: delete all messages for those huts
      ::
      =.  msg-jar
        |-
        ?~  to-rm  msg-jar
        $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
      :: notify subscribers & unsubscribe from the host if it's
      :: not our. Also update state to delete all the huts,
      :: messages and members
      ::
      :-  :-  (fact:io hut-did+vase /all ~)
          ?:  =(our.bol host.gid.act)
            ~
          ~[(~(leave-path pass:io path) [host.gid.act %hut] path)]
      %=  this
        huts     (~(del by huts) gid.act)
        msg-jar  msg-jar
        joined   (~(del by joined) gid.act)
      ==
    ::
      :: create a new hut
      ::
        %new
      :: make sure we're creating a hut in our own squad
      ::
      ?>  =(our.bol host.gid.hut.act)
      :: make sure the specified squad exists
      ::
      ?>  (has-squad:hc gid.hut.act)
      :: make sure the new hut doesn't already exist
      ::
      ?<  (~(has ju huts) gid.hut.act name.hut.act)
      :: notify subscribers and initialize the new
      :: hut in state
      ::
      =/  =path
        /(scot %p host.gid.hut.act)/[name.gid.hut.act]
      :-  :~  (fact:io hut-did+vase path /all ~)
          ==
      %=  this
        huts     (~(put ju huts) gid.hut.act name.hut.act)
        msg-jar  (~(put by msg-jar) hut.act *msgs)
        joined   (~(put ju joined) gid.hut.act our.bol)
      ==
    ::
      :: delete a hut
      ::
        %del
      :: make sure we're the host
      ::
      ?>  =(our.bol host.gid.hut.act)
      :: notify subscribers and delete its messages and
      :: metadata in state
      ::
      =/  =path
        /(scot %p host.gid.hut.act)/[name.gid.hut.act]
      :-  :~  (fact:io hut-did+vase path /all ~)
          ==
      %=  this
        huts     (~(del ju huts) gid.hut.act name.hut.act)
        msg-jar  (~(del by msg-jar) hut.act)
      ==
    ==
  :: ++remote handles requests from remote ships
  ::
  ++  remote
    :: it takes a $hut-act
    ::
    |=  act=hut-act
    :: assert it can only be a %post message request
    ::
    ?>  ?=(%post -.act)
    ^-  (quip card _this)
    :: make sure we host the hut in question
    ::
    ?>  =(our.bol host.gid.hut.act)
    :: make sure it exists
    ::
    ?>  (~(has by huts) gid.hut.act)
    :: make sure the source of the request is the specified
    :: author
    ::
    ?>  =(src.bol who.msg.act)
    :: make sure the source of the request is a member
    ::
    ?>  (~(has ju joined) gid.hut.act src.bol)
    =/  =path  /(scot %p host.gid.hut.act)/[name.gid.hut.act]
    :: get that hut's messages from state
    ::
    =/  =msgs  (~(get ja msg-jar) hut.act)
    :: add the new message
    ::
    =.  msgs
      ?.  (lte 50 (lent msgs))
        [msg.act msgs]
      [msg.act (snip msgs)]
    :: notify subscribers of the new message and update state
    ::
    :_  this(msg-jar (~(put by msg-jar) hut.act msgs))
    :~  (fact:io hut-did+vase path /all ~)
    ==
  --
:: on-agent handles responses to requests we've initiated
:: and updates/events from those to whom we've subscribed
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  :: if it's from the Squad app
  ::
  ?:  ?=([%squad ~] wire)
    :: switch on the type of event
    ::
    ?+    -.sign  (on-agent:def wire sign)
      :: if we've been kicked from the subscription,
      :: automatically resubscribe
      ::
        %kick
      :_  this
      :~  (~(watch-our pass:io /squad) %squad /local/all)
      ==
    ::
      :: if it's a subscription acknowledgement, see if
      :: the subscribe succeeded or failed
      ::
        %watch-ack
      :: if there's no error message it succceeded,
      :: do nothing further
      ::
      ?~  p.sign  `this
      :: otherwise if there's an error message it failed,
      :: set a timer to retry subscribing in 1 minute
      ::
      :_  this
      :~  (~(wait pass:io /behn) (add now.bol ~m1))
      ==
    ::
      :: if it's an ordinary subscription update...
      ::
        %fact
      :: assert it's a %squad-did mark containing a Squad $upd
      ::
      ?>  ?=(%squad-did p.cage.sign)
      :: extract the squad $upd update
      ::
      =/  =upd  !<(upd q.cage.sign)
      :: switch on the kind of update
      ::
      ?+    -.upd  `this
        :: if it's a state initialization update...
        ::
          %init-all
        :: diff the squads we have with those in the update,
        :: making a list of the ones we have that aren't in the
        :: update and that we therefore need to remove
        ::
        =/  gid-to-rm=(list gid)
          ~(tap in (~(dif in ~(key by huts)) ~(key by squads.upd)))
        :: delete the $huts entries for those
        ::
        =.  huts
          |-
          ?~  gid-to-rm  huts
          $(gid-to-rm t.gid-to-rm, huts (~(del by huts) i.gid-to-rm))
        :: delete the member lists for those
        ::
        =.  joined
          |-
          ?~  gid-to-rm  joined
          $(gid-to-rm t.gid-to-rm, joined (~(del by joined) i.gid-to-rm))
        :: make a list of huts to remove based on the squads to remove
        ::
        =/  hut-to-rm=(list hut)
          %-  zing
          %+  turn  gid-to-rm
          |=  =gid
          (turn ~(tap in (~(get ju huts) gid)) |=(=name `hut`[gid name]))
        :: delete all message container entries for those huts
        ::
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
        :: kick all members of removed squads and create notifications
        :: of their kicks to send to subscribers
        ::
        =^  cards=(list card)  joined
          %+  roll  ~(tap by joined)
          |:  [[gid=*gid ppl=*ppl] cards=*(list card) n-joined=joined]
          =/  =path  /(scot %p host.gid)/[name.gid]
          =/  ppl-list=(list @p)  ~(tap in ppl)
          =;  [n-cards=(list card) n-n-joined=^joined]
            [(weld n-cards cards) n-n-joined]
          %+  roll  ppl-list
          |:  [ship=*@p n-cards=*(list card) n-n-joined=n-joined]
          ?.  ?&  ?|  ?&  pub:(~(got by squads.upd) gid)
                          (~(has ju acls.upd) gid ship)
                      ==
                      ?&  !pub:(~(got by squads.upd) gid)
                          !(~(has ju acls.upd) gid ship)
                      ==
                  ==
                  (~(has ju n-n-joined) gid ship)
              ==
            [n-cards n-n-joined]
          :-  :+  (kick-only:io ship path ~)
                (fact:io hut-did+!>(`hut-upd`[%quit gid ship]) path /all ~)
              n-cards
          (~(del ju n-n-joined) gid ship)
        =/  kick-paths=(list path)
          (turn gid-to-rm |=(=gid `path`/(scot %p host.gid)/[name.gid]))
        =.  cards  ?~(kick-paths cards [(kick:io kick-paths) cards])
        =.  cards
          %+  weld
            %+  turn  gid-to-rm
            |=  =gid
            ^-  card
            (fact:io hut-did+!>(`hut-upd`[%quit gid our.bol]) /all ~)
          cards
        :: update state and send off the notifications
        ::
        [cards this(huts huts, msg-jar msg-jar, joined joined)]
      ::
        :: a squad has been deleted
        ::
          %del
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :: get the huts of the deleted squad
        ::
        =/  to-rm=(list hut)
          %+  turn  ~(tap in (~(get ju huts) gid.upd))
          |=(=name `hut`[gid.upd name])
        :: delete messages for those huts
        ::
        =.  msg-jar
          |-
          ?~  to-rm  msg-jar
          $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
        :: update state
        ::
        :_  %=  this
              huts     (~(del by huts) gid.upd)
              msg-jar  msg-jar
              joined   (~(del by joined) gid.upd)
            ==
        :: kick all subscribers for that squad and unsubscribe if
        :: it's not ours
        ::
        :+  (kick:io path ~)
          (fact:io hut-did+!>(`hut-upd`[%quit gid.upd our.bol]) /all ~)
        ?:  =(our.bol host.gid.upd)
          ~
        ~[(~(leave-path pass:io path) [host.gid.upd %tally] path)]
      ::
        :: someone has been kicked from a squad
        ::
          %kick
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :: if it wasn't us: kick them, delete them from the member set
        :: and notify subscribers of the kick
        ::
        ?.  =(our.bol ship.upd)
          :_  this(joined (~(del ju joined) gid.upd ship.upd))
          :-  (kick-only:io ship.upd path ~)
          ?.  (~(has ju joined) gid.upd ship.upd)
            ~
          ~[(fact:io hut-did+!>(`hut-upd`[%quit gid.upd ship.upd]) path /all ~)]
        :: if we were kicked, get all huts for that squad
        ::
        =/  hut-to-rm=(list hut)
          (turn ~(tap in (~(get ju huts) gid.upd)) |=(=name `hut`[gid.upd name]))
        :: delete all messages for those huts
        ::
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
        :: update state and kick subscribers
        ::
        :_  %=  this
               huts     (~(del by huts) gid.upd)
               msg-jar  msg-jar
               joined   (~(del by joined) gid.upd)
            ==
        :+  (kick:io path ~)
          (fact:io hut-did+!>(`hut-upd`[%quit gid.upd ship.upd]) /all ~)
        ?:  =(our.bol host.gid.upd)
          ~
        ~[(~(leave-path pass:io path) [host.gid.upd %tally] path)]
      ::
        :: someone has left a squad
        ::
          %leave
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        :: if it wasn't us, remove them from the members list
        :: and notify subscribers that they quit
        ::
        ?.  =(our.bol ship.upd)
          ?.  (~(has ju joined) gid.upd ship.upd)
            `this
          :_  this(joined (~(del ju joined) gid.upd ship.upd))
          :~  (kick-only:io ship.upd path ~)
              %+  fact:io
                hut-did+!>(`hut-upd`[%quit gid.upd ship.upd])
              ~[path /all]
          ==
        :: if it was us, get a list of that squad's huts
        ::
        =/  hut-to-rm=(list hut)
          (turn ~(tap in (~(get ju huts) gid.upd)) |=(=name `hut`[gid.upd name]))
        :: delete all messages for those huts
        ::
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
        :: update state and kick all subscribers to this squad
        ::
        :_  %=  this
              huts     (~(del by huts) gid.upd)
              msg-jar  msg-jar
              joined   (~(del by joined) gid.upd)
            ==
        :+  (kick:io path ~)
          (fact:io hut-did+!>(`hut-upd`[%quit gid.upd ship.upd]) /all ~)
        ?:  =(our.bol host.gid.upd)
          ~
        ~[(~(leave-path pass:io path) [host.gid.upd %tally] path)]
      ==
    ==
  :: otherwise the event is from another tally instance we've
  :: subscribed to
  ::
  ?>  ?=([@ @ ~] wire)
  :: decode the squad from the wire (event tag)
  ::
  =/  =gid  [(slav %p i.wire) i.t.wire]
  :: switch on the kind of event
  ::
  ?+    -.sign  (on-agent:def wire sign)
    :: if it was a response to a subscriiption request...
      %watch-ack
    :: if there's no error message the subscription succeeded,
    :: no nothing
    ?~  p.sign  `this
    :: otherwise it failed. Get a list of the huts for that squad
    ::
    =/  to-rm=(list hut)
      %+  turn  ~(tap in (~(get ju huts) gid))
      |=(=name `hut`[gid name])
    :: delete all its messages
    ::
    =.  msg-jar
      |-
      ?~  to-rm  msg-jar
      $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
    :: update state and send notification
    ::
    :-  :~  (fact:io hut-did+!>(`hut-upd`[%quit gid our.bol]) /all ~)
        ==
    %=  this
      huts     (~(del by huts) gid)
      msg-jar  msg-jar
      joined   (~(del by joined) gid)
    ==
  ::
    :: if we've been kicked from the subscription,
    :: automatically resubscribe
    ::
      %kick
    :_  this
    :~  (~(watch pass:io wire) [host.gid %hut] wire)
    ==
  ::
    :: if it's an ordinary subscription update...
    ::
      %fact
    :: assert the update has a %hut-did mark and
    :: contains a $hut-upd
    ::
    ?>  ?=(%hut-did p.cage.sign)
    :: extract the $hut-upd
    ::
    =/  upd  !<(hut-upd q.cage.sign)
    :: switch on what kind of update it is
    ::
    ?+    -.upd  (on-agent:def wire sign)
      :: a state initialization update
      ::
        %init
      :: if it's trying to initialize squads other
      :: than it should, do nothing
      ::
      ?.  =([gid ~] ~(tap in ~(key by huts.upd)))
        `this
      :: if it's trying to overwrite members for squads
      :: other than it should, do nothing
      ::
      ?.  =([gid ~] ~(tap in ~(key by joined.upd)))
        `this
      :: delete huts we have that no longer exist for this
      :: squad and update the messages for the rest
      ::
      =.  msg-jar.upd
        =/  to-rm=(list [=hut =msgs])
          %+  skip  ~(tap by msg-jar.upd)
          |=  [=hut =msgs]
          ?&  =(gid gid.hut)
              (~(has ju huts.upd) gid.hut name.hut)
          ==
        |-
        ?~  to-rm
          msg-jar.upd
        $(to-rm t.to-rm, msg-jar.upd (~(del by msg-jar.upd) hut.i.to-rm))
      :: pass on the %init event to the front-end and update state
      ::
      :-  :~  %+  fact:io
                hut-did+!>(`hut-upd`[%init huts.upd msg-jar.upd joined.upd])
              ~[/all]
          ==
      %=  this
        huts     (~(uni by huts) huts.upd)
        msg-jar  (~(uni by msg-jar) msg-jar.upd)
        joined   (~(uni by joined) joined.upd)
      ==
    ::
      :: a new message
      ::
        %post
      ?.  =(gid gid.hut.upd)
        `this
      :: update messages for the hut in question
      ::
      =/  msgs  (~(get ja msg-jar) hut.upd)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.upd msgs]
        [msg.upd (snip msgs)]
      :: update state and notify the front-end
      ::
      :_  this(msg-jar (~(put by msg-jar) hut.upd msgs))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
      :: someone has joined the huts for a squad
      ::
        %join
      ?.  =(gid gid.upd)
        `this
      :: update the member list and notify the front-end
      ::
      :_  this(joined (~(put ju joined) gid who.upd))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
      :: someone has left the huts for a squad
      ::
        %quit
      ?.  =(gid gid.upd)
        `this
      :: update thje member list and notify the front-end
      ::
      :_  this(joined (~(del ju joined) gid who.upd))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
      :: a hut has been deleted
      ::
        %del
      ?.  =(gid gid.hut.upd)
        `this
      :: notify the front-end and delete everything about
      :: it in state
      :-  :~  (fact:io cage.sign /all ~)
          ==
      %=  this
        huts     (~(del ju huts) hut.upd)
        msg-jar  (~(del by msg-jar) hut.upd)
      ==
    ==
  ==
:: on-watch handles subscription requests
::
++  on-watch
  :: it takes the requested subscription path as its argument
  ::
  |=  =path
  |^  ^-  (quip card _this)
  :: if it's /all...
  ?:  ?=([%all ~] path)
    :: assert it must be from the local ship (and front-end)
    ::
    ?>  =(our.bol src.bol)
    :: give the subscriber the current state of all huts
    ::
    :_  this
    :~  %-  fact-init:io
        hut-did+!>(`hut-upd`[%init-all huts msg-jar joined])
    ==
  :: otherwise it's a probably a remote ship subscribing
  :: to huts for a particular squad
  ::
  ?>  ?=([@ @ ~] path)
  :: decode the gid (squad id)
  ::
  =/  =gid  [(slav %p i.path) i.t.path]
  :: assert we're the host
  ::
  ?>  =(our.bol host.gid)
  :: assert the requester is a member of the squad in question
  ::
  ?>  (is-allowed:hc gid src.bol)
  :: update the member list, give them the initial state of huts
  :: for that squad and notify all other subscribers of the join
  ::
  :_  this(joined (~(put ju joined) gid src.bol))
  :-  (init gid)
  ?:  (~(has ju joined) gid src.bol)
    ~
  ~[(fact:io hut-did+!>(`hut-upd`[%join gid src.bol]) /all path ~)]
  :: this is just a convenience function to construct the
  :: initialization update for new subscribers
  ::
  ++  init
    |=  =gid
    ^-  card
    =/  hut-list=(list hut)
      %+  turn  ~(tap in (~(get ju huts) gid))
      |=(=name `hut`[gid name])
    %-  fact-init:io
    :-  %hut-did
    !>  ^-  hut-upd
    :^    %init
        (~(put by *^huts) gid (~(get ju huts) gid))
      %-  ~(gas by *^msg-jar)
      %+  turn  hut-list
      |=(=hut `[^hut msgs]`[hut (~(get ja msg-jar) hut)])
    (~(put by *^joined) gid (~(put in (~(get ju joined) gid)) src.bol))
  --
:: on-leave is called when someone unsubscribes
::
++  on-leave
  |=  =path
  ^-  (quip card _this)
  :: if it's /all (and therefore the front-end), do nothing
  ::
  ?:  ?=([%all ~] path)
    `this
  :: otherwise it's probably a remote ship leaving
  ::
  ?>  ?=([@ @ ~] path)
  :: decode the gid (squad id)
  ::
  =/  =gid  [(slav %p i.path) i.t.path]
  :: check if this is the only subscription the person leaving
  :: has with us
  ::
  =/  last=?
    %+  gte  1
    (lent (skim ~(val by sup.bol) |=([=@p *] =(src.bol p))))
  :: update state and alert other subscribers that they left
  :: if it's the only subscription they have
  ::
  :_  this(joined (~(del ju joined) gid src.bol))
  ?.  last
    ~
  :~  (fact:io hut-did+!>(`hut-upd`[%quit gid src.bol]) /all path ~)
  ==
:: on-peek handles local read-only requests. We don't use it so
:: we leave it to default-agent to handle
::
++  on-peek  on-peek:def
:: on-arvo handles responses from the kernel
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  :: if it's not from Behn (the timer vane), do nothing
  ::
  ?.  ?=([%behn ~] wire)
    (on-arvo:def [wire sign-arvo])
  ?>  ?=([%behn %wake *] sign-arvo)
  :: if the timer fired successfully, resubscribe to the squad app
  ::
  ?~  error.sign-arvo
    :_  this
    :~  (~(watch-our pass:io /squad) %squad /local/all)
    ==
  :: otherwise, if the timer failed for some reason, reset it
  ::
  :_  this
  :~  (~(wait pass:io /behn) (add now.bol ~m1))
  ==
:: on-fail handles crash notifications. We just leave it to
:: default-agent
::
++  on-fail  on-fail:def
--
:: that's the end of the agent core proper. Now we have the
:: "helper core" that we reverse-composed into the main
:: agent core's subject. It contains some useful functions
:: we use in our agent in various places.
::
:: it takes the same bowl as the main agent
::
|_  bol=bowl:gall
:: this function checks whether a squad exists in our local
:: squad agent
::
++  has-squad
  |=  =gid
  ^-  ?
  =-  ?=(^ .)
  .^  (unit)
    %gx
    (scot %p our.bol)
    %squad
    (scot %da now.bol)
    %squad
    (scot %p host.gid)
    /[name.gid]/noun
  ==
:: this function checks whether a ship should be allowed to subscribe,
:: based on the access control list for the squad in the squad app
::
++  is-allowed
  |=  [=gid =ship]
  ^-  ?
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
--
```

## Marks

The last piece of our backend are the *marks*. Marks are Urbit's version of
filetypes/MIME types, but strongly typed and with inter-mark conversion methods.

We'll create two marks: one for handling poke actions with the type of `act` we
defined previously, and one for handling updates with the type of `upd`. We'll
call the first one `%hut-do`, and the second one `%hut-did`. The `%hut-did` mark
will include conversion methods to JSON for our front-end, and the `%hut-do`
mark will include conversion methods in the other direction.

Mark files live in the `/mar` directory of a desk. You can save the code below
in `hut/mar/hut/do.hoon` and `hut/mar/hut/did.hoon` respectively.

#### `%hut-do`

```hoon {% copy=true mode="collapse" %}
:: import the hut type defs from /sur/hut.hoon
::
/-  *hut
:: the mark door takes a $hut-act as its sample
::
|_  a=hut-act
:: grow defines methods for converting from this mark
:: to other marks
::
++  grow
  |%
  :: this mark is primarily used inbound from the
  :: front-end, so we only need a simple %noun
  :: conversion method here
  ::
  ++  noun  a
  --
:: grab defines methods for converting to this mark
:: from other marks
::
++  grab
  |%
  :: for a plain noun we'll just mold it with the
  :: $hut-act mold
  ::
  ++  noun  hut-act
  :: we'll receive JSON data from the front-end,
  :: so we need methods to convert the json to
  :: a $hut-act
  ::
  ++  json
    :: we expose the contents of the dejs:format
    :: library so we don't have to type dejs:format
    :: every time we use its functions
    ::
    =,  dejs:format
    :: we create a gate that takes some $json
    ::
    |=  jon=json
    :: the return type is a $hut-act
    ::
    |^  ^-  hut-act
    :: we call our decoding function with the
    :: incoming JSON as its argument
    ::
    %.  jon
    :: ++of:dejs:format decodes objects into
    :: head-tagged structures. We define a method
    :: for each type of JSON-encoded $hut-action
    ::
    %-  of
    :~  new+(ot ~[hut+de-hut msgs+(ar de-msg)])
        post+(ot ~[hut+de-hut msg+de-msg])
        join+(ot ~[gid+de-gid who+(se %p)])
        quit+(ot ~[gid+de-gid who+(se %p)])
        del+(ot ~[hut+de-hut])
    ==
    :: this decodes a $msg from JSON
    ::
    ++  de-msg  (ot ~[who+(se %p) what+so])
    :: decode a $hut from JSON
    ::
    ++  de-hut  (ot ~[gid+de-gid name+(se %tas)])
    :: decode a squad $gid from JSON
    ::
    ++  de-gid  (ot ~[host+(se %p) name+(se %tas)])
    --
  --
:: grab handles revision control functions. We don't
:: need to use these, so we just delegate it to the
:: %noun mark
::
++  grad  %noun
--
```

#### `%hut-did`

```hoon {% copy=true mode="collapse" %}
:: first we import the type defs from /sur/hut.hoon
::
/-  *hut
:: our mark door takes a $hut-upd as its argument
::
|_  u=hut-upd
:: grow handles conversions from our %hut-did mark to other
:: marks. We'll be sending updates out to the front-end, so
:: we need conversion methods to JSON in particular
::
++  grow
  |%
  :: we handle a plain noun by just returning the $hut-upd
  ::
  ++  noun  u
  :: here are the conversion methods to JSON
  ::
  ++  json
    :: we expose the contents of the enjs:format library so we
    :: don't have to type enjs:format every time we use its
    :: functions
    ::
    =,  enjs:format
    :: we return a $json structure
    ::
    |^  ^-  ^json
    :: we switch on the type of $hut-upd and JSON-encode it
    :: appropriately. For each case we create an object with
    :: a single key corresponding to the update type, and containing
    :: another object with its details
    ::
    ?-    -.u
        %new
      %+  frond  'new'
      (pairs ~[['hut' (en-hut hut.u)] ['msgs' (en-msgs msgs.u)]])
    ::
        %post
      %+  frond  'post'
      (pairs ~[['hut' (en-hut hut.u)] ['msg' (en-msg msg.u)]])
    ::
        %join
      %+  frond  'join'
      (pairs ~[['gid' (en-gid gid.u)] ['who' s+(scot %p who.u)]])
    ::
        %quit
      %+  frond  'quit'
      (pairs ~[['gid' (en-gid gid.u)] ['who' s+(scot %p who.u)]])
    ::
        %del
      (frond 'del' (frond 'hut' (en-hut hut.u)))
    ::
        %init
      %+  frond  'init'
      %-  pairs
      :~  ['huts' (en-huts huts.u)]
          ['msgJar' (en-msg-jar msg-jar.u)]
          ['joined' (en-joined joined.u)]
      ==
    ::
        %init-all
      %+  frond  'initAll'
      %-  pairs
      :~  ['huts' (en-huts huts.u)]
          ['msgJar' (en-msg-jar msg-jar.u)]
          ['joined' (en-joined joined.u)]
      ==
    ==
    :: this function creates an array of the the members of a the
    :: huts for a squad
    ::
    ++  en-joined
      |=  =joined
      ^-  ^json
      :-  %a
      %+  turn  ~(tap by joined)
      |=  [=gid =ppl]
      %-  pairs
      :~  ['gid' (en-gid gid)]
          :-  'ppl'
          a+(sort (turn ~(tap in ppl) |=(=@p s+(scot %p p))) aor)
      ==
    :: this function creates an array of all the messages for all
    :: the huts
    ::
    ++  en-msg-jar
      |=  =msg-jar
      ^-  ^json
      :-  %a
      %+  turn  ~(tap by msg-jar)
      |=  [=hut =msgs]
      (pairs ~[['hut' (en-hut hut)] ['msgs' (en-msgs msgs)]])
    :: this function creates an array of all the metadata for
    :: all huts
    ::
    ++  en-huts
      |=  =huts
      ^-  ^json
      :-  %a
      %+  turn  ~(tap by huts)
      |=  [=gid names=(set name)]
      %-  pairs
      :~  ['gid' (en-gid gid)]
          ['names' a+(turn (sort ~(tap in names) aor) (lead %s))]
      ==
    :: encode an array of all the messages in a particular hut
    ::
    ++  en-msgs  |=(=msgs `^json`a+(turn (flop msgs) en-msg))
    :: encode an individual chat message
    ::
    ++  en-msg
      |=  =msg
      ^-  ^json
      (pairs ~[['who' s+(scot %p who.msg)] ['what' s+what.msg]])
    :: encode a hut id
    ::
    ++  en-hut
      |=  =hut
      ^-  ^json
      (pairs ~[['gid' (en-gid gid.hut)] ['name' s+name.hut]])
    :: encode a squad id
    ::
    ++  en-gid
      |=  =gid
      ^-  ^json
      (pairs ~[['host' s+(scot %p host.gid)] ['name' s+name.gid]])
    --
  --
:: grab handles conversion methods from other marks to our mark.
::
++  grab
  |%
  :: we just handle the normal noun case by molding it with the
  :: $hut-upd type
  ::
  ++  noun  hut-upd
  --
:: grad handles revision control functions. We don't need to deal with
:: these so we delegate them to the %noun mark
::
++  grad  %noun
--
```

## React app

Our back-end is complete, so we can now work on our React front-end. We'll just
look at the basic setup process here, but you can get the full React app by
cloning [this repo on Github](https://github.com/urbit/docs-examples) and run
`npm i` in `chat-app/ui`. Additional commentary on the code is in the
[additional commentary](#additional-commentary) section below.

#### Basic setup process

When creating it from scratch, first make sure you have Node.js installed on
your computer (you can download it from their
[website](https://nodejs.org/en/download)) and then run `create-landscape-app`:

```shell
npx @urbit/create-landscape-app
✔ What should we call your application? … hut
✔ What URL do you use to access Urbit? … http://127.0.0.1:8080
```

This will generate a React project in the `hut/ui` directory with all the
basic necessities for Urbit front-end development. Next, run the following
commands to install the project's dependencies:

```shell
cd hut/ui
npm i
```

We can now open `src/app.jsx`, wipe its contents, and start writing our own
app. The first thing is to import the `Urbit` class from `@urbit/http-api`:

```javascript
import React, {useEffect, useState} from "react";
import Urbit from "@urbit/http-api";
```

We'll create an `App` component that will create a new `Urbit` instance on load
to monitor our front-end's connection with our ship. Our app is simple and will
just display the connection status in the top-left corner:

```javascript
export function App() {
  const [status, setStatus] = useState("try");

  useEffect(() => {
    window.urbit = new Urbit("");
    window.urbit.ship = window.ship;

    window.urbit.onOpen = () => setStatus("con");
    window.urbit.onRetry = () => setStatus("try");
    window.urbit.onError = () => setStatus("err");

    const subscription = window.urbit.subscribe({
      app: "hut",
      path: "/all",
      event: (e) => console.log(e),
    });

    return () => window.urbit.unsubscribe(subscription);
  }, []);

  return (<h1>{status}</h1>);
}
```

After we've finished writing our React app, we can build it and view the
resulting files in the `dist` directory:

```shell
npm run build
ls dist
```

#### Additional commentary

There are a fair few functions in the
[complete front-end source for `%hut`](https://github.com/urbit/docs-examples);
we'll just look at a handful to cover the basics. The first is the `appPoke`
in `src/lib.js`, which (as the name suggests) sends a poke to a ship. It takes
the poke in JSON form and calls the `poke` method of our `Urbit` object to
perform the poke:

```javascript
export function appPoke(jon) {
  return api.poke({
    app: "hut",
    mark: "hut-do",
    json: jon,
  });
}
```

An example of sending a `poke` with a `%join`-type `act` in JSON form can be
found in the `src/components/SelectGid.jsx` source file:

```javascript
const handleJoin = () => {
  if (joinSelect !== "def") {
    const [host, name] = joinSelect.split("/");
    appPoke({
      "join": {
        "gid" : {"host": host, "name": name},
        "who" : OUR
      }
    });
  }
};
```

Our front-end will subscribe to updates for all groups our `%hut` agent is
currently tracking. To do so, it calls the `subscribe` method of the `Urbit`
object (aliased to `api` in our example) with the `path` to subscribe to and an
`event` callback to handle each update it receives. Our agent publishes all
updates on the local-only `/all` path. Here's the source in the `src/app.jsx`
file:

```javascript
const subscription = api.subscribe({
  app: "hut",
  path: "/all",
  event: setSubEvent,
});
```

Notice that the above call to `subscribe` passes the `setSubEvent` function.
This is part of a common pattern for Urbit React applications wherein a state
variable is used to track new events and cause component re-rendering. The
broad outline for this workflow is as follows:

1. Create a component subscription event variable with:
   ```javascript
   const [subEvent, setSubEvent] = useState();
   ```
2. Call the `subscribe` function, passing `setSubEvent` as the `event` keyword
   argument:
   ```javascript
   urbit.subscribe({ /* ... */, event: setSubEvent });
   ```
3. Create a subscription handler function that updates when new events are
   available with:
   ```javascript
   useEffect(() => {/* handler goes here */}, [subEvent]);
   ```

The source for the final `useEffect` portion of this workflow (found in the
`src/app.jsx` file) can be found below:

```javascript {% mode="collapse" %}
useEffect(() => {
  const updateFuns = {
    "initAll": (update) => {
      update.huts.forEach(obj =>
        huts.set(gidToStr(obj.gid), new Set(obj.names))
      );

      setHuts(new Map(huts));
      setChatContents(new Map(
        update.msgJar.map(o => [hutToStr(o.hut), o.msgs])
      ));
      setChatMembers(new Map(
        update.joined.map(o => [gidToStr(o.gid), new Set(o.ppl)])
      ));
    }, "init": (update) => {
      setChatContents(new Map(update.msgJar.reduce(
        (a, n) => a.set(hutToStr(n.hut), n.msgs)
      , chatContents)));
      setHuts(new Map(huts.set(
        gidToStr(update.huts[0].gid),
        new Set(update.huts[0].names)
      )));
      setChatMembers(new Map(chatMembers.set(
        gidToStr(update.joined[0].gid),
        new Set(update.joined[0].ppl)
      )));
    }, "new": (update) => {
      const gidStr = gidToStr(update.hut.gid);
      const hutStr = hutToStr(update.hut);
      if (huts.has(gidStr)) {
        huts.get(gidStr).add(update.hut.name);
      } else {
        huts.set(gidStr, new Set(update.hut.name));
      }

      setHuts(new Map(huts));
      setChatMembers(new Map(chatMembers.set(hutStr, update.msgs)));
    }, "post": (update) => {
      const newHut = hutToStr(update.hut);
      if (chatContents.has(newHut)) {
        chatContents.set(newHut, [...chatContents.get(newHut), update.msg]);
      } else {
        chatContents.set(newHut, [update.msg]);
      }

      setChatContents(new Map(chatContents));
    }, "join": (update) => {
      const gidStr = gidToStr(update.gid);
      if (chatMembers.has(gidStr)) {
        chatMembers.get(gidStr).add(update.who)
      } else {
        chatMembers.set(gidStr, new Set([update.who]));
      }

      setChatMembers(new Map(chatMembers));
      setJoinSelect("def");
    }, "quit": (update) => {
      const gidStr = gidToStr(update.gid);
      if (update.who === OUR) {
        huts.delete(gidStr);
        chatMembers.delete(gidStr);
        if(huts.has(gidStr)) {
          huts.get(gidStr).forEach(name =>
            chatContents.delete(gidStr + "/" + name)
          );
        }

        setHuts(new Map(huts));
        setChatMembers(new Map(chatMembers));
        setChatContents(new Map(chatContents));
        setCurrGid((currGid === gidStr) ? null : currGid);
        setCurrHut((currHut === null)
          ? null
          : (`${currHut.split("/")[0]}/${currHut.split("/")[1]}` === gidStr)
            ? null
            : currHut
        );
        setViewSelect("def");
        setHutInput((currGid === gidStr) ? "" : hutInput);
      } else {
        if (chatMembers.has(gidStr)) {
          chatMembers.get(gidStr).delete(update.who);
        }

        setChatMembers(new Map(chatMembers));
      }
    }, "del": (update) => {
      const gidStr = gidToStr(update.hut.gid);
      const hutStr = hutToStr(update.hut);
      if (huts.has(gidStr)) {
        huts.get(gidStr).delete(update.hut.name);
      }
      chatContents.delete(hutStr);

      setHuts(new Map(huts));
      setChatContents(new Map(chatContents));
      setCurrHut((currHut === hutStr) ? null : currHut);
    },
  };

  const eventTypes = Object.keys(subEvent);
  if (eventTypes.length > 0) {
    const eventType = eventTypes[0];
    updateFuns[eventType](subEvent[eventType]);
  }
}, [subEvent]);
```

## Desk config

With our agent and front-end both complete, the last thing we need are some desk
configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `hut` directory:

```shell {% copy=true %}
cd hut
echo "[%zuse 414]" > sys.kelvin
```

We also need to specify which agents to start when our desk is installed. We do
this in a `desk.bill` file:

```shell {% copy=true %}
echo "~[%hut]" > desk.bill
```

Lastly, we need to create a Docket file. Docket is the agent that manages app
front-ends - it fetches & serves them, and it also configures the app tile and
other metadata. Create a `desk.docket-0` file in the `hut` directory and add the
following:

```hoon {% copy=true %}
:~
  title+'Hut'
  info+'A simple chat app.'
  color+0x7c.afc2
  version+[0 1 0]
  website+'https://urbit.org'
  license+'MIT'
  base+'hut'
  glob-ames+[~sampel-sampel-sampel-sampel--sampel-sampel-sampel-samzod 0v0]
==
```

The main field of note is `glob-ames`. A glob is the bundle of front-end
resources (our React app), and the `-ames` part means it'll be distributed via
the normal inter-ship networking protocol, as opposed to `glob-http` where it
would be fetched from a separate server. The two fields are the ship to fetch it
from and the hash of the glob. We can get the full name of our comet by typing
`our` in the Dojo (don't use the ship name above, it's just a sample). We're
going to upload the glob in the next step, so we'll leave the hash as `0v0` for
the moment.

## Put it together

Our app is now complete, so let's try it out. In the Dojo of our comet,
we'll create a new desk with the `|new-desk` generator:

``` {% copy=true %}
|new-desk %hut
```

Next, we'll mount the desk so we can access it from the host OS:

``` {% copy=true %}
|mount %hut
```

It'll have a handful of skeleton files in it, but we can just delete those and
add our own instead. In the normal shell, do the
following:

```shell {% copy=true %}
rm -rI dev-comet/hut/*
cp -r hut/* dev-comet/hut/
```

Back in the Dojo again, we can now commit those files and install the app:

``` {% copy=true %}
|commit %hut
|install our %hut
```

The last thing to do is upload our front-end resources. Open a browser and go
to `localhost:8080` (or just `localhost` on a Mac). Login with the comet's web
code, which you can get by running `+code` in the Dojo. Next, go to
`localhost:8080/docket/upload` (or `localhost/docket/upload` on a Mac) and
it'll bring up the Docket Globulator tool. Select the `hut` desk from the
drop-down menu, then navigate to `hut-ui/build` and select the whole folder.
Finally, hit `glob!` and it'll upload our React app.

If we return to `localhost:8080` (or `localhost` on a Mac), we should see a
tile for the Hut app. If we click on it, it'll open our React front-end and we
can start using it.

One thing we can also do is publish the app so others can install it from us.
To do so, just run the following command:

``` {% copy=true %}
:treaty|publish %hut
```

Now our friends will be able to install it with `|install <our ship> %hut` or by
searching for `<our ship>` on their ship's homescreen.

## Next steps

To learn to create an app like this, the first thing to do is learn Hoon. [Hoon
School](/guides/core/hoon-school/A-intro) is a comprehensive guide to the
language, and the best place to start. After learning the basics of Hoon, [App
School](/guides/core/app-school/intro) will teach you everything you need to
know about app development.

Along with these self-directed guides, we also run regular courses on both Hoon
and app development. You can check the [Courses](/courses) page for details, or
join the `~hiddev-dannut/new-hooniverse` group on Urbit.
