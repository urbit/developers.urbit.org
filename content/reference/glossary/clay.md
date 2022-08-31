+++
title = "Clay"

[extra]
category = "arvo"
+++

**Clay** is the typed, revision-controlled filesystem
[vane](/reference/glossary/vane) (kernel module) and also contains Urbit's build
system (formerly a separate vane called Ford before it was merged into Clay).
Clay's revision control system is similar to Git.

Clay contains a number of [desks](/reference/glossary/desk), which can be
thought of as separate repos or branches, and contain the source code for your
apps. The `%base` desk contains the [Arvo](/reference/glossary/arvo) kernel and
vanes including Clay itself, as well as the standard libraries.

Clay is located at `/base/sys/vane/clay.hoon` within Arvo.

### Further Reading

- [Using Your Ship](https://urbit.org/using/os/filesystem): A user guide that includes instructions on using Clay.
- [The Clay tutorial](/reference/arvo/clay/clay): A technical guide to the Clay vane.
