+++
title = "%ahoy Ship Monitoring"
weight = 10
+++

#   `%ahoy` Ship Monitoring

The `%ahoy` desk by [~midden-fabler](https://urbit.org/ids/~midden-fabler) provides a number of agents to automatically monitor ship activity such as breaching and network uptime.  This tutorial examines the `%ahoy` agent specifically with some slight simplifications to demonstrate how an Urbit-native app can be constructed.  You will see how to render a front-end using Sail, employ the `++abet` engine design pattern, construct CLI generators, and set wakeup timers using [Behn](https://developers.urbit.org/reference/glossary/behn).

`%ahoy` presents a web UI at `/ahoy` rendered using [Sail](https://developers.urbit.org/guides/additional/sail) and [~paldev](https://urbit.org/ids/~paldev)'s Rudder library alongside command-line generators to add, delete, and modify ship watches.  Notifications are sent using `%hark-store` if a ship hasn't been contacted after a specified amount of time.

```hoon
:ahoy|add-watch ~sampel ~d1
:ahoy|del-watch ~sampel
:ahoy|set-update-interval ~m30
```

##  `/sur` Structure Files

As with other agents, we think about our data structures and actions before we dive into the agent code.  The structure file here defines the state for the agent, `records`, which is a collection of ships to watch and the update interval for sending notifications.

```hoon
+$  records
  $:  watchlist=(map ship @dr)
      update-interval=@dr
  ==
```

Three commands are supported:  to add a ship to the watchlist at a given watch interval, to delete the ship, or to change the check interval.  (Modifying a ship is the same as adding it.)

```hoon
+$  command
  $%  [%add-watch =ship t=@dr]
      [%del-watch =ship]
      [%set-update-interval t=@dr]
  ==
```

**`/sur/ahoy.hoon`**:

```hoon {% copy=true, mode="collapse" %}
|%
+$  records
  $:  watchlist=(map ship @dr)
      update-interval=@dr
  ==
+$  command
  $%  [%add-watch =ship t=@dr]
      [%del-watch =ship]
      [%set-update-interval t=@dr]
  ==
--
```

No special mark files are necessary for `%ahoy`.

##  `/app` Agent Files

The agent itself is simple:  it maintains `records` as state and processes pokes from generators or the front-end and gifts from `%behn` in particular.

In addition, `%ahoy` sends notifications using `%hark-store`, the notification process integrated with Landscape and Grid.

### Pokes

At the macro level, `++on-poke` recognizes three poke cages:

1. `%noun` for pinging a ship.
2. `%ahoy-command` for commands per `/sur/ahoy.hoon`.
3. `handle-http-request` for displaying the webpage.

Most of the poke work takes place through `%ahoy-command`, which checks on the ship state per [Ames](https://developers.urbit.org/reference/glossary/ames)’ scheme of `%alien` and `%known` ships, then maintains the agent state by its watchlist.

```hoon
  %ahoy-command
=+  !<(cmd=command vase)
?-    -.cmd
    %add-watch
  =/  ss=(unit ship-state:ames)
    (~(ship-state ahoy bowl) ship.cmd)
  ?~  ss
    ~&  >>  [%ahoy '%alien ship not added']
    [~ this]
  :-  [(send-plea:hc ship.cmd)]~
  this(watchlist (~(put by watchlist) ship.cmd t.cmd))
::
    %del-watch
  `this(watchlist (~(del by watchlist) ship.cmd))
::
    %set-update-interval  
  `this(update-interval t.cmd)
==
```

HTTP requests are processed into a form useful to `rudder`, a front-end rendering library for native Hoon webpages.  `rudder` facilitates a Sail-based webpage being exposed through three arms:

1. `++argue` responds to `POST` requests.
2. `++final` is called after `POST` requests.
3. `++build` responds to `GET` requests, most commonly just yielding the webpage.

A number of other facilities in `rudder` are employed here as well:

- `++order:rudder` is a type for handling inbound requests from Eyre.
- `++steer:rudder` is the helper constructor for producing pages.
- `++point:rudder` is a routing arm.
- `++fours:rudder` is a 404 error handler.
- `++brief:rudder` is a type union, `?(~ @t)`.

```hoon
  %handle-http-request
=;  out=(quip card _+.state)
  [-.out this(+.state +.out)]
%.  [bowl !<(order:rudder vase) +.state]
%-  (steer:rudder _+.state command)
:^    pages
    (point:rudder /[dap.bowl] & ~(key by pages))
  (fours:rudder +.state)
|=  cmd=command
^-  $@  brief:rudder
    [brief:rudder (list card) _+.state]
=^  cards  this
  (on-poke %ahoy-command !>(cmd))
['Processed succesfully.' cards +.state]
```

### Gifts

The agent expects to receive a `%wake` gift periodically from Behn on the wire `%update-interval`.  It handles this by means of an arm in the agent's helper core, `++on-update-interval`.

```hoon
  [%update-interval ~]
=^  cards  state
  on-update-interval:hc
[cards this]
```

This helper core arm notably employs the `++abet` engine pattern for handling cards.  The `++abet` engine is a design pattern rather than a specific core.  It is designed to accumulate cards, often using `++emit` and `++emil`, then send them all at once.

The `++abet` engine pattern itself is rather simple to construct.  It enables other arms to construct a list of cards rather than having to produce complex `=^`-style constructions.  This instance of the engine pattern consists of three arms (omitting an `++abed` arm):

- `++emit` is used to submit a card to a collection of cards in the engine helper core.
- `++emil` is similar but accepts a list of cards.
- `++abet` issues the list of cards back along with the state to be updated.  (Note that the core must be scoped such that the Gall agent's state is visible.)

Other arms (such as `++set-timer`) then simply construct cards which are inserted into the `++abet` engine's list.


```hoon {% mode="collapse" %}
=|  cards=(list card)
|_  =bowl:gall
++  this  .
++  abet
  ^-  (quip card _state)
  [(flop cards) state]
::
++  emit
  |=  car=card
  this(cards [car cards])
::
++  emil
  |=  rac=(list card)
  |-  ^+  this
  ?~  rac
    this
  =.  cards  [i.rac cards]
  $(rac t.rac)
::
++  on-update-interval
  ^-  (quip card _state)
  ::  reset timer
  =.  this  (emit (set-timer update-interval))
  ::  send pleas
  =.  this
    %-  emil
    %+  turn  ~(tap in ~(key by watchlist))
    |=  [who=ship]
    (send-plea who)
  ::  send notifications
  =.  this
    %-  emil
    %-  zing
    %+  turn  ~(tap in down-status)
    |=  [who=ship]
    (send-notification who)
  abet
::
++  set-timer
  |=  t=@dr
  ^-  card
  =/  when=@da  (add now.bowl t)
  [%pass /update-interval %arvo %b %wait when]
::
++  send-plea
  |=  [who=ship]
  ^-  card
  [%pass /ahoy/(scot %p who) %arvo %a %plea who %evil-vane / ~]
::
++  down-status
  ^-  (set ship)
  %-  silt
  %+  murn  ~(tap in ~(key by watchlist))
  |=  [who=ship]
  =/  when=(unit @dr)  (~(last-contact ahoy bowl) who)
  ?~  when  ~
  ?.  (gte u.when (~(got by watchlist) who))
    ~
  `who
::
++  send-notification
  |=  [who=ship]
  ^-  (list card)
  ?.  .^(? %gu /(scot %p our.bowl)/hark-store/(scot %da now.bowl))  ~
  =/  when=@dr  (need (~(last-contact ahoy bowl) who))
  =/  title=(list content:hark)
    =-  [ship+who - ~]
    text+(crip " has not been contacted in {<when>}")
  =/  =bin:hark     [/[dap.bowl] q.byk.bowl /(scot %p who)]
  =/  =action:hark  [%add-note bin title ~ now.bowl / /[dap.bowl]]
  =/  =cage         [%hark-action !>(action)]
  [%pass /hark %agent [our.bowl %hark-store] %poke cage]~
--
```

For `%ahoy`, the main arm we need to examine is `++on-update-interval`.  This arm resets the timer, sends checks to all of the ships, and then sends notifications to `%hark-store` for anything unresponsive.

```hoon
++  on-update-interval
  ^-  (quip card _state)
  ::  reset timer
  =.  this  (emit (set-timer update-interval))
  ::  send pleas
  =.  this
    %-  emil
    %+  turn  ~(tap in ~(key by watchlist))
    |=  [who=ship]
    (send-plea who)
  ::  send notifications
  =.  this
    %-  emil
    %-  zing
    %+  turn  ~(tap in down-status)
    |=  [who=ship]
    (send-notification who)
  abet
```

The `++send-plea` status check is interesting:  it checks whether Ames is responsive on a particular ship without doing anything to the remote ship except eliciting an error.  (`|hi` or similar would unnecessarily spam the recipient's Dojo.)

```hoon
++  send-plea
  |=  [who=ship]
  ^-  card
  [%pass /ahoy/(scot %p who) %arvo %a %plea who %evil-vane / ~]
```

`%hark-store` is the standard cross-agent notification store provided by Grid and recognized by Landscape.  The notification message requires a little bit of explicit construction as `action` but can be treated as boilerplate code aside from the text.

```hoon
++  send-notification
  |=  [who=ship]
  ^-  (list card)
  ?.  .^(? %gu /(scot %p our.bowl)/hark-store/(scot %da now.bowl))  ~
  =/  when=@dr  (need (~(last-contact ahoy bowl) who))
  =/  title=(list content:hark)
    =-  [ship+who - ~]
    text+(crip " has not been contacted in {<when>}")
  =/  =bin:hark     [/[dap.bowl] q.byk.bowl /(scot %p who)]
  =/  =action:hark  [%add-note bin title ~ now.bowl / /[dap.bowl]]
  =/  =cage         [%hark-action !>(action)]
  [%pass /hark %agent [our.bowl %hark-store] %poke cage]~
```

**`/app/ahoy.hoon`**:

```hoon {% copy=true, mode="collapse" %}
::  ahoy: ship monitoring
::
::    get notified if last-contact with a ship
::    exceeds a specified amount of time
::
::  usage:
::    :ahoy|add-watch ~sampel ~d1
::    :ahoy|del-watch ~sampel
::    :ahoy|set-update-interval ~m30
::
::  scrys:
::    .^((map @p @dr) %gx /=ahoy=/watchlist/noun)
::    .^((set ship) %gx /=ahoy=/watchlist/ships/noun)
::    .^(@dr %gx /=ahoy=/update-interval/noun)
::
/-  *ahoy, hark=hark-store
/+  default-agent, 
    agentio, 
    rudder,
    dbug,
    ahoy 
/~  pages  (page:rudder records command)  /app/ahoy/webui
::
=>  |%
    +$  card  card:agent:gall
    +$  versioned-state
      $%  state-0
      ==
    +$  state-0  [%0 records]
    --
::
=|  state-0
=*  state  -
%-  agent:dbug
^-  agent:gall
=<
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
    io    ~(. agentio bowl)
    pass  pass:io
::
++  on-init
  ^-  (quip card _this)
  =/  interval=@dr  ~m5
  =+  sponsor=(sein:title [our now our]:bowl)
  :_  this(update-interval interval)
  :~  (~(connect pass /eyre/connect) [~ /[dap.bowl]] dap.bowl)
      (poke-self:pass %ahoy-command !>([%add-watch sponsor ~d1]))
      (set-timer interval)
  ==
::
++  on-save  !>(state)
++  on-load
  |=  ole=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state ole)
  ?-  -.old
    %0  [~ this(state old)]
  ==
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  =(our src):bowl
  ?+    mark  (on-poke:def mark vase)
      %noun
    =+  !<(who=ship vase)
    :_  this
    [(send-plea:hc who)]~
  ::
      %ahoy-command
    =+  !<(cmd=command vase)
    ?-    -.cmd
        %add-watch
      =/  ss=(unit ship-state:ames)
        (~(ship-state ahoy bowl) ship.cmd)
      ?~  ss
        ~&  >>  [%ahoy '%alien ship not added']
        [~ this]
      :-  [(send-plea:hc ship.cmd)]~
      this(watchlist (~(put by watchlist) ship.cmd t.cmd))
    ::
        %del-watch
      `this(watchlist (~(del by watchlist) ship.cmd))
    ::
        %set-update-interval  
      `this(update-interval t.cmd)
    ==
  ::
      %handle-http-request
    =;  out=(quip card _+.state)
      [-.out this(+.state +.out)]
    %.  [bowl !<(order:rudder vase) +.state]
    %-  (steer:rudder _+.state command)
    :^    pages
        (point:rudder /[dap.bowl] & ~(key by pages))
      (fours:rudder +.state)
    |=  cmd=command
    ^-  $@  brief:rudder
        [brief:rudder (list card) _+.state]
    =^  cards  this
      (on-poke %ahoy-command !>(cmd))
    ['Processed succesfully.' cards +.state]
  ==
::
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path  (on-watch:def path)
      [%http-response *]
    ?>  =(our src):bowl
    [~ this]
  ==
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  ?+    wire  (on-arvo:def wire sign-arvo)
      [%ahoy @ ~]  [~ this]
  ::
      [%update-interval ~]
    =^  cards  state
      on-update-interval:hc
    [cards this]
  ::
      [%eyre %connect ~]
    ?+  sign-arvo  (on-arvo:def wire sign-arvo)
        [%eyre %bound *]
      ~?  !accepted.sign-arvo
        [dap.bowl 'eyre bind rejected!' binding.sign-arvo]
      [~ this]
    ==
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?>  =(our src):bowl
  ?+  path  (on-peek:def path)
    [%x %watchlist ~]         ``noun+!>(watchlist)
    [%x %watchlist %ships ~]  ``noun+!>(~(key by watchlist))
    [%x %update-interval ~]   ``noun+!>(update-interval)
  ==
::
++  on-leave  on-leave:def
++  on-agent  on-agent:def
++  on-fail   on-fail:def
--
::
=|  cards=(list card)
|_  =bowl:gall
++  this  .
++  abet
  ^-  (quip card _state)
  [(flop cards) state]
::
++  emit
  |=  car=card
  this(cards [car cards])
::
++  emil
  |=  rac=(list card)
  |-  ^+  this
  ?~  rac
    this
  =.  cards  [i.rac cards]
  $(rac t.rac)
::
++  on-update-interval
  ^-  (quip card _state)
  ::  reset timer
  =.  this  (emit (set-timer update-interval))
  ::  send pleas
  =.  this
    %-  emil
    %+  turn  ~(tap in ~(key by watchlist))
    |=  [who=ship]
    (send-plea who)
  ::  send notifications
  =.  this
    %-  emil
    %-  zing
    %+  turn  ~(tap in down-status)
    |=  [who=ship]
    (send-notification who)
  abet
::
++  set-timer
  |=  t=@dr
  ^-  card
  =/  when=@da  (add now.bowl t)
  [%pass /update-interval %arvo %b %wait when]
::
++  send-plea
  |=  [who=ship]
  ^-  card
  [%pass /ahoy/(scot %p who) %arvo %a %plea who %evil-vane / ~]
::
++  down-status
  ^-  (set ship)
  %-  silt
  %+  murn  ~(tap in ~(key by watchlist))
  |=  [who=ship]
  =/  when=(unit @dr)  (~(last-contact ahoy bowl) who)
  ?~  when  ~
  ?.  (gte u.when (~(got by watchlist) who))
    ~
  `who
::
++  send-notification
  |=  [who=ship]
  ^-  (list card)
  ?.  .^(? %gu /(scot %p our.bowl)/hark-store/(scot %da now.bowl))  ~
  =/  when=@dr  (need (~(last-contact ahoy bowl) who))
  =/  title=(list content:hark)
    =-  [ship+who - ~]
    text+(crip " has not been contacted in {<when>}")
  =/  =bin:hark     [/[dap.bowl] q.byk.bowl /(scot %p who)]
  =/  =action:hark  [%add-note bin title ~ now.bowl / /[dap.bowl]]
  =/  =cage         [%hark-action !>(action)]
  [%pass /hark %agent [our.bowl %hark-store] %poke cage]~
--
```

**`/lib/ahoy.hoon`**:

This library file provides helper logic for determining ship status.  In particular, scries are simplified.  For instance, `(~(last-contact ahoy bowl) ship)` can be used instead of the scry below.

```hoon {% copy=true, mode="collapse" %}
|_  =bowl:gall
++  ship-state
  |=  [who=ship]
  ^-  (unit ship-state:ames)
  ?.  (~(has in peers) who)
    ~
  `.^(ship-state:ames %ax /(scot %p our.bowl)//(scot %da now.bowl)/peers/(scot %p who))
::
++  peers
  ^-  (set ship)
  =/  mips
    .^((map ship ?(%alien %known)) %ax /(scot %p our.bowl)//(scot %da now.bowl)/peers)
  ~(key by mips)
::
++  last-contact
  |=  [who=ship]
  ^-  (unit @dr)
  =/  ss=(unit ship-state:ames)  (ship-state who)
  ?~  ss  ~
  ?.  ?=([%known *] u.ss)
    ~
  =/  last-contact=@da  last-contact.qos.u.ss
  =/  when=@dr  (sub now.bowl last-contact)
  `when
--
```

**`/app/ahoy/webui/index.hoon`**:

```hoon {% copy=true, mode="collapse" %}
/-  *ahoy, contact=contact-store
/+  ahoy, rudder, ahoy-style, sigil-svg=sigil
::
^-  (page:rudder records command)
|_  [=bowl:gall =order:rudder records]
++  argue
  |=  [headers=header-list:http body=(unit octs)]
  ^-  $@(brief:rudder command)
  =/  args=(map @t @t)
    ?~(body ~ (frisk:rudder q.u.body))
  ?~  what=(~(get by args) 'what')  ~
  ?+    u.what  ~
      %add-watch
    ?~  who=(slaw %p (~(gut by args) 'who' ''))     ~
    ?~  when=(slaw %dr (~(gut by args) 'when' ''))  ~
    [%add-watch u.who u.when]
  ::
      %del-watch
    ?~  who=(slaw %p (~(gut by args) 'who' ''))  ~
    [%del-watch u.who]
  ==
::
++  final  (alert:rudder (cat 3 '/' dap.bowl) build)
++  build
  |=  $:  arg=(list [k=@t v=@t])
          msg=(unit [o=? =@t])
      ==
  ^-  reply:rudder
  |^  [%page page]
  ++  page
    ^-  manx
    ;html
      ;head
        ;title:"%ahoy"
        ;meta(charset "utf-8");
        ;meta(name "viewport", content "width=device-width, initial-scale=1");
        ;style:"{(trip style:ahoy-style)}"
      ==
      ;body
        ;a/"/ahoy"
          ;h2:"%ahoy"
        ==

        ;h4:"ship monitoring (tutorial)"

        get notified if last-contact with a ship
        exceeds a specified amount of time
        
        ;+  ?~  msg  ;p:""
            ?:  o.u.msg
              ;p.green:"{(trip t.u.msg)}"
            ;p.red:"{(trip t.u.msg)}"
        ;table#ahoy
          ;form(method "post")
            ::  table header
            ;tr(style "font-weight: bold")
              ;td(align "center"):"~"
              ;td(align "center"):"@p"
              ;td(align "center"):"notify after @dr"
              ;td(align "center"):"last-contact `@dr"
            ==
            ::  first row for adding new ships
            ;tr
              ;td
                ;button(type "submit", name "what", value "add-watch"):"+"
              ==
              ;td
                ;input(type "text", name "who", placeholder "~sampel");
              ==
              ;td
                ;input(type "text", name "when", placeholder "~d1.h12.m30");
              ==
              ;td(align "center"):"~"
            ==  ::  first row
          ==    ::  form
          ;*  work
        ==
      ==  ::  body
    ==    ::  html
  ++  work
    ^-  (list manx)
    %+  turn  ~(tap by watchlist)
    |=  [=ship t=@dr]
    ;tr
      ;td
        ::  %del-watch
        ;form(method "post")
          ;button(type "submit", name "what", value "del-watch"):"-"
          ;input(type "hidden", name "who", value "{(scow %p ship)}");
        ==
        ::  ship
        ;td
          ;+  (sigil ship)
          ; {(scow %p ship)}
        ==
        ::  when to notify
        ;form(method "post")
          ;td
            ;input(type "hidden", name "what", value "add-watch");
            ;input(type "hidden", name "who", value "{(scow %p ship)}");
            ;input(type "text", name "when", value "{(scow %dr t)}");
          ==
        ==
        ::  last-contact
        ;td(align "right")
          ; {<(~(last-contact ahoy bowl) ship)>}
        ==
      ==
    ==
  ::
  ++  contacts  ~+
    =/  base=path
      /(scot %p our.bowl)/contact-store/(scot %da now.bowl)
    ?.  .^(? %gu base)  *rolodex:contact
    .^(rolodex:contact %gx (weld base /all/noun))
  ::
  ++  sigil
    |=  =ship
    ^-  manx
    =/  bg=@ux
      ?~(p=(~(get by contacts) ship) 0xff.ffff color.u.p)
    =/  fg=tape
      =+  avg=(div (roll (rip 3 bg) add) 3)
      ?:((gth avg 0xc1) "black" "white")
    =/  bg=tape
      ((x-co:co 6) bg)
    ;div.sigil(style "background-color: #{bg}; width: 20px; height: 20px;")
      ;img@"/ahoy/sigil.svg?p={(scow %p ship)}&fg={fg}&bg=%23{bg}&icon&size=20";
    ==
  --  ::  |^
--    ::  |_
```

The CSS styling is included via a library core:

**`/lib/ahoy/style.hoon`**:

```hoon {% copy=true, mode="collapse" %}
|%
++  style
  '''

  * { margin: 0.2em; padding: 0.2em; font-family: monospace; }

  body {
    background-color: black; 
    color: white; 
  }

  h2 { color: red; }

  p { max-width: 50em; }

  form { margin: 0; padding: 0; }

  .red { font-weight: bold; color: #dd2222; }
  .green { font-weight: bold; color: #229922; }

  a {
    display: inline-block;
    color: inherit;
    padding: 0;
    margin-top: 0;
  }

  table#ahoy tr td:nth-child(2) {
    padding: 0 0.5em;
  }

  .label {
    display: inline-block;
    background-color: #ccc;
    border-radius: 3px;
    margin-right: 0.5em;
    padding: 0.1em;
  }
  .label input[type="text"] {
    max-width: 100px;
  }
  .label span {
    margin: 0 0 0 0.2em;
  }

  button {
    padding: 0.2em 0.5em;
  }

  .sigil {
    display: inline-block;
    vertical-align: middle;
    margin: 0 0.5em 0 0;
    padding: 0.2em;
    border-radius: 0.2em;
  }

  .sigil * {
    margin: 0;
    padding: 0;
  }
  '''
--
```

### Rendering Sigils

[Sigils](https://urbit.org/blog/creating-sigils) are unique visual representations of `@p` ship identifiers.  Many Urbit apps use sigils in small or large sizes as ship icons.

A sigil library is provided with ~paldev's Suite tools.  We do not include the contents of `/lib/sigil.hoon` or `/lib/sigil/symbols.hoon` here due to their length.

- [`/lib/sigil.hoon`](https://github.com/Fang-/suite/blob/master/lib/sigil.hoon)
- [`/lib/sigil/symbols.hoon`](https://github.com/Fang-/suite/blob/master/lib/sigil/symbols.hoon)

The sigils are rendered in `/app/ahoy/webui/index.hoon`.


##  `/gen` Generator Files

Some agents (notably `%helm`, a Dojo tool) are instrumented to work directly with generators at the command line.  The `%ahoy` agent demonstrates this with several generator files such as `/gen/add-watch.hoon`, used thus:

```hoon
:ahoy|add-watch ~sampel-palnet ~h2
```

**`/gen/ahoy/add-watch.hoon`**

```hoon {% mode="collapse" %}
  ::  :ahoy|add-watch ~sampel ~d1
  ::
  :-  %say
  |=  $:  ^
          [who=ship t=@dr ~]
          ~
      ==
  [%ahoy-command [%add-watch who t]]
```

As you can see here, an `%ahoy-command` is generated which is then passed to the `%ahoy` agent as a poke using Dojo's `|` logic.  (A generator called with Dojo's `+` logic would be located in `/gen`, whereas `|` tells Dojo to look inside the agent's folder, much like a `/mar` mark file.)

Such agent-specific generator files can be much cleaner than manual poke logic:

```hoon
:ahoy|add-watch ~sampel-palnet ~h2
```
is the equivalent of
```hoon
:ahoy &ahoy-command [%add-watch ~zod ~h2]
```

### Exercise:  Compose a Generator

- Without consulting the `%ahoy` source code, compose a generator `/gen/ahoy/del-watch.hoon` which removes a ship from the watchlist.
