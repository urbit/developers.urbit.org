+++
title = "Styled Text"
weight = 199
+++

In this tutorial, we examine how to produce `styx` styled text strings and output them to the terminal from an agent.

##  `%shoe` CLI Session Manager

`%shoe` is responsible to manage attached agent sessions.  It adds a few arms to the standard Gall agent, namely:

- `++command-parser` is the input parser, similar to the work we were carrying out just above.  This parses every input and only permits valid keystrokes (think of Dojo real-time parsing).
- `++tab-list` provides autocompletion options.  We can ignore for now.
- `++on-command` is called whenever a valid command is run.  This produces the actual effects.
- `++can-connect` supports `|link` connexion to the app.
- `++on-connect` provides particular session support when a user connects.  We can ignore for now.
- `++on-disconnect` provides particular session support when a user disconnects.  We can ignore for now.

To get started with text parsers and CLI agents, we need to focus on `++command-parser` and `++on-command`.  But first, the agent's structure and state:


The agent will adopt a two-stage process, wherein a value is put on the stack then the stack is checked for any valid operations.

### `++command-parser`

The input parser can simply accept whole words or single inputs, or parse complex expressions (as Dojo does with Hoon).

This results in a noun of `+$command-type` based on the specific application.  The example `/app/shoe.hoon` agent defines:

```hoon
+$  command
  $?  %demo
      %row
      %table
  ==
```

and later uses this as:

```hoon
  ++  command-parser                                                                            
    |=  =sole-id:shoe
    ^+  |~(nail *(like [? command]))
    %+  stag  &
    (perk %demo %row %table ~)
```

where the unfamiliar parser components are:

- `++stag` adds a label, here `&` pam `TRUE`/`%.y` to indicate that the command should be run immediately when it matches.  (We won't want this below so we will `++stag` a `|` `FALSE`/`%.n`.)
- `++perk` parses a fork in the type.

### `++on-command`

This arm accepts a session ID and a command resulting from `++command-parser`.  It produces a regular `(quip card _this)` so you can modify agent state and produce effects here.


##  `%sole` Effects

`%sole` is responsible for producing effects.  If you want to yield effects to the command line from your CLI agent (which you often do), this is a great place to work.

`%sole-effect`s are head-tagged by time and produce a variety of terminal effects, from text to bells, colors, and other screen effects.


##  `$styx` Styled Text String

A `klr` effect uses a `styx`, or styled text string.  The relevant data structures are in `/sys/lull.hoon`:

```hoon
+$  deco  ?(~ %bl %br %un)                              ::  text decoration
+$  stye  (pair (set deco) (pair tint tint))            ::  decos/bg/fg
+$  styl  %+  pair  (unit deco)                         ::  cascading style
          (pair (unit tint) (unit tint))                ::
+$  styx  (list $@(@t (pair styl styx)))                ::  styled text       
+$  tint  $@  ?(%r %g %b %c %m %y %k %w %~)             ::  text color
          [r=@uxD g=@uxD b=@uxD]                        ::  24bit true color
```

- `$deco` is a text decoration, here `%bl` blinking, `%br` bright (bold), and `%un` underlined.
- `$tint` is a color, either explicitly the terminal red/green/blue/cyan etc. or a 24-bit true color value.
- `$stye` composes these into a style which will be applied to a string.
- `$styl` similarly composes styles together.
- `$styx` pairs styles with cords.

This means that composing styled text correctly can require explicitly nesting statements in rather a complicated way.

For instance, to produce a bold string with hex color `#123456`, we could produce the `sole-effect`:

```hoon
^-  sole-effect:sole
:-  klr
^-  styx
~[[[`%br ~ `[r=0x12 g=0x34 b=0x56]] 'Hello Mars!' ~]]
```

- [~ropdeb-sormyr, "Styled output - requirements and progress" ~2016.8.2 Urbit fora post](https://github.com/urbit/fora-posts/blob/0238536650dfc284f14295d350f9acada0341480/archive/posts/~2016.8.2..21.19.29..2ab8~.md)


##  Agent Logic

Here is an agent that will accept a single character and produce a line with varying random colors of that character.

**`/app/track7.hoon`**

```hoon
/+  default-agent, dbug, shoe, sole
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  %0
+$  card  card:agent:shoe
+$  command  @t
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
%-  (agent:shoe command)
^-  (shoe:shoe command)
|_  =bowl:gall
+*  this     .
    default  ~(. (default-agent this %|) bowl)
    leather  ~(. (default:shoe this command) bowl)
++  on-init   on-init:default
++  on-save   !>(state)
++  on-load
  |=  old=vase
  ^-  (quip card _this)
  `this(state !<(state-0 old))
++  on-poke   on-poke:default
++  on-peek   on-peek:default
++  on-arvo   on-arvo:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-agent  on-agent:default
++  on-fail   on-fail:default
++  command-parser
  |=  =sole-id:shoe
  ^+  |~(nail *(like [? command]))
  (stag & (boss 256 (more gon qit)))
++  on-command
  |=  [=sole-id:shoe =command]
  ^-  (quip card _this)
  :_  this
  ^-  (list card)
  :~  :+  %shoe  ~
  ^-  shoe-effect:shoe
  :-  %sole
  ^-  sole-effect:sole  :-  %klr
  ^-  styx
  =/  idx  0
  =|  fx=styx
  =/  rng  ~(. og eny:bowl)
  |-
  ?:  =(80 idx)  fx
  =^  huer  rng  (rads:rng 256)
  =^  hueg  rng  (rads:rng 256)
  =^  hueb  rng  (rads:rng 256)
  %=  $
    idx  +(idx)
    fx   `styx`(weld fx `styx`~[[[`%br ~ `[r=`@ux`huer g=`@ux`hueg b=`@ux`hueb]] command ~]])
  ==  ==
++  can-connect
  |=  =sole-id:shoe
  ^-  ?
  ?|  =(~zod src.bowl)
      (team:title [our src]:bowl)
  ==
++  on-connect     on-connect:leather
++  on-disconnect  on-disconnect:leather
++  tab-list       tab-list:leather
--
```
