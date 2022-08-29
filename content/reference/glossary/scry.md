+++
title = "Scry"

[extra]
category = "hoon-nock"
+++

A **scry** is a read-only request to the namespace of a local
[vane](/reference/glossary/vane) or [agent](/reference/glossary/agent). In
[Hoon](/reference/glossary/hoon), scries are performed with the `.^`
[rune](/reference/glossary/rune). Unlike other kinds of inter-vane or
inter-agent communications, scries cannot alter the state of the ship or produce
other side-effects. Additionally, scries are an exception to the purity of Hoon
functions, and can be performed in-line. The scry interface is also exposed
through [Eyre](/reference/glossary/eyre), the web-server vane, to web clients.

#### Further Reading

- [Scry reference](/reference/arvo/concepts/scry): developer documentation of
  how scries work and how to use them.
