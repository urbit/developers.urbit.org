+++
title = "Data Types"
weight = 3
+++

Khan only uses a handful of types, described below.

## `+avow`

Thread result mold builder

```hoon
|$  [a]  (each a goof)
```

Khan returns this structure when the thread either successfully completes, or
fails.

If the [`each`](/reference/hoon/stdlib/1c#each) is `%.y`, it succeeded and `p`
contains the result in either a `cage` or a `page`. If the thread was run
internally it's a `cage`, and if it was run externally it's a `page`.

If the `each` is `%.n`, the thread failed and `p` contains a `goof`, which is:

```hoon
+$  goof  [mote=term =tang]
```

The `mote` is an error code like `%foobar` and the `tang` contains something
like a stack trace.

#### Example

```
> `(avow:khan cage)`[%.y %noun !>('foo')]
[%.y p=[p=%noun q=[#t/@t q=7.303.014]]]

> `(avow:khan cage)`[%.n %foo-error 'blah' 'blah' ~]
[%.n p=[mote=%foo-error tang=~['blah' 'blah']]]
```

---

## `$bear`

Thread location

```hoon
$@(desk beak)
```

This is tells Khan where to look for a thread. It's either a `desk` or a full
`beak`. Khan will look in the `/ted` directory of the specified location.

#### Example

```
> `bear:khan`%base
%base

> `bear:khan`[~sampel %base da+now]
[p=~sampel q=%base r=[%da p=~2022.11.6..08.33.22..9818]]
```

---

## `$cast`

External thread argument

```hoon
(pair mark page)
```

This is only used if you're running a thread via Khan's external interface. The
`mark` specifies the output mark, and a `page` is a pair of input `mark` and raw
noun.

#### Example

```
> `cast:khan`[%noun %noun 123]
[p=%noun q=[p=%noun q=123]]
```

---

## `+fyrd`

Mold builder for a thread run request

```hoon
|$  [a]  [=bear name=term args=a]
```

The fields are:

- [`bear`](#bear): thread location.
- `name`: thread name. Khan will look in `/ted` for this. If it's in a
  subdirectory like `/ted/foo/bar.hoon`, you'd say `%foo-bar`.
- `args`: a `cage` if it's an internal request, and a [`cast`](#cast) if it's an
  external request.

#### Examples

```
> `(fyrd:khan cage)`[%base %mythread %noun !>(123)]
[bear=%base name=%mythread args=[p=%noun q=[#t/@ud q=123]]]

> `(fyrd:khan cast:khan)`[%base %mythread %noun %noun 123]
[bear=%base name=%mythread args=[p=%noun q=[p=%noun q=123]]]
```

---
