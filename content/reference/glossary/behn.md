+++
title = "Behn"
template = "doc.html"
[extra]
category = "arvo"
+++

**Behn** is the timing [vane](/docs/glossary/filesystem). It allows for applications to schedule events, which are managed in a simple priority queue. For example, [Clay](/docs/glossary/clay), the Urbit filesystem, uses Behn to keep track of time-specific file requests. [Eyre](/docs/glossary/eyre), the Urbit web vane, uses Behn for timing-out HTTP sessions.

Behn is located in `/base/sys/vane/behn.hoon` within [Arvo](/docs/glossary/arvo).

### Further Reading

- [The Behn tutorial](/docs/arvo/behn/behn): A technical guide to the Behn vane.
