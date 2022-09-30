+++
title = "Path"

[extra]
category = "hoon-nock"
+++

A **path** is a data type in [Hoon](/reference/glossary/hoon). It is a
[list](/reference/glossary/list) of `@ta` text strings, and its syntax looks
like `/foo/bar/baz`. This type resembles a file path and while it *is* used for
file paths in [Clay](/reference/glossary/clay) (the filesystem
[vane](/reference/glossary/vane)), it's a more general type and is used in other
cases as well, such as subscription paths and [wires](/reference/glossary/wire).
