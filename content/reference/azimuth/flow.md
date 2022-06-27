+++
title = "Azimuth Data Flow"
weight = 4
+++

This document summarizes the various components involved with Azimuth and
how they communicate with each other. This also constitutes an explanation for
how Urbit implements the data flow of naive rollups.

## Bridge

The primary way in which users interact with Azimuth is via
[Bridge](https://bridge.urbit.org). Bridge is responsible for collecting
transactions from users, signing them, and forwarding them to a roller via an
HTTP API.

## Azimuth

Azimuth was originally defined as a set of smart contracts on Ethereum that
defines the [state](/reference/azimuth/azimuth-eth) and [business
logic](/reference/azimuth/ecliptic) of the PKI for layer 1. With the introduction of
naive rollups, this has also come to include the set of components used for
dealing with the PKI within Urbit, as now the complete PKI state is stored
offchain (though this state is derived entirely from on-chain data). The
following sections outline what each component is responsible for and how it
communicates with the others.

The Gall agents involved with Azimuth are summarized as follows:

- [`%azimuth`](#azimuth) - obtains and holds PKI state.
- [`%azimuth-rpc`](#azimuth-rpc) - JSON RPC-API for `%azimuth`.
- [`%eth-watcher`](#eth-watcher) - Ethereum event log collector.
- [`%roller`](#roller) - submits batches of L2 transactions to Ethereum.
- [`%roller-rpc`](#roller-rpc) - JSON RPC-API for `%roller`.

The transaction processing library is [`/lib/naive.hoon`](#naive).

### Gall agents

#### `%azimuth` {% #azimuth %}

`%azimuth`, located at `/app/azimuth.hoon`, is a Gall agent and thread handler
responsible for finding Azimuth transactions gathered by `%eth-watcher`,
keeping track of the PKI state, and exposing that data via scries.

The following diagram illustrates `%azimuth`'s and `%eth-watcher`'s role in the system.

![Azimuth components](https://media.urbit.org/docs/layer2/l2-azimuth-azimuth.svg)

The state held by `%azimuth` is the following.

```hoon
++  app-state
  $:  %3
      url=@ta
      whos=(set ship)
      nas=^state:naive
      own=owners
      logs=(list =event-log:rpc:ethereum)
  ==
```

`whos` is the set of ships currently known by Azimuth. `nas` is the PKI state,
as defined in [`naive.hoon`](#naive). `own` is a `jug` of Ethereum addresses and
the set of ships owned by that address. `logs` is a list of all Azimuth-related
Ethereum event logs known by the ship.

Scries can be inferred from the `+on-peek` arm:

```hoon
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+  path  (on-peek:def path)
      [%x %logs ~]  ``noun+!>(logs.state)
      [%x %nas ~]   ``noun+!>(nas.state)
      [%x %dns ~]   ``noun+!>(dns.nas.state)
      [%x %own ~]   ``noun+!>(own.state)
  ==
```

#### `%azimuth-rpc` {% #azimuth-rpc %}

`%azimuth-rpc`, located at `app/azimuth-rpc.hoon`, is a JSON RPC-API for getting
`point` and `dns` data from the Azimuth PKI state kept by `%azimuth`.

#### `%eth-watcher` {% #eth-watcher %}

`%eth-watcher`, located at `/app/eth-watcher.hoon`, is responsible for listening
to an Ethereum node and collecting event logs from it. It is general-purpose and
not particular to Azimuth. It sends collected transactions to `+on-agent` in
`%azimuth`, which then obtains the resulting PKI state transitions by passing them to
[`naive.hoon`](#naive).

[![Eth-watcher](https://media.urbit.org/docs/layer2/roller-agents.png)](https://media.urbit.org/docs/layer2/roller-agents.png)

#### `%roller` {% #roller %}

`%roller`, stored at `/app/roller.hoon`, is a Gall agent responsible for
collecting and submitting batches of layer 2 transactions to the Ethereum
blockchain. Among other things, it keeps
track of a list of pending transactions to be sent, transactions it has sent
that are awaiting confirmation, history of transactions sent organized by
Ethereum address, and when the next batch of transactions will be sent. See also
[Rollers](/reference/azimuth/l2/roller) for more information on the roller.

The following diagram illustrates how the roller interacts with Bridge and
Ethereum at a high level.

[![High level overview](https://media.urbit.org/docs/layer2/l2-high.png)](https://media.urbit.org/docs/layer2/l2-high.png)

The relationship between the roller and other agents is outlined in the
following diagram.

[![Roller](https://media.urbit.org/docs/layer2/roller-agents.png)](https://media.urbit.org/docs/layer2/roller-agents.png)

`%roller` has a number of scries available, intended primarily to
display data to the end user in Bridge. They can be inferred from the `+on-peek`
arm:

```hoon
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    |^
    ?+  path  ~
      [%x %pending ~]       ``noun+!>(pending)
      [%x %pending @ ~]     (pending-by i.t.t.path)
      [%x %tx @ %status ~]  (status i.t.t.path)
      [%x %history @ ~]     (history i.t.t.path)
      [%x %nonce @ @ ~]     (nonce i.t.t.path i.t.t.t.path)
      [%x %spawned @ ~]     (spawned i.t.t.path)
      [%x %next-batch ~]    ``atom+!>(next-batch)
      [%x %point @ ~]       (point i.t.t.path)
      [%x %points @ ~]      (points i.t.t.path)
      [%x %config ~]        config
      [%x %chain-id ~]      ``atom+!>(chain-id)
    ==
```

This app is not responsible for communicating with Bridge via HTTP. Instead, that is
handled by `%roller-rpc`. The scries are also communicated to Bridge via
`%roller-rpc`.

#### `%roller-rpc`

`%roller-rpc`, stored at `/app/roller-rpc.hoon`, is a very simple Gall app responsible for receiving HTTP RPC-API
calls, typically sent from other Urbit ID users via Bridge. It then translates
these API calls from JSON to a format understood by `%roller` and
forwards them to `%roller`. This app
does not keep any state - its only purpose is to act as an intermediary between
Bridge and `%roller`. See [here](/reference/azimuth/l2/layer2-api) for more
information on the JSON RPC-API.

### `naive.hoon` {% #naive %}

`/lib/naive.hoon` consists of a gate whose sample is a `verifier`, `chain-id=@ud`,
`state`, and `input`, which outputs a cell of `[effects state]`. This is the
transition function which updates the state of the PKI stored in `%azimuth`
which handles state transitions caused by both layer 1 and layer 2 transactions.
A high-level overview of how `naive.hoon` functions can be found
[here](/reference/azimuth/l2/layer2#layer-2).

A `verifier` is a gate whose sample is of the form `[dat=octs v=@ r=@ s=@]` and
which returns `(unit address)`:

```hoon
+$  verifier  $-([dat=octs v=@ r=@ s=@] (unit address))
```

The `verifier` in use by `naive.hoon` runs the keccak hash function on `dat` to
verify that `dat` is data signed by the ECDSA signature given by the `[v r s]`
tuple, according to the format for signed transactions outlined in the
[bytestring format](/reference/azimuth/l2/bytestring) documentation.

`chain-id` is the ID used by the Ethereum blockchain, which is `1337`. See [bytestring
format](/reference/azimuth/l2/bytestring) for more information. This is used so that
e.g. transactions on the Ropsten test network cannot be replayed on the mainnet.

`state` is the current state of the PKI. This is structured similarly to the
state held in [Azimuth.eth](/reference/azimuth/azimuth-eth), but will differ in
general since `state` takes into account layer 2 transactions as well. See the
[Layer 2 Overview](/reference/azimuth/l2/layer2#state) for more on how PKI state is handled.

```hoon
+$  state
  $:  =points
      =operators
      dns=(list @t)
  ==
+$  points     (tree [ship point])
++  point
  $:  ::  domain
      ::
      =dominion
      ::
      ::  ownership
      ::
      $=  own
      $:  owner=[=address =nonce]
          spawn-proxy=[=address =nonce]
          management-proxy=[=address =nonce]
          voting-proxy=[=address =nonce]
          transfer-proxy=[=address =nonce]
      ==
      ::
      ::  networking
      ::
      $=  net
      $:  rift=@ud
          =keys
          sponsor=[has=? who=@p]
          escape=(unit @p)
      ==
  ==
+$  dominion  ?(%l1 %l2 %spawn)
+$  operators  (jug address address)
```

`points` should be self-explanatory if you are already familiar with the
structure of [Azimuth.eth](/reference/azimuth/azimuth-eth). The only new addition is
`dominion`, whose value says
whether a ship is on layer 1, layer 2, or layer 1 with a layer 2 spawn proxy.
See [Layer 2 actions](/reference/azimuth/l2/l2-actions) for an overview of how
`dominion` determines the PKI actions available to a ship.

`operators` already existed on layer 1 and are defined as a part of the [ERC-721
standard](https://eips.ethereum.org/EIPS/eip-721).

`dns` is a list of DNS entries by which galaxy IP addresses may be looked up. At
present, this is always `~['urbit.org' 'urbit.org' 'urbit.org']`.
