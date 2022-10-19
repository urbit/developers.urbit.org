+++
title = "Replay"

[extra]
category = "arvo"

[glossaryEntry.replay]
name = "replay"
symbol = ""
usage = "arvo"
desc = "How Vere computes the state of a ship's Arvo instance from an event log."

+++

**Replay** is how [Vere](/reference/glossary/vere) computes the state of a ship's [Arvo](/reference/glossary/arvo) instance from the [event log](/reference/glossary/eventlog) after a ship reboots. In order to avoid replaying the entire event log, Replay takes a snapshot of the current state of the ship approximately once every ten minutes. Then when a ship reboots, Replay loads the most recent snapshot and replays events from the event log up to the most recent event.

### Further Reading

- [The Vere tutorial](/reference/runtime/): An in-depth technical guide to Vere.
