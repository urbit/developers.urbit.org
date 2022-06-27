+++
title = "Scry Reference"
weight = 3
+++

Here are Behn's scry endpoints. There's only a few and they're mostly just useful for debugging. All of Behn's scries take a `%x` `care` and require the `desk` in the path prefix be empty, so the general format is `.^([type] %bx /=//=/[some-path])`.

## /debug/timers

A scry with a `%x` `care` and a `path` of `/debug/timers` will return the timestamp and `duct` of all timers which are currently set. The type returned is a `(list [@da duct])`.

```
> .^((list [@da duct]) %bx /=//=/debug/timers)
~[
  [~2021.8.9..16.16.30..9d49 ~[/ames/pump/~wet/0 /ames]]
  [~2021.8.9..16.17.58..597d ~[/ames/pump/~nes/0 /ames]]
]
```

## /timers

A scry with a `%x` `care` and a `path` of `/timers` will return the timestamps of all timers currently set. The type returned is a `(list @da)`.

```
> .^((list @da) %bx /=//=/timers)
~[~2021.8.9..16.17.02..9de6 ~2021.8.9..16.17.58..597d]
```

## /timers/next

A scry with a `%x` `care` and a `path` of `/timers/next` will return the timestamp of the timer set to fire next, or null if there's none. The type returned is a `(unit @da)`.

```
> .^((unit @da) %bx /=//=/timers/next)
[~ ~2021.8.9..16.17.58..597d]
```

## /timers/[da]

A scry with a `%x` `care` and a `path` of `/timers/[da]` (where `[da]` is an absolute date) will return all timers which are scheduled to fire between now and the specified date (inclusive). The type returned is a `(list @da)`.

```
> .^((list @da) %bx /=//=/timers/(scot %da (add now ~d1)))
~[~2021.8.9..16.17.58..597d ~2021.8.9..16.18.06..a24b]
```
