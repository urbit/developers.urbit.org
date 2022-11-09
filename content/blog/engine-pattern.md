#   The Engine Design Pattern

A Gall agent is a door with a sample of the `bowl` and an associated `state`.  `card`s are issued from the agent to Arvo and other agents, while `gift`s and incoming `card`s are handled by the agent.  This means that agents need to compose lists of `card`s—the ubiquitous `(quip card state)` return type.  This pair of `(list card)` and `agent:gall` allow us to produce effects (`card`s) and maintain state.

A Gall agent sometimes needs to issue a lot of state changes using cards.  This can lead to awkward chains of `=^` tisket pins as several cards are aggregated together before resolving.  (Cards all happen “at the same time”, meaning before any mutations are applied to the state, but composing several cards together can be vexing.)  As an alternative, a helper core (the “engine”) can be used to encapsulate complexity with card handling.  When used well, the engine pattern can lead to cleaner code factoring and sequestration of more complex logic.

##  Single `card` or multiple `card`s, list pattern

For instance, imagine a chat app.  When a message arrives, a set of cards can be built on the basis of what changes need to be effected:  namely, subscribers need to be notified with a `%gift`.

Classically, a single card would be bundled with any necessary state changes:

```hoon
:_  this(messages ~[text messages])
~[[%give %fact ~[/update] %chat-effect !>(`chat-effect`[text])]]
```

Much like a single card, a list of cards can be produced and returned from an arm in a Gall agent.  Here a Gall agent triggers a thread:

```hoon
:_  this
:~  [%pass wire %agent [our.bowl %spider] %watch /thread-result/[tid]]                        
    [%pass wire %agent [our.bowl %spider] %poke %spider-start !>(args)]
==
```

This pattern works well for single cards or short collections of them, in particular with simple generating logic.


##  Multiple `card`s, `=^` tisket pattern

