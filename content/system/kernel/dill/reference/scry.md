+++
title = "Scry Reference"
weight = 3
+++

Here are the scry endpoints of Dill. They require the `desk` in the path prefix
be empty, so the general format is `.^([type] %d[care] /=//=/[some-path])`.

## `%x` - `/sessions`

Get all sessions.

A scy with a `care` of `%x` and a `path` of `/sessions` returns a `(set @tas)`
of the current sessions. The `%$` session is the default session.

#### Example

```
> .^((set @tas) %dy /=//=/sessions)
{%$}
```

---

## `%u` - `/sessions/[ses]`

Does session exist?

A scry with a `care` of `%x` and a `path` of `/sessions/[ses]` where `[ses]` is
a session name returns a `?` of whether `[ses]` exists.

#### Example

```
> .^(? %du /=//=/sessions/$)
%.y
> .^(? %du /=//=/sessions/foo)
%.n
```

---
