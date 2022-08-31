+++
title = "Dill"

[extra]
category = "arvo"
+++

**Dill** is the terminal-driver [vane](/reference/glossary/filesystem). You run
your urbit in your Unix terminal, and Unix sends every event—such as a keystroke
or a change in the dimensions of the terminal window—to be handled by Dill.

A keyboard event's journey from Unix to Dojo, the Urbit shell, can be imagined
as diagrammed below:

```
Keystroke in Unix -> Vere (virtual machine) -> Arvo -> Dill -> the Dojo
```

Dill is located at `/base/sys/vane/dill.hoon` within
[Arvo](/reference/glossary/arvo).

### Further Reading

- [The Dill tutorial](/reference/arvo/dill/dill): A technical guide to the Dill
  vane.
