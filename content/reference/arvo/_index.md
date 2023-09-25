+++
title = "Arvo"
weight = 300
sort_by = "weight"
+++

Resources about the Urbit OS.

## [Overview](/reference/arvo/overview)

Arvo is Urbit's functional operating system, written in [Hoon](/guides/core/hoon-school/). It's composed of modules called _vanes_, each of which has its own folder:

## [Ames](/reference/arvo/ames/ames)

Ames is the name of our network and the vane that communicates over it. It's an encrypted P2P network composed of instances of the Arvo operating system.

## [Behn](/reference/arvo/behn/behn)

Behn is our timer. It allows vanes and applications to set and timer events, which are managed in a simple priority queue.

## [Clay](/reference/arvo/clay/clay)

Clay is our filesystem and revision-control system.

## [Dill](/reference/arvo/dill/dill)

Dill is our terminal driver. Unix sends keyboard events to dill from the terminal, and dill produces terminal output.

## [Eyre](/reference/arvo/eyre/eyre)

Eyre is our HTTP server. Unix sends HTTP messages to `%eyre`, and `%eyre` produces HTTP messages in response.

## [Gall](/reference/arvo/gall/gall)

Gall is the vane for controlling userspace apps.

## [Iris](/reference/arvo/iris/iris)

Iris is our HTTP client.

## [Jael](/reference/arvo/jael/jael)

Jael manages keys and Azimuth state.

## [Khan](/reference/arvo/khan/khan)

Khan is our thread dispatcher.

## [Lick](/reference/arvo/lick/lick)

Lick is the IPC vane.

## [Concepts](/reference/arvo/concepts/)

Explanations of design decisions that are pervasive throughout Arvo.

## [Tutorials](/reference/arvo/tutorials/)

Walkthroughs that teach you more about how Arvo works.
