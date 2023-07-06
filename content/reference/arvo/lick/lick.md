+++
title = "Overview"
weight = 1
+++

Urbit's Interprocess Communication vane.

Lick manages IPC ports and the communication between Urbit applications and POSIX applciations. Other vanes and applications ask Lick to open an IPC port, notify it when something is connected or disconnected, and transfer data between itself and the Unix application. 

## Sections

[API Reference](/reference/arvo/lick/tasks) - The `task`s Lick takes and the `gift`s it returns.

[Scry Reference](/reference/arvo/lick/scry) - The scry endpoints of Lick.

[Examples](/reference/arvo/lick/examples) - Practical examples of using Lick's `task`s.
