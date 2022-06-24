+++
title = "Scry Reference"
weight = 4
template = "doc.html"
+++

Here are the scry endpoints of Ames. All of them take a `%x` `care` and require the `desk` in the path prefix be empty, so the general format is `.^([type] %ax /=//=/[some-path])`.

## /protocol/version

A scry with a `%x` `care` and a `path` of `/protocol/version` will return the current Ames protocol version as a `@`.

#### Example

```
> .^(@ %ax /=//=/protocol/version)
0
```

## /peers

A scry with a `%x` `care` and a `path` of `/peers` will return all ships that Ames is aware of. The type returned is a `(map ship ?(%alien %known))`, where `%known` means we have PKI data for them and `%alien` means we don't.

#### Example

```
> .^((map ship ?(%alien %known)) %ax /=//=/peers)
{[p=~wet q=%known] [p=~nes q=%known]}
```

## /peers/[ship]

A scry with a `%x` `care` and a `path` of `/peers/[ship]` where `[ship]` is a ship name like `~dopzod` will return everything Ames knows about that ship, or crash if the ship is unknown to Ames. The type returned is a [$ship-state](/docs/arvo/ames/data-types#ship-state).

#### Example

```
> .^(ship-state:ames %ax /=//=/peers/~nes)
[ %known
  [ symmetric-key=0wEF.5-Mp4.ehBxk.a-ktl.CAUHq.~XNVq.AfPFk.TwBbj.rc7MS
    life=1
    public-key=0w9R.IG6Km.CQfuL.lP9Da.l~kh1.lOHzV.xactk.1ybiB.hekW~.VC2d0.DDRsU.h6GHl.PKmRX.p3u2-.vO4Hg.QTOlp.A4AI0.uGPVy
    sponsor=~nes
  ]
  route=[~ [direct=%.y lane=[%.y p=~nes]]]
  qos=[%dead last-contact=~2021.8.9..16.11.36..fdbc]
    ossuary
  [ next-bone=4
    by-duct={[p=~[/gall/sys/way/~nes/hood /gall/use/hood/0w2.4d7EV/out/~nes/hood/helm/hi/~nes /dill //term/1] q=0]}
    by-bone={[p=0 q=~[/gall/sys/way/~nes/hood /gall/use/hood/0w2.4d7EV/out/~nes/hood/helm/hi/~nes /dill //term/1]]}
  ]
    snd
  { [ p=0
        q
      [ current=2
        next=3
        unsent-messages={}
        unsent-fragments=~
        queued-message-acks={}
          packet-pump-state
        [ next-wake=[~ ~2021.8.17..02.21.14..3d23]
          live={[[message-num=2 fragment-num=0] [last-sent=~2021.8.17..02.19.14..3d23 retries=2.255 skips=0] num-fragments=1 fragment=0w2.QJ1qS.JzaQn.w7rMp.IzuTJ.7M7aP.-1s~1]}
          metrics=[rto=~m2 rtt=~s1 rttvar=~s1 ssthresh=1 cwnd=1 num-live=1 counter=1]
        ]
      ]
    ]
  }
  rcv={}
  nax={}
  heeds={~[/gall/sys/lag /dill //term/1]}
]
```

## /peers/[ship]/forward-lane

A scry with a `%x` `care` and a `path` of `/peers/[ship]/forward-lane` where `[ship]` is a ship name like `~dopzod` will return outbound routes to the given ship, or `~` if there are none. The type returned is a `(list lane:ames)`, see [$lane](/docs/arvo/ames/data-types#lane) for type details.

#### Examples

```
> .^((list lane:ames) %ax /=//=/peers/~nes/forward-lane)
~[[%.y p=~nes]]
```

```
> .^((list lane:ames) %ax /=//=/peers/~nec/forward-lane)
~
```

## /bones/[ship]

A scry with a `%x` `care` and a `path` of `/bones/[ship]` where `[ship]` is a ship name like `~dopzod` will return inbound and outbound [$bone](/docs/arvo/ames/data-types#bone)s, which index message flows. If the ship in question is unknown to Ames, the scry will fail. The type returned is `[snd=(set bone) rcv=(set bone)]`.

#### Example

```
> .^([snd=(set bone) rcv=(set bone)] %ax /=//=/bones/~nes)
[snd={0} rcv={}]
```

## /snd-bones/[ship]/[bone]

A scry with a `%x` `care` and a `path` of `/snd-bones/[ship]/[bone]`, where `[ship]` is a ship name like `~dopzod` and `[bone]` is an outbound [$bone](/docs/arvo/ames/data-types#bone), will return message flow details for that `bone`. If the ship in question is unknown to Ames or the `bone` does not exist, the scry will fail. The type returned is a [$message-pump-state](/docs/arvo/ames/data-types#message-pump-state) wrapped in a `vase`.

#### Example

```
> !<  message-pump-state:ames  .^(vase %ax /=//=/snd-bones/~nes/0)
[ current=2
  next=3
  unsent-messages={}
  unsent-fragments=~
  queued-message-acks={}
    packet-pump-state
  [ next-wake=[~ ~2021.8.17..02.27.14..aaff]
      live
    { [ [message-num=2 fragment-num=0]
        [last-sent=~2021.8.17..02.25.14..aaff retries=2.258 skips=0]
        num-fragments=1
        fragment=0w2.QJ1qS.JzaQn.w7rMp.IzuTJ.7M7aP.-1s~1
      ]
    }
    metrics=[rto=~m2 rtt=~s1 rttvar=~s1 ssthresh=1 cwnd=1 num-live=1 counter=1]
  ]
]
```
