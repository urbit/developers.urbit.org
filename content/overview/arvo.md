+++
title = "Arvo"
weight = 10
+++

Arvo is a purely functional,
[non-preemptive](https://en.wikipedia.org/wiki/Cooperative_multitasking) OS,
written in Hoon, that serves as the event manager of your urbit. It can upgrade
itself from over the network without downtime. The Arvo kernel proper is quite
simple -- it's only about 600 lines of code, excluding its various modules.

The Urbit transition function is implemented in Arvo. Upon being 'poked' by Vere
with the pair of `<input event, state>`, Arvo directs the event to the
appropriate OS module. The result of each Vere 'poke' is a pair of
`<output events, new state>`. Events are typed, and each has an explicit call-stack
structure indicating the event's source module in Arvo.

For a more in-depth technical introduction, see [Arvo Overview](/reference/arvo/overview).

Arvo modules are also called 'vanes'. Arvo's vanes are:

- [Ames](/reference/arvo/ames/ames): defines and implements Urbit's encrypted P2P network protocol, as well
  as Urbit's identity protocol.
- [Behn](/reference/arvo/behn/behn): manages timer events for other vanes.
- [Clay](/reference/arvo/clay/clay): global, version-controlled, and referentially-transparent file system.
  Also includes our typed functional build system.
- [Dill](/reference/arvo/dill/dill): terminal driver.
- [Eyre](/reference/arvo/eyre/eyre): HTTP server.
- [Gall](/reference/arvo/gall/gall): application sandbox and manager.
- [Iris](/reference/arvo/iris/iris): HTTP client.
- [Jael](/reference/arvo/jael/jael): Public and private key storage.
- [Khan](/reference/arvo/khan/khan): Control plane and thread runner.
