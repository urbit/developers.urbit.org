+++
title = "Keyfile"

[extra]
category = "azimuth"
+++

A **keyfile** is a piece of information used to associate a [ship](/reference/glossary/ship) with an Urbit identity so that the ship can use the [Arvo](/reference/glossary/arvo) network. A keyfile is dependent upon the [networking keys](/reference/glossary/bridge) that have been set for the identity; we recommend using [Bridge](/reference/glossary/bridge) to set the networking keys and to generate the corresponding keyfile.

The keyfile is used as an argument in the command line when booting a ship. During the boot process, [Vere](/reference/glossary/vere) passes the keyfile into the Arvo state.

### Further Reading

- [Installation Guide](https://urbit.org/getting-started): Instructions on using a keyfile to boot a ship.
