+++
title = "Layer 2 for stars"
weight = 60
template = "doc.html"
+++

This is a brief summary of the three possible options for star owners with
respect to use of [layer 2](https://developers.urbit.org/reference/glossary/rollups).

## One-way trip

Stars have three options with respect to layer 2:

- Layer 1
- Layer 1 with Layer 2 spawn proxy
- Layer 2

A layer 1 star can move to layer 1 with layer 2 spawn proxy, or to layer 2. A
star on layer 1 with layer 2 spawn proxy can move to layer 2. None of these
actions are currently reversible.

Moving between layers has no effect on sponsorship status of any of its
sponsees, nor its sponsorship status with its galaxy. It also has no effect on
planets spawned by the star prior to moving between layers.

## Layer 1

A star on layer 1 performs all Urbit ID-related actions on layer 1, except for
sponsorship actions, which can be performed on either layer.

## Layer 1 with Layer 2 spawn proxy

A star on layer 1 with layer 2 spawn proxy can spawn planets on layer 2 using
either their ownership proxy or spawn proxy. They will no longer be able to
spawn planets on layer 1. They may also perform sponsorship actions on either
layer, identical to layer 1 stars.

## Layer 2

A star on layer 2 must perform all Urbit ID related actions on layer 2. All
planets spawned by the star will be on layer 2.
