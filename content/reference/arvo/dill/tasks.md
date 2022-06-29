+++
title = "API Reference"
weight = 2
+++

In this document we describe the public interface for Dill. Namely, we describe each `task` that Dill can be `pass`ed, and which `gift`(s) Dill can `give` in return.

## `%belt`

```hoon
[%belt p=belt]
```

Terminal input.

The runtime sends a `%belt` `task` to Dill whenever there is input in the terminal, such as a keystroke.

The [$belt](/reference/arvo/dill/data-types#belt) in `p` contains the input such as which key was pressed.

Dill will convert the `$belt` into a [$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke` the session handler (typically `drum`) with it.

This `task` would not typically be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%belt` `task`.

## `%blew`

```hoon
[%blew p=blew]
```

Terminal resized.

The runtime passes Dill a `%blew` `task` whenever the terminal is resized.

The [$blew](/reference/arvo/dill/data-types#blew) specifies the new dimensions.

Dill will convert the `$blew` into a `%rez` [$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke`s the session handler (typically `drum`) with it.

This `task` would not typically be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%blew` `task`.

## `%boot`

```hoon
[%boot lit=? p=*]
```

This `task` is used only once, when Arvo first enters the [adult stage](/reference/arvo/overview#structural-interface-core). Dill is technically the first vane to be activated, via the `%boot` `task`, which then sends Jael (considered the "true" first vane) the `%dawn` or `%fake` `task` wrapped in the `%boot` `task`. Jael then goes on to call `%init` `task`s for other vanes (including Dill).

`lit` specifies whether to boot in lite mode. `p` is either a [%dawn](/reference/arvo/jael/data-types#dawn) or [%fake](/reference/arvo/jael/tasks#fake) `task:jael`. `%dawn` is for an ordinary boot and `%fake` is for booting a fake ship.

This `task` would not be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%boot` `task`, but it will `%pass` the wrapped `%dawn` or `%fake` `task` to Jael.

## `%crop`

```hoon
[%crop p=@ud]
```

Trim kernel state.

This `task` is the same as the [%trim](#trim) `task`. Like `%trim`, Dill does nothing with it.

#### Returns

Dill returns no `gift` in response to a `%crop` `task`.

## `%crud`

```hoon
[%crud p=@tas q=(list tank)]
```

Print error.

Dill prints the given error to the terminal. The verbosity for the particular `@tas` error tag specified in `p` is determined by the `level` set by a [%knob](#knob) `task` - either `%hush`, `%soft` or `%loud`. The default is `%loud`, where it will print the full `(list tank)` specified in `q`. See [%knob](#knob) for details of verbosity levels.

#### Returns

Dill does not return a `gift` in response to a `%crud` `task`.

## `%flee`

```hoon
[%flee session=~]
```

Unwatch a session to which you've previously subscribed with [%view](#view).

The ability to specify a session is not yet implemented in Dill, so `session` is always `~`, the default session.

#### Returns

Dill does not return a `gift` in response to a `%flee` `task`.

## `%flog`

```hoon
[%flog p=flog]
```

A `%flog` `task` is a wrapper over a `task` sent by another vane. Dill removes the wrapper and sends the bare `task` to itself over the default `duct`.

A `%flog` `task` takes a [$flog](/reference/arvo/dill/data-types#flog) as its argument. A `$flog` is a subset of Dill's `task`s.

#### Returns

Dill does not return a `gift` in response to a `%flog` `task`.

## `%flow`

```hoon
[%flow p=@tas q=(list gill:gall)]
```

Terminal config.

This `task` is not used.

## `%hail`

```hoon
[%hail ~]
```

Refresh.

Dill converts a `%hail` `task` into a `%hey` [$dill-belt](/reference/arvo/dill/data-types#dill-belt) and `%poke`s the session handler (typically `drum`) with it to handle the refresh.

This `task` would not be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%hail` `task`.

## `%heft`

```hoon
[%heft ~]
```

Produce memory report.

When Dill receives a `%heft` `task` it passes Arvo a `%whey` `waif` to obtain a memory report and prints it to the terminal.

#### Returns

Dill does not return a `gift` in response to a `%heft` `task`.

## `%hook`

```hoon
[%hook ~]
```

This terminal hung up.

This task is not used.

## `%harm`

```hoon
[%harm ~]
```

All terminals hung up.

This `task` is not used.

## `%init`

```hoon
[%init ~]
```

This `task` is called only once, when Arvo first enters the [adult stage](/reference/arvo/overview#structural-interface-core). It performs initial setup for Dill, such as setting the width of the console.

Note that this is not actually the first `task` passed to Dill - see [%boot](#%boot).

This `task` would not be used from userspace.

#### Returns

Dill does not return a `gift` in response to a `%init` `task`.

## `%meld`

```
[%meld ~]
```

Deduplicate persistent state.

Dill asks the runtime to perform the memory deduplication.

#### Returns

Dill does not return a `gift` in response to a `%meld` `task`.

## `%noop`

```hoon
[%noop ~]
```

No operation.

A `%noop` `task` does nothing, as the name implies.

#### Returns

Dill does not return a `gift` in response to a `%noop` `task`.

## `%pack`

```hoon
[%pack ~]
```

Defragment persistent state.

Dill asks the runtime to perform the defragmentation.

#### Returns

Dill does not return a `gift` in response to a `%meld` `task`.

## `%talk`

```hoon
[%talk p=tank]
```

This `task` is not used.

## `%text`

```hoon
[%text p=tape]
```

Print `tape` to terminal.

Upon receiving a `%text` `task`, Dill will convert the `tape` given in `p` to a `(list @c)` and give it to the runtime in a `%blit` `gift` including a `%lin` [$blit](/reference/arvo/dill/data-types#blit).

#### Returns

Dill does not return a `gift` in response to a `%text` `task`, but it does give a `%blit` `gift` to the runtime which looks like:

```hoon
[%blit p=(list blit)]
```

## `%view`

```hoon
[%view session=~]
```

Watch session.

A `%view` `task` subscribes for a copy of all `%blit` `gift`s which Dill `%give`s for the default session. This `task` is used by the `%herm` app so it can convert the `$blit`s to JSON and render them in the web terminal.

The ability to specify a session is not yet implemented in Dill, so `session` is always `~`, the default session.

#### Returns

Dill will `%give` a copy of all `%blit`s for the default session. A `%blit` `gift` is:

```hoon
[%blit p=(list blit)]
```

## `%trim`

```hoon
[%trim p=@ud]
```

`%trim` is a common vane `task` used to reduce memory usage. It does nothing for Dill because Dill only keeps a minimal necessary state.

#### Returns

Dill does not return a `gift` in response to a `%trim` `task`.

## `%vega`

```hoon
[%vega ~]
```

This is a common vane `task` used to inform the vane that the kernel has been
upgraded. Dill does not do anything in response to this.

This `task` would not be used from userspace.

#### Returns

Dill returns no `gift` in response to a `%vega` `task`.

## `%verb`

```hoon
[%verb ~]
```

This `task` toggles verbose mode for all of Arvo, which is located here since
Dill is the vane that prints errors. To be precise, `%verb` toggles the laconic
bit `lac` in the [Arvo state](/reference/arvo/overview#the-state) by passing a `%verb` `waif` to Arvo.

#### Returns

Dill does not return a `gift` in response to a `%verb` `task`.

## `%knob`

```hoon
[%knob tag=term level=?(%hush %soft %loud)]
```

`%knob` sets the verbosity level for each error tag. The error `tag` can be any `@tas`. The given `tag` and `level` will be added to Dill's `veb` which maps tags to levels. Subsequent [%crud](#crud) `task`s will then print with the specified verbosity.

The `level`s behave like so:

- `%hush` - Completely silent, print nothing.
- `%soft` - Just print `crud: %error-tag event failed`, ignore any `tang` given in the `%crud`.
- `%loud` - Print the `%soft` message as well as the full `tang` given in the `%crud` `task`.

#### Returns

Dill does not return a `gift` in response to a `%knob` `task`.
