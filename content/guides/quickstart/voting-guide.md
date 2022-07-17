+++
title = "Build a Voting App"
weight = 1
+++

In this lightning tutorial, we're going to build a voting app for groups called
Tally, which uses [linkable ring
signatures](https://en.wikipedia.org/wiki/Ring_signature). If the group host has
Tally installed, members may make proposals, and other members may vote yea or
nay on them. Linkable ring signatures allow votes to be anonymous - each vote
can be verified to have come from a group member and duplicate votes can be
detected, but it cannot be determined who voted for what. The finished app will
look like this:

![tally screenshot](https://media.urbit.org/guides/quickstart/voting-app-guide/tally-screenshot.png)

The front-end of the app will be written in
[Sail](/reference/glossary/sailudon), Urbit's XML language built into the Hoon
compiler. Using Sail means we don't need to create a separate React front-end,
and can instead serve pages directly from our back-end. This works well for
static pages but a full JS-enabled front-end would be preferred for a dynamic
page.

If you'd like to check out the finished app, you can install it from
`~pocwet/tally` with the `|install ~pocwet %tally` command in your ship's Dojo,
or else install it from your ship's homescreen.

The app source is available in the [`docs-examples` repo on
Github](https://github.com/urbit/docs-examples), in the `voting-app` folder. It
has two folders inside:

1. `bare-desk`: just the hoon files created here without any dependencies.
2. `full-desk`: `bare-desk` plus all dependencies. Note some files are
   symlinked, so if you're copying them you'll need to do `cp -rL`.

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

```
|mount %base
|mount %garden
|mount %landscape
```

With those mounted, switch back to a normal shell in another terminal window.
We'll create a folder to develop our app in, and then we'll copy a few files
across that our app will depend on:

```shell {% copy=true %}
mkdir -p tally/{app,sur,mar,lib}
cp zod/base/sys.kelvin tally/sys.kelvin
cp zod/base/sur/ring.hoon tally/sur/
cp zod/base/mar/{bill*,hoon*,json.hoon,kelvin*,mime*,noun*,ship*,txt*} tally/mar/
cp zod/base/lib/{agentio*,dbug*,default-agent*,skeleton*} tally/lib/
cp zod/garden/mar/docket-0* tally/mar/
cp zod/garden/lib/{docket*,mip*} tally/lib/
cp zod/garden/sur/docket* tally/sur/
cp zod/landscape/sur/{group*,metadata-store*,resource*} tally/sur/
```
Now we can start working on the app itself.

### Types

The first thing we need to do is define the data types our app will use. We'll
define the basic types for polls, group IDs, poll IDs, etc. We'll also define
the types of actions/requests we might send or receive, and the types of
updates/events we might send to subscribers or receive from subscriptions.

Type definitions are typically stored in a separate file in the `/sur` directory
(for "**sur**face"), and named the same as the app. Save the following code in
`tally/sur/tally.hoon`:

```hoon {% copy=true mode="collapse" %}
/-  *ring
/+  *mip
|%
+$  pid  @
+$  gid  (pair @p @tas)
+$  poll
  $:  creator=@p
      proposal=@t
      expiry=@da
      =gid
      =ring-group
  ==
+$  vote  (pair ? raw-ring-signature)
+$  votes  (map @udpoint vote)
::
+$  by-group  (mip gid pid [=poll =votes])
::
+$  action
  $%  [%new proposal=@t days=@ud =gid]
      [%vote =gid =pid =vote]
      [%watch =gid]
      [%leave =gid]
      [%withdraw =gid =pid]
  ==
+$  update
  $%  [%init polls=(map pid [=poll =votes])]
      [%vote =pid =vote]
      [%new =pid =poll]
      [%withdraw =pid]
  ==
--
```

### Ring Library

The `%base` desk of ship includes a `ring.hoon` library for ring signatures.
This implementation verifies signatures again a ship's most recent keys, which
may cause problems verifying old polls if group members rotate their keys. To
solve this, here is a slightly modified version that takes a ship's `life` (key
revision) as an additional argument:

- [ring.hoon](https://github.com/urbit/docs-examples/blob/main/voting-app/bare-desk/lib/ring.hoon)

Save that file in the `tally/lib/` directory.

### Agent

Next, we'll add our agent (the app itself). Gall agents live in the `/app`
directory of a desk, so save this code in `hut/app/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
/-  *tally, *ring, ms=metadata-store, g=group
/+  *mip, ring, default-agent, dbug, agentio
/=  index  /app/tally/index
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =by-group voted=(set pid) withdrawn=(set pid)]
+$  card  card:agent:gall
--
::
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  bol=bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bol)
    io    ~(. agentio bol)
    hc    ~(. +> bol)
++  on-init
  ^-  (quip card _this)
  :_  this
  [%pass /bind %arvo %e %connect `/'tally' %tally]~
++  on-save  !>(state)
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
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
  ++  handle-http
    |=  [rid=@ta req=inbound-request:eyre]
    ^-  (quip card _state)
    ?.  authenticated.req
      :_  state
      (give-http:hc rid [307 ['Location' '/~/login?redirect='] ~] ~)
    ?+  method.request.req
      :_  state
      %^    give-http:hc
          rid
        :-  405
        :~  ['Content-Type' 'text/html']
            ['Content-Length' '31']
            ['Allow' 'GET, POST']
        ==
      (some (as-octs:mimes:html '<h1>405 Method Not Allowed</h1>'))
    ::
        %'GET'
      [(make-index:hc rid) state]
    ::
        %'POST'
      ?~  body.request.req  [(make-index:hc rid) state]
      =/  query=(unit (list [k=@t v=@t]))
        (rush q.u.body.request.req yquy:de-purl:html)
      ?~  query
        :_  state
        (give-http:hc rid [302 ['Location' '/tally'] ~] ~)
      =/  kv-map  (~(gas by *(map @t @t)) u.query)
      ?:  (~(has by kv-map) 's-gid')
        =/  =gid
          %+  rash  (~(got by kv-map) 's-gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =^  cards  state  (handle-action %watch gid)
        :_  state
        %+  weld  cards
        (give-http:hc rid [302 ['Location' '/tally'] ~] ~)
      ?:  (~(has by kv-map) 'u-gid')
        =/  =gid
          %+  rash  (~(got by kv-map) 'u-gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =^  cards  state  (handle-action %leave gid)
        :_  state
        %+  weld  cards
        (give-http:hc rid [302 ['Location' '/tally'] ~] ~)
      ?:  (~(has by kv-map) 'n-gid')
        =/  =gid
          %+  rash  (~(got by kv-map) 'n-gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =/  days=@ud  (rash (~(got by kv-map) 'n-days') dem)
        =/  proposal=@t  (~(got by kv-map) 'n-proposal')
        =/  location=@t
          %-  crip
          %+  weld  "/tally#"
          "{=>(<p.gid> ?>(?=(^ .) t))}_{(trip q.gid)}"
        =^  cards  state  (handle-action %new proposal days gid)
        :_  state
        %+  weld  cards
        (give-http:hc rid [302 ['Location' location] ~] ~)
      ?:  (~(has by kv-map) 'w-gid')
        =/  =gid
          %+  rash  (~(got by kv-map) 'w-gid')
          ;~(plug fed:ag ;~(pfix cab sym))
        =/  =pid  (rash (~(got by kv-map) 'w-pid') dem)
        =^  cards  state  (handle-action %withdraw gid pid)
        =/  location=@t
          %-  crip
          %+  weld  "/tally#"
          "{=>(<p.gid> ?>(?=(^ .) t))}_{(trip q.gid)}"
        :_  state
        %+  weld  cards
        (give-http:hc rid [302 ['Location' location] ~] ~)
      =/  =gid
        %+  rash  (~(got by kv-map) 'v-gid')
        ;~(plug fed:ag ;~(pfix cab sym))
      =/  =pid  (rash (~(got by kv-map) 'v-pid') dem)
      =/  choice=?
        %+  rash  (~(got by kv-map) 'v-choice')
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
      :_  state
      %+  weld  cards
      (give-http:hc rid [302 ['Location' (crip "/tally#{(a-co:co pid)}")] ~] ~)
    ==
  ::
  ++  handle-action
    |=  act=action
    ^-  (quip card _state)
    ?-    -.act
        %new
      =/  =path  /(scot %p p.gid.act)/[q.gid.act]
      ?.  =(our.bol p.gid.act)
        ?>  =(our.bol src.bol)
        :_  state
        :~  %+  ~(poke pass:io path)
              [p.gid.act %tally]
            tally-action+!>(`action`[%new proposal.act days.act gid.act])
        ==
      ?>  (~(has in (get-members:hc gid.act)) src.bol)
      =/  members=(set [=ship =life])  (make-ring-members:hc gid.act)
      ?>  ?=(^ members)
      =/  expiry=@da  (add now.bol (yule days.act 0 0 0 ~))
      =/  polls=(map pid [=poll =votes])
        (fall (~(get by by-group) gid.act) *(map pid [=poll =votes]))
      =/  =pid
        =/  rng  ~(. og eny.bol)
        |-
        =^  n  rng  (rads:rng (bex 256))
        ?.  (~(has by polls) n)
          n
        $(rng rng)
      =/  =ring-group  [members ~ pid]
      =/  =poll  [src.bol proposal.act expiry gid.act ring-group]
      :-  :~  (fact:io tally-update+!>(`update`[%new pid poll]) ~[path])
          ==
      %=  state
        by-group  (~(put bi by-group) gid.act pid [poll *votes])
      ==
    ::
        %vote
      =/  [=poll =votes]  (~(got bi by-group) gid.act pid.act)
      ?>  (gte expiry.poll now.bol)
      =/  =path  /(scot %p p.gid.act)/[q.gid.act]
      ?.  =(our.bol p.gid.act)
        ?>  =(our.bol src.bol)
        :_  state(voted (~(put in voted) pid.act))
        :~  %+  ~(poke pass:io path)
              [p.gid.act %tally]
            tally-action+!>([%vote gid.act pid.act vote.act])
        ==
      ?>  %:  verify:ring
            our.bol
            now.bol
            p.vote.act
            participants.ring-group.poll
            link-scope.ring-group.poll
            q.vote.act
          ==
      ?<  (~(has by votes) (need y.q.vote.act))
      =.  by-group
        %^    ~(put bi by-group)
            gid.act
          pid.act
        [poll (~(put by votes) (need y.q.vote.act) vote.act)]
      :_  ?.  =(our.bol src.bol)
            state
          state(voted (~(put in voted) pid.act))
      :~  (fact:io tally-update+!>(`update`[%vote pid.act vote.act]) ~[path])
      ==
    ::
        %watch
      ?>  =(our.bol src.bol)
      ?>  !=(our.bol p.gid.act)
      =/  =path  /(scot %p p.gid.act)/[q.gid.act]
      :_  state
      :~  (~(watch pass:io path) [p.gid.act %tally] path)
      ==
    ::
        %leave
      ?>  =(our.bol src.bol)
      ?<  =(our.bol p.gid.act)
      =/  =path  /(scot %p p.gid.act)/[q.gid.act]
      :_  state(by-group (~(del by by-group) gid.act))
      :~  (~(leave-path pass:io path) [p.gid.act %tally] path)
      ==
    ::
        %withdraw
      =/  [=poll =votes]  (~(got bi by-group) gid.act pid.act)
      =/  =path  /(scot %p p.gid.act)/[q.gid.act]
      ?.  =(our.bol p.gid.poll)
        ?>  =(our.bol src.bol)
        :_  state(withdrawn (~(put in withdrawn) pid.act))
        :~  %+  ~(poke pass:io path)
              [p.gid.act %tally]
            tally-action+!>(`action`[%withdraw gid.act pid.act])
        ==
      ?>  ?|  =(our.bol src.bol)
              &(=(src.bol creator.poll) (gte expiry.poll now.bol))
          ==
      :_  %=  state
            by-group   (~(del bi by-group) gid.act pid.act)
            voted      (~(del in voted) pid.act)
            withdrawn  (~(del in withdrawn) pid.act)
          ==
      :~  (fact:io tally-update+!>(`update`[%withdraw pid.act]) ~[path])
      ==
    ==
  --
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?:  &(=(our.bol src.bol) ?=([%http-response *] path))
    `this
  ?>  ?=([@ @ ~] path)
  =/  =gid  [(slav %p i.path) i.t.path]
  ?>  =(our.bol p.gid)
  ?>  (~(has in (get-members:hc gid)) src.bol)
  :_  this
  :~  %+  fact-init:io  %tally-action
      !>  ^-  update
      :-  %init
      (fall (~(get by by-group) gid) *(map pid [=poll =votes]))
  ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?>  ?=([@ @ ~] wire)
  =/  =gid  [(slav %p i.wire) i.t.wire]
  ?+    -.sign  (on-agent:def wire sign)
      %watch-ack
    ?~  p.sign  `this
    `this(by-group (~(del by by-group) gid))
  ::
      %kick
    :_  this
    :~  (~(watch pass:io wire) [p.gid %tally] wire)
    ==
  ::
      %fact
    ?>  ?=(%tally-update p.cage.sign)
    =/  upd  !<(update q.cage.sign)
    ?-    -.upd
        %init
      =;  by-group  `this
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
        %new
      ?:  (~(has bi by-group) gid pid.upd)  `this
      ?.  =(gid gid.poll.upd)  `this
      ?.  =(pid.upd (fall link-scope.ring-group.poll.upd 0^0))  `this
      `this(by-group (~(put bi by-group) gid pid.upd poll.upd *votes))
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
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%bind ~] wire)
    (on-arvo:def [wire sign-arvo])
  ?.  ?=([%eyre %bound *] sign-arvo)
    (on-arvo:def [wire sign-arvo])
  ~?  !accepted.sign-arvo
    %eyre-rejected-tally-binding
  `this
::
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-fail   on-fail:def
--
|_  bol=bowl:gall
++  make-index
  |=  rid=@ta
  ^-  (list card)
  %+  make-200
    rid
  %-  as-octs:mimes:html
  %-  crip
  %-  en-xml:html
  (index bol by-group voted withdrawn)
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
::
++  give-http
  |=  [rid=@ta hed=response-header:http dat=(unit octs)]
  ^-  (list card)
  :~  [%give %fact ~[/http-response/[rid]] %http-response-header !>(hed)]
      [%give %fact ~[/http-response/[rid]] %http-response-data !>(dat)]
      [%give %kick ~[/http-response/[rid]] ~]
  ==
::
++  make-ring-members
  |=  =gid
  ^-  (set [=ship =life])
  =/  invited=(list @p)  ~(tap in (get-members gid))
  =|  members=(set [=ship =life])
  |-
  ?~  invited
    members
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
    invited  t.invited
    members  (~(put in members) [i.invited u.lyfe])
  ==
::
++  get-members
  |=  =gid
  ^-  (set ship)
  %-  ~(gas in *(set ship))
  %+  skim
    %~  tap  in
    =<  members
    %-  fall
    :_  *group:g
    .^  (unit group:g)
      %gx
      (scot %p our.bol)
      %group-store
      (scot %da now.bol)
      /groups/ship/(scot %p p.gid)/[q.gid]/noun
    ==
  |=  =ship
  ?|  =(our.bol ship)
      ?=(?(%czar %king %duke) (clan:title ship))
  ==
--
```

### Marks

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
/-  *tally
|_  act=action
++  grow
  |%
  ++  noun  act
  --
++  grab
  |%
  ++  noun  action
  --
++  grad  %noun
--
```

#### `%tally-update`

```hoon {% copy=true %}
/-  *tally
|_  upd=update
++  grow
  |%
  ++  noun  upd
  --
++  grab
  |%
  ++  noun  update
  --
++  grad  %noun
--
```

### Front-end

We could have put the front-end code directly in our Gall agent, but it tends to
be quite large so it's convenient to have it in a separate file and just import
it. Most of this file consists of Sail code, which is the internal HTML
representation, similar to other server-side renderings like Clojure's Hiccup.

Save the code below in `tally/app/tally/index.hoon`.

```hoon {% copy=true mode="collapse" %}
/-  *tally, ms=metadata-store, g=group
/+  *mip
|=  [bol=bowl:gall =by-group voted=(set pid) withdrawn=(set pid)]
=<
=/  all-group-names=(list (pair gid @t))  all-group-names
=/  group-names  (get-group-names ~(tap in ~(key by by-group)))
|^  ^-  manx
;html
  ;head
    ;title: Tally
    ;meta(charset "utf-8");
    ;style
      ;+  ;/  style
    ==
  ==
  ;body
    ;h1: tally
    ;h2: subscriptions
    ;form(method "post")
      ;select
        =name      "s-gid"
        =required  ""
        ;*  (group-options-component %.n %.n)
      ==
      ;input(id "s", type "submit", value "watch");
    ==
    ;form(method "post")
      ;select
        =name      "u-gid"
        =required  ""
        ;*  (group-options-component %.n %.y)
      ==
      ;input(id "u", type "submit", value "leave");
    ==
    ;h2: new poll
    ;form(method "post")
      ;label(for "n-gid"): group:
      ;select
        =id        "n-gid"
        =name      "n-gid"
        =required  ""
        ;*  (group-options-component %.y %.y)
      ==
      ;br;
      ;label(for "n-days"): duration:
      ;input
        =type         "number"
        =id           "n-days"
        =name         "n-days"
        =min          "1"
        =step         "1"
        =required     ""
        =placeholder  "days"
        ;+  ;/("")
      ==
      ;br;
      ;label(for "n-proposal"): proposal:
      ;input
        =type      "text"
        =id        "n-proposal"
        =name      "n-proposal"
        =size      "50"
        =required  ""
        ;+  ;/("")
      ==
      ;br;
      ;input(id "submit", type "submit", value "submit");
    ==
    ;h2: groups
    ;*  ?~  group-names
          ~[;/("")]
        (turn group-names group-component)
  ==
==
::
++  group-options-component
  |=  [our=? in-subs=?]
  ^-  marl
  =/  names=(list (pair gid @t))  all-group-names
  =/  subs=(set gid)
    %-  ~(gas in *(set gid))
    %+  turn  ~(tap by wex.bol)
    |=  [[=wire *] *]
    ^-  gid
    ?>  ?=([@ @ ~] wire)
    [(slav %p i.wire) i.t.wire]
  =?  names  &(our in-subs)
    (skim names |=((pair gid @t) |(=(our.bol p.p) (~(has in subs) p))))
  =?  names  &(!our in-subs)
    (skim names |=((pair gid @t) (~(has in subs) p)))
  =?  names  &(!our !in-subs)
    (skip names |=((pair gid @t) |(=(our.bol p.p) (~(has in subs) p))))
  %+  turn  names
  |=  (pair gid @t)
  ^-  manx
  ;option(value "{=>(<p.p> ?>(?=(^ .) t))}_{(trip q.p)}"): {(trip q)}
::
++  group-component
  |=  (pair gid @t)
  ^-  manx
  =/  polls=(list [=pid =poll =votes])
    ~(tap by (~(got by by-group) p))
  =/  open=@ud
    %-  lent
    %+  skim  polls
    |=  [* =poll *]
    (gth expiry.poll now.bol)
  =/  title=tape
    %+  weld  (trip q)
    ?:  =(0 open)
      ""
    " ({(a-co:co open)})"
  ;details(id "{=>(<p.p> ?>(?=(^ .) t))}_{(trip q.p)}", open "open")
    ;summary
      ;h3: {title}
    ==
    ;*  (group-polls-component p polls)
  ==
::
++  group-polls-component
  |=  [=gid =(list [=pid =poll =votes])]
  ^-  marl
  %+  turn
    %+  sort  list
    |=  [a=[* =poll *] b=[* =poll *]]
    (gth expiry.poll.a expiry.poll.b)
  (cury poll-component gid)
::
++  poll-component
  |=  [=gid =pid =poll =votes]
  ^-  manx
  ;table(id (a-co:co pid))
    ;tr
      ;th: proposal:
      ;td: {(trip proposal.poll)}
    ==
    ;+  ?.  ?|  =(our.bol p.gid)
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
            ;form(method "post")
              ;input
                =type  "hidden"
                =name  "w-gid"
                =value  "{=>(<p.gid> ?>(?=(^ .) t))}_{(trip q.gid)}"
                ;+  ;/("")
              ==
              ;input(type "hidden", name "w-pid", value (a-co:co pid));
              ;input(type "submit", value "withdraw?");
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
            ;form(method "post")
              ;input
                =type   "hidden"
                =name   "v-gid"
                =value  "{=>(<p.gid> ?>(?=(^ .) t))}_{(trip q.gid)}"
                ;+  ;/("")
              ==
              ;input(type "hidden", name "v-pid", value (a-co:co pid));
              ;input(id "yea", type "submit", name "v-choice", value "yea");
              ;input(id "nay", type "submit", name "v-choice", value "nay");
            ==
          ==
        ==
  ==
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
++  style
  ^~
  ^-  tape
  %-  trip
  '''
  * {font-family: monospace}
  h3 {display: inline}
  table {margin: 1em}
  th {text-align: right; vertical-align: middle;}
  td {padding-left: 1em; vertical-align: middle;}
  td form {margin: 0}
  label {
    display: inline-block;
    margin-right: 1em;
    min-width: 9ch;
    vertical-align: middle;
  }
  select {min-width: 8ch}
  #s, #u {margin-left: 1ch}
  #submit {margin-top: 1em}
  #yea {margin-right: 1ch}
  '''
--
::
|%
++  our-groups
  ^-  (set gid)
  %-  ~(rep in get-groups)
  |=  [a=gid b=(set gid)]
  ?.  =(p.a our.bol)
    b
  (~(put in b) a)
::
++  get-group-names
  |=  groups=(list gid)
  ^-  (list (pair gid @t))
  %+  sort
    %+  turn  groups
    |=  =gid
    ^-  (pair ^gid @t)
    =/  group-data
      .^  (unit association:ms)
        %gx
        (scot %p our.bol)
        %metadata-store
        (scot %da now.bol)
        /metadata/groups/ship/(scot %p p.gid)/[q.gid]/noun
      ==
    ?~  group-data
      [gid q.gid]
    [gid title.metadatum.u.group-data]
  |=([[* a=@] [* b=@]] (aor a b))
::
++  all-group-names
  ^-  (list (pair gid @t))
  (get-group-names ~(tap in get-groups))
::
++  get-groups
  ^-  (set gid)
  %.  head
  %~  run  in
  %.  %groups
  %~  get  ju
  .^  (jug app-name:ms [gid *])
    %gy
    (scot %p our.bol)
    %metadata-store
    (scot %da now.bol)
    /app-indices
  ==
++  our-life
  .^  life
    %j
    (scot %p our.bol)
    %life
    (scot %da now.bol)
    /(scot %p our.bol)
  ==
--
```

### Desk config

With our types, agent, mark files and front-end now complete, the last thing we
need are some desk configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `tally` directory:

```shell {% copy=true %}
cd tally
echo "[%zuse 418]" > sys.kelvin
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

### Put it together

Our app is now complete, so let's try it out. In the Dojo of our fake ~zod,
we'll create a new desk (filesystem repo) by forking from an existing one:

```
|merge %tally our %webterm
```

Next, we'll mount the desk so we can access it from the host OS:

```
|mount %tally
```

Currently its contents are the same as the `%webterm` desk, so we'll need to
delete those files and copy in our own instead. In the normal shell, do the
following:

```shell {% copy=true %}
rm -r zod/tally/*
cp -r tally/* zod/tally/*
```

Back in the Dojo again, we can now commit those files and install the app:

```
|commit %tally
|install our %tally
```

If we open a web browser and go to `localhost:8080`, we should see a tile for
the Tally app. If we click on it, it'll open our React front-end and we can start
using it.

Once we've confirmed it's working on our fake ~zod, we can shut it down with
`|exit` or CTRL-D and try installing it on a real ship instead. To do that, we
can just repeat the steps in this section with our actual ship. On the live
network, we can also publish the app so others can install it from us. To do so,
just run the following command:

```
:treaty|publish %tally
```

Now our friends will be able to install it with `|install <our ship> %tally`
or by searching for `<our ship>` on their ship's homescreen.

## Code commentary

### Types

A poll is the following structure:

```hoon
+$  poll
  $:  creator=@p
      proposal=@t
      expiry=@da
      =gid
      =ring-group
  ==
```

The `ring-group` is a structure from `/sur/ring.hoon`, and contains the set of
all participants, their key revisions, and a "linkage scope", which is used to
associate votes with a particular poll and detect duplicates. We just set the
linkage scope to the poll ID (`pid`).

The `action` structure defines what requests/actions can be sent or received in *pokes* (one-off messages):

```hoon
+$  action
  $%  [%new proposal=@t days=@ud =gid]
      [%vote =gid =pid =vote]
      [%watch =gid]
      [%leave =gid]
      [%withdraw =gid =pid]
  ==
```

The `update` structure defines what updates/events can be sent out to subscribers or received from people to who we've subscribed:

```hoon
+$  update
  $%  [%init polls=(map pid [=poll =votes])]
      [%vote =pid =vote]
      [%new =pid =poll]
      [%withdraw =pid]
  ==
```

### Agent

Gall is the userspace application management vane (kernel module). Userspace
applications are called *agents*.

Our agent imports the structure file we create, some structures for dealing
with groups and their metadata, some utility libraries including the ring
signature library, and our `index.hoon` front-end file.

The agent's state is defined as:

```hoon
+$  state-0  [%0 =by-group voted=(set pid) withdrawn=(set pid)]
```

The `by-group` structure is `mip`, which is a map of map. The first set of keys
is the group ID, and then for each group there is a map from poll ID to the poll
and associated votes. We additionally have `voted` and `withdrawn` to keep track
of actions we've taken so the front-end will update instantly rather than having
to wait for a remote ship to acknowledge the request.

A Gall agent has ten event handler *arms*. Most agent arms produce the same two
things: a list of effects to be emitted, and a new version of the agent itself,
typically with an updated state. It thus behaves much like a state machine,
performing the function `(events, old-state) => (effects, new-state)`. We'll
look at some of our agent's significant arms:

#### `on-init`

This arm is called exactly once, when the agent is first installed. We just
pass a `task` to Eyre, the web-server vane, to bind the `/tally`
URL path so visiting that will load our front-end:

```hoon
[%pass /bind %arvo %e %connect `/'tally' %tally]~
```

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
request ID. If it's a POST request, it checks the key-value pairs to see what
kind of request it is (vote, new poll, subscribe request, etc), converts the
request into an `action`, calls `handle-action` to process it, and then sends a
302 redirect back to the index to reload the page.

#### `on-watch`

This arm handles subscription requests, which will either come from Eyre when
waiting for a response to an HTTP request, or from other ships who want to
subscribe to polls for a group we host. In the latter case, we make sure they're
a member and then send them out the current state of the polls for that group.

#### `on-agent`

This arm handles updates from people we've subscribed to, which will be other
groups we're a member of. The messages we'll receive here will contain
`update`s, which we'll process in a similar manner to the `action`s in
`on-poke`. All incoming votes will be validated here also.

#### Helper core

Below the agent proper, we have some additional useful functions, such as
retrieving group members from the Groups app and putting together HTTP
responses.

### Front-end

As mentioned previously, our front-end is written in *Sail*, and contained in a
separate `index.hoon` file which our agent imports. Sail lets us easily build
XML structures inside hoon, and looks like this:

```hoon
;html
  ;head
    ;title: Tally
    ;meta(charset "utf-8");
    ;style
      ;+  ;/  style
    ==
  ==
  ;body
    ;h1: tally
    ;h2: subscriptions
    ;form(method "post")
      ;select
        =name      "s-gid"
        =required  ""
        ;*  (group-options-component %.n %.n)
      ==
      ;input(id "s", type "submit", value "watch");
    ==
..........
```

Most of `index.hoon` contains the various front-end components like this. It
also contains some functions to retrieve lists of groups, group metadata,
current subscriptions, etc.

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
