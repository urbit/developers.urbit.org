+++
title = "Eyre"

[extra]
category = "arvo"
+++

**Eyre** is the web-server [vane](/reference/glossary/vane) (kernel module) that
handles client-facing HTTP operations. Unix sends HTTP messages though to Eyre
and Eyre produces HTTP messages in response. It is the counterpart to
[Iris](/reference/glossary/iris), which is the server-facing HTTP vane.

In general, apps and vanes do not call Eyre; rather, Eyre calls apps and vanes.
Eyre uses [Gall](/reference/glossary/gall) to facilitate communication with
apps.

Eyre is located at `/base/sys/vane/eyre.hoon` within
[Arvo](/reference/glossary/arvo).

### Further Reading

- [The Eyre tutorial](/reference/arvo/eyre/eyre): A technical guide to the Eyre vane.
