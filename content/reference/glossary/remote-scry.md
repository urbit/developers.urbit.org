+++
title = "Scry"

[extra]
category = "hoon-nock"

[glossaryEntry."Remote scry"]
name = "remote scry"
symbol = ""
usage = "hoon-nock"
desc = "A remote scry is a read-only request to the namespace of a remote ship."

+++

A **remote scry** is a read-only request to the namespace of a remote
[vane](/reference/glossary/vane) or [agent](/reference/glossary/agent). These
differ from ordinary [local scries](/reference/glossary/scry) and are not
performed with the `.^` [rune](/reference/glossary/rune).

Remote scries reduce event log bloat on the publishing ship, allow the
publisher's runtime to cache data, and especially improve performance when
publishing the same data for many ships to retrieve.

At the the time of writing, Gall allows agents to bind data to remote scry
paths and perform remote scries with `task`s to
[Ames](/reference/glossary/ames). Additionally, Clay uses remote scries
internally to sync remote desks.

#### Further Reading

- [Remote scry guide](/guides/additional/remote-scry): developer documentation
  of how remote scries work and how to use them.
