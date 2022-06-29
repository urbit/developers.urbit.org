+++
title = "Behn"
[extra]
category = "arvo"
+++

**Behn** is the timing [vane](/reference/glossary/filesystem). It allows for applications to schedule events, which are managed in a simple priority queue. For example, [Clay](/reference/glossary/clay), the Urbit filesystem, uses Behn to keep track of time-specific file requests. [Eyre](/reference/glossary/eyre), the Urbit web vane, uses Behn for timing-out HTTP sessions.

Behn is located in `/base/sys/vane/behn.hoon` within [Arvo](/reference/glossary/arvo).

### Further Reading

- [The Behn tutorial](/reference/arvo/behn/behn): A technical guide to the Behn vane.
