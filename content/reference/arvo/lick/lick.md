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

The format of the full message with header and data sent to and from the socket
is as follows:

|1 byte |4 bytes          |n bytes|
|-------|-----------------|-------|
|version|jam size in bytes|jamfile|

The version is currently `0`.

The [++jam](/reference/hoon/stdlib/2p#jam)file contains a pair of `mark` and
`noun`. The process on the host OS must therefore strip the first 5 bytes,
[`++cue`](/reference/hoon/stdlib/2p#cue) the jamfile, check the mark and (most
likely) convert the noun into a native data structure.

Here are some libraries that can cue/jam:

- [`pynoun`](https://github.com/urbit/tools)
- [`nockjs`](https://github.com/urbit/nockjs)
- [Rust Noun](https://github.com/urbit/noun)

Lick has no novel data types in its API apart from `name`, which is just a
`path` representing the name of a socket.

## Sections

[API Reference](/reference/arvo/lick/tasks) - The `task`s Lick takes and the `gift`s it returns.

[Scry Reference](/reference/arvo/lick/scry) - The scry endpoints of Lick.

[Examples](/reference/arvo/lick/examples) - Practical examples of using Lick's `task`s.

[Guide](/reference/arvo/lick/guide) - A thorough walk-through of using Lick.
