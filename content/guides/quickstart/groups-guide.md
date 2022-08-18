+++
title = "Build a Groups app"
weight = 2
+++

In this lightning tutorial, we're going to build an app to create groups called
Squad. It'll look like this:

![squad screenshot](https://media.urbit.org/guides/quickstart/groups-app/squad-screenshot.png)

We'll be able to create either public groups or private groups. Private groups
will have a whitelist of allowed ships, and public groups will have a blacklist
of banned ships. Other ships will be able to join groups we create, and we'll be
able to join groups hosted by other ships too. This app isn't terribly useful by
itself, but its API will be used by the other apps we'll build in these
lightning tutorials.

The front-end of the app will be written in
[Sail](/reference/glossary/sailudon), Urbit's XML language built into the Hoon
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

### Dependencies

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
cp dev-comet/base/mar/{bill*,hoon*,json*,kelvin*,mime*,noun*,ship*,txt*} squad/mar/
cp dev-comet/base/lib/{agentio*,dbug*,default-agent*,skeleton*} squad/lib/
cp dev-comet/garden/mar/docket-0.hoon squad/mar/
cp dev-comet/garden/lib/docket.hoon squad/lib/
cp dev-comet/garden/sur/docket.hoon squad/sur/
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
following code in `squad/sur/squad.hoon`:

```hoon {% copy=true mode="collapse" %}
|%
+$  gid  [host=@p name=@tas]
+$  title  @t
+$  ppl  (set @p)
+$  squad  [=title pub=?]
::
+$  squads  (map gid squad)
+$  acls  (jug gid @p)
+$  members  (jug gid @p)
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
+$  page  [sect=@t gid=(unit gid) success=?]
--
```

### Agent

With all the types now defined, we can create the app itself. Gall agents live
in the `/app` directory of a desk, so you can save this code in
`squad/app/squad.hoon`:

```hoon {% copy=true mode="collapse" %}
/-  *squad
/+  default-agent, dbug, agentio
/=  index  /app/squad/index
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =squads =acls =members =page]
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
++  on-init
  ^-  (quip card _this)
  :_  this
  :-  (~(arvo pass:io /bind) %e %connect `/'squad' %squad)
  ?:  =(~pocwet our.bol)  ~
  ~[(~(watch pass:io /hello) [~pocwet %squad] /hello)]
++  on-save  !>(state)
++  on-load
  |=  old-vase=vase
  ^-  (quip card _this)
  [~ this(state !<(state-0 old-vase))]
