+++
title = "Layer 2 Actions"
weight = 6
+++

There are a total of eleven layer 2 actions, each corresponding to a familiar
[layer 1 action](/reference/azimuth/ecliptic): `%transfer-point`, `%spawn`,
`%configure-keys`, `%escape`, `%cancel-escape`, `%adopt`, `%reject`, `%detach`,
`%set-management-proxy`, `%set-spawn-proxy`, and `%set-transfer-proxy`.
Descriptions of what these actions do may be found by searching for them at
[Azimuth.eth](/reference/azimuth/azimuth-eth).

Once a ship moves to layer 2, the owner will still utilize the same private keys
they used before the transfer to perform Azimuth actions. This includes the ownership
key as well as proxies. Stars and galaxies may move their spawn proxy to layer 2
while otherwise remaining on layer 1, but it is not possible to transfer only
the management proxy to layer 2; it may only happen as a side-effect of
transferring ownership to layer 2.

## Moving a pre-existing ship to L2

In order to move your ship from layer 1 to layer 2, transfer ownership of your
ship to the address `0x1111111111111111111111111111111111111111`. The easiest
way to accomplish this is using [Bridge](/reference/glossary/bridge). The Azimuth
smart contracts interpret any ship at this address as being on layer 2.

## Dominion

Layer 2 Azimuth data for a given ship includes which layer that ship is on. We
call this the ship's _dominion_. There are three dominions: `%l1`, `l2`, and
`%spawn`. Planets may exist in dominion `%l1` or `%l2`, stars may exist in any
of the three dominions, and galaxies may exist in dominion `%l1` or `%spawn`. We
detail what this means in each case in the following.

## Planets

*Permitted dominions:* `%l1`, `%l2`.

### `%l1` planets

*Permitted layer 2 actions:* 
 - owner: `%escape`, `%cancel-escape`
 - management proxy: `%escape`, `%cancel-escape`
 - transfer proxy: none

