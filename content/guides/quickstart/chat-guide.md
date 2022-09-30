+++
title = "Build a Chat App"
weight = 3
+++

In this lightning tutorial, we're going to build a simple chat app named Hut. It'll
look like this:

![hut screenshot](https://media.urbit.org/guides/quickstart/chat-guide/hut-v2-screenshot.png)

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

### Dependencies

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
cp dev-comet/squad/mar/{bill*,hoon*,json*,kelvin*,mime*,noun*,ship*,txt*,docket-0*} hut/mar/
cp dev-comet/squad/lib/{agentio*,dbug*,default-agent*,skeleton*,docket*} hut/lib/
cp dev-comet/squad/sur/{docket*, squad*} hut/sur/
cp dev-comet/garden/lib/mip.hoon hut/lib/
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
/-  *squad
|%
+$  msg      [who=@p what=@t]
+$  msgs     (list msg)
+$  name     @tas
+$  hut      [=gid =name]
::
+$  huts     (jug gid name)
+$  msg-jar  (jar hut msg)
+$  joined   (jug gid @p)
::
+$  hut-act
  $%  [%new =hut =msgs]
      [%post =hut =msg]
      [%join =gid who=@p]
      [%quit =gid who=@p]
      [%del =hut]
  ==
+$  hut-upd
  $%  [%init =huts =msg-jar =joined]
      [%init-all =huts =msg-jar =joined]
      hut-act
  ==
--
```

### Agent

With all the types now defined, we can create the app itself. Gall agents live
in the `/app` directory of a desk, so you can save this code in
`hut/app/hut.hoon`:

```hoon {% copy=true mode="collapse" %}
/-  *hut, *squad
/+  default-agent, dbug, agentio
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =huts =msg-jar =joined]
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
  :~  (~(watch-our pass:io /squad) %squad /local/all)
  ==
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
    (local !<(hut-act vase))
  (remote !<(hut-act vase))
  ++  local
    |=  act=hut-act
    ^-  (quip card _this)
    ?-    -.act
        %post
      =/  =path
        /(scot %p host.gid.hut.act)/[name.gid.hut.act]
      ?.  =(our.bol host.gid.hut.act)
        :_  this
        :~  (~(poke pass:io path) [host.gid.hut.act %hut] [mark vase])
        ==
      =/  =msgs  (~(get ja msg-jar) hut.act)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.act msgs]
        [msg.act (snip msgs)]
      :_  this(msg-jar (~(put by msg-jar) hut.act msgs))
      :~  (fact:io hut-did+vase path /all ~)
      ==
    ::
        %join
      ?<  =(our.bol host.gid.act)
      =/  =path
        /(scot %p host.gid.act)/[name.gid.act]
      :_  this
      :~  (~(watch pass:io path) [host.gid.act %hut] path)
      ==
    ::
        %quit
      =/  =path
        /(scot %p host.gid.act)/[name.gid.act]
      =/  to-rm=(list hut)
        %+  turn  ~(tap in (~(get ju huts) gid.act))
        |=(=name `hut`[gid.act name])
      =.  msg-jar
        |-
        ?~  to-rm  msg-jar
        $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
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
        %new
      ?>  =(our.bol host.gid.hut.act)
      ?>  (has-squad:hc gid.hut.act)
      ?<  (~(has ju huts) gid.hut.act name.hut.act)
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
        %del
      ?>  =(our.bol host.gid.hut.act)
      =/  =path
        /(scot %p host.gid.hut.act)/[name.gid.hut.act]
      :-  :~  (fact:io hut-did+vase path /all ~)
          ==
      %=  this
        huts     (~(del ju huts) gid.hut.act name.hut.act)
        msg-jar  (~(del by msg-jar) hut.act)
      ==
    ==
  ++  remote
    |=  act=hut-act
    ?>  ?=(%post -.act)
    ^-  (quip card _this)
    ?>  =(our.bol host.gid.hut.act)
    ?>  (~(has by huts) gid.hut.act)
    ?>  =(src.bol who.msg.act)
    ?>  (~(has ju joined) gid.hut.act src.bol)
    =/  =path  /(scot %p host.gid.hut.act)/[name.gid.hut.act]
    =/  =msgs  (~(get ja msg-jar) hut.act)
    =.  msgs
      ?.  (lte 50 (lent msgs))
        [msg.act msgs]
      [msg.act (snip msgs)]
    :_  this(msg-jar (~(put by msg-jar) hut.act msgs))
    :~  (fact:io hut-did+vase path /all ~)
    ==
  --
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?:  ?=([%squad ~] wire)
    ?+    -.sign  (on-agent:def wire sign)
        %kick
      :_  this
      :~  (~(watch-our pass:io /squad) %squad /local/all)
      ==
    ::
        %watch-ack
      ?~  p.sign  `this
      :_  this
      :~  (~(wait pass:io /behn) (add now.bol ~m1))
      ==
    ::
        %fact
      ?>  ?=(%squad-did p.cage.sign)
      =/  =upd  !<(upd q.cage.sign)
      ?+    -.upd  `this
          %init-all
        =/  gid-to-rm=(list gid)
          ~(tap in (~(dif in ~(key by huts)) ~(key by squads.upd)))
        =.  huts
          |-
          ?~  gid-to-rm  huts
          $(gid-to-rm t.gid-to-rm, huts (~(del by huts) i.gid-to-rm))
        =.  joined
          |-
          ?~  gid-to-rm  joined
          $(gid-to-rm t.gid-to-rm, joined (~(del by joined) i.gid-to-rm))
        =/  hut-to-rm=(list hut)
          %-  zing
          %+  turn  gid-to-rm
          |=  =gid
          (turn ~(tap in (~(get ju huts) gid)) |=(=name `hut`[gid name]))
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
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
        [cards this(huts huts, msg-jar msg-jar, joined joined)]
      ::
          %del
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        =/  to-rm=(list hut)
          %+  turn  ~(tap in (~(get ju huts) gid.upd))
          |=(=name `hut`[gid.upd name])
        =.  msg-jar
          |-
          ?~  to-rm  msg-jar
          $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
        :_  %=  this
              huts     (~(del by huts) gid.upd)
              msg-jar  msg-jar
              joined   (~(del by joined) gid.upd)
            ==
        :+  (kick:io path ~)
          (fact:io hut-did+!>(`hut-upd`[%quit gid.upd our.bol]) /all ~)
        ?:  =(our.bol host.gid.upd)
          ~
        ~[(~(leave-path pass:io path) [host.gid.upd %tally] path)]
      ::
          %kick
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        ?.  =(our.bol ship.upd)
          :_  this(joined (~(del ju joined) gid.upd ship.upd))
          :-  (kick-only:io ship.upd path ~)
          ?.  (~(has ju joined) gid.upd ship.upd)
            ~
          ~[(fact:io hut-did+!>(`hut-upd`[%quit gid.upd ship.upd]) path /all ~)]
        =/  hut-to-rm=(list hut)
          (turn ~(tap in (~(get ju huts) gid.upd)) |=(=name `hut`[gid.upd name]))
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
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
          %leave
        =/  =path  /(scot %p host.gid.upd)/[name.gid.upd]
        ?.  =(our.bol ship.upd)
          ?.  (~(has ju joined) gid.upd ship.upd)
            `this
          :_  this(joined (~(del ju joined) gid.upd ship.upd))
          :~  (kick-only:io ship.upd path ~)
              %+  fact:io
                hut-did+!>(`hut-upd`[%quit gid.upd ship.upd])
              ~[path /all]
          ==
        =/  hut-to-rm=(list hut)
          (turn ~(tap in (~(get ju huts) gid.upd)) |=(=name `hut`[gid.upd name]))
        =.  msg-jar
          |-
          ?~  hut-to-rm  msg-jar
          $(hut-to-rm t.hut-to-rm, msg-jar (~(del by msg-jar) i.hut-to-rm))
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
  ?>  ?=([@ @ ~] wire)
  =/  =gid  [(slav %p i.wire) i.t.wire]
  ?+    -.sign  (on-agent:def wire sign)
      %watch-ack
    ?~  p.sign  `this
    =/  to-rm=(list hut)
      %+  turn  ~(tap in (~(get ju huts) gid))
      |=(=name `hut`[gid name])
    =.  msg-jar
      |-
      ?~  to-rm  msg-jar
      $(to-rm t.to-rm, msg-jar (~(del by msg-jar) i.to-rm))
    :-  :~  (fact:io hut-did+!>(`hut-upd`[%quit gid our.bol]) /all ~)
        ==
    %=  this
      huts     (~(del by huts) gid)
      msg-jar  msg-jar
      joined   (~(del by joined) gid)
    ==
  ::
      %kick
    :_  this
    :~  (~(watch pass:io wire) [host.gid %hut] wire)
    ==
  ::
      %fact
    ?>  ?=(%hut-did p.cage.sign)
    =/  upd  !<(hut-upd q.cage.sign)
    ?+    -.upd  (on-agent:def wire sign)
        %init
      ?.  =([gid ~] ~(tap in ~(key by huts.upd)))
        `this
      ?.  =([gid ~] ~(tap in ~(key by joined.upd)))
        `this
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
        %post
      ?.  =(gid gid.hut.upd)
        `this
      =/  msgs  (~(get ja msg-jar) hut.upd)
      =.  msgs
        ?.  (lte 50 (lent msgs))
          [msg.upd msgs]
        [msg.upd (snip msgs)]
      :_  this(msg-jar (~(put by msg-jar) hut.upd msgs))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
        %join
      ?.  =(gid gid.upd)
        `this
      :_  this(joined (~(put ju joined) gid who.upd))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
        %quit
      ?.  =(gid gid.upd)
        `this
      :_  this(joined (~(del ju joined) gid who.upd))
      :~  (fact:io cage.sign /all ~)
      ==
    ::
        %del
      ?.  =(gid gid.hut.upd)
        `this
      :-  :~  (fact:io cage.sign /all ~)
          ==
      %=  this
        huts     (~(del ju huts) hut.upd)
        msg-jar  (~(del by msg-jar) hut.upd)
      ==
    ==
  ==
