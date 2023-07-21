+++
title = "Arvo"

[glossaryEntry.arvo]
name = "arvo"
symbol = ""
usage = "Arvo"
desc = "The Urbit operating system and kernel."

+++

**Arvo** is the Urbit operating system and kernel. Arvo's state is a pure
function of its [event log](/reference/glossary/eventlog), and it serves as the
Urbit event manager. It contains [vanes](/reference/glossary/vane), which are
kernel modules that perform essential system operations.

Arvo being purely functional means that the state of the operating system at a
given moment is completely determined by the sequence of events in the event
log. In other words, the state of an Arvo instance is given by a lifecycle
function

```
L: History ➜ State
```

where `History` consists of the set of all possible sequences of events in an
Arvo event log.

Arvo coordinates and reloads vanes. It can be thought of as a traffic-director.
Any vane needs to go through Arvo before reaching another vane. Events and their
effects happen like so:

```
Unix event -> Vere -> Arvo -> vane -> Arvo
```

Here, [Vere](/reference/glossary/vere) is the virtual machine running Urbit.

Arvo is located in `/base/sys/arvo.hoon` within your urbit.

Arvo vanes are [Ames](/reference/glossary/ames) for networking,
[Behn](/reference/glossary/behn) for timing, [Clay](/reference/glossary/clay)
for the filesystem and build system, [Dill](/reference/glossary/dill) for
terminal driving, [Eyre](/reference/glossary/eyre) for the web server,
[Gall](/reference/glossary/gall) for application management,
[Iris](/reference/glossary/iris) for the HTTP client,
[Jael](/reference/glossary/jael) for PKI management, and
[Khan](/reference/glossary/khan) for external control and thread running.
[Lick](/reference/glossary/lick) for external communication.

Vanes and other programs for Arvo are written in [Hoon](/reference/glossary/hoon).

A ship creates its own copy of Arvo via a bootstrap sequence known as a
[Pill](/reference/glossary/pill).

### Further Reading

- [The Arvo reference](/reference/arvo/overview): An in-depth technical
  guide to Arvo and its vanes.
