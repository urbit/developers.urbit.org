+++
title = "Path Prefix"

[extra]
category = "arvo"

[glossaryEntry."path prefix"]
name = "path prefix"
symbol = ""
usage = "arvo"
desc = "The first three elements of a Clay file path denoting ship, desk and case (revision number)."

+++

A **path prefix** is the first three elements of a
[Clay](/reference/glossary/clay) [path](/reference/glossary/path). These three
fields encode a `beak` in path-form. A `beak` is a triple of
[ship](/reference/glossary/ship), [desk](/reference/glossary/desk), and
[case](/reference/glossary/case). Here's an example:

```hoon
/~sampel/base/~2022.9.4..17.13.12..5835
```

The first two fields are the ship and desk in which the target file resides.
The third field (the `case`) is the desk revision. A `case` can be one
of:

- The revision date-time in `@da` format, as in the example above.
- A revision number like `42` (`1` is the first commit and it's numbered sequentially).
- A revision label like `foo`. People rarely label commits so this is seldom useful.

So you could do any of:

```hoon
/~sampel/base/~2022.9.4..17.13.12..5835
/~sampel/base/42
/~sampel/base/foo
```

In the dojo, there are a couple of short-hands for this prefix. The first is
`%`, which is the local ship, current desk (typically `%base`) and the current
date. The second short-hand is that any of these three elements can be replaced
by `=`. Each `=` will be auto-filled with these defaults, for example
`/=base=`, `/~sampel==`, etc. 

A file path in the dojo would typically be entered like `%/gen/hood/code` or
`/=garden=/sys/kelvin`.