::
++  on-watch
  |=  =path
  |^  ^-  (quip card _this)
  ?:  ?=([%all ~] path)
    ?>  =(our.bol src.bol)
    :_  this
    :~  %-  fact-init:io
        hut-did+!>(`hut-upd`[%init-all huts msg-jar joined])
    ==
  ?>  ?=([@ @ ~] path)
  =/  =gid  [(slav %p i.path) i.t.path]
  ?>  =(our.bol host.gid)
  ?>  (is-allowed:hc gid src.bol)
  :_  this(joined (~(put ju joined) gid src.bol))
  :-  (init gid)
  ?:  (~(has ju joined) gid src.bol)
    ~
  ~[(fact:io hut-did+!>(`hut-upd`[%join gid src.bol]) /all path ~)]
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
::
++  on-leave
  |=  =path
  ^-  (quip card _this)
  ?:  ?=([%all ~] path)
    `this
  ?>  ?=([@ @ ~] path)
  =/  =gid  [(slav %p i.path) i.t.path]
  =/  last=?
    %+  gte  1
    (lent (skim ~(val by sup.bol) |=([=@p *] =(src.bol p))))
  :_  this(joined (~(del ju joined) gid src.bol))
  ?.  last
    ~
  :~  (fact:io hut-did+!>(`hut-upd`[%quit gid src.bol]) /all path ~)
  ==
::
++  on-peek  on-peek:def
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%behn ~] wire)
    (on-arvo:def [wire sign-arvo])
  ?>  ?=([%behn %wake *] sign-arvo)
  ?~  error.sign-arvo
    :_  this
    :~  (~(watch-our pass:io /squad) %squad /local/all)
    ==
  :_  this
  :~  (~(wait pass:io /behn) (add now.bol ~m1))
  ==
++  on-fail  on-fail:def
--
::
|_  bol=bowl:gall
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
|_  a=hut-act
++  grow
  |%
  ++  noun  a
  --
++  grab
  |%
  ++  noun  hut-act
  ++  json
    =,  dejs:format
    |=  jon=json
    |^  ^-  hut-act
    %.  jon
    %-  of
    :~  new+(ot ~[hut+de-hut msgs+(ar de-msg)])
        post+(ot ~[hut+de-hut msg+de-msg])
        join+(ot ~[gid+de-gid who+(se %p)])
        quit+(ot ~[gid+de-gid who+(se %p)])
        del+(ot ~[hut+de-hut])
    ==
    ++  de-msg  (ot ~[who+(se %p) what+so])
    ++  de-hut  (ot ~[gid+de-gid name+(se %tas)])
    ++  de-gid  (ot ~[host+(se %p) name+(se %tas)])
    --
  --
++  grad  %noun
--
```