A planet in dominion `%l1` is said to exist on layer 1, which is the default
state for all planets prior to the introduction of naive rollups. In addition to
the ordinary layer 1 Azimuth actions a planet can perform, they may also choose to
`%escape` or `%cancel-escape` on layer 2 using either their ownership key or
[management proxy](/reference/glossary/proxies). See the [layer 2 sponsorship](/reference/azimuth/l2/layer2#sponsorship)
section for more information on layer 1 ships performing layer 2
sponsorship actions.

Layer 1 planets may also move to dominion `%l2` by depositing their ownership to
the layer 2 deposit address.

### `%l2` planets

*Permitted layer 2 actions:*
 - owner: `%transfer-point`, `%configure-keys`,
`%escape`, `%cancel-escape`, `%set-management-proxy`, `%set-transfer-proxy`
 - management proxy: `%configure-keys`, `%escape`, `%cancel-escape`,
`%set-management-proxy`
 - transfer proxy: `%transfer-point`, `%set-transfer-proxy`

A planet in dominion `%l2` is said to exist on layer 2. A planet may be on layer
2 either by previously being a layer 1 planet deposited to the layer 2 address,
or by being spawned by a star in dominion `%spawn` or `%l2`, in which case it
will always be on layer 2.

A layer 2 planet is no longer capable of performing any layer 1 actions, and
cannot move to layer 1.

## Stars

*Permitted dominions:* `%l1`, `%spawn`, `%l2`.

### `%l1` stars

*Permitted layer 2 actions:*
 - owner: `%escape`, `%cancel-escape`, `%adopt`,
`%reject`, `%detach`
 - management proxy: `%escape`, `%cancel-escape`, `%adopt`,
`%reject`, `%detach`
 - spawn proxy: none
 - transfer proxy: none

A star in dominion `%l1` is said to exist on layer 1, which is the default state
for all stars prior to the introduction of naive rollups. In addition to the
ordinary Azimuth actions a star can perform, they may also perform any
sponsorship-related actions on layer 2.

A `%l1` dominion star may move to dominion `%spawn` by depositing its spawn proxy to the
layer 2 deposit address, or may move to dominion `%l2` by depositing its ownership
to the layer 2 deposit address. Both actions are irreversible.

### `%spawn` stars

*Permitted layer 2 actions:*
 - owner: `%escape`, `%cancel-escape`, `%adopt`,
`%reject`, `%detach`, `%spawn`, `%set-spawn-proxy`
 - management proxy: `%escape`,
`%cancel-escape`, `%adopt`, `%reject`, `%detach`
 - spawn proxy: `%spawn`,
`%set-spawn-proxy`
 - transfer proxy: none

A star in dominion `%spawn` is said to exist on layer 1.

A star in dominion `%spawn` may spawn planets directly on layer 2, but will no
longer be able to spawn layer 1 planets and will no longer be able to set its
spawn proxy on layer 1. All other layer 1 Azimuth actions may still be performed
by the star.

A star moving from `%l1` to `%spawn` has no effect on sponsorship status of any
of its sponsored planets. Moving to `%spawn` from `%l1` is currently
irreversible - the only further change to dominion permitted is moving to `%l2`.

### `%l2` stars

*Permitted layer 2 actions:*
 - owner: `%transfer-point`, `%spawn`, `%configure-keys`, `%escape`,
`%cancel-escape`, `%adopt`, `%reject`, `%detach`, `%set-management-proxy`,
`%set-spawn-proxy`,`%set-transfer-proxy`
 - management proxy: `%escape`,
`%cancel-escape`, `%adopt`, `%reject`, `%detach`, `%configure-keys`,
`%set-management-proxy`
 - spawn proxy: `%spawn`, `%set-spawn-proxy`
 - transfer proxy: `%transfer-point`, `%set-transfer-proxy`

A star in dominion `%l2` is said to exist on layer 2. A star may exist on layer
2 by being deposited to the layer 2 deposit address from layer 1, or by being
spawned by a `%spawn` dominion galaxy.

A star in dominion `%l2` cannot perform any layer 1 actions.

## Galaxies

*Permitted dominions:* `%l1`, `%spawn`.

### `%l1` galaxies

*Permitted layer 2 actions:*
 - owner: `%adopt`, `%reject`, `%detach`
 - management proxy: `%adopt`, `%reject`, `%detach`
 - spawn proxy: none
 - transfer proxy: none
 - voting proxy: none.

A galaxy in dominion `%l1` is said to exist on layer 1, which is the default state
for all galaxies prior to the introduction of naive rollups. In addition to the
ordinary Azimuth actions a galaxy can perform, they may also perform any
sponsorship-related actions on layer 2. `%l1` galaxies can perform all the usual
layer 1 Azimuth actions, and may also perform layer 2 sponsorship actions.

A `%l1` dominion galaxy may move to dominion `%spawn` by depositing its spawn proxy to the
layer 2 deposit address. This action is irreversible. Note, however that the
majority of galaxies already have all of their stars spawned in the [Linear
Star Release
Contract](https://etherscan.io/address/0x86cd9cd0992f04231751e3761de45cecea5d1801).
Layer 2 has no interactions with this contract - all stars released in this
manner are `%l1` dominion stars. Moving to the `%spawn` dominion has no effect
on sponsorship status.

### `%spawn` galaxies

*Permitted layer 2 actions:*
 - owner: `%adopt`, `%reject`, `%detach`, `%spawn`,
`%set-spawn-proxy`
 - management proxy: `%adopt`, `%reject`, `%detach`
 - spawn proxy: `%spawn`, `%set-spawn-proxy`
 - transfer proxy: none
 - voting proxy: none

Galaxies may either remain on layer 1, or, similar to stars, they may
deposit their spawn proxy to layer 2. They cannot move their ownership,
management proxy, or voting proxy to layer 2. However, as with stars,
sponsorship actions may be performed on layer 2 using the ownership or
management proxies regardless of the dominion status of the galaxy.



