+++
title = "API Reference"
weight = 2
+++

In this document we describe the public interface for Lick. Namely, we describe each `task` that Lick can be `pass`ed, and which `gift`(s) Lick can `give` in return.


## `%born`

```hoon
[%born ~]
```

Each time you start your urbit, the Arvo kernel calls the `%born` task for Lick. When called, Lick will send every IPC port in it state to `vere` and send a `%disconnect` `%soak` to each IPC port owner.

#### Returns

Lick returns a `%spin` `gift` to `vere` in response to a `%born` `task`.

## `%spin`

```hoon
[%spin name=path]
```
Open an IPC port.

Lick takes in a `path` and saves the `duct` that sent it as the owner then forwards the call to `vere`. `vere` will open an IPC port on the host OS and wait for something to connect to it. 

#### Returns

Lick sends a `gift` of a `%spin` to `vere`  in response to a `%spin` `task`.

#### Example

See the [%spin](/reference/arvo/lick/examples#spin) section of the Examples document.

## `%shut`

```hoon
[%shut name=path]
```
Close an IPC port.

Lick takes a `path` and removes it from its state. It also forwards the `path` to `vere` which inturn disconnects the IPC port from anything connected to it and closes it. 

#### Returns

Lick sends a `gift` of a `%shut` to `vere`  in response to a `%shut` `task`.

#### Example

See the [%shut](/reference/arvo/lick/examples#shut) section of the Examples document.

## `%spit`

```hoon
[%spit name=path mark=mark noun=noun]
```

Sends a `[mark noun]` cell to the IPC vane. 

Lick will send a newt-jammed `[mark noun]` cell to the IPC port if something is connected to it. If nothing is connected to the port, Lick will send an `%error` `%soak` to the port's owner.

#### Returns

Lick forwards the contents of the task as a gift to vere.

## `%trim`

```hoon
[%trim ~]
```

This `task` is sent by the interpreter in order to free up memory. Lick does not do anything with this `task`, since it is not a good idea to forget your IPC ports.

You would not use this `task` from userspace.

#### Returns

Lick does not return any `gift` in response to a `%trim` `task`.

## `%vega`

```hoon
[%vega ~]
```

This `task` informs the vane that the kernel has been upgraded. Lick does not do anything in response to this.

You would not use this `task` from userspace.

#### Returns

Lick does not return any `gift` in response to a `%vega` `task`.

## `%soak`

```hoon
[%soak name=path mark=mark noun=noun]
```

Receives data from outside. This `task` is sent to Lick by the runtime, you would not use it manually.

The `name` is associated with the `duct` that registered it and the `%soak` is forwarded to it.

