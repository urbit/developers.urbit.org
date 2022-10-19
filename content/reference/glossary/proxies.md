+++
title = "Proxies"

[extra]
category = "azimuth"

[glossaryEntry.proxies]
name = "proxies"
symbol = ""
usage = "azimuth"
desc = "Ethereum addresses in the Urbit HD Wallet that have limited powers."

+++

**Proxies** are Ethereum addresses in the [Urbit ID](/reference/glossary/azimuth)
system that have limited powers. They are lower-powered "siblings" of the
ownership key, which has the sole power to transfer the assigned Urbit identity.
Using [Bridge](/reference/glossary/bridge), you can change the Ethereum addresses
used for your proxies. If you use the [Urbit HD
wallet](/reference/glossary/hdwallet), your proxies have already been set.

There are three types of proxy.

- **Management Proxy**

The management proxy can configure or set Arvo networking keys and conduct sponsorship-related operations.

- **Voting Proxy**

The voting proxy can cast votes on behalf of its assigned point on new proposals, including changes to [Ecliptic](/reference/glossary/ecliptic). The voting proxy is unique to [galaxies](/reference/glossary/galaxy), since only power galaxies have seats in the Senate.

- **Spawn Proxy**

Creates new child points given Ethereum address. For [stars](/reference/glossary/star) and [galaxies](/reference/glossary/galaxy) only.


### Further Reading

- [Azimuth glossary page](/reference/glossary/azimuth): The glossary entry for Azimuth.
- [The Azimuth concepts page](/reference/azimuth/advanced-azimuth-tools): A more in-depth explanation of Azimuth, including information the storage of Urbit identities.
