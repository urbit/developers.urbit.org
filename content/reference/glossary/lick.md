+++
title = "Lick"

[extra]
category = "arvo"

[glossaryEntry.lick]
name = "lick"
symbol = ""
usage = "arvo"
desc = "IPC vane Arvo. Allows for applications to communicate with earth."

+++
**Lick** is the interprocess communication (IPC) [vane](/reference/glossary/vane) (kernel module).
It allows for applications to open and close IPC ports to earth. For 
example, a [Gall](/reference/glossary/gall) agent can send a `%spin` 
card to open an IPC port and allow for an earth process to communicate 
with it through `%spit` and `%soak` cards. 

Lick is located in `/base/sys/vane/lick.hoon` within [Arvo](/reference/glossary/arvo).

### Further Reading

- [The Lick reference](/reference/arvo/lick/lick): A technical guide to the Lick vane.
