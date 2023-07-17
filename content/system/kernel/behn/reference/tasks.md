+++
title = "API Reference"
weight = 2
+++

In this document we describe the public interface for Behn. Namely, we describe each `task` that Behn can be `pass`ed, and which `gift`(s) Behn can `give` in return.

Most of Behn's `task`s are only used by the kernel or runtime. The two `task`s you're likely to use from userspace are [%wait](#wait) for setting a timer and [%rest](#rest) for cancelling a timer.

## `%born`

```hoon
[%born ~]
```

Each time you start your urbit, the Arvo kernel calls the `%born` task for Behn. When called, Behn gets the current time from Unix and updates its list of timers accordingly.

You would not use this `task` from userspace.

#### Returns

Behn does not return any `gift` in response to a `%born` `task`.

## `%rest`

```hoon
[%rest p=@da]
```

Cancel a timer.

Behn takes in a `@da` and cancels the timer at that time if one had been set through that `wire`, then adjusts the next wakeup call from Unix if necessary.

#### Returns

Behn does not return any `gift` in response to a `%rest` `task`.

#### Example

See the [%rest](/reference/arvo/behn/examples#rest) section of the Examples document.

## `%drip`

```hoon
[%drip p=vase]
```

`%drip` allows one to delay a `gift` until a timer set for `now` fires.

A Client `%slip`s Behn a `%drip` task wrapping a `gift` to be `give`n to a Target. This launches a sequence of `move`s as written here:

```
Client -- %slip %drip --> Behn -- %pass %wait --> Behn -- %give %wake --> Behn -- %give %meta --> Target
```

Here the `%meta` `move` is a wrapper for the `%gift` inside of the initial `%drip` wrapper.

`%drip` only handles `gift`s, and can only schedule `gift`s for as soon as possible after the prescribed timer fires.

`%drip` takes in a `%give` `move` in a `vase`.

A `%drip` `task` is not likely to be used from userspace.

#### Returns

In response to a `%drip` `task`, Behn will `%pass` a `%wait` to itself, which then triggers a `%wake` `gift` to itself, which then causes Behn to `%give` a `%meta` `gift` containing the `gift` originally `%give`n to Behn when `%drip` was first called. That makes Behn its own client for `%drip`.

#### Example

Say an app (the Target) is subscribed to updates from Clay (the Client). If Clay `%give`s updates to the app directly and the app crashes, this may cause Clay to crash as well. If instead Clay `%pass`es Behn a `%drip` `task` wrapping the update `gift`, Behn will set a timer for `now` that, when fired, will cause the update `gift` to be given. If it causes a crash then it will have been in response to the `%drip` move, thereby isolating Clay from the crash. Thus `%drip` acts as a sort of buffer against cascading sequences of crashes.

## `%huck`

```hoon
[%huck syn=sign-arvo]
```

Immediately gives back a `sign-arvo`.

You would not use this `task` from userspace.

#### Returns

Behn returns the input `sign-arvo` as a `%heck` `gift`:

```hoon
[%heck syn=sign-arvo]
```

## `%trim`

```hoon
[%trim p=@ud]
```

This `task` is sent by the interpreter in order to free up memory. Behn does not do anything with this `task`, since it is not a good idea to forget your timers.

You would not use this `task` from userspace.

#### Returns

Behn does not return any `gift` in response to a `%trim` `task`.

## `%vega`

```hoon
[%vega ~]
```

This `task` informs the vane that the kernel has been upgraded. Behn does not do anything in response to this.

You would not use this `task` from userspace.

#### Returns

Behn does not return any `gift` in response to a `%vega` `task`.

## `%wait`

```hoon
[%wait p=@da]
```

Set timer.

This `task` sets a timer to fire at the `@da` specified in `p`.

#### Returns

Behn returns a `%wake` `gift` in response to a `%wait` `task`, once the timer has fired. A `%wake` `gift` looks like:

```hoon
[%wake error=(unit tang)]
```

The `error` `unit` will be `~` if successful, or contain a traceback in the `tang` if the timer failed for some reason.

#### Example

See the [%wait](/reference/arvo/behn/tasks#wait) section of the Examples document.

## `%wake`

```hoon
[%wake ~]
```

This `task` is sent by the kernel when the Unix timer tells the kernel that it is time for Behn to wake up. This is often caused by a `%doze` `gift` that Behn originally sent to the kernel that is then forwarded to Unix, which is where the real timekeeping occurs.

You would not use this `task` from userspace.

#### Returns

In response to receiving this `task`, Behn may `%give` a `%doze` `gift` containing the `@da` of the next timer to elapse. Behn may also `%give` a `%wake` `gift` to itself.