#### `%hut-did`

```hoon {% copy=true mode="collapse" %}
/-  *hut
|_  u=hut-upd
++  grow
  |%
  ++  noun  u
  ++  json
    =,  enjs:format
    |^  ^-  ^json
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
    ++  en-msg-jar
      |=  =msg-jar
      ^-  ^json
      :-  %a
      %+  turn  ~(tap by msg-jar)
      |=  [=hut =msgs]
      (pairs ~[['hut' (en-hut hut)] ['msgs' (en-msgs msgs)]])
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
    ++  en-msgs  |=(=msgs `^json`a+(turn (flop msgs) en-msg))
    ++  en-msg
      |=  =msg
      ^-  ^json
      (pairs ~[['who' s+(scot %p who.msg)] ['what' s+what.msg]])
    ++  en-hut
      |=  =hut
      ^-  ^json
      (pairs ~[['gid' (en-gid gid.hut)] ['name' s+name.hut]])
    ++  en-gid
      |=  =gid
      ^-  ^json
      (pairs ~[['host' s+(scot %p host.gid)] ['name' s+name.gid]])
    --
  --
++  grab
  |%
  ++  noun  hut-upd
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

### Put it together

Our app is now complete, so let's try it out. In the Dojo of our comet,
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
rm -r dev-comet/hut/*
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

## Code commentary

### Types

We're making a chat app, so a message (`msg`) needs to contain the author and
the text. A chat room (`hut`) will be identified by the Squad `gid` (group ID)
it belongs to, as well as a name for the hut itself:

```hoon
+$  msg      [who=@p what=@t]
+$  msgs     (list msg)
+$  name     @tas
+$  hut      [=gid =name]
```

Our app state will contain a map from `gid` to `hut`s for that group. It will
also contain a map from `hut` to that hut's `msgs`. We also need to keep track
of who has actually joined, so we'll add a map from `gid` to a `(set ship)`:

```hoon
+$  huts     (jug gid name)
+$  msg-jar  (jar hut msg)
+$  joined   (jug gid @p)
```

For the actions/requests our app will accept, we'll need the following:

1. Create a new hut.
2. Post a message to a hut.
3. Subscribe to huts for a group.
4. Unsubscribe.
5. Delete an individual hut if we're the host.

Remote ships will only be able to do #2, while our own ship and front-end will
be able to perform any of these actions.

The structure for these actions is called `hut-act` and looks like so:

```hoon
+$  hut-act
  $%  [%new =hut =msgs]
      [%post =hut =msg]
      [%join =gid who=@p]
      [%quit =gid who=@p]
      [%del =hut]
  ==
