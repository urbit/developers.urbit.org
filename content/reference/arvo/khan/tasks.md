+++
title = "API Reference"
weight = 2
+++

These are the `task`s Khan can be passed and the `gift`s it can give.

## Tasks

Here are the `task`s you can pass Khan. You'd either use
[`%fard`](#fard) to run a thread from a file or [`%lard`](#lard) to run
an in-line thread.

### `%fard`

Run a thread from within Arvo.

```hoon
[%fard p=(fyrd cage)]
```

`p` contains the thread location, name, and start arguments. See the
[`fyrd`](/reference/arvo/khan/types#fyrd) data type reference entry for details.

#### Returns

When the thread finishes, either by succeeding or failing, Khan will return an
[`%arow`](#arow) gift.

---

### `%fyrd`

External thread.

```hoon
[%fyrd p=(fyrd cast)]
```

This is passed to Khan by the runtime when a thread is run externally.
You would not use this from userspace.

---

### `%lard`

In-line thread.

```hoon
[%lard =bear =shed]
```

The [`bear`](/reference/arvo/khan/types#bear) is either a `desk` or
`beak`. The [`shed`](/reference/arvo/khan/types#shed) is the thread
itself. Since Spider doesn't need to read out the thread from Clay, the
`bear` doesn't do much apart from be included in the thread name that
Spider generates. Khan will have Spider run the given thread, and
eventually give an [`%arow`](#arow) gift back with the result.

#### Returns

When the thread eventually finishes (or if it fails), Khan with give an
[`%arow`](#arow) gift back with the result.

---

## Gifts

These are the two `gift`s Khan can give. In userspace, you'd only
receive an [`%arow`](#arow).

### `%arow`

In-arvo result.

```hoon
[%arow p=(avow cage)]
```

This gift contains the result of a finished thread if successful, or an
error and stack trace if it failed. It's given for threads run from
within Arvo. See the [`avow`](/reference/arvo/khan/types#avow) entry in
the types reference for more details.

---

### `%avow`

External result.

```hoon
[%avow p=(avow page)]
```

This gift contains the result of running a thread externally. You would
not receive this in userspace.


A `page` is a pair of `mark` and `noun`. See the
[`avow`](/reference/arvo/khan/types#avow) entry in the types reference
for more details of that mold builder.

---
