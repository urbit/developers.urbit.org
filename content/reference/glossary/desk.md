+++
title = "Desk"

[extra]
category = "arvo"

[glossaryEntry.desk]
name = "desk"
symbol = ""
usage = "arvo"
desc = "A revision-controlled branch of the Clay filesystem."

+++

A **desk** is an independently revision-controlled branch of a [ship](/reference/glossary/ship) that uses the [Clay](/reference/glossary/clay) filesystem. Each desk contains its own apps, [mark](/reference/glossary/mark) definitions, files, and so forth.

Traditionally a ship has at least a `%base` desk, and typically `%garden` and `%landscape` desk among others. The `%base` desk has the kernel and base system software, while other desks are usually each for different apps. A desk is a series of numbered commits, the most recent of which represents the current state of the desk. A commit is composed of:

1. An absolute time when it was created.
2. A list of zero or more parents.
3. A map from paths to data.

### Further Reading

- [Using Your Ship](https://urbit.org/using/os/filesystem): A user guide that includes instructions for using desks.
