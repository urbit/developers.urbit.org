+++
title = "Overview"
weight = 1
+++

Urbit's inter-process communication (IPC) vane.

Lick manages IPC ports, and the communication between Urbit applications and
POSIX applications via these ports. Other vanes and applications ask Lick to
open an IPC port, notify it when something is connected or disconnected, and
transfer data between itself and the Unix application.

The IPC ports Lick creates are Unix domain sockets (`AF_UNIX` address family)
of the `SOCK_STREAM` type.

Data sent to and from the socket is a [++jam](/reference/hoon/stdlib/2p#jam)med
pair of `mark` and `noun`. The process on the host OS must therefore be able to
[`++cue`](/reference/hoon/stdlib/2p#cue) the jam and (most likely) convert the
noun into a native data structure. A couple of examples of libraries for this
purpose are [`pynoun`](https://github.com/urbit/tools) and
[`nockjs`](https://github.com/urbit/nockjs).

Lick has no novel data types in its API apart from `name`, which is just a
`path` representing the name of a socket.

## Sections

[API Reference](/reference/arvo/lick/tasks) - The `task`s Lick takes and the `gift`s it returns.

[Scry Reference](/reference/arvo/lick/scry) - The scry endpoints of Lick.

[Examples](/reference/arvo/lick/examples) - Practical examples of using Lick's `task`s.