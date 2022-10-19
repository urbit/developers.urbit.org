+++
title = "Delegated Sending"

[extra]
category = "azimuth"

[glossaryEntry."delegated sending"]
name = "delegated sending"
symbol = ""
usage = "azimuth"
desc = "A method by which a star can distribute planets, assigning them to a delegated planet."

+++

The **Delegated Sending** [Azimuth](/reference/glossary/azimuth) contract is a way that a [star](/reference/glossary/star ) distributes [L1](/reference/glossary/azimuth) [planets](/reference/glossary/planet). After a star configures the Delegated Sending contract as its [spawn proxy](/reference/glossary/proxies) it can give invites to planets, and those invitees can subsequently send additional planets from that star to their friends, and pass on this invite power indefinitely. This contract keeps track of those operations in the form of the [Invite Tree](/reference/glossary/invite-tree), so the relationship between inviters and invitees is publicly known.

With the introduction of the [L2](/reference/glossary/rollups) invite system,
delegated sending is less commonly used.
