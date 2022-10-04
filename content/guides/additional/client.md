+++
title = "Serving a Browser Game"
weight = 11
+++

## Introduction

In this tutorial, we will take an off-the-shelf JavaScript game which runs in the browser and connect it to an Urbit back-end.  This page assumes that you have completed some version of Hoon School and App School, whether the [live courses](/courses) or the [written docs](/guides/core/hoon-school/A-intro).  Our goal is to show you one way of directly serving client code from an Urbit ship as server.

_Flappy Bird_ is an "insanely irritating, difficult and frustrating game which combines a super-steep difficulty curve with bad, boring graphics and jerky movement" ([Huffington Post](https://web.archive.org/web/20140205084251/http://www.huffingtonpost.com/2014/02/03/flappy-bird-tips_n_4717406.html)).  We are going to implement `%flap`, a _Flappy Bird_ leaderboard using `%pals`.  The approach given in this tutorial will apply to any game which is primarily run in the browser and has some persistent state to retain across sessions or communicate between players at discrete intervals.  Direct player-v.-player games will require other techniques to implement.

Our objective is to illustrate a minimum viable set of changes necessary to implement the task.  We should the following components when complete:

1. A front end.  We will start with the FOSS app and make some adjustments so it can communicate with Urbit and display shared results.
2. A data model.  Structure and mark files will allow the components of the system to seamlessly communicate.
3. A back end.  Urbit will serve as the database for storing and propagating scores.  Urbit will also serve the front end.
4. A communications protocol.  The leaderboard will need to know who to watch and track as peers.  We will utilize [~paldev](https://urbit.org/ids/~paldev)'s [`%pals`](https://urbit.org/applications/~paldev/pals) contact list.

We will conceive of this app's communications structure as consisting of a _vertical_ component (which is the communication between the client in the browser and the Urbit ship as database) and a _horizontal_ component (which is the communication between Urbit peers).  Vertical communication will take place using JSON via the `%flappy-action` mark, while horizontal communication will take place using the `%flappy-update` mark.  Apps can achieve good data modularity using this separation.

![](vert-horz.svg)


##  Desk Setup

As with all Urbit development, you should set up a development ship.  In this case, it will be more convenient to have this ship be on the live network:  a comet or a moon.  Below, we refer to this as `comet`.

On that ship, `|install ~paldev %pals`.  Optionally, download [~paldev](https://urbit.org/ids/~paldev)'s [Suite repo](https://github.com/Fang-/suite) in case you need to refer to `%pals`-related code.

Download the [Flappy Bird repo](https://github.com/CodeExplainedRepo/Original-Flappy-bird-JavaScript/).  Although we will follow this clone, other versions and other games follow a similar structure and the below approach is highly transferrable.

At this point, you should have a directory structure containing the following:

```
├── Original-Flappy-bird-JavaScript/
├── suite/
└── comet/
```

We now need to create a new clean desk in the development ship.  In the Dojo:

```hoon {% copy=true %}
|mount %base
|mount %garden
|merge %flap our %base
|mount %flap
```

Back on Earth:

```sh {% copy=true %}
rm -rf comet/flap/*
echo "~[%flap]" > comet/flap/desk.bill
echo "[%zuse 418]" > comet/flap/sys.kelvin
```

At this point, we need to take stock of what kind of file marks and libraries we need to make available:  `kelvin`, `docket-0`, and so forth.  While there are marks for `js` and `png`, there is no `wav` so we'll handle that directly.

```sh {% copy=true %}
# Copy necessary %base files to %flap
cp -r comet/base/lib comet/flap
cp -r comet/base/sur comet/flap
cp -r comet/base/mar comet/flap

# Copy necessary %garden files to %flap
yes | cp -r comet/garden/lib comet/flap
yes | cp -r comet/garden/sur comet/flap
yes | cp -r comet/garden/mar comet/flap

# Create empty directories for planned files
mkdir -p comet/flap/app/flap
mkdir -p comet/flap/mar/flap

# Include the Schooner library by Quartus/Dalten for HTTP handling.
#git clone https://github.com/dalten-collective/schooner.git
# We actually should instead pull a slightly modified version of `schooner.hoon` pending some upstream changes
git clone https://github.com/hoon-school/schooner.git
cp schooner/lib/schooner.hoon comet/flap/lib
```

Make an appropriate docket file `desk.docket-0`, e.g.:

```hoon {% copy=true %}
:~
  title+'Flappy Bird'
  info+'An insanely irritating, difficult and frustrating game which combines a super-steep difficulty curve with bad, boring graphics and jerky movement.'
  color+0xea.c124
  version+[0 0 1]
  website+'https://urbit.org'
  license+''
  base+'flap'
  site+/apps/flap
==
```

At this point, your overall directory structure (not showing most of the files) should look like this:

```
├── Original-Flappy-bird-JavaScript/
├── suite/
└── comet/
    ├── base/
    ├── flap/
    │   ├── app/
    │   │   └── flap/
    │   ├── mar/
    │   │   └── flap/
    │   ├── sur/
    │   ├── desk.bill
    │   ├── desk.docket-0
    │   └── sys.kelvin
    └── garden/
```

`|commit %flap` to include all of these files.


##  Front End

If you open `index.html` in `Original-Flappy-bird-JavaScript/` in a web browser, the game should work interactively.  Only mouse clicks are recorded as events.  The only termination condition is death.

![](./flappy-launch.png)

The original authors of this clone, CodeExplained, provide [a walkthrough video](https://youtu.be/0ArCFchlTq4) which explains how the front-end code works in detail.  For our purposes now, you don't need to know much JavaScript—just enough to be able to interpret and modify some simple statements and functions.

Since the game is served directly from the `index.html` file, we can simply copy that file into Urbit and have things work.  Other files also have appropriate marks except for the sound files which are `wav` files.  Since `wav` files are a standard MIME type for web browsers to handle, we don't need to do very much to represent them correctly:  by copying `/mar/png.hoon` to `/mar/wav.hoon` and modifying it to present an `/audio/wav` MIME type, you can correctly include 

```hoon {% copy=true %}
|_  dat=@
++  grow
  |%
  ++  mime  [/audio/wav (as-octs:mimes:html dat)]
  --
++  grab
  |%
  ++  mime  |=([p=mite q=octs] q.q)
  ++  noun  @
  --
++  grad  %mime
--
```

With `/mar/wav.hoon` present, you should be able to directly copy in the game content to the Urbit ship:

```sh
cp -r Original-Flappy-bird-JavaScript/* comet/flap/app/flap
```

and `|commit %flap`.

The `index.html` file will still work if you open it in the browser directly, but it doesn't have any connection to Urbit yet.  Clay doesn't know where to build everything and hook it up, so at a minimum we have to load and display the front-end using `/app/flap.hoon`.

##  Data Model

Different parts of the system need to converge on their shared vision of the world.  Thus, `/sur` and `/mar`.  We aren't interested in calculating the gameplay mechanics, only in the scores.  So we expect to be able to track our state including:

- our current score (last game) (`score`)
- our all-time high score (`hiscore`)
- the all-time high score of our `%pals` (`scores`)

We don't need to actively track friends _except_ that they will have entries in `scores`, even if zero.

**`/sur/flap.hoon`**:

The basic structure file defines friendship, which it will derive from `%pals`, and scores.  Scores are simple, so they're just a matter of a single `@ud` number.

We `%gain` a `score` at the end of each game by an `%action`, and track our own `hiscore`.  We `%lord` a high score over others (or they over us) by sending and receiving `%update`s.  (So `%action`s are vertical between client and server, while `%update`s are horizontal between servers.)

```hoon {% copy=true %}
|%
+$  fren    @p
+$  score   @ud
+$  scores  (map fren score)
::
+$  action
  $%  [%gain =score]
  ==
::
+$  update
  $%  [%lord =score =fren]
  ==
--
```

**`/mar/flap/action.hoon`**:

Actions are sent from the client to the Urbit ship.  An incoming JSON will be of the form

```json
{
  "gain": {
    "score": 15
  }
}
```

Given an action to `%gain` a score as a JSON, we process it in the mark and yield it as a `%flap-action`.

```hoon {% copy=true %}
/-  flap
|_  =action:flap
++  grab
  |%
  ++  noun  action:flap
  ++  json
    =,  dejs:format
    |=  jon=json
    ^-  action
    %.  jon
    %-  of
    :~  [%gain (ot ~[score+ni])]
    ==
  --
++  grow
  |%
  ++  noun  action
  --
++  grad  %noun
--
```

**`/mar/flap/update.hoon`**:

Updates are sent between Urbit peers.

```hoon {% copy=true %}
/-  flap
|_  =update:flap
++  grab
  |%
  ++  noun  update:flap
  --
++  grow
  |%
  ++  noun  update
  --
++  grad  %noun
--
```


##  Back End

The main app implements the logic for exposing and tracking data.

**`/app/flap.hoon`** (version 1):

```hoon {% copy=true mode="collapse" %}
  ::  flap.hoon
::::  Maintains leaderboard for Flappy Bird on Mars.
::
/-  *flap
/+  default-agent               :: agent arm defaults
/+  dbug                        :: debug wrapper for agent
/+  schooner                    :: HTTP request handling
/+  server                      :: HTTP request processing
/+  verb                        :: support verbose output for agent
/*  flapui      %html  /app/flap/index/html
/*  flapjs      %js    /app/flap/game/js
/*  flapsprite  %png   /app/flap/img/sprite/png
/*  flapaudios  %wav   /app/flap/audio/sfx-point/wav
/*  flapaudiof  %wav   /app/flap/audio/sfx-flap/wav
/*  flapaudioh  %wav   /app/flap/audio/sfx-hit/wav
/*  flapaudiow  %wav   /app/flap/audio/sfx-swooshing/wav
/*  flapaudiod  %wav   /app/flap/audio/sfx-die/wav
|%
+$  versioned-state
  $%  state-zero
  ==
+$  state-zero  $:
      %zero
      =score
      hiscore=score
    ==
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-zero
=*  state  -
%+  verb  |
^-  agent:gall
|_  bol=bowl:gall
+*  this     .
    default  ~(. (default-agent this %.n) bol)
::
++  on-init
  ^-  (quip card _this)
  ~&  >  "%flap initialized successfully."
  :_  this
  :~  [%pass /eyre %arvo %e %connect [~ /apps/flap] %flap]
  ==
::
++  on-save
  ^-  vase
  !>(state)
::
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %zero  `this(state old)
  ==
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  =(our src):bol
  |^
  ?+    mark  (on-poke:default mark vase)
    ::
      %flap-action
    =/  axn  !<(action vase)
    ?>  ?=(-.axn %gain)
    ?.  (gth score.axn hiscore)
      `this(score score.axn)
    `this(score score.axn, hiscore score.axn)
    ::
      %handle-http-request
    (handle-http !<([@ta =inbound-request:eyre] vase))
  ==
  ::
  ++  handle-http
    |=  [eyre-id=@ta =inbound-request:eyre]
    ^-  (quip card _this)
    =/  ,request-line:server
      (parse-request-line:server url.request.inbound-request)
    =+  send=(cury response:schooner eyre-id)
    ?.  authenticated.inbound-request
      :_  this
      %-  send
      [302 ~ [%login-redirect './apps/flap']]
    ::
    ?+    method.request.inbound-request
      [(send [405 ~ [%stock ~]]) this]
      ::
        %'POST'
      ?~  body.request.inbound-request
        [(send [405 ~ [%stock ~]]) this]
      =/  json  (de-json:html q.u.body.request.inbound-request)
      =/  axn  `action`(dejs-action +.json)
      (on-poke %flap-action !>(axn))
      ::
        %'GET'
      ?+  site  :_  this
                %-  send
                :+  404
                  ~
                [%plain "404 - Not Found"]
          [%apps %flap ~]
        :_  this
        %-  send
        :+  200
          ~
        [%html flapui]
        ::
          [%apps %flap %whoami ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %p our.bol)]
        ::
          [%apps %flap %score ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %ud score)]
        ::
          [%apps %flap %hiscore ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %ud hiscore)]
        ::
          [%apps %flap %game %js ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (trip flapjs)]
        ::
          [%apps %flap %img %sprite %png ~]
        :_  this
        %-  send
        :+  200
          ~
        [%image-png flapsprite]
        ::
          [%apps %flap %audio %sfx-point %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudios]
        ::
          [%apps %flap %audio %sfx-flap %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiof]
        ::
          [%apps %flap %audio %sfx-hit %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudioh]
        ::
          [%apps %flap %audio %sfx-swooshing %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiow]
        ::
          [%apps %flap %audio %sfx-die %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiod]
      ==
    ==
  ++  dejs-action
    =,  dejs:format
    |=  jon=json
    ^-  action
    %.  jon
    %-  of
    :~  [%gain (ot ~[score+ni])]
    ==
  --
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path  (on-watch:default path)
      [%http-response *]
    ?:  =(our src):bol
      `this
    (on-watch:default path)
  ==
::
++  on-leave  on-leave:default
::
++  on-peek  on-peek:default
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%flap ~]
    ?+    -.sign  (on-agent:default wire sign)
      ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %flap-update
        =/  upd  !<(update q.cage.sign)
        ?-    -.upd
            %lord
          !!
        ==
      ==
      ::
        %kick
      :_  this
      :~  [%pass /flap %agent [src.bol %flap] %watch /updates/out]
      ==
      ::
        %watch-ack
      ?~  p.sign
        ((slog '%flap: Subscribe succeeded!' ~) `this)
      ((slog '%flap: Subscribe failed!' ~) `this)
    ==
  ==
::
++  on-arvo
|=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%eyre %bound *] sign-arvo)
    (on-arvo:default [wire sign-arvo])
  ?:  accepted.sign-arvo
    %-  (slog leaf+"/apps/flap bound successfully!" ~)
    `this
  %-  (slog leaf+"Binding /apps/flap failed!" ~)
  `this
::
++  on-fail   on-fail:default
--
```

Then `|install our %flap` to install the app.

Now when we navigate to `localhost:8080/apps/flap`, what do we see?  The game canvas is merely an empty box.  What can we do to fix this?

### Serving Correctly

If we investigate the Developer Tools console in our browser, we see messages to the effect that resources are unable to be located.  Resource paths (for `js`, `png`, and `wav` files) tell the browser from whence the resources will come when they are loaded.  We have two options here as well:  hot-link the resource from its GitHub or other source, or

If we hot-link the resources, the corresponding lines will look like this:

```js
const sprite = new Image();
sprite.src = "https://raw.githubusercontent.com/CodeExplainedRepo/Original-Flappy-bird-JavaScript/master/img/sprite.png";
```

This is easiest if less elegant than serving the files from Urbit.

If we want to serve our files from Urbit, we need to build the files and serve them to particular endpoints so that they are visible to the browser.  This means importing and serving these to make these available.  It also means renaming the files so that they are compatible with `@ta`-style path entries.

```sh {% copy=true %}
mv comet/flap/app/flap/audio/sfx_point.wav comet/flap/app/flap/audio/sfx-point.wav
mv comet/flap/app/flap/audio/sfx_flap.wav comet/flap/app/flap/audio/sfx-flap.wav
mv comet/flap/app/flap/audio/sfx_hit.wav comet/flap/app/flap/audio/sfx-hit.wav
mv comet/flap/app/flap/audio/sfx_swooshing.wav comet/flap/app/flap/audio/sfx-swooshing.wav
mv comet/flap/app/flap/audio/sfx_die.wav comet/flap/app/flap/audio/sfx-die.wav
```

The import lines at the top of `/app/flap.hoon` build each file according to its mark:

```hoon {% copy=true %}
/*  flapjs  %js    /app/flap/game/js
/*  flapsprite  %png   /app/flap/img/sprite/png
/*  flapaudios  %wav   /app/flap/audio/sfx-point/wav
/*  flapaudiof  %wav   /app/flap/audio/sfx-flap/wav
/*  flapaudioh  %wav   /app/flap/audio/sfx-hit/wav
/*  flapaudiow  %wav   /app/flap/audio/sfx-swooshing/wav
/*  flapaudiod  %wav   /app/flap/audio/sfx-die/wav
```

Later in `/app/flap.hoon` we serve the files at particular endpoints:

```hoon {% copy=true mode="collapse" %}
  [%apps %flap %game %js ~]
:_  this
%-  send
:+  200
  ~
[%plain (trip flapjs)]
::
  [%apps %flap %img %sprite %png ~]
:_  this
%-  send
:+  200
  ~
[%image-png flapsprite]
::
  [%apps %flap %audio %sfx-point %wav ~]
:_  this
%-  send
:+  200
  ~
[%audio-wav flapaudios]
::
  [%apps %flap %audio %sfx-flap %wav ~]
:_  this
%-  send
:+  200
  ~
[%audio-wav flapaudiof]
::
  [%apps %flap %audio %sfx-hit %wav ~]
:_  this
%-  send
:+  200
  ~
[%audio-wav flapaudioh]
::
  [%apps %flap %audio %sfx-swooshing %wav ~]
:_  this
%-  send
:+  200
  ~
[%audio-wav flapaudiow]
::
  [%apps %flap %audio %sfx-die %wav ~]
:_  this
%-  send
:+  200
  ~
[%audio-wav flapaudiod]
```

In `index.html`:

```html
<script src="flap/game/js"></script>
```

In `game.js`, all we need to change are the source paths:

```js
// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "flap/img/sprite/png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "flap/audio/sfx-point/wav";

const FLAP = new Audio();
FLAP.src = "flap/audio/sfx-flap/wav";

const HIT = new Audio();
HIT.src = "flap/audio/sfx-hit/wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "flap/audio/sfx-swooshing/wav";

const DIE = new Audio();
DIE.src = "flap/audio/sfx-die/wav";
```

Flappy Bird in HTML+JS needs Urbit affordances so it knows how to talk to the app backend.  Changes like the above will be common in adapting non-Hoon-compliant code due to assumptions about file location and naming conventions, but most of the time your process of adaptation will look much like the above.

You can check out the API endpoints listed in the code above:  `/apps/flap/whoami`, `/apps/flap/img/sprite/png` and so forth, to see what they serve to the browser as.

This version of the app should run in your browser correctly once you `|commit %flap`.  Urbit knows where all resources are and how to serve them.  However, while the vertical communications work (between client and server), the horizontal communications are still missing (between Urbit peers).

> ##  Cross-Origin Resource Sharing
>
> CORS is a security policy that allows you to load resources dynamically with prior approval from the browser and server.  Sometimes when you are serving various game configurations during development, you may arrive a situation in which things aren't loading correctly to due to the CORS policy.  (When things are entirely served from your Urbit ship then this shouldn't be an issue.)  If you encounter this problem on your way, however, you can [set up CORS origins](https://developers.urbit.org/reference/arvo/eyre/guide#managing-cors-origins) for Eyre by telling your Urbit ship to allow `localhost` files to be served on the appropriate port.
>
> ```hoon {% copy=true %}
> |cors-approve 'http://localhost:8080'
> ```


##  Communications Protocol

### Changes to Back End

#### Urbit as Database

Our app's state should retain a list of _all_ high scores it receives.  To that end, we will transition from a single high-score state to using a `(map fren score)`.

```hoon
/-  *flap, pals
::  * * *
::
|%
+$  versioned-state
  $%  state-zero
      state-one
  ==
+$  state-one  $:
      %one
      =score
      =scores
    ==
+$  state-zero  $:
      %zero
      =score
      hiscore=score
    ==
+$  card  card:agent:gall
--
```

We will include an upgrade path for the old agent:

```hoon
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %one   `this(state old)
    %zero  `this(scores (~(put by scores) our.bol hiscore.old))
  ==
```

These values will be changed when peer state changes are received using `%pals`.

#### Adding Friends

`%pals` is a very simple contact manager which recognizes outgoing requests, incoming requests, and mutually recognized peers.  Let's integrate knowledge of other friends (and thus the ability to maintain a leaderboard of our friends).  We will base our leaderboard on outgoing requests for simplicity.

You should copy `%pals` support files over to our working desk.

```sh
# Include the %pals tooling by ~paldev.
git clone https://github.com/Fang-/suite.git
cp suite/lib/pals.hoon comet/flap/lib
cp suite/sur/pals.hoon comet/flap/sur
cp -r suite/mar/pals comet/flap/mar
```

When dealing with `%pals`, we need to maintain some list of our friends and their current known high scores (which means modifying the app's state) and dealing with sending and receiving notifications.  That is reflected in adding `scores` to the new state in the state definition in `/app/flap.hoon`.

Subscriptions will all take place over the `/flap` path.  In the `++on-poke` arm, we need to issue notices along that arm with the `%flap-update` mark.

```hoon
  %flap-action
=/  axn  !<(action vase)
?>  ?=(-.axn %gain)
?.  (gth score.axn hiscore)
  `this(score score.axn)
:_  this(score score.axn, hiscore score.axn)
:~  [%give %fact ~[/flap] %flap-update !>(`update`lord+[score=score.axn fren=our.bol])]
==
```

We also need to process incoming `%fact`s with a `%flap-update` cage in `++on-agent`:

```hoon
  %flap-update
=/  upd  !<(update q.cage.sign)
?>  ?=(-.upd %lord)
?:  (gth (~(got by scores) fren.upd) score.upd)
  `this
~&  >  "%flap:  new high score {<score.upd>} from {<fren.upd>}"
`this(scores (~(put by scores) fren.upd score.upd))
```

Changes to `%pals` come in along the path `/newpals`, so we need to watch for incoming values there.  `%pals` organizes friends to `%meet` for the first time or `%part` when they separate.  Thus we add or remove entries from our `scores.state`.

```hoon
  [%newpals ~]
?+    -.sign  `this
    %fact
  ?+    p.cage.sign  `this
      %pals-effect
    =/  fx  !<(effect:pals q.cage.sign)
    ?+    -.fx  (on-agent:default wire sign)
        %meet
      :_  this(scores (~(put by scores) +.fx 0))
      :~  [%pass /flap %agent [+.fx %flap] %watch /flap]
      ==
        %part
      :_  this(scores (~(del by scores) +.fx))
      :~  [%pass /flap %agent [+.fx %flap] %leave ~]
      ==
    ==
  ==
    %kick
  :_  this
  :~  [%pass /flap %agent [src.bol dap.bol] %watch /flap]
  ==
==
```

With all of the above, you should have a working `%flappy` instance at `http://localhost:8080/apps/flappy`.  Use `:flappy +dbug` to check that the score is being communicated back.

**`/app/flap.hoon`** (version 2):

```hoon {% copy=true mode="collapse" %}
  ::  flap.hoon
::::  Maintains leaderboard for Flappy Bird on Mars.
::
/-  *flap, pals
/+  default-agent               :: agent arm defaults
/+  dbug                        :: debug wrapper for agent
/+  schooner                    :: HTTP request handling
/+  server                      :: HTTP request processing
/+  verb                        :: support verbose output for agent
/*  flapui      %html  /app/flap/index/html
/*  flapjs      %js    /app/flap/game/js
/*  flapsprite  %png   /app/flap/img/sprite/png
/*  flapaudios  %wav   /app/flap/audio/sfx-point/wav
/*  flapaudiof  %wav   /app/flap/audio/sfx-flap/wav
/*  flapaudioh  %wav   /app/flap/audio/sfx-hit/wav
/*  flapaudiow  %wav   /app/flap/audio/sfx-swooshing/wav
/*  flapaudiod  %wav   /app/flap/audio/sfx-die/wav
|%
+$  versioned-state
  $%  state-zero
      state-one
  ==
+$  state-one  $:
      %one
      =score
      =scores
      hiscore=score
    ==
+$  state-zero  $:
      %zero
      =score
      hiscore=score
    ==
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-one
=*  state  -
%+  verb  |
^-  agent:gall
|_  bol=bowl:gall
+*  this     .
    default  ~(. (default-agent this %.n) bol)
::
++  on-init
  ^-  (quip card _this)
  ~&  >  "%flap initialized successfully."
  :_  this
  :~  [%pass /eyre %arvo %e %connect [~ /apps/flap] %flap]
  ==
::
++  on-save
  ^-  vase
  !>(state)
::
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %one   `this(state old)
    %zero  `this(scores (~(put by scores) our.bol hiscore.old))
  ==
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  =(our src):bol
  |^
  ?+    mark  (on-poke:default mark vase)
    ::
      %flap-action
    =/  axn  !<(action vase)
    ?>  ?=(-.axn %gain)
    ?.  (gth score.axn (~(gut by scores) our.bol 0))
      `this(score score.axn)
    :_  this(score score.axn, scores (~(put by scores) our.bol score.axn))
    :~  [%give %fact ~[/flap] %flap-update !>(`update`lord+[score=score.axn fren=our.bol])]
    ==
    ::
      %handle-http-request
    (handle-http !<([@ta =inbound-request:eyre] vase))
  ==
  ::
  ++  handle-http
    |=  [eyre-id=@ta =inbound-request:eyre]
    ^-  (quip card _this)
    =/  ,request-line:server
      (parse-request-line:server url.request.inbound-request)
    =+  send=(cury response:schooner eyre-id)
    ?.  authenticated.inbound-request
      :_  this
      %-  send
      [302 ~ [%login-redirect './apps/flap']]
    ::
    ?+    method.request.inbound-request
      [(send [405 ~ [%stock ~]]) this]
      ::
        %'POST'
      ?~  body.request.inbound-request
        [(send [405 ~ [%stock ~]]) this]
      =/  json  (de-json:html q.u.body.request.inbound-request)
      =/  axn  `action`(dejs-action +.json)
      (on-poke %flap-action !>(axn))
      ::
        %'GET'
      ?+  site  :_  this
                %-  send
                :+  404
                  ~
                [%plain "404 - Not Found"]
          [%apps %flap ~]
        :_  this
        %-  send
        :+  200
          ~
        [%html flapui]
        ::
          [%apps %flap %whoami ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %p our.bol)]
        ::
          [%apps %flap %score ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %ud score)]
        ::
          [%apps %flap %hiscore ~]
        :_  this
        %-  send
        :+  200
          ~
        [%plain (scow %ud (~(gut by scores) our.bol 0))]
        ::
          [%apps %flap %game %js ~]
        :_  this
        %-  send
        :+  200
          ~
        [%application-javascript (trip flapjs)]
        ::
          [%apps %flap %img %sprite %png ~]
        :_  this
        %-  send
        :+  200
          ~
        [%image-png flapsprite]
        ::
          [%apps %flap %audio %sfx-point %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudios]
        ::
          [%apps %flap %audio %sfx-flap %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiof]
        ::
          [%apps %flap %audio %sfx-hit %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudioh]
        ::
          [%apps %flap %audio %sfx-swooshing %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiow]
        ::
          [%apps %flap %audio %sfx-die %wav ~]
        :_  this
        %-  send
        :+  200
          ~
        [%audio-wav flapaudiod]
        ::
          [%apps %flap %frens ~]
        :_  this
        %-  send
        :+  200
          ~
        [%json (enjs-scores scores)]
      ==
    ==
  ++  dejs-action
    =,  dejs:format
    |=  jon=json
    ^-  action
    %.  jon
    %-  of
    :~  [%gain (ot ~[score+ni])]
    ==
  ++  enjs-scores
    =,  enjs:format
    |=  =^scores
    ^-  json
    :-  %a
    :*
    %+  turn  ~(tap by scores)
    |=  point=[@p @ud]
    %-  pairs
    :~  ['fren' s+(scot %p -.point)]
        ['score' (numb +.point)]
    ==  ==
  --
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path  (on-watch:default path)
      [%http-response *]
    ?:  =(our src):bol
      `this
    (on-watch:default path)
  ==
::
++  on-leave  on-leave:default
::
++  on-peek  on-peek:default
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%flap ~]
    ?+    -.sign  (on-agent:default wire sign)
      ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %flap-update
        =/  upd  !<(update q.cage.sign)
        ?>  ?=(-.upd %lord)
        =/  hiscore  (~(gut by `(map @p @ud)`scores) fren.upd 0)
        ?:  (gth hiscore score.upd)
          `this
        ~&  >  "%flap:  new high score {<score.upd>} from {<fren.upd>}"
        `this(scores (~(put by scores) fren.upd score.upd))
      ==
      ::
        %kick
      :_  this
      :~  [%pass /flap %agent [src.bol %flap] %watch /updates/out]
      ==
      ::
        %watch-ack
      ?~  p.sign
        ((slog '%flap: Subscribe succeeded!' ~) `this)
      ((slog '%flap: Subscribe failed!' ~) `this)
    ==
    ::
      [%newpals ~]
    ?+    -.sign  `this
        %fact
      ?+    p.cage.sign  `this
          %pals-effect
        =/  fx  !<(effect:pals q.cage.sign)
        ?+    -.fx  (on-agent:default wire sign)
            %meet
          :_  this(scores (~(put by scores) +.fx 0))
          :~  [%pass /flap %agent [+.fx %flap] %watch /flap]
          ==
            %part
          :_  this(scores (~(del by scores) +.fx))
          :~  [%pass /flap %agent [+.fx %flap] %leave ~]
          ==
        ==
      ==
    ==
      %kick
    :_  this
    :~  [%pass /flap %agent [src.bol dap.bol] %watch /flap]
    ==
  ==
::
++  on-arvo
|=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%eyre %bound *] sign-arvo)
    (on-arvo:default [wire sign-arvo])
  ?:  accepted.sign-arvo
    %-  (slog leaf+"/apps/flap bound successfully!" ~)
    `this
  %-  (slog leaf+"Binding /apps/flap failed!" ~)
  `this
::
++  on-fail   on-fail:default
--
```

### Changes to Front End

Now that the a leaderboard is supported, we need a way to display it alongside the browser game.  To wit, we will add some `async` functions to retrieve key bits of information from the ship and display it in a table.

```js
// URBIT STATE
async function getmyship() {
        const response = await fetch('/apps/flap/whoami');
        return response.text();
    }
var myshipname = await getmyship();
document.getElementById("ship").innerHTML = myshipname;

async function gethiscore() {
        const response = await fetch('/apps/flap/hiscore');
        return response.text();
    }
var myhiscore = await gethiscore();

async function getscore() {
        const response = await fetch('/apps/flap/score');
        return response.text();
    }
var myscore = await getscore();

document.getElementById("hiscore").innerHTML = myhiscore;
document.getElementById("score").innerHTML = myscore;
```

along with similar modest changes in the final file (included below in its entirety).  E.g. on death we modify some value we placed in tags in `index.html`:

```js
if(state.current == state.game){
    state.current = state.over;
    sendscore(score);
    document.getElementById("hiscore").innerHTML = myhiscore;
    document.getElementById("score").innerHTML = myscore;
    drawtable(myfrens);
}
```

We'll also include a way to post data back as a `flap-action`.

```js
//  Send score to Gall agent
function sendscore(score) {
    fetch('/apps/flap', {
        method: 'POST',
        body: JSON.stringify({'gain': {'score': score.value}})
    })
}
```

If you examine `++on-poke` in `/app/flap.hoon`, you will see that HTTP `POST` requests are accepted, examined, and if valid passed back through as a self-poke with appropriate mark.

```hoon
  %'POST'
?~  body.request.inbound-request
  [(send [405 ~ [%stock ~]]) this]
=/  json  (de-json:html q.u.body.request.inbound-request)
=/  axn  `action`(dejs-action +.json)
(on-poke %flap-action !>(axn))
```

**`/app/flap/index.html`** (version 2):

```html {% copy=true mode="collapse" %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Original Flappy Bird -JavaScript</title>
    <link href="https://fonts.googleapis.com/css?family=Teko:700" rel="stylesheet">
    <style>        
        canvas{
            border: 1px solid #000;
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <canvas id="bird" width="320" height="480"></canvas>

    <p>
    <span id="ship"></span>:  <span id="score"></span>/<span id="hiscore"></span>
    </p>
    
    <p>
    <div id="frens"></div>
    </p>
        
    <script src="flap/game/js" type="module"></script>
</body>
</html>
```

**`/app/flap/game.js`** (version 2):

```js {% copy=true mode="collapse" %}
// URBIT STATE
async function getmyship() {
    const response = await fetch('/apps/flap/whoami');
    return response.text();
}
var myshipname = await getmyship();
document.getElementById("ship").innerHTML = myshipname;

async function gethiscore() {
    const response = await fetch('/apps/flap/hiscore');
    return response.text();
}
var myhiscore = await gethiscore();

document.getElementById("hiscore").innerHTML = myhiscore;

async function getscore() {
    const response = await fetch('/apps/flap/score');
    return response.text();
}
var myscore = await getscore();
document.getElementById("score").innerHTML = myscore;

//  Send score to Gall agent
function sendscore(score) {
fetch('/apps/flap', {
    method: 'POST',
    body: JSON.stringify({'gain': {'score': score.value}})
})
}

//  Draw table of frens
async function getfrens() {
    const response = await fetch('/apps/flap/frens');
    return response.text();
}
function drawtable(myfrens) {
console.log(myfrens);
var frens = JSON.parse(myfrens);

var table = document.createElement("table");
var titleRow = table.insertRow();
var frenCell = titleRow.insertCell();
frenCell.innerHTML = "Ship";
var scoreCell = titleRow.insertCell();
scoreCell.innerHTML = "Score";

for (let key in frens) {
    var row = table.insertRow();
    var cell = row.insertCell();
    cell.classList += "ship";
    cell.innerHTML = frens[key]['fren'];
    cell = row.insertCell();
    cell.innerHTML = frens[key]['score'];
}

// Clear the old table
const list = document.getElementById("frens");
while (list.hasChildNodes()) {
    list.removeChild(list.firstChild);
}
// Add the new one
document.getElementById("frens").appendChild(table);
}
var myfrens = await getfrens();
console.log(myfrens);
drawtable(myfrens);

// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI/180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "flap/img/sprite/png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "flap/audio/sfx-point/wav";

const FLAP = new Audio();
FLAP.src = "flap/audio/sfx-flap/wav";

const HIT = new Audio();
HIT.src = "flap/audio/sfx-hit/wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "flap/audio/sfx-swooshing/wav";

const DIE = new Audio();
DIE.src = "flap/audio/sfx-die/wav";

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// START BUTTON COORD
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROL THE GAME
cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if(bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // CHECK IF WE CLICK ON THE START BUTTON
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});


// BACKGROUND
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// BIRD
const bird = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    sendscore(score);
                    document.getElementById("hiscore").innerHTML = myhiscore;
                    document.getElementById("score").innerHTML = myscore;
                    drawtable(myfrens);
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }else{
                this.rotation = -25 * DEGREE;
            }
        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// PIPES
const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // COLLISION DETECTION
            // TOP PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                sendscore(score);
                document.getElementById("hiscore").innerHTML = myhiscore;
                document.getElementById("score").innerHTML = myscore;
                drawtable(myfrens);
                HIT.play();
            }
            // BOTTOM PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                sendscore(score);
                document.getElementById("hiscore").innerHTML = myhiscore;
                document.getElementById("score").innerHTML = myscore;
                drawtable(myfrens);
                HIT.play();
            }
            
            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            
            // if the pipes go beyond canvas, we delete them from the array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || (myhiscore ? myhiscore : 0),
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// DRAW
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
```

At this point, if we refresh the page we will see our `%pals` data visible in the table.  You can set up multiple development comets with the desk and test it out.

```hoon
|install our %flap
:treaty|publish %flap
```

### Beautification

There's a final set of changes we can make to the styling which makes this a much prettier app while still keeping these simple:

**`/app/flap/index.html`** (version 3):

```html {% copy=true mode="collapse" %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Original Flappy Bird -JavaScript</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"> 
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> 
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Teko:wght@700&display=swap" rel="stylesheet">
    <style>
        body, html {
            font-family: "Inter", sans-serif;
            height: 100%;
            width: 100%;
            margin: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        body > div {
            max-width: 320px;
            width: 100%;
        }
        table {
            width: 100%;
            text-align: center;
        }
        tr:first-of-type {
            font-weight: 700;
            color: #918C84;
        }
        canvas {
            border: 1px solid #000;
            display: block;
            margin: 0 auto;
        }
        #ship, #score, #hiscore {
            display: block;
            color: #000;
            font-weight: 400;
        }
        #bird {
            image-rendering: pixelated;
        }
        #ship, .ship {
            font-family: monospace;
        }
        #our {
            display: flex;
        }
        #our > p {
            margin: 1rem;
            font-weight: 700;
            color: #918C84;
            text-align: center;
        }
    </style>
</head>
<body>
    <div>
<canvas id="bird" width="320" height="480"></canvas>

<div id="our">
<p>Ship
    <span id="ship"></span>
</p>
<p>
    Last score
    <span id="score"></span>
</p>
<p>High score <span id="hiscore"></span></p>
</div>

<p style="font-weight: 700; text-align: center; margin-top: 2rem;">Leaderboard</p>
<p id="board">
<div id="frens"></div>
</p>
</div>

<script src="flap/game/js" type="module"></script>
</body>
</html>
```

**`/app/flap/game.js`** (version 3):

```hoon {% copy=true mode="collapse" %}
// URBIT STATE
async function getmyship() {
    const response = await fetch('/apps/flap/whoami');
    return response.text();
}
var myshipname = await getmyship();
document.getElementById("ship").innerHTML = myshipname;

async function gethiscore() {
    const response = await fetch('/apps/flap/hiscore');
    return response.text();
}
var myhiscore = await gethiscore();

async function updateHiScore() {
    let newHiScore = await gethiscore();
    myhiscore = newHiScore;
}
document.getElementById("hiscore").innerHTML = myhiscore;

async function getscore() {
    const response = await fetch('/apps/flap/score');
    return response.text();
}
var myscore = await getscore();
document.getElementById("score").innerHTML = myscore;

//  Send score to Gall agent
function sendscore(score) {
  fetch('/apps/flap', {
    method: 'POST',
    body: JSON.stringify({'gain': {'score': score.value}})
  })
}

//  Draw table of frens
async function getfrens() {
        const response = await fetch('/apps/flap/frens');
        return response.text();
    }
function drawtable(myfrens) {
    console.log(myfrens);
    var frens = JSON.parse(myfrens);

    var table = document.createElement("table");
    var titleRow = table.insertRow();
    var frenCell = titleRow.insertCell();
    frenCell.innerHTML = "Ship";
    var scoreCell = titleRow.insertCell();
    scoreCell.innerHTML = "Score";

    for (let key in frens) {
        var row = table.insertRow();
        var cell = row.insertCell();
        cell.classList += "ship";
        cell.innerHTML = frens[key]['fren'];
        cell = row.insertCell();
        cell.innerHTML = frens[key]['score'];
    }

    // Clear the old table
    const list = document.getElementById("frens");
    while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);
    }
    // Add the new one
    document.getElementById("frens").appendChild(table);
}
var myfrens = await getfrens();
console.log(myfrens);
drawtable(myfrens);

// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI/180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "flap/img/sprite/png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "flap/audio/sfx-point/wav";

const FLAP = new Audio();
FLAP.src = "flap/audio/sfx-flap/wav";

const HIT = new Audio();
HIT.src = "flap/audio/sfx-hit/wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "flap/audio/sfx-swooshing/wav";

const DIE = new Audio();
DIE.src = "flap/audio/sfx-die/wav";

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// START BUTTON COORD
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROL THE GAME
cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if(bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // CHECK IF WE CLICK ON THE START BUTTON
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});


// BACKGROUND
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// BIRD
const bird = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    sendscore(score);
                    document.getElementById("hiscore").innerHTML = myhiscore;
                    document.getElementById("score").innerHTML = myscore;
                    drawtable(myfrens);
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }else{
                this.rotation = -25 * DEGREE;
            }
        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// PIPES
const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // COLLISION DETECTION
            // TOP PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                sendscore(score);
                document.getElementById("hiscore").innerHTML = myhiscore;
                document.getElementById("score").innerHTML = myscore;
                drawtable(myfrens);
                HIT.play();
            }
            // BOTTOM PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                sendscore(score);
                document.getElementById("hiscore").innerHTML = myhiscore;
                document.getElementById("score").innerHTML = myscore;
                drawtable(myfrens);
                HIT.play();
            }
            
            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            
            // if the pipes go beyond canvas, we delete them from the array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        updateHiScore();
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || (myhiscore ? myhiscore : 0),
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// DRAW
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
```


##  What's Next?

After completing this tutorial, you should think about how to apply what you've seen to other applications.  Some things to think about:

- What do other games need?
- What internal state do other games maintain?
- What makes sense to share via Urbit peers?
- How can we serve other components directly from the ship?
