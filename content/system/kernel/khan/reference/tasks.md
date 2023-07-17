+++
title = "API Reference"
weight = 2
+++

Khan's external interface is still experimental, so there's only one `task` that
is currently useful:

## `%fard`

```hoon
[%fard p=(fyrd cage)]
```

Run a thread from within Arvo

`p` contains the thread location, name, and start arguments. See the
[`fyrd`](/reference/arvo/khan/types#fyrd) data type reference entry for details.

#### Returns

When the thread finishes, either by succeeding or failing, Khan will return an
`%arow` `gift`, which looks like :

```hoon
[%arow p=(avow cage)]
```

`p` either contains the result in a `cage`, or an error and stack trace if it
failed. See the [`avow`](/reference/arvo/khan/types#avow) data type reference
entry for details.

---