::
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
  ++  handle-http
    |=  [rid=@ta req=inbound-request:eyre]
    ^-  (quip card _state)
    ?.  authenticated.req
      :_  state
      (give-http rid [307 ['Location' '/~/login?redirect='] ~] ~)
    ?+  method.request.req
      :_  state
      %^    give-http
          rid
        :-  405
        :~  ['Content-Type' 'text/html']
            ['Content-Length' '31']
            ['Allow' 'GET, POST']
        ==
      (some (as-octs:mimes:html '<h1>405 Method Not Allowed</h1>'))
    ::
        %'GET'
      :_  state(page *^page)
      (make-200 rid (index bol squads acls members page))
    ::
        %'POST'
      ?~  body.request.req  [(index-redirect rid '/squad') state]
      =/  query=(unit (list [k=@t v=@t]))
        (rush q.u.body.request.req yquy:de-purl:html)
      ?~  query  [(index-redirect rid '/squad') state]
      =/  kv-map=(map @t @t)  (~(gas by *(map @t @t)) u.query)
      =/  =path
        %-  tail
        %+  rash  url.request.req
        ;~(sfix apat:de-purl:html yquy:de-purl:html)
      ?+    path  [(index-redirect rid '/squad') state]
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
        ?:  =(our.bol host.u.u-gid)
          :_  state(page ['join' ~ &])
          (index-redirect rid '/squad#join')
        =^  cards  state  (handle-action %join u.u-gid)
        :_  state(page ['join' ~ &])
        (weld cards (index-redirect rid '/squad#join'))
      ::
          [%squad %new ~]
        ?.  (~(has by kv-map) 'title')
          :_  state(page ['new' ~ |])
          (index-redirect rid '/squad#new')
        =/  title=@t  (~(got by kv-map) 'title')
        =/  pub=?  (~(has by kv-map) 'public')
        =^  cards  state  (handle-action %new title pub)
        :_  state(page ['new' ~ &])
        (weld cards (index-redirect rid '/squad#new'))
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
        =^  cards  state  (handle-action %title u.u-gid title.u.vals)
        :_  state(page ['title' u-gid &])
        (weld cards (index-redirect rid (crip "/squad#{(trip gid-str.u.vals)}")))
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
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =^  cards  state  (handle-action %del u.u-gid)
        :_  state(page ['generic' ~ &])
        (weld cards (index-redirect rid '/squad'))
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
        ?:  =(our.bol host.u.u-gid)
          :_  state(page ['generic' ~ |])
          (index-redirect rid '/squad')
        =^  cards  state  (handle-action %leave u.u-gid)
        :_  state(page ['generic' ~ &])
        (weld cards (index-redirect rid '/squad'))
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
        ?:  =(u.u-ship our.bol)
          :_  state(page ['kick' `u.u-gid |])
          (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
        =^  cards  state  (handle-action %kick u.u-gid u.u-ship)
        :_  state(page ['kick' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
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
        =^  cards  state  (handle-action %allow u.u-gid u.u-ship)
        :_  state(page ['kick' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#acl:{(trip gid-str.u.vals)}"))
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
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['public' `u.u-gid |])
          (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
        =^  cards  state  (handle-action %pub u.u-gid)
        :_  state(page ['public' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
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
        ?.  =(our.bol host.u.u-gid)
          :_  state(page ['public' `u.u-gid |])
          (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
        =^  cards  state  (handle-action %priv u.u-gid)
        :_  state(page ['public' `u.u-gid &])
        %+  weld
          cards
        (index-redirect rid (crip "/squad#{(trip (~(got by kv-map) 'gid'))}"))
      ==
    ==
  ++  handle-action
    |=  =act
    ^-  (quip card _state)
    ?-  -.act
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
        %join
      ?:  |(=(our.bol host.gid.act) (~(has by squads) gid.act))
        `state
      =/  =path  /[name.gid.act]
      :_  state
      :~  (~(watch pass:io path) [host.gid.act %squad] path)
      ==
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
  ::
  ++  index-redirect
    |=  [rid=@ta path=@t]
    ^-  (list card)
    (give-http rid [302 ['Location' path] ~] ~)
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
  --
::
++  on-watch
  |=  =path
  |^  ^-  (quip card _this)
  ?:  &(=(our.bol src.bol) ?=([%http-response *] path))
    `this
  ?:  ?=([%local %all ~] path)
    ?>  =(our.bol src.bol)
    :_  this
    :~  %-  fact-init:io
        squad-did+!>(`upd`[%init-all squads acls members])
    ==
  ?>  ?=([@ ~] path)
  =/  =gid  [our.bol i.path]
  =/  =squad  (~(got by squads) gid)
  ?:  pub.squad
    ?<  (~(has ju acls) gid src.bol)
    ?:  (~(has ju members) gid src.bol)
      [~[(init gid)] this]
    :_  this(members (~(put ju members) gid src.bol))
    :~  (init gid)
        %+  fact:io
          squad-did+!>(`upd`[%join gid src.bol])
        ~[/local/all /[name.gid]]
    ==
  ?>  (~(has ju acls) gid src.bol)
  ?:  (~(has ju members) gid src.bol)
    [~[(init gid)] this]
  :_  this(members (~(put ju members) gid src.bol))
  :~  (init gid)
      %+  fact:io
        squad-did+!>(`upd`[%join gid src.bol])
      ~[/local/all /[name.gid]]
  ==
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
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?>  ?=([@ ~] wire)
  =/  =gid  [src.bol i.wire]
  ?+  -.sign  (on-agent:def wire sign)
      %watch-ack
    ?~  p.sign
      [~ this]
    :_  %=  this
          squads   (~(del by squads) gid)
          acls     (~(del by acls) gid)
          members  (~(del by members) gid)
        ==
    :~  (fact:io squad-did+!>(`upd`[%kick gid our.bol]) ~[/local/all])
    ==
  ::
      %kick
    ?.  (~(has by squads) gid)  `this
    :_  this
    :~  (~(watch pass:io wire) [host.gid %squad] wire)
    ==
  ::
      %fact
    ?>  ?=(%squad-did p.cage.sign)
    =/  =upd  !<(upd q.cage.sign)
    ?+  -.upd  (on-agent:def wire sign)
        %init
      ?.  =(gid gid.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      %=  this
        squads   (~(put by squads) gid squad.upd)
        acls     (~(put by acls) gid acl.upd)
        members  (~(put by members) gid ppl.upd)
      ==
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
        %allow
      ?.  =(gid gid.upd)  `this
      =/  pub=?  pub:(~(got by squads) gid)
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(acls (?:(pub ~(del ju acls) ~(put ju acls)) gid ship.upd))
    ::
        %kick
      ?.  =(gid gid.upd)  `this
      =/  pub=?  pub:(~(got by squads) gid)
      ?.  =(our.bol ship.upd)
        :-  ~[(fact:io cage.sign ~[/local/all])]
        %=  this
          acls  (?:(pub ~(put ju acls) ~(del ju acls)) gid ship.upd)
          members  (~(del ju members) gid ship.upd)
        ==
      :_  %=  this
            squads   (~(del by squads) gid)
            acls     (~(del by acls) gid)
            members  (~(del by members) gid)
          ==
      :~  (fact:io cage.sign ~[/local/all])
          (~(leave-path pass:io wire) [src.bol %squad] wire)
      ==
    ::
        %join
      ?.  =(gid gid.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(members (~(put ju members) gid ship.upd))
    ::
        %leave
      ?.  =(gid gid.upd)  `this
      ?:  =(our.bol ship.upd)  `this
      :-  ~[(fact:io cage.sign ~[/local/all])]
      this(members (~(del ju members) gid ship.upd))
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
::
++  on-leave
  |=  =path
  ^-  (quip card _this)
  ?.  ?=([@ ~] path)  (on-leave:def path)
  ?:  |(=(src.bol our.bol) (~(any by sup.bol) |=([=@p *] =(src.bol p))))
    `this
  =/  =gid  [our.bol i.path]
  :_  this(members (~(del ju members) gid src.bol))
  :~  (fact:io squad-did+!>(`upd`[%leave gid src.bol]) ~[/local/all path])
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+    path  (on-peek:def path)
      [%x %all ~]
    ``noun+!>([squads acls members])
  ::
      [%x %squads ~]
    ``noun+!>(squads)
  ::
      [%x %gids %all ~]
    ``noun+!>(`(set gid)`~(key by squads))
  ::
      [%x %gids %our ~]
    =/  gids=(list gid)  ~(tap by ~(key by squads))
    =.  gids  (skim gids |=(=gid =(our.bol host.gid)))
    ``noun+!>(`(set gid)`(~(gas in *(set gid)) gids))
  ::
      [%x %squad @ @ ~]
    =/  =gid  [(slav %p i.t.t.path) i.t.t.t.path]
    ``noun+!>(`(unit squad)`(~(get by squads) gid))
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
      [%x %members @ @ ~]
    =/  =gid  [(slav %p i.t.t.path) i.t.t.t.path]
    ``noun+!>(`ppl`(~(get ju members) gid))
  ::
      [%x %titles ~]
    :^  ~  ~  %json
    !>  ^-  json
    :-  %a
    %+  turn
      (sort ~(tap by squads) |=([[* a=@t *] [* b=@t *]] (aor a b)))
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
::
++  on-fail  on-fail:def
--
```

### Marks

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
/-  *squad
|_  a=act
++  grow
  |%
  ++  noun  a
  --
++  grab
  |%
  ++  noun  act
  --
++  grad  %noun
--
```

#### `%squad-did`

```hoon {% copy=true %}
/-  *squad
|_  u=upd
++  grow
  |%
  ++  noun  u
  --
++  grab
  |%
  ++  noun  upd
  --
++  grad  %noun
--
```
### Front-end

We could have put the front-end code directly in our Gall agent, but it tends to
be quite large so it's convenient to have it in a separate file and just import
it. Most of this file consists of Sail code, which is the internal HTML
representation, similar to other server-side renderings like Clojure's Hiccup.

Save the code below in `squad/app/squad/index.hoon`.

```hoon {% copy=true mode="collapse" %}
/-  *squad
|=  [bol=bowl:gall =squads =acls =members =page]
|^  ^-  octs
%-  as-octs:mimes:html
%-  crip
%-  en-xml:html
^-  manx
;html
  ;head
    ;title: squad
    ;meta(charset "utf-8");
    ;style
      ;+  ;/  style
    ==
  ==
  ;body
    ;+  ?.  =('generic' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
    ;h2: join
    ;+  join-component
    ;h2: create
    ;+  new-component
    ;+  ?~  squads
          ;/("")
        ;h2: squads
    ;*  %+  turn
          %+  sort  ~(tap by squads)
          |=  [a=[* =title *] b=[* =title *]]
          (aor title.a title.b)
        squad-component
  ==
==
::
++  success-component
  |=  [txt=tape success=?]
  ^-  manx
  ;span(class ?:(success "success" "failure")): {txt}
::
++  join-component
  ^-  manx
  ;form(method "post", action "/squad/join")
    ;input
      =type         "text"
      =id           "join"
      =name         "target-squad"
      =size         "30"
      =required     ""
      =placeholder  "~sampel-palnet/squad-name"
      ;+  ;/("")
    ==
    ;input(type "submit", value "join");
    ;+  ?.  =('join' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "request sent" "failed")
        success.page
  ==
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
    ;label(for "new-pub-checkbox"): Public:
    ;input
      =type   "checkbox"
      =id     "new-pub-checkbox"
      =name   "public"
      =value  "true"
      ;+  ;/("")
    ==
    ;br;
    ;input(type "submit", value "create");
    ;+  ?.  =('new' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
  ==
::
++  squad-component
  |=  [=gid =squad]
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  =/  summary=manx
    ;summary
      ;h3: {(trip title.squad)}
    ==
  =/  content=manx
    ;div
      ;p: id: {<host.gid>}/{(trip name.gid)}
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
    ;input(type "submit", value "change");
    ;+  ?.  &(=('title' sect.page) ?=(^ gid.page) =(gid u.gid.page))
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
  ==
::
++  squad-public-component
  |=  [=gid =squad]
  ^-  manx
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  ;form(method "post", action "/squad/{?:(pub.squad "private" "public")}")
    ;input(type "hidden", name "gid", value gid-str);
    ;input(type "submit", value ?:(pub.squad "make private" "make public"));
    ;+  ?.  &(=('public' sect.page) ?=(^ gid.page) =(gid u.gid.page))
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
  ==
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
    ;input(type "submit", value ?:(=(our.bol host.gid) "delete" "leave"));
  ==
::
++  squad-acl-component
  |=  [=gid =squad]
  ^-  manx
  =/  acl=(list @p)  ~(tap in (~(get ju acls) gid))
  =/  gid-str=tape  "{=>(<host.gid> ?>(?=(^ .) t))}_{(trip name.gid)}"
  =/  summary=manx
    ;summary
      ;h4: {?:(pub.squad "blacklist" "whitelist")} ({(a-co:co (lent acl))})
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
      ;input(type "submit", value ?:(pub.squad "blacklist" "whitelist"));
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
::
++  squad-members-component
  |=  [=gid =squad]
  ^-  manx
  =/  members=(list @p)  ~(tap in (~(get ju members) gid))
  ;details
    ;summary
      ;h4: members ({(a-co:co (lent members))})
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
++  style
  ^~
  %-  trip
  '''
  body {
    background-color: white;
    color: black;
  }
  * {font-family: monospace}
  summary > * {display: inline}
  details > div {margin: 1em 2ch}
  label {padding-right: 1ch}
  .success {
    background-color: #bfee90;
    color: green;
    padding: 3px;
    border: 1px solid green;
    border-radius: 2px;
  }
  .failure {
    background-color: #ab4642;
    padding: 3px;
    color: white;
    border: 1px solid darkred;
    border-radius: 2px;

  }
  .success:not(:first-child), .failure:not(:first-child) {
    margin-left: 1ch
  }
  .delete-form > input:hover {
    background-color: #ab4642;
    color: white;
    border-color: #ab4642;
  }
  .ship-acl-form {display: inline}
  .ship-acl-form > input {
    background-color: white;
    border: 1px solid lightgrey;
  }
  .ship-acl-form > input:hover {
    background-color: #ab4642;
    color: white;
    border-color: #ab4642;
  }
  .ship-acl-form:not(:last-child) {
    padding-right: 1ch;
  }
  .ship-members-span:not(:last-child), .ship-acl-span:not(:last-child) {
    padding-right: 1ch;
  }
  .new-form {line-height: 300%}
  input[type=text] + input[type=submit] {margin-left: 1ch}
  '''
--
```

### Desk config

With our types, agent, mark files and front-end now complete, the last thing we
need are some desk configuration files.

Firstly, we need to specify the kernel version our app is compatible with. We do
this by adding a `sys.kelvin` file to the root of our `squad` directory:

```shell {% copy=true %}
cd squad
echo "[%zuse 418]" > sys.kelvin
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

### Put it together

Our app is now complete, so let's try it out. In the Dojo of our comet,
we'll create a new desk by forking from an existing one:

``` {% copy=true %}
|merge %squad our %webterm
```

Next, we'll mount the desk so we can access it from the host OS:

``` {% copy=true %}
|mount %squad
```

Currently its contents are the same as the `%webterm` desk, so we'll need to
delete those files and copy in our own instead. In the normal shell, do the
following:

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
a tile for the Tally app.  If we click on it, it'll open our front-end and we
can start using it.

One thing we can also do is publish the app so others can install it from us. To
do so, just run the following command:

```
:treaty|publish %squad
```

Now our friends will be able to install it directly from us with `|install <our
ship> %squad` or by searching for `<our ship>` on their ship's homescreen.

## Code commentary

### Types

A group (aka squad) will be identified by a combination of the host ship and the
group name - this structure will be called a `gid` (group ID). A group has a
changeable title, and may be public or private, so we'll track these in the
`squad` structure. We also need to track the current members of a group, and the
blacklist or whitelist depending if the group is public or private. The basic
data structures will therefore look like:

```hoon
+$  gid    [host=@p name=@tas]
+$  title  @t
+$  squad  [=title pub=?]
+$  ppl    (set @p)
```

Our app state will contain a map from `gid` to `squad` for the basic groups.
We'll also have an access control list called `acl`, mapping `gid` to `ppl`. If
the squad is public it will represent a blacklist, and if the squad is private
it will represent a whitelist. Lastly, we'll maintain another map from `gid` to
`ppl` which tracks who has actually joined:

```hoon
+$  squads   (map gid squad)
+$  acls     (jug gid @p)
+$  members  (jug gid @p)
```

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

The structure for these actions is called an `act` and looks like so:

```hoon
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
```

We also need to be able to send these events/updates out to subscribers in the
following cases:

1. The above `act` cases.
2. Provide the initial state of a squad for new subscribers.
3. Provide the initial state of all squads for other agents on the local ship.

This structure for these updates is called `upd` and looks like so:

```hoon
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

Squad uses a pub/sub pattern. Remote ships are able to subscribe to a squad we
host and receive updates such as access control list changes or members joining
and leaving. Likewise, we'll be able to subscribe to squads on other ships and
receive their updates. Remember, all Urbit ships are both clients and servers.

There's three main agent arms we use for this:

1. `on-poke`: This arm handles one-off actions/requests.
2. `on-watch`: This arm handles incoming subscription requests.
3. `on-agent`: This arm handles updates/events from people we've subscribed to.

#### `on-poke`

For this app, the `on-poke` will only allow pokes from the local ship - either
other agents using Squad's API or Squad's front-end. It will accept pokes with a
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

### Front-end

As mentioned previously, our front-end is written in *Sail*, and contained in a
separate `index.hoon` file which our agent imports. Sail lets us easily build
XML structures inside hoon, and looks like this:

```hoon
;html
  ;head
    ;title: squad
    ;meta(charset "utf-8");
    ;style
      ;+  ;/  style
    ==
  ==
  ;body
    ;+  ?.  =('generic' sect.page)
          ;/("")
        %+  success-component
          ?:(success.page "success" "failed")
        success.page
    ;h2: join
    ;+  join-component
    ;h2: create
    ;+  new-component
    ;+  ?~  squads
          ;/("")
        ;h2: squads
    ;*  %+  turn
          %+  sort  ~(tap by squads)
          |=  [a=[* =title *] b=[* =title *]]
          (aor title.a title.b)
        squad-component
  ==
==
..........
```

Most of `index.hoon` contains the various front-end components like this.

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
