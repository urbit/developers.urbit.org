+++
title = "Vere"

[extra]
category = "hoon-nock"
+++

**Vere**, pronounced "Vair", is the [Nock](/reference/glossary/nock) runtime environment and Urbit virtual machine. Vere is written in C, runs on Unix, and is the intermediate layer between your urbit and Unix. Unix system calls are made by Vere, not Arvo; Vere must also encode and deliver relevant external events to [Arvo](/reference/glossary/arvo). Vere is also responsible for implementing jets and maintaining the persistent state of each urbit (computed as a pure function of its [event log](/reference/glossary/eventlog) with [Replay](/reference/glossary/replay)). It also contains the I/O drivers for Urbit’s vanes, which are responsible for generating events from Unix and applying effects to Unix.

When you boot your [ship](/reference/glossary/ship), Vere passes your [Azimuth](/reference/glossary/azimuth) [keyfile](/reference/glossary/keyfile) into the Arvo state, allowing a connection to the [Ames](/reference/glossary/ames) network.

Vere consists of two processes that communicate via a socket: a daemon process in charge of managing I/O channels, and a worker process that acts as a Nock interpreter that is instructed by the daemon process. Currently the worker is written in C, but a new worker written in Java, called [Jacque](/reference/glossary/jacque), is under development.

### Further Reading

- [The Technical Overview](/overview/)
- [The Vere tutorial](/reference/runtime/): An in-depth technical guide to Vere.
