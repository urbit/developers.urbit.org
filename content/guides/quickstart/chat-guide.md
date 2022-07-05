+++
title = "Build a Chat App"
weight = 1
+++

In this lightning tutorial, we're going to build a simple chat app named Hut. It'll
look like this:

![hut screenshot](https://media.urbit.org/guides/quickstart/chat-guide/hut-screenshot.png)

We'll be able to create private chat rooms with the friends we specify, and
communicate instantly and securely. Hut will be quite simple, it'll have a very
basic UI and only store the last 50 messages in each chat, but it's a good
demonstration of app development, networking, and front-end integration on
Urbit.

If you'd like to check out the finished app, you can install it from
`~pocwet/hut`.

The app source is available in the [`docs-examples` repo on
Github](https://github.com/urbit/docs-examples), in the `chat-app` folder. It
has three folders inside:

1. `bare-desk`: just the hoon files created here without any dependencies.
2. `full-desk`: `bare-desk` plus all dependencies. Note some files are
   symlinked, so if you're copying them you'll need to do `cp -rL`.
3. `react-frontend`: the React front-end files.

## Install binary

If you've already got the `urbit` CLI runtime installed, you can skip this step.
Otherwise, run one of the commands below, depending on your platform. It will
fetch the binary and save it in the current directory.

#### Linux

```bash
curl -L https://urbit.org/install/linux64/latest | tar xzk --strip=1
```

#### Mac

```bash
curl -L https://urbit.org/install/mac/latest | tar xzk --strip=1
```

## Development ship

App development is typically done on a "fake" ship. Fake ships don't have real
networking keys and don't connect to the real network. They can only communicate
with other fake ships running on the local machine. Let's spin up a fake ~zod
galaxy. We can do this with the `-F` option:

```bash
./urbit -F zod
```

It'll take a couple of minutes to boot up, and then it'll take us to the Dojo.
Once in the Dojo, let's mount a couple of desks so their files can be accessed
from the host OS. We can do this with the `|mount` command:

```
|mount %base
|mount %garden
```

With those mounted, switch back to a normal shell. We'll create a folder to
develop our app in, and then we'll copy a few files across that our app will
depend on:

```bash
mkdir -p hut/{app,sur,mar,lib}
cp zod/base/sys.kelvin hut/sys.kelvin
cp zod/base/mar/{bill*,hoon*,json.hoon,kelvin*,mime*,noun*,ship*,txt*} hut/mar/
cp zod/base/lib/{agentio*,dbug*,default-agent*,skeleton*} hut/lib/
cp zod/garden/mar/docket-0* hut/mar/
cp zod/garden/lib/{docket*,mip*} hut/lib/
cp zod/garden/sur/docket* hut/sur/
```

Now we can start working on the app itself.

## Types

The first thing we typically do when developing an app is define:

1. The basic types our app will deal with.
2. The structure of our app's state.
3. The app's interface - the types of requests it will accept and the types of
   updates it will send out to subscribers.
   
We're making a chat app, so a message needs to contain the author and the text.
A chat room ("hut") will be identified by its host ship and a name, and will
contain a simple list of messages.

Our app state can therefore include a map from huts to lists of messages. We
also need to keep track of member whitelists, so we'll add another map from huts
to sets of ships. We'll also add a boolean to the members, representing whether
a given ship has joined yet.

For the actions/requests our app will accept, we'll need the following:

1. Create a new hut.
2. Post a message to a hut.
3. Add a ship to the whitelist.
4. Kick an ship and remove it from the whitelist.
5. Join a hut.
6. Leave a hut, or delete it if it's our own.

Remote ships will only be able to do #2, while our own ship and front-end will
be able to perform any of these actions.

We also need to be able to send these events/updates out to subscribers:

1. The initial state of a hut (when someone first subscribers).
2. A new message has be posted.
3. A new ship has been whitelisted.
4. A ship has been kicked and removed from the whitelist.
5. A ship has joined.
6. A ship has left.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. We'll therefore save the
following code in `hut/sur/hut.hoon`:

```hoon
:: We import the mip library. A mip is a map of maps.
/+  *mip
|%
:: A chat msg is a pair of author ship and a UTF-8 string.
+$  msg    [who=@p what=@t]
::
:: The msgs in a hut are just a list of msg.
+$  msgs   (list msg)
::
:: A hut is identified by host ship and a name like my-hut-42.
+$  hut    [host=@p name=@tas]
::
:: All huts we've created or joined are stored
:: in a map with the hut as key and msgs as value.
+$  huts   (jar hut msg)
::
:: The whitelists for huts are stored in a mip, which is a map of maps.
:: The first key is the hut, the second key is the ship,
:: and the value is a boolean saying whether they've actually joined.
+$  ppl    (mip hut @p ?)
::
:: These are the possible actions/requests the agent will accept. It's
:: a tagged union, so each action is exactly one of these.
+$  act
  $%  [%make =hut]          :: create new hut
      [%post =hut =msg]     :: post a new message
      [%ship =hut who=@p]   :: whitelist a ship
      [%kick =hut who=@p]   :: kick and remove from whitelist
      [%join =hut]          :: join a hut
      [%quit =hut]          :: leave a hut (delete if it's ours)
  ==
::
:: These are the possible updates our agent can send out to subscribers.
+$  upd
  $%  [%init ppl=(map @p ?) =msgs]  :: initial state for new subscribers
      [%post =msg]                  :: new message posted
      [%ship who=@p]                :: new ship whitelisted
      [%kick who=@p]                :: ship kicked & removed from whitelist
      [%join who=@p]                :: a ship has joined the hut
      [%quit who=@p]                :: a ship has left the hut
  ==
--
```

## Agent

With all the types now defined, we can write the app itself.

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

Hut is going to use a pub/sub pattern. Remote ships will be able to subscribe to
a hut on our ship and receive updates such as new messages. They'll be able to
post new messages to a hut by poking our agent with a `%post` action. Likewise,
we'll be able to subscribe to huts on other ships and poke them to post
messages. Remember, all Urbit ships are both clients and servers.

There's three main agent arms we'll use for this:

1. `on-poke`: This arm handles one-off actions/requests, such as posting a
   message to a hut.
2. `on-watch`: This arm handles incoming subscription requests.
3. `on-agent`: This arm handles updates/events from people we've subscribed to.

When you subscribe to an agent, you subscribe to a *path*. In our app's case,
we'll use the hut as the path, like `/~sampel-palnet/my-hut-123`. A remote ship
will send us a subscription request which will arrive in the `on-watch` arm.
We'll check whether the remote ship is whitelisted for the requested hut, and
then either accept or reject the subscription request. If accepted, we'll send
them the initial state of the hut, and then continue to send them updates as
they happen (such as new messages being posted).

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
case we'll make it the same - `/~sampel-palnet/my-hut-123`.

The last thing to note here is communications with the front-end. The web-server
kernel module Eyre exposes the same poke and subscription mechanics to the
front-end as JSON over a SSE (server-sent event) stream. Our front-end will
therefore interact with our agent just like any other ship would. When pokes and
subscription requests come in from the front-end, they'll have our own ship as
the source. This means differentiating the front-end from other ships is as
simple as checking that the source is us, like `?: =(our src) ...`. On Urbit,
interacting with a remote ship is just as easy as interacting with the local
ship.

With those things noted, here's the full agent, with extensive comments. Gall
agents live in the `/app` directory of a desk, so you can save this code in
`hut/app/hut.hoon`:

```hoon
:: These first two lines are imports.
::
:: We import the types we defined previously.
/-  *hut
:: We import the mip library, and also some useful utilities.
/+  *mip, default-agent, dbug, agentio
::
:: This small core defines the type of our agent's state.
|%
::
:: We version our state type so it's easy to change in the future.
+$  versioned-state
  $%  state-0
  ==
::
:: This is our agent's state type.
+$  state-0  [%0 =huts =ppl]
::
:: This is just for convenience.
+$  card  card:agent:gall
--
::
:: This is so we can debug our agent from the Dojo.
%-  agent:dbug
::
:: We instantiate our agent's state.
=|  state-0
=*  state  -
^-  agent:gall
::
:: The proper agent core begins here. Its sample is a bowl.
:: The bowl is populated every time an event is applied.
:: It contains the current date, entropy, the source of the
:: current event, our ship's name, etc.
|_  bol=bowl:gall
::
:: These are some aliases for convenience.
    :: "this" is our whole agent including state.
+*  this  .
    :: "def" is default-agent, a sane default handler.
    def   ~(. (default-agent this %.n) bol)
    :: "io" is agentio, a library containing convenience function.
    io    ~(. agentio bol)
::
:: This arm is called when the agent is first started.
:: We just leave it as the default.
++  on-init  on-init:def
::
:: This arm exports our agent's state during upgrade.
:: We just pack the current state in a vase.
++  on-save  !>(state)
::
:: This arm is called when the exported state is re-imported
:: after upgrading. We extract the state from the vase and put it
:: back in our agent's state.
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
::
:: on-poke handles actions / direct requests to our agent.
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  ::
  :: We check the mark of the incoming poke is %hut-do, our action mark.
  ?>  ?=(%hut-do mark)
  ::
  :: If it's from us, we call ++local. If it's from a remote ship,
  :: we call ++remote.
  ?:  =(our.bol src.bol)
    (local !<(act vase))
  (remote !<(act vase))
  ::
  :: This handles local requests (typically from our front-end).
  ++  local
    |=  =act
    ^-  (quip card _this)
    ::
    :: This ?- expression tests which action the poke contains,
    :: and handles it appropriately.
    ?-    -.act
    ::
    :: This handles us posting a new message to a hut.
        %post
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ::
      :: If it's a remote hut, send them our message.
      ?.  =(our.bol host.hut.act)
        :_  this
        :~  (~(poke pass:io path) [host.hut.act %hut] [mark vase])
        ==
      ::
      :: If it's our hut, update messages and then send the new message
      :: to our subscribers.
      =/  =msgs  (~(got by huts) hut.act)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.act msgs]
        [msg.act (snip msgs)]
      :_  this(huts (~(put by huts) hut.act msgs))
      :~  (fact:io hut-did+!>(`upd`[%post msg.act]) ~[path])
      ==
    ::
    :: This handles us joining a new hut.
        %join
      ::
      :: Make sure we're joining a remote hut.
      ?<  =(our.bol host.hut.act)
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ::
      :: Send a subscription request to the remote ship.
      :_  this
      :~  (~(watch pass:io path) [host.hut.act %hut] path)
      ==
    ::
    :: This handles us leaving a hut or deleting one of our huts.
        %quit
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ::
      :: If it's our hut, kick everyone.
      :-  ?:  =(our.bol host.hut.act)
            :~  (kick:io ~[path])
            ==
          :: If it's a remote hut, kick frontend and leave.
          :~  (kick:io ~[path])
              (~(leave pass:io path) [host.hut.act %hut])
          ==
      :: Delete hut and whitelist from our state.
      %=  this
        huts  (~(del by huts) hut.act)
        ppl   (~(del by ppl) hut.act)
      ==
    ::
    :: This handles us whitelisting a ship in one of our huts.
        %ship
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ::
      :: Check it's our hut.
      ?>  =(our.bol host.hut.act)
      ::
      :: Add ship to hut's whitelist and send update to subscribers
      :: saying the new ship joined.
      :_  this(ppl (~(put bi ppl) hut.act who.act %.n))
      :~  (fact:io hut-did+!>(`upd`[%ship who.act]) ~[path])
      ==
    ::
    :: This handles us kicking a ship from one of our huts.
        %kick
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ::
      :: Check it's our hut.
      ?>  =(our.bol host.hut.act)
      ::
      :: Check we're not kicking ourselves.
      ?<  =(our.bol who.act)
      ::
      :: Delete ship from hut's whitelist and send update to
      :: to subscribers saying a ship was kicked.
      :_  this(ppl (~(del bi ppl) hut.act who.act))
      :~  (kick-only:io who.act ~[path])
          (fact:io hut-did+!>(`upd`[%kick who.act]) ~[path])
      ==
    ::
    :: This handles the creation of a new hut.
        %make
      ::
      :: Check it doesn't already exist.
      ?<  (~(has by huts) hut.act)
      ::
      :: Create the hut and add outselves as member.
      :-  ~
      %=  this
        huts  (~(put by huts) hut.act ~)
        ppl   (~(put bi ppl) hut.act our.bol %.y)
      ==
    ==
  ::
  :: This handles action requests from remote ships.
  ++  remote
    |=  =act
    ^-  (quip card _this)
    ::
    :: Only allow posting new messages, not other actions.
    ?>  ?=(%post -.act)
    ::
    :: Check they're posting to a hut we own.
    ?>  =(our.bol host.hut.act)
    ::
    :: Check the hut exists.
    ?>  (~(has by huts) hut.act)
    ::
    :: Check they're posting as themselves.
    ?>  =(src.bol who.msg.act)
    ::
    :: Check they're whitelisted.
    ?>  (~(has bi ppl) hut.act src.bol)
    =/  =path  /(scot %p host.hut.act)/[name.hut.act]
    ::
    :: Save the new message and send update to subscribers.
    =/  =msgs  (~(got by huts) hut.act)
    =.  msgs
      ?.  (lte 50 (lent msgs))
        [msg.act msgs]
      [msg.act (snip msgs)]
    :_  this(huts (~(put by huts) hut.act msgs))
    :~  (fact:io hut-did+!>(`upd`[%post msg.act]) ~[path])
    ==
  --
::
:: on-agent handles events that come back as responses to requests
:: we've sent other agents. This includes updates on paths which
:: were subscribed to.
++  on-agent
  ::
  :: A wire is tag we defined when we sent the original request, so
  :: we know what the response pertains to.
  :: The sign is the response itself.
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ::
  :: Check the wire is the correct structure and then decode its
  :: elements to find out which hut it pertains to.
  ?>  ?=([@ @ ~] wire)
  =/  =hut  [(slav %p i.wire) i.t.wire]
  ::
  :: This ?+ expression handles the different types of responses
  :: we care about, and sends others to default-agent.
  ?+    -.sign  (on-agent:def wire sign)
  ::
  :: This case is a response to a subscription request aka
  :: when we've tried to join a hut.
      %watch-ack
    ::
    :: If there's no error message, it succeeded.
    ?~  p.sign
      [~ this]
    ::
    :: If there's an error message, our request was rejected.
    :: Tell our front-end and then close the front-end's subscription.
    :-  :~  (fact:io hut-did+!>(`upd`[%kick our.bol]) ~[wire])
            (kick:io ~[wire])
        ==
    ::
    :: Either way, delete the hut and whitelist from our state.
    %=  this
      huts  (~(del by huts) hut)
      ppl   (~(del by ppl) hut)
    ==
  ::
  :: We get a kick when we're kicked from a subscription.
  :: Kicks can be unintentional, so we automatically resubscribe.
      %kick
    :_  this
    :~  (~(watch pass:io wire) [host.hut %hut] wire)
    ==
  ::
  :: A fact is an update from something we're subscribed to.
      %fact
    :: The fact should have a %hut-did mark and contain an
    :: "upd" update structure.
    ?>  ?=(%hut-did p.cage.sign)
    =/  upd  !<(upd q.cage.sign)
    ::
    :: This ?- expression handles the different update types.
    ?-    -.upd
    ::
    :: An init message contains the initial state. We get it
    :: when we first subscribe. We'll forward it on to the front-end
    :: and save its contents in our state.
        %init
      :-  :~  (fact:io cage.sign ~[wire])
          ==
      %=  this
        huts  (~(put by huts) hut msgs.upd)
        ppl   (~(put by ppl) hut ppl.upd)
      ==
    ::
    :: This case is a new message. We save the message in our
    :: state and forward the message on to our front-end.
        %post
      =/  msgs  (~(got by huts) hut)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.upd msgs]
        [msg.upd (snip msgs)]
      :_  this(huts (~(put by huts) hut msgs))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
    :: This case means someone joined a hut. We mark that person
    :: as joined in our state, and forward the update to our front-end.
        %join
      :_  this(ppl (~(put bi ppl) hut who.upd %.y))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
    :: This case means someone left a hut. We mark that person as not
    :: joined in our state, and forward the update to our front-end.
        %quit
      :_  this(ppl (~(put bi ppl) hut who.upd %.n))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
    :: This case means someone was whitelisted. We add that person to
    :: to the whitelist for that hut and forward the update to our front-end.
        %ship
      :_  this(ppl (~(put bi ppl) hut who.upd %.n))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
    :: Someone was kicked from a hut. We remove that person from that hut's
    :: whitelist and forward the update to our front-end.
        %kick
      :_  this(ppl (~(del bi ppl) hut who.upd))
      :~  (fact:io cage.sign ~[wire])
      ==
    ==
  ==
::
:: on-watch is where people subscribe to your agent, and where you define
:: the paths they can subscribe to.
++  on-watch
  |=  =path
  |^  ^-  (quip card _this)
  ::
  :: Check the path is the correct structure and then decode its
  :: elements to find out which hut they're subscribing to.
  ?>  ?=([@ @ ~] path)
  =/  =hut  [(slav %p i.path) i.t.path]
  ::
  :: Check if it's our own ship subscribing (our front-end).
  ?:  =(our.bol src.bol)
    ::
    :: If it's our own hut, send out its initial state.
    ?:  =(our.bol host.hut)
      [[(init hut) ~] this]
    ::
    :: Otherwise, if we have the hut, send out initial state.
    :: If we don't, accept the subscription but send nothing.
    ?.  (~(has by huts) hut)
      [~ this]
    [[(init hut) ~] this]
  ::
  :: If it's a remote ship subscribing, check they're subscribing
  :: to a hut we own.
  ?>  =(our.bol host.hut)
  ::
  :: Check they are whitelisted for that hut.
  ?>  (~(has bi ppl) hut src.bol)
  ::
  :: Update our state to say they've joined, send them the initial
  :: state and update all other subscribers to let them know this
  :: ship has joined.
  :_  this(ppl (~(put bi ppl) hut src.bol %.y))
  :~  (init hut)
      (fact:io hut-did+!>(`upd`[%join src.bol]) ~[path])
  ==
  ::
  :: This function just creates the initial state update.
  ++  init
    |=  =hut
    ^-  card
    %-  fact-init:io
    :-  %hut-did
    !>  ^-  upd
    :+  %init
      (~(got by ppl) hut)
    (~(got by huts) hut)
  --
::
:: on-leave is called when a subscriber unsubscribes.
++  on-leave
  |=  =path
  ^-  (quip card _this)
  ::
  :: Check the path they're unsubscribing from is valid and
  :: decode hut from the path.
  ?>  ?=([@ @ ~] path)
  =/  =hut  [(slav %p i.path) i.t.path]
  ::
  :: If it's our ship (our front-end) unsubscribing, do nothing.
  ?:  =(our.bol src.bol)
    [~ this]
  ::
  :: Otherwise, mark the person as not joined and update other
  :: subscribers to let them know this person has left.
  :_  this(ppl (~(put bi ppl) hut src.bol %.n))
  :~  (fact:io hut-did+!>(`upd`[%quit src.bol]) ~[path])
  ==
::
:: on-peek is an arm for local read-only queries. We use it here
:: for the front-end to retrieve the initial list of huts. We have
:: it return JSON directly since only the front-end uses it.
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ::
  :: Check the path is /x/huts.
  ?>  ?=([%x %huts ~] path)
  ::
  :: Form the response with a %json mark and cage.
  :^  ~  ~  %json
  !>  ^-  json
  ::
  :: Create a JSON array.
  :-  %a
  ::
  :: Get all huts and sort them alphabetically
  %+  turn
    %+  sort  ~(tap by ~(key by huts))
    |=  [a=hut b=hut]
    %+  aor
      :((cury cat 3) (scot %p host.a) '/' name.a)
    :((cury cat 3) (scot %p host.b) '/' name.b)
  ::
  :: Convert each to a JSON object.
  |=  [host=@p name=@tas]
  %-  pairs:enjs:format
  :~  ['host' s+(scot %p host)]
      ['name' s+name]
  ==
::
:: on-arvo handles kernel responses. We don't use this here.
++  on-arvo  on-arvo:def
::
:: on-fail handles crashes. We just use the default crash handling.
++  on-fail  on-fail:def
--
```

## Marks

The last piece of our backend are the *marks*. The kernel module Clay is a typed
filesystem, and marks are its filetypes. As well as defining the type, a mark
also specifies methods for converting to and from other marks, as well as
revision control functions. Our agent doesn't need to save files in Clay, but
marks aren't just used for files - they're used for all data from the outside
world like other ships or the front-end. Marks serve the same purpose as MIME
types, but are much more powerful.

We'll create two marks: one for handling poke actions with the type of `act` we
defined previously, and one for handling updates with the type of `upd`. We'll
call the first one `%hut-do`, and the second one `%hut-did`.

Our agent needs to talk to the front-end in JSON, but it takes and produces
ordinary Hoon types. We therefore need a way to decode inbound JSON to an `act`,
and encode an outbound `upd` as JSON when we send the front-end an update. This
is the main thing our mark files are going to do. The utility library Zuse
contains many ready-made functions for decoding and encoding JSON, so we'll use
those to write our JSON functions.

Mark files live in the `/mar` directory of a desk. You can save the code below
in `hut/mar/hut/do.hoon` and `hut/mar/hut/did.hoon` respectively.

#### `%hut-do`

```hoon
:: First we import the type definitions we create earlier.
/-  *hut
::
:: The mark takes the action type (which we name "a" here).
|_  a=act
::
:: grow defines methods to convert from our mark to other marks.
++  grow
  |%
  ::
  :: We define a simple method to convert our mark to a noun
  :: by just returning our sample "a".
  ++  noun  a
  --
::
:: grab defines methods to convert from other marks to our mark.
++  grab
  |%
  ::
  :: We convert from a noun by just molding the data with our act type.
  ++  noun  act
  ::
  :: Here we define a function to convert JSON from our front-end back to
  :: our mark and act data type.
  ++  json
    ::
    :: zuse.hoon contains dejs:format, which has many ready-made JSON
    :: decoding functions. We compose them together here to handle all
    :: the different actions we might receive from the front-end.
    =,  dejs:format
    |=  jon=json
    |^  ^-  act
    %.  jon
    %-  of
    :~  join+de-hut
        quit+de-hut
        make+de-hut
        ship+(ot ~[hut+de-hut who+(se %p)])
        kick+(ot ~[hut+de-hut who+(se %p)])
        post+(ot ~[hut+de-hut msg+(ot ~[who+(se %p) what+so])])
    ==
    ++  de-hut  (ot ~[host+(se %p) name+(su sym)])
    --
  --
:: grad defines revision control and merge functions. We'll not be storing data
:: in Arvo's filesystem so this isn't important and we can just delegate it to
:: the generic noun mark.
++  grad  %noun
--
```

#### `%hut-did`

```hoon
:: First we import the type definitions we create earlier.
/-  *hut
::
:: The mark takes the update type (which we name "u" here).
|_  u=upd
::
:: grow defines methods to convert from our mark to other marks.
++  grow
  |%
  ::
  :: We define a simple method to convert our mark to a noun
  :: by just returning our sample "u".
  ++  noun  u
    ::
    :: zuse.hoon contains enjs:format, which has many ready-made JSON
    :: encoding functions. We compose them together here to handle all
    :: the different updates we might send to the front-end.
  ++  json
    =,  enjs:format
    |^  ^-  ^json
    ?-  -.u
      %join  (frond 'join' s+(scot %p who.u))
      %quit  (frond 'quit' s+(scot %p who.u))
      %ship  (frond 'ship' s+(scot %p who.u))
      %kick  (frond 'kick' s+(scot %p who.u))
      %post  %+  frond  'post'
             %-  pairs
             :~  ['who' s+(scot %p who.msg.u)]
                 ['what' s+what.msg.u]
             ==
      %init  %+  frond  'init'
             %-  pairs
             :~  ['ppl' (ppl-array ppl.u)]
                 ['msgs' (msg-array msgs.u)]
    ==       ==
    ++  msg-array
      |=  =msgs
      ^-  ^json
      :-  %a
      %+  turn  (flop msgs)
      |=  =msg
      %-  pairs
      :~  ['who' s+(scot %p who.msg)]
          ['what' s+what.msg]
      ==
    ++  ppl-array
      |=  ppl=(map @p ?)
      ^-  ^json
      :-  %a
      %+  turn
        %+  sort  ~(tap by ppl)
        |=  [[a=@ @] [b=@ @]]
        (aor (scot %p a) (scot %p b))
      |=  [p=@p q=?]
      a+~[s+(scot %p p) b+q]
    --
  --
::
:: grab defines methods to convert from other marks to our mark.
++  grab
  |%
  ::
  :: We convert from a noun by just molding the data with our upd type.
  ++  noun  upd
  --
::
:: grad defines revision control and merge functions. We'll not be storing data
:: in Arvo's filesystem so this isn't important and we can just delegate it to
:: the generic noun mark.
++  grad  %noun
--
```

## React app

Our back-end is complete, so we can now work on our React front-end. Most of the
front-end is just UI components and logic which aren't very interesting, so
we'll just look at a few notable parts and walk through the basic process of
creating it. To skip ahead and get the full React app, you can clone [this repo
on Github](https://github.com/urbit/docs-examples) and just run `npm i` in
`chat-app/react-frontend`.

When creating it from scratch, we can first run `create-react-app` like usual:

```bash
npx create-react-app hut-ui
cd hut-ui
```

To make talking to our ship easy, we'll install the `@urbit/http-api` module:

```
npm i @urbit/http-api
```

`http-api` handles most of the tricky parts of communicating with our ship for
us, and has a simple set of methods for doing things like pokes, subscriptions,
receiving updates, etc.

The next thing we need to do is edit `package.json`. We'll change the name of
the app, and we'll also add an additional `"homepage"` entry. Front-ends are
serve at `/apps/<name>`, so we need to set that as the root for when we build
it:

```json
"name": "hut",
"homepage": "/apps/hut/",
```

Next, we need to edit `public/index.html` and add a script import to the
`<head>` section. `http-api` needs to know the name of our ship in order to talk
to it, so our ship serves a simple script at `/session.js` that just does
`window.ship = "sampel-palnet";`.

```html
<script src="/session.js"></script>
```

We can now open `src/App.js`, wipe its contents, and start writing our own app.
The first thing is to import the `Urbit` class from `@urbit/http-api`:

```javascript
import React, {Component} from "react";
import Urbit from "@urbit/http-api";
// .....
```

In our App class, we'll create a new `Urbit` instance and tell it our ship name.
We'll also add some connection state callbacks. Our app is simple and will just
display the connection status in the top-right corner.

```javascript
constructor(props) {
  super(props);
  window.urbit = new Urbit("");
  window.urbit.ship = window.ship;
  // ......
  window.urbit.onOpen = () => this.setState({conn: "ok"});
  window.urbit.onRetry = () => this.setState({conn: "try"});
  window.urbit.onError = () => this.setState({conn: "err"});
  // ......
};
```

There are a fair few functions our front-end uses, so we'll just look at a
handful. The first is `doPoke`, which (as the name suggests) sends a poke to a
ship. It takes the poke in JSON form and a callback to do if it succeeds. It
then calls the `poke` method of our `Urbit` object to perform the poke.

```javascript
doPoke = (jon, succ) => {
  window.urbit.poke({
    app: "hut",
    mark: "hut-do",
    json: jon,
    onSuccess: succ
  })
};
```

Here's an example of a `%join`-type `act` in JSON form:

```javascript
joinHut = async hut => {
  if (hut.host === this.our) return;
  this.doPoke(
    {"join": {"host": hut.host, "name": hut.name}},
    () => this.openHut(hut)
  )
};
```

Our front-end will subscribe to updates for the selected hut. To do so, it calls
the `subscribe` method of the `Urbit` object with the `path` to subscribe to and
an `event` callback to handle each update it receives. The `subscribe` method
return a subscription ID number if successful. We save this ID so we can
unsubscribe later.

```javascript
  openHut = async hut => {
    await this.resetState();
    const newID = await window.urbit.subscribe({
      app: "hut",
      path: "/" + hut.host + "/" + hut.name,
      event: this.handleUpdate,
      quit: () => (this.state.host === hut.host) &&
        this.openHut(hut),
      err: () => this.resetState()
    });
    this.setState({
      // .....
    })
  };
```

Here's the `handleUpdate` function we gave as a callback. The update will be one
of our `upd` types in JSON form, so we just switch on the type and handle it as
appropriate.

```javascript
handleUpdate = upd => {
  const { ppl, msgs } = this.state;
  if ("init" in upd)
    this.setState({
      msgs: upd.init.msgs,
      ppl: new Map(upd.init.ppl)
    }, () => {
      this.scrollToBottom()
    });
  else if ("join" in upd)
    this.setState({ppl: ppl.set(upd.join, true)});
  else if ("quit" in upd)
    this.setState({ppl: ppl.set(upd.quit, false)});
  else if ("ship" in upd)
    this.setState({ppl: ppl.set(upd.ship, false)});
  else if ("post" in upd)
    this.setState({
      msgs: [...msgs.slice(-49), upd.post]
    }, () => {
      this.scrollToBottom()
    });
  else if ("kick" in upd)
    if (this.our === upd.kick)
      this.setState({select: "def"}, () => this.resetState());
    else {
      ppl.delete(upd.kick);
      this.setState({ppl: ppl})
    }
};
```

When we change to a different hut in the front-end, we unsubscribe from the old
one before opening a new one. This is done by calling the `unsubscribe` method
of the `Urbit` object with the subscription ID. Note we could have designed our
app differently and had it receive updates for all huts at the same time, this
one-at-a-time approach was just done for simplicity.

```javascript
resetState = async () => {
  const id = this.state.id;
  (id !== null) && await window.urbit.unsubscribe(id);
  await this.getHuts();
  this.setState({
    // ......
  });
};
```

After we've finished writing our React app, we can build it:

```shell
npm run build
```

## Desk config

With our agent and front-end both complete, the last thing we need are some desk
configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `hut` directory:

```shell
cd hut
echo "[%zuse 418]" > sys.kelvin
```

We also need to specify which agents to start when our desk is installed. We do
this in a `desk.bill` file:

```shell
echo "~[%hut]" > desk.bill
```

Lastly, we need to create a Docket file. Docket is the agent that manages app
front-ends - it fetches & serves them, and it also configures the app tile and
other metadata. Create a `desk.docket-0` file in the `hut` directory and add the
following:

```shell
:~
  title+'Hut'
  info+'A simple chat app.'
  color+0x7c.afc2
  version+[0 1 0]
  website+'https://urbit.org'
  license+'MIT'
  base+'hut'
  glob-ames+[~zod 0v0]
==
```

The main field of note is `glob-ames`. A glob is the bundle of front-end
resources (our React app), and the `-ames` part means it'll be distributed via
the normal inter-ship networking protocol, as opposed to `glob-http` where it
would be fetched from a separate server. The two fields are the ship to fetch it
from and the hash of the glob. We're currently working on a fake ~zod, so we
just say `~zod` for the ship. We're going to upload the glob in the next step,
so we'll leave the hash as `0v0` for the moment.

## Put it together

Our app is now complete, so let's try it out. In the Dojo of our fake ~zod,
we'll create a new desk by forking from an existing one:

```
|merge %hut our %webterm
```

Next, we'll mount the desk so we can access it from the host OS:

```
|mount %hut
```

Currently its contents are the same as the `%webterm` desk, so we'll need to
delete those files and copy in our own instead. In the normal shell, do the
following:

```bash
rm -r zod/hut/*
cp -r hut/* zod/hut/*
```

Back in the Dojo again, we can now commit those files and install the app:

```
|commit %hut
|install our %hut
```

The last thing to do is upload our front-end resources. Open a browser and go to
`localhost:8080`. Login with the fake ~zod's code `lidlut-tabwed-pillex-ridrup`.
Next, go to `localhost:8080/docket/upload` and it'll bring up the Docket
Globulator tool. Select the `hut` desk from the drop-down menu, then navigate to
`hut-ui/build` and select the whole folder. Finally, hit `glob!` and it'll
upload our React app.

If we return to `localhost:8080`, we should see a tile for the Hut app. If we
click on it, it'll open our React front-end and we can start using it.

## Do it live

Now that we've confirmed it's all working on a fake ~zod, we can try it on a
real ship. There's just one small change we need to make to the `desk.docket-0`
file. Open `hut/desk.docket-0` and change `~zod` in `glob-ames` to the name of
your ship:

```
glob-ames+[<your ship> 0v0]
```

On our live ship, we can repeat the same steps to create and install the desk.

In the Dojo run:

```
|merge %hut our %webterm
|mount %hut
```

Back in the shell, remove the old files and copy in the contents of `hut` again:

```bash
rm -r <your pier>/hut/*
cp -r hut/* <your pier>/hut/*
```

Commit and install it:

```
|commit %hut
|install our %hut
```

Go to the Docket Globulator again at `<host>/docket/upload` and upload `hut-ui/build` again.

Hut will now be installed and running on our live ship. The last thing we can do
is publish the app, so others can install it from us. In the Dojo, run the
following:

```
:treaty|publish %hut
```

Now your friends will be able to install it with `|install <your ship> %hut` or
by searching for `<your ship>` on their ship's homescreen.

## Improvements

Hut is a very basic chat app to demonstrate app development, front-end
integration, and networked communications on Urbit.

Here are some ideas of how it could be improved:

- Message signing: although a chat host can be sure that only the people they've
  whitelisted can post in a chat, the host is able to post as anyone and the
  other members won't know. Having all chat members sign their messages so
  others can validate them is simple to implement, and would mean everyone can
  be sure about who's talking.
  
- Timestamping: Hut doesn't include timestamps with messages and doesn't care
  about message order, the host just posts them in the order they arrive. This
  means a chat member who's having networking troubles could post a message and
  not have it appear until hours later where it might be out of context. If we
  added timestamps to the messages, the host could apply some logic to correctly
  order them regardless of when they're received.
  
- Groups integration: rather than having to add ships one-by-one to a chat, we
  could use the existing groups of the Groups app. The `%group-store` agent in
  Groups has a well-designed API that's simple to interface with.