```

We also need to be able to send these events/updates out to subscribers:

1. The initial state of the huts for a particular group.
2. The state of all huts (this is for our front-end only).
3. Any of the actions above.

This structure for these updates is called `hut-upd` and looks like so:

```hoon
+$  hut-upd
  $%  [%init =huts =msg-jar =joined]
      [%init-all =huts =msg-jar =joined]
      hut-act
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

### Marks

The kernel module Clay is a typed filesystem, and marks are its filetypes. As
well as defining the type, a mark also specifies methods for converting to and
from other marks, as well as revision control functions. Our agent doesn't need
to save files in Clay, but marks aren't just used for files - they're used for
all data from the outside world like other ships or the front-end. Marks serve
the same purpose as MIME types, but are much more powerful.

Our agent needs to talk to the front-end in JSON, but it takes and produces
ordinary Hoon types. We therefore need a way to decode inbound JSON to a
`hut-act`, and encode an outbound `hut-upd` as JSON when we send the front-end
an update. This is the main thing our mark files are going to do. The utility
library Zuse contains many ready-made functions for decoding and encoding JSON,
so we use those to write our JSON functions.

### React app

There are a fair few functions our front-end uses, so we'll just look at a
handful. The first is `doPoke`, which (as the name suggests) sends a poke to a
ship. It takes the poke in JSON form. It then calls the `poke` method of our
`Urbit` object to perform the poke.

```javascript
doPoke = jon => {
  window.urbit.poke({
    app: "hut",
    mark: "hut-do",
    json: jon,
  })
};
```

Here's an example of a `%join`-type `act` in JSON form:

```javascript
joinGid = () => {
  const joinSelect = this.state.joinSelect
  if (joinSelect === "def") return;
  const [host, name] = joinSelect.split("/");
  this.doPoke(
    {"join": {
      "gid" : {"host": host, "name": name},
      "who" : this.our
    }}
  );
  this.setState({joinSelect: "def"})
};
```

