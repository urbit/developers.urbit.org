+++
title = "Examples"
weight = 4
+++

## %receipt

Below is an example of an application that spins up a lick port on its
init call. When it recieves a `%connected` soak it subscribes to
`%rumors`. whenever a `%rumor` is recieved it will spit it out to the
Lick port and which will forward it to a reciept printer. When the
receipt printer disconnects the application will unsubscribe to
`%rumors` and wait.

### `receipt.hoon`

```hoon
/+  default-agent, dbug
!:
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0
  $:  [%0 name=@tas]
  ==
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this     .
    default  ~(. (default-agent this %|) bowl)
++  on-init
  ^-  (quip card _this)
  :_  this
  [%pass / %arvo %l %spin /rumors/uart]~
++  on-save   !>(state)
++  on-load
  |=  old=vase
  ^-  (quip card _this)
  `this(state !<(state-0 old))
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  ?=(%uart-action mark)
  =/  act  !<(action vase)
  ?-    -.act
      %spin
    :_  this
    [%pass / %arvo %l %spin name.act]~
    ::
      %shut
    :_  this
    [%pass /shut %arvo %l %shut name.act]~
    ::
      %spit
    :_  this
    [%pass /spit %arvo %l %spit name.act mark.act data.act]~
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ~&  >>  path
  =/  dev  `@tas`(snag 2 path)
  ?+  path  (on-peek:default path)
    [%s %agents *]  ``noun+!>(dev)
  ==
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)
  =/  cad  +.sign-arvo
  ~&  >  ['wire' wire]
  ~&  >  ['sign-arvo' sign-arvo]
  ?+  sign-arvo  (on-arvo:default wire sign-arvo)
      [%lick %soak *]
      ?+  mark.sign-arvo  [~ this]
      ::
        %connect
      :_  this
      :~  [%pass /subscribe %agent [our.bowl %rumors] %watch /rumors]
      ==
      ::
        %disconnect
      :_  this
      :~  [%pass /subscribe %agent [our.bowl %rumors] %leave ~]
      ==
      ::
        %error
      ~&  >  ['Error: ' ;;(@tas noun.sign-arvo)]
      `this
      ==
  ==
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%subscribe ~]
    ?+    -.sign  (on-agent:default wire sign)
        %watch-ack
      ?~  p.sign
        ((slog '%rumors-watcher: Subscribe succeeded!' ~) `this)
      ((slog '%rumors-watcher: Subscribe failed!' ~) `this)
    ::
        %kick
      %-  (slog '%rumors-watcher: Got kick, resubscribing...' ~)
      :_  this
      :~  [%pass /subscribe %agent [our.bowl %rumors] %watch /rumors]
      ==
    ::
        %fact
      ?+  p.cage.sign  (on-agent:default wire sign)
        %rumor
        =/  rumor  !<([when=@da what=@t] q.cage.sign)
        =/  print  :(weld (scow %da when.rumor) ": " (trip what.rumor))
        ~&  (crip print)
        :_  this
        [%pass /spit %arvo %l %spit /rumors/uart %print (crip print)]~
      ==
    ==
  ==
::
++  on-fail   on-fail:default
--
```

