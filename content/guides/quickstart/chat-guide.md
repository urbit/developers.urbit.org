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

## Quick walk-through

This section will walk through putting together and publishing the app from
scratch, but will be light on commentary about how the app works. For more
details on that, you can refer to the [Code commentary](#code-commentary)
section below.

### Install binary

If you've already got the `urbit` CLI runtime installed, you can skip this step.
Otherwise, run one of the commands below, depending on your platform. It will
fetch the binary and save it in the current directory.

#### Linux

```shell {% copy=true %}
curl -L https://urbit.org/install/linux64/latest | tar xzk --strip=1
```

#### Mac

```shell {% copy=true %}
curl -L https://urbit.org/install/mac/latest | tar xzk --strip=1
```

### Development ship

App development is typically done on a "fake" ship. Fake ships don't have real
networking keys and don't connect to the real network. They can only communicate
with other fake ships running on the local machine. Let's spin up a fake ~zod
galaxy. We can do this with the `-F` option:

```shell {% copy=true %}
./urbit -F zod
```

It'll take a couple of minutes to boot up, and then it'll take us to the Dojo.

### Dependencies

Once in the Dojo (as indicated by the `~zod:dojo>` prompt), let's mount a couple
of desks so their files can be accessed from the host OS. We can do this with
the `|mount` command:

``` {% copy=true %}
|mount %base
|mount %garden
```

With those mounted, switch back to a normal shell. We'll create a folder to
develop our app in, and then we'll copy a few files across that our app will
depend on:

```shell {% copy=true %}
mkdir -p hut/{app,sur,mar,lib}
cp zod/base/sys.kelvin hut/sys.kelvin
cp zod/base/mar/{bill*,hoon*,json.hoon,kelvin*,mime*,noun*,ship*,txt*} hut/mar/
cp zod/base/lib/{agentio*,dbug*,default-agent*,skeleton*} hut/lib/
cp zod/garden/mar/docket-0* hut/mar/
cp zod/garden/lib/{docket*,mip*} hut/lib/
cp zod/garden/sur/docket* hut/sur/
```

Now we can start working on the app itself.

### Types

The first thing we typically do when developing an app is define:

1. The basic types our app will deal with.
2. The structure of our app's state.
3. The app's interface - the types of requests it will accept and the types of
   updates it will send out to subscribers.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. We'll therefore save the
following code in `hut/sur/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
/+  *mip
|%
+$  msg    [who=@p what=@t]
+$  msgs   (list msg)
+$  hut    [host=@p name=@tas]
::
+$  huts   (jar hut msg)
+$  ppl    (mip hut @p ?)
::
+$  act
  $%  [%make =hut]
      [%post =hut =msg]
      [%ship =hut who=@p]
      [%kick =hut who=@p]
      [%join =hut]
      [%quit =hut]
  ==
::
+$  upd
  $%  [%init ppl=(map @p ?) =msgs]
      [%post =msg]
      [%ship who=@p]
      [%kick who=@p]
      [%join who=@p]
      [%quit who=@p]
  ==
--
```

### Agent

With all the types now defined, we can create the app itself. Gall agents live
in the `/app` directory of a desk, so you can save this code in
`hut/app/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
/-  *hut
/+  *mip, default-agent, dbug, agentio
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =huts =ppl]
+$  card  card:agent:gall
--
::
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  bol=bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bol)
    io    ~(. agentio bol)
++  on-init  on-init:def
++  on-save  !>(state)
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
::
++  on-poke
  |=  [=mark =vase]
  |^  ^-  (quip card _this)
  ?>  ?=(%hut-do mark)
  ?:  =(our.bol src.bol)
    (local !<(act vase))
  (remote !<(act vase))
  ++  local
    |=  =act
    ^-  (quip card _this)
    ?-    -.act
        %post
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ?.  =(our.bol host.hut.act)
        :_  this
        :~  (~(poke pass:io path) [host.hut.act %hut] [mark vase])
        ==
      =/  =msgs  (~(got by huts) hut.act)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.act msgs]
        [msg.act (snip msgs)]
      :_  this(huts (~(put by huts) hut.act msgs))
      :~  (fact:io hut-did+!>(`upd`[%post msg.act]) ~[path])
      ==
    ::
        %join
      ?<  =(our.bol host.hut.act)
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      :_  this
      :~  (~(watch pass:io path) [host.hut.act %hut] path)
      ==
    ::
        %quit
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      :-  ?:  =(our.bol host.hut.act)
            :~  (kick:io ~[path])
            ==
          :~  (kick:io ~[path])
              (~(leave pass:io path) [host.hut.act %hut])
          ==
      %=  this
        huts  (~(del by huts) hut.act)
        ppl   (~(del by ppl) hut.act)
      ==
    ::
        %ship
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ?>  =(our.bol host.hut.act)
      :_  this(ppl (~(put bi ppl) hut.act who.act %.n))
      :~  (fact:io hut-did+!>(`upd`[%ship who.act]) ~[path])
      ==
    ::
        %kick
      =/  =path  /(scot %p host.hut.act)/[name.hut.act]
      ?>  =(our.bol host.hut.act)
      ?<  =(our.bol who.act)
      :_  this(ppl (~(del bi ppl) hut.act who.act))
      :~  (kick-only:io who.act ~[path])
          (fact:io hut-did+!>(`upd`[%kick who.act]) ~[path])
      ==
    ::
        %make
      ?<  (~(has by huts) hut.act)
      :-  ~
      %=  this
        huts  (~(put by huts) hut.act ~)
        ppl   (~(put bi ppl) hut.act our.bol %.y)
      ==
    ==
  ::
  ++  remote
    |=  =act
    ^-  (quip card _this)
    ?>  ?=(%post -.act)
    ?>  =(our.bol host.hut.act)
    ?>  (~(has by huts) hut.act)
    ?>  =(src.bol who.msg.act)
    ?>  (~(has bi ppl) hut.act src.bol)
    =/  =path  /(scot %p host.hut.act)/[name.hut.act]
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
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?>  ?=([@ @ ~] wire)
  =/  =hut  [(slav %p i.wire) i.t.wire]
  ?+    -.sign  (on-agent:def wire sign)
      %watch-ack
    ?~  p.sign
      [~ this]
    :-  :~  (fact:io hut-did+!>(`upd`[%kick our.bol]) ~[wire])
            (kick:io ~[wire])
        ==
    %=  this
      huts  (~(del by huts) hut)
      ppl   (~(del by ppl) hut)
    ==
  ::
      %kick
    :_  this
    :~  (~(watch pass:io wire) [host.hut %hut] wire)
    ==
  ::
      %fact
    ?>  ?=(%hut-did p.cage.sign)
    =/  upd  !<(upd q.cage.sign)
    ?-    -.upd
        %init
      :-  :~  (fact:io cage.sign ~[wire])
          ==
      %=  this
        huts  (~(put by huts) hut msgs.upd)
        ppl   (~(put by ppl) hut ppl.upd)
      ==
    ::
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
        %join
      :_  this(ppl (~(put bi ppl) hut who.upd %.y))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
        %quit
      :_  this(ppl (~(put bi ppl) hut who.upd %.n))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
        %ship
      :_  this(ppl (~(put bi ppl) hut who.upd %.n))
      :~  (fact:io cage.sign ~[wire])
      ==
    ::
        %kick
      :_  this(ppl (~(del bi ppl) hut who.upd))
      :~  (fact:io cage.sign ~[wire])
      ==
    ==
  ==
::
++  on-watch
  |=  =path
  |^  ^-  (quip card _this)
  ?>  ?=([@ @ ~] path)
  =/  =hut  [(slav %p i.path) i.t.path]
  ?:  =(our.bol src.bol)
    ?:  =(our.bol host.hut)
      [[(init hut) ~] this]
    ?.  (~(has by huts) hut)
      [~ this]
    [[(init hut) ~] this]
  ?>  =(our.bol host.hut)
  ?>  (~(has bi ppl) hut src.bol)
  :_  this(ppl (~(put bi ppl) hut src.bol %.y))
  :~  (init hut)
      (fact:io hut-did+!>(`upd`[%join src.bol]) ~[path])
  ==
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
++  on-leave
  |=  =path
  ^-  (quip card _this)
  ?>  ?=([@ @ ~] path)
  =/  =hut  [(slav %p i.path) i.t.path]
  ?:  =(our.bol src.bol)
    [~ this]
  :_  this(ppl (~(put bi ppl) hut src.bol %.n))
  :~  (fact:io hut-did+!>(`upd`[%quit src.bol]) ~[path])
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?>  ?=([%x %huts ~] path)
  :^  ~  ~  %json
  !>  ^-  json
  :-  %a
  %+  turn
    %+  sort  ~(tap by ~(key by huts))
    |=  [a=hut b=hut]
    %+  aor
      :((cury cat 3) (scot %p host.a) '/' name.a)
    :((cury cat 3) (scot %p host.b) '/' name.b)
  |=  [host=@p name=@tas]
  %-  pairs:enjs:format
  :~  ['host' s+(scot %p host)]
      ['name' s+name]
  ==
::
++  on-arvo  on-arvo:def
++  on-fail  on-fail:def
--
```

### Marks

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
/-  *hut
|_  a=act
++  grow
  |%
  ++  noun  a
  --
++  grab
  |%
  ++  noun  act
  ++  json
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
++  grad  %noun
--
```

#### `%hut-did`

```hoon {% copy=true mode="collapse" %}
/-  *hut
|_  u=upd
++  grow
  |%
  ++  noun  u
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
++  grab
  |%
  ++  noun  upd
  --
++  grad  %noun
--
```

### React app

Our back-end is complete, so we can now work on our React front-end. We'll just
look at the basic setup process here, but you can get the full React app by
cloning [this repo on Github](https://github.com/urbit/docs-examples) and run
`npm i` in `chat-app/react-frontend`. Additional commentary on the code is in
the [code commentary](#code-commentary) section below.

When creating it from scratch, we can first run `create-react-app` like usual:

```shell {% copy=true %}
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

After we've finished writing our React app, we can build it:

```shell {% copy=true %}
npm run build
```

### Desk config

With our agent and front-end both complete, the last thing we need are some desk
configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `hut` directory:

```shell {% copy=true %}
cd hut
echo "[%zuse 418]" > sys.kelvin
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

### Put it together

Our app is now complete, so let's try it out. In the Dojo of our fake ~zod,
we'll create a new desk by forking from an existing one:

``` {% copy=true %}
|merge %hut our %webterm
```

Next, we'll mount the desk so we can access it from the host OS:

``` {% copy=true %}
|mount %hut
```

Currently its contents are the same as the `%webterm` desk, so we'll need to
delete those files and copy in our own instead. In the normal shell, do the
following:

```shell {% copy=true %}
rm -r zod/hut/*
cp -r hut/* zod/hut/
```

Back in the Dojo again, we can now commit those files and install the app:

``` {% copy=true %}
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

Once we've confirmed it's working on our fake ~zod, we can shut it down with
`|exit` or CTRL-D and try installing it on a real ship instead. To do that, we
can just repeat the steps in this section with our actual ship. On the live
network, we can also publish the app so others can install it from us. To do so,
just run the following command:

``` {% copy=true %}
:treaty|publish %hut
```

Now your friends will be able to install it with `|install <your ship> %hut` or
by searching for `<your ship>` on their ship's homescreen.

## Code commentary

### Types

We're making a chat app, so a message (`msg`) needs to contain the author and
the text. A chat room (`hut`) will be identified by its host ship and a name,
and will contain a simple list of messages.

Our app state can therefore include a map from huts to lists of messages (`(jar
hut msg)`). We also need to keep track of member whitelists, so we'll add
another map from huts to sets of ships. We'll also add a boolean to the members,
representing whether a given ship has joined yet (`(mip hut @p ?)`).

For the actions/requests our app will accept, we'll need the following:

1. Create a new hut.
2. Post a message to a hut.
3. Add a ship to the whitelist.
4. Kick an ship and remove it from the whitelist.
5. Join a hut.
6. Leave a hut, or delete it if it's our own.

Remote ships will only be able to do #2, while our own ship and front-end will
be able to perform any of these actions.

The structure for these actions is called `act` and looks like so:

```hoon
+$  act
  $%  [%make =hut]
      [%post =hut =msg]
      [%ship =hut who=@p]
      [%kick =hut who=@p]
      [%join =hut]
      [%quit =hut]
  ==
```

We also need to be able to send these events/updates out to subscribers:

1. The initial state of a hut (when someone first subscribers).
2. A new message has be posted.
3. A new ship has been whitelisted.
4. A ship has been kicked and removed from the whitelist.
5. A ship has joined.
6. A ship has left.

This structure for these updates is called `upd` and looks like so:

```hoon
+$  upd
  $%  [%init ppl=(map @p ?) =msgs]
      [%post =msg]
      [%ship who=@p]
      [%kick who=@p]
      [%join who=@p]
      [%quit who=@p]
  ==
```

### Agent

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

Hut uses a pub/sub pattern. Remote ships are able to subscribe to a hut on our
ship and receive updates such as new messages. They're also able to post new
messages to a hut by poking our agent with a `%post` action. Likewise, we'll be
able to subscribe to huts on other ships and poke them to post messages.
Remember, all Urbit ships are both clients and servers.

There's three main agent arms we use for this:

1. `on-poke`: This arm handles one-off actions/requests, such as posting a
   message to a hut.
2. `on-watch`: This arm handles incoming subscription requests.
3. `on-agent`: This arm handles updates/events from people we've subscribed to.

When you subscribe to an agent, you subscribe to a *path*. In our app's case, we
use the hut as the path, like `/~sampel-palnet/my-hut-123`. A remote ship will
send us a subscription request which will arrive in the `on-watch` arm. We'll
check whether the remote ship is whitelisted for the requested hut, and then
either accept or reject the subscription request. If accepted, we'll send them
the initial state of the hut, and then continue to send them updates as they
happen (such as new messages being posted).

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

### Marks

The kernel module Clay is a typed filesystem, and marks are its filetypes. As
well as defining the type, a mark also specifies methods for converting to and
from other marks, as well as revision control functions. Our agent doesn't need
to save files in Clay, but marks aren't just used for files - they're used for
all data from the outside world like other ships or the front-end. Marks serve
the same purpose as MIME types, but are much more powerful.

Our agent needs to talk to the front-end in JSON, but it takes and produces
ordinary Hoon types. We therefore need a way to decode inbound JSON to an `act`,
and encode an outbound `upd` as JSON when we send the front-end an update. This
is the main thing our mark files are going to do. The utility library Zuse
contains many ready-made functions for decoding and encoding JSON, so we use
those to write our JSON functions.

### React app

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
## Next steps

To learn to create an app like this, the first thing to do is learn Hoon. [Hoon
School](/guides/core/hoon-school/A-intro) is a comprehensive guide to the
language, and the best place to start. After learning the basics of Hoon, [App
School](/guides/core/app-school/intro) will teach you everything you need to
know about app development.

Along with these self-directed guides, we also run regular courses on both Hoon
and app development. You can check the [Courses](/courses) page for details, or
join the [~hiddev-dannut/new-hooniverse](/groups/~hiddev-dannut/new-hooniverse)
group on Urbit.