Our front-end will subscribe to updates for all groups our `%hut` agent is
currently tracking. To do so, it calls the `subscribe` method of the `Urbit`
object with the `path` to subscribe to and an `event` callback to handle each
update it receives. Our agent publishes all updates on the local-only `/all`
path.

```javascript
subscribe = () => {
  window.urbit.subscribe({
    app: "hut",
    path: "/all",
    event: this.handleUpdate
  });
};
```

Here's the `handleUpdate` function we gave as a callback. The update will be one
of our `hut-upd` types in JSON form, so we just switch on the type and handle it
as appropriate.

```javascript {% mode="collapse" %}
handleUpdate = upd => {
  const {huts, msgJar, joined, currentGid, currentHut} = this.state;
  if ("initAll" in upd) {
    upd.initAll.huts.forEach(obj =>
      huts.set(this.gidToStr(obj.gid), new Set(obj.names))
    );
    this.setState({
      huts: huts,
      msgJar: new Map(
        upd.initAll.msgJar.map(obj => [this.hutToStr(obj.hut), obj.msgs])
      ),
      joined: new Map(
        upd.initAll.joined.map(obj =>
          [this.gidToStr(obj.gid), new Set(obj.ppl)]
        )
      )
    })
  } else if ("init" in upd) {
    upd.init.msgJar.forEach(obj =>
      msgJar.set(this.hutToStr(obj.hut), obj.msgs)
    );
    this.setState({
      msgJar: msgJar,
      huts: huts.set(
        this.gidToStr(upd.init.huts[0].gid),
        new Set(upd.init.huts[0].names)
      ),
      joined: joined.set(
        this.gidToStr(upd.init.joined[0].gid),
        new Set(upd.init.joined[0].ppl)
      )
    })
  } else if ("new" in upd) {
    const gidStr = this.gidToStr(upd.new.hut.gid);
    const hutStr = this.hutToStr(upd.new.hut);
    (huts.has(gidStr))
      ? huts.get(gidStr).add(upd.new.hut.name)
      : huts.set(gidStr, new Set(upd.new.hut.name));
    this.setState({
      huts: huts,
      msgJar: msgJar.set(hutStr, upd.new.msgs)
    })
  } else if ("post" in upd) {
    const hutStr = this.hutToStr(upd.post.hut);
    (msgJar.has(hutStr))
      ? msgJar.get(hutStr).push(upd.post.msg)
      : msgJar.set(hutStr, [upd.post.msg]);
    this.setState(
      {msgJar: msgJar},
      () => {
        (hutStr === this.state.currentHut)
          && this.scrollToBottom();
      }
    )
  } else if ("join" in upd) {
    const gidStr = this.gidToStr(upd.join.gid);
    (joined.has(gidStr))
      ? joined.get(gidStr).add(upd.join.who)
      : joined.set(gidStr, new Set([upd.join.who]));
    this.setState({joined: joined})
  } else if ("quit" in upd) {
    const gidStr = this.gidToStr(upd.quit.gid);
    if ("~" + window.ship === upd.quit.who) {
      (huts.has(gidStr)) &&
        huts.get(gidStr).forEach(name =>
          msgJar.delete(gidStr + "/" + name)
        );
      huts.delete(gidStr);
      joined.delete(gidStr);
      this.setState({
        msgJar: msgJar,
        huts: huts,
        joined: joined,
        currentGid: (currentGid === gidStr)
          ? null : currentGid,
        currentHut: (currentHut === null) ? null :
          (
            currentHut.split("/")[0] + "/" + currentHut.split("/")[1]
              === gidStr
          )
          ? null : currentHut,
        make: (currentGid === gidStr) ? "" : this.state.make
      })
    } else {
      (joined.has(gidStr)) &&
        joined.get(gidStr).delete(upd.quit.who);
      this.setState({joined: joined})
    }
  } else if ("del" in upd) {
    const gidStr = this.gidToStr(upd.del.hut.gid);
    const hutStr = this.hutToStr(upd.del.hut);
    (huts.has(gidStr)) &&
      huts.get(gidStr).delete(upd.del.hut.name);
    msgJar.delete(hutStr);
    this.setState({
      huts: huts,
      msgJar: msgJar,
      currentHut: (currentHut === hutStr) ? null : currentHut
    })
  }
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
join the `~hiddev-dannut/new-hooniverse` group on Urbit.