The classic way of composing several cards uses a [`=^` tisket](https://developers.urbit.org/reference/hoon/rune/tis#-tisket) to pin a state and a helper core to process actions.  This allows sequestration of logic into particular arms.

```hoon
=^  cards  state
  `state(allowances (~(put by allowances) +.action))
[cards this]
```

Another advantage (at the cost of more obfuscatory logic) is that code effects can be better ordered, e.g. in this code snippet which registers a token (`++produce-token`) before producing a corresponding message (`++subscribe-dms`).  The `card`s at the end TODO.

```hoon
=^  cards  state  (produce-token:main source.action target.action)
=^  cards  state  (subscribe-dms:main source.action target.action)
:_  state
^-  (list card)
%+  weld  cards
  %+  give-simple-payload:app:server  id
  (handle-auth-request:main source target)
```


##  Multiple cards, engine pattern



```hoon
   ++  change-policy  
     |=  [rid=resource =diff:policy]       
     ^-  (quip card _state)    
     ?.  (~(has by groups) rid)  
       [~ state]
     =/  =group
       (~(got by groups) rid)  
     |^
     =^  cards  group                                                                                     
       ?-  -.diff                            
         %open     (open +.diff)                         
         %invite   (invite +.diff)  
         %replace  (replace +.diff)           
       ==                                               
     =.  groups  
       (~(put by groups) rid group)  
     :_  state                                                           
     %+  weld  
       (send-diff %change-policy rid diff)  
     cards
```

**`/=landscape=/app/graph-store/hoon`**:

```hoon
    ++  run-updates                                                                                      
       |=  [=resource:store =update-log:store]  
       ^-  (quip card _state)  
       ?<  (~(has by archive) resource)  
       ?>  (~(has by graphs) resource)  
       =/  updates=(list [=time upd=logged-update:store])  
         ::  updates are time-ordered with most recent first  
         ::  process with earliest first  
         (bap:orm-log update-log)  
       =|  cards=(list card)  
       |-  ^-  (quip card _state)  
       ?~  updates  
         [cards state]  
       =*  update  upd.i.updates  
       =^  crds  state  
         %-  graph-update                        
         ^-  update:store  
         ?-  -.q.update  
           %add-graph          update(resource.q resource)        
           %add-nodes          update(resource.q resource)  
           %remove-posts       update(resource.q resource)  
           %add-signatures     update(resource.uid.q resource)  
           %remove-signatures  update(resource.uid.q resource)              
         ==               
       $(cards (weld cards crds), updates t.updates)
   ++  poke-import             
     |=  arc=*                      
     ^-  (quip card _state)  
     =^  cards  state                                                                                     
       (import:store arc our.bowl)  
     [cards state]
```
Let's have a core that has the state of a particular chat in the door's sample, which you initialize by calling an arm `++abed` to populate the sample.  Then all mutations (cards) are carried out and collected using specialized arms (`++emit` and `++emil`), and finally performed using the door's `++abet` arm.



You can nest cores and use this pattern to simplify wire management by `area`; e.g. `++go-abet` and so forth.

Rather than produce `(quip card _state)`, you can close over a list of cards and state using a core, then pull the `++abet` arm on that core to produce the new list of cards and state.

```hoon
++  abet
  ^-  (quip card _state)
  [(flop cards) state]
```

You can see this illustrated today in several core apps, such as `/app/acme.hoon`, which obtains HTTPS `letsencrypt` certificates.  Various arms like `++wake` make calls such as `%-  (slog u.error)  abet` from time to time.  It's also used in [`/sys/gall.hoon`](https://github.com/urbit/urbit/blob/cd10e02b732ad2c410e5b730d2fa2ce133060dd2/pkg/arvo/sys/vane/gall.hoon#L280) with nested cores.

This helper core arm notably employs the `++abet` engine pattern for handling cards.  The `++abet` engine is a design pattern rather than a specific core.  It is designed to accumulate cards, often using `++emit` and `++emil`, then send them all at once.

The `++abet` engine pattern itself is rather simple to construct.  It enables other arms to construct a list of cards rather than having to produce complex `=^`-style constructions.  This instance of the engine pattern consists of three arms (omitting an `++abed` arm):

- `++emit` is used to submit a card to a collection of cards in the engine helper core.
- `++emil` is similar but accepts a list of cards.
- `++abet` issues the list of cards back along with the state to be updated.  (Note that the core must be scoped such that the Gall agent's state is visible.)
- `++abed` is a constructor (and may not be present if unnecessary)

two kinds:
- ames, only modify one part of mapping, one key-value pair, pulls effects out
- clay, focus on one but can modify others in inner core (inner core is like high-level script, like pinned values in subject in sample of inner core, like a DSL)

look at a bunch of abets
nested core pattern is very powerful, concise, and useful
natural evolution of doors to next level

abet = exit from inner core to outer core, taking changes (think of this like a cursor, like a map w/ one key-value pair), take modified value and overwrite with put by
abed = constructor (++ap-abed in Gall, inner for mo core, move; agent state is yoke)
abut = alt exit for a delete

 ::  +mo-abed: initialise state with the provided duct  
   ::  +mo-abet: finalize, reversing moves  
   ::  +mo-pass: prepend a standard %pass to the current list of moves  
   ::  +mo-give: prepend a standard %give to the current list of moves       
   ::                                   
   ++  mo-core  .  
   ++  mo-abed  |=(hun=duct mo-core(hen hun))                                                             
   ++  mo-abet  [(flop moves) gall-payload]  
   ++  mo-give  |=(g=gift mo-core(moves [[hen give+g] moves]))  
   ++  mo-pass  |=(p=[wire note-arvo] mo-core(moves [[hen pass+p] moves]))  
   ++  mo-slip  |=(p=note-arvo mo-core(moves [[hen slip+p] moves]))  
   ++  mo-past                         
     |=  =(list [wire note-arvo])                   
     ?~  list                                       
       mo-core                                             
     =.  mo-core  (mo-pass i.list)                
     $(list t.list)            
   ::  +mo-jolt: (re)start agent if not already started on this desk
pass
give


multi-level embedded cores

Other arms (such as `++set-timer`) then simply construct cards which are inserted into the `++abet` engine's list.


  
ted tells me its comonadic

the pattern as a whole, i mean


Gossip library

```
     ++  go-easy
        |=  egg=cage
        ^-  (quip card _cargo)
        |^
        ?:  ?=(%cult-easy p.egg)
          =+  ease=!<(easy q.egg)
          (over ease)
        ?~  fix=(~(get by ritual.cargo) p.egg)
          =.  relics.cargo
            (~(put by relics.cargo) now.dish egg)
          go-abet
        =+  hard=`(unit easy)`(u.fix q.egg)
        ?~  hard  go-abet
        (over u.hard)
        ::
        ++  over
          |=  ease=easy
          ?~  turn=(~(get by clique.cargo) -.ease)
            go-abet
          =~
            :-  ease=`_ease`ease
            =~  go(flag [our.dish u.turn])
                go-dick
                go-form
            ==
            (go-diff +.ease)
            go-abet
          ==
        --
```
