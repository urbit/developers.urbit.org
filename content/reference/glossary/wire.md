+++
title = "Wire"

[extra]
category = "hoon-nock"
+++

A **wire** is a tag specified for responses to requests a
[Gall](/reference/glossary/gall) [agent](/reference/glossary/agent) makes to
other agents or [vanes](/reference/glossary/vane). The type of a wire is the
same as a [path](/reference/glossary/path), having the format `/foo/bar/baz`.
The wire lets an agent know what a particular message relates to. The content of
the wire is up to the developer, depending on the needs and logic of their
agent.
