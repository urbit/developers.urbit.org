+++
title = "Scry Reference"
weight = 3
+++

Here are Lick's scry endpoints. There's only a few and they're mostly just
useful for debugging. All of Lick's scries are specified by a `care`. The
`desk` field in the `beak` must be empty (`%$`, e.g. `/=//=`).

The only novel data type is a `name`, which is just a `path` representing the
name of a socket.

## `%a` - Read ports

A scry with a `care` of `%a` will return a list of all registered IPC ports.

```
.^((list name:lick) %la /=//=/ports)
~[/hood/reciept/control /slick/control]
```

---

## `%d` - Port owner

A scry with a `care` of `%d` and the socket `name` in the `spur` will return
the `duct` of the IPC port owner in a `unit`, which is null if the socket
doesn't exist.

```
.^((unit duct) %ld /=//=/[port-name])
[~ [i=/gall/use/slick/0w3.IZWEn/~nec t=[i=/dill t=~[//term/1]]]]
```

---

## `%u` - Port existance

A scry with a `care` of `%u` and the socket `name` in the `spur` will return a
`?` which is `%.y` if the socket exists in Lick's state.

```
.^(? %lu /=//=/slick/control)
%.y
```

---
