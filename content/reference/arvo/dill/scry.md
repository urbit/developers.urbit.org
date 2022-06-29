+++
title = "Scry Reference"
weight = 3
+++

Here are the scry endpoints of Dill. They take a `%x` `care` and require the `desk` in the path prefix be empty, so the general format is `.^([type] %dx /=//=/[some-path])`.

Dill only has a couple of scry endpoints, both of which begin with `/session//`. The empty `//` would be where the target session would be specified, but at this stage Dill can only return a result for the default session, so it's always empty.

## /sessions//line

A scry with a `care` of `%x` and a `path` of `/sessions//line` returns the current text of the prompt line of the default session. The type returned is a [$blit](/reference/arvo/dill/data-types#blit).

#### Example

```
> .^(blit:dill %dx /=//=/sessions//line)
[ %lin
    p
  ~[
    ~-~~
    ~-z
    ~-o
    ~-d
    ~-~3a.
    ~-d
    ~-o
    ~-j
    ~-o
    ...truncated for brevity...
  ]
]
```

## /sessions//cursor

A scry with a `care` of `%x` and a `path` of `/sessions//cursor` returns the current horizontal position of the cursor in the default session. The type returned is a `@ud`.

#### Example

```
> .^(@ud %dx /=//=/sessions//cursor)
44
```
