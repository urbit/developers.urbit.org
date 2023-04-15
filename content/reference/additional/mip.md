+++
title = "Mips (Maps of Maps)"
weight = 60

[glossaryEntry."Mip (map of maps) mold builder"]
name = "Mip (map of maps) mold builder"
symbol = "mip"
usage = "libmip"
slug = "#mip"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Mip engine"]
name = "Mip engine"
symbol = "bi"
usage = "libmip"
slug = "#bi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Delete item in mip"]
name = "Delete item in mip"
symbol = "del:bi"
usage = "libmip"
slug = "#delbi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Maybe get value in mip"]
name = "Maybe get value in mip"
symbol = "get:bi"
usage = "libmip"
slug = "#getbi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Get value in mip or default"]
name = "Get value in mip or default"
symbol = "gut:bi"
usage = "libmip"
slug = "#gutbi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Check if mip contains"]
name = "Check if mip contains"
symbol = "has:bi"
usage = "libmip"
slug = "#hasbi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Get keys of inner map in mip"]
name = "Get keys of inner map in mip"
symbol = "key:bi"
usage = "libmip"
slug = "#keybi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Insert value in mip"]
name = "Insert value in mip"
symbol = "put:bi"
usage = "libmip"
slug = "#putbi"
desc = "Used in /lib/mip.hoon"

[glossaryEntry."Convert mip to list"]
name = "Convert mip to list"
symbol = "tap:bi"
usage = "libmip"
slug = "#tapbi"
desc = "Used in /lib/mip.hoon"
+++

A `mip` is a map of maps. These can be constructed manually by nesting
ordinary `map`s, but the `%landscape` desk contains a `/lib/mip.hoon` library which
makes these a bit easier to deal with. You can copy the library into your own
project. The various `mip` functions are documented below.

## `++mip`

Mip (map of maps) mold builder

A `mip` is a map of maps. An outer `map` maps keys to inner `map`s, which
themselves map keys to values.

A `(mip kex key value)` is equivalent to `(map kex (map key value))`.

#### Accepts

`kex` is a `mold`, the type of the outer map's key.

`key` is a `mold`, the type of the key of the inner maps.

`value` is a `mold`, the type of the value of the inner maps.

#### Produces

A `mold`.

#### Source

```hoon
|%
++  mip                                                 ::  map of maps
  |$  [kex key value]
  (map kex (map key value))
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> *(mip:libmip @ @ @)
{}

> (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3) 
[n=[p=1 q=[n=[p=2 q=3] l=~ r=~]] l=~ r=~]
```

---

## `++bi`

Mip engine

This is the container door for all the mip functions.

#### Accepts

`a` is a [`mip`](#mip).

#### Source

```hoon
++  bi                                                  ::  mip engine
  =|  a=(map * (map))
  |@
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> ~(. bi:libmip *(mip:libmip @ @ @))
< 8.bql
  [ a=nlr([p=@ q=nlr([p=@ q=@])])
    <2.gtk 17.zfg 35.yza 14.oai 54.ecl 77.swa 232.sje 51.qbt 123.ppa 46.hgz 1.pnw %140>
  ]
>
```

---

### `++del:bi`

Delete item in `mip`

This takes two keys as its argument, `b` and `c`, and deletes `c` in the inner
map that matches key `b` in the outer map . If this results in an empty inner
map, then `b` is also deleted from the outer map.

#### Accepts

`a` is a [`mip`](#mip), and is the [`+bi`](#bi) door's sample.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

#### Produces

A [`mip`](#mip) with `c` deleted from `b`, or `b` deleted from `a` if `c` ended
up empty.

#### Source

```hoon
++  del
  |*  [b=* c=*]
  =+  d=(~(gut by a) b ~)
  =+  e=(~(del by d) c)
  ?~  e
    (~(del by a) b)
  (~(put by a) b e)
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)
> =mymip (~(put bi:libmip mymip) 1 3 4)

> mymip
[n=[p=1 q=[n=[p=2 q=3] l=~ r=[n=[p=3 q=4] l=~ r=~]]] l=~ r=~]

> =mymip (~(del bi:libmip mymip) 1 2)

> mymip
[n=[p=1 q=[n=[p=3 q=4] l=~ r=~]] l=~ r=~]

> =mymip (~(del bi:libmip mymip) 1 3)

> mymip
~
```

---

### `++get:bi`

Maybe get value in `mip`

Get the value of `c` in the map with key `b` in `mip` `a` as a unit. If
there's no `c` in `b` or `b` in `a`, the unit is null.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

#### Produces

A `(unit [type])`, where `[type]` is the value type. The unit is null if there's
no `c` in `b` or no `b` in `a`.

#### Source

```hoon
++  get
  |*  [b=* c=*]
  =>  .(b `_?>(?=(^ a) p.n.a)`b, c `_?>(?=(^ a) ?>(?=(^ q.n.a) p.n.q.n.a))`c)
  ^-  (unit _?>(?=(^ a) ?>(?=(^ q.n.a) q.n.q.n.a)))
  (~(get by (~(gut by a) b ~)) c)
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)

> (~(get bi:libmip mymip) 1 2)
[~ 3]

> (~(get bi:libmip mymip) 2 3)
~
```

---

#### `++got:bi`

Get value in `mip` or crash

Get the value of `c` in the map with key `b` in `mip` `a`. If there's no `c`
in `b` or `b` in `a`, crash.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

#### Produces

A noun of the type of the values in the `mip`, or else crashes.

#### Source

```hoon
++  got
  |*  [b=* c=*]
  (need (get b c))
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)

> (~(got bi:libmip mymip) 1 2)
3

> (~(got bi:libmip mymip) 2 3)
/lib/mip/hoon:<[25 5].[25 21]>
dojo: hoon expression failed
```

---

### `++gut:bi`

Get value in `mip` or default

Get the value of `c` in the map with key `b` in `mip` `a`. If there's no `c`
in `b` or `b` in `a`, produce default value `d`.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

`d` is a default value, which is produced if the value cannot be found.

#### Produces

A noun, either the type of the value in the map or `d`.

#### Source

```hoon
++  gut
  |*  [b=* c=* d=*]
  (~(gut by (~(gut by a) b ~)) c d)
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)

> (~(gut bi:libmip mymip) 1 2 42)
3

> (~(gut bi:libmip mymip) 2 3 42)
42
```

---

### `++has:bi`

Check if `mip` contains

Check if `mip` `a` contains `c` in `b`.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

#### Produces

A `?` which is true if `c` in `b` exists, and false otherwise.

#### Source

```hoon
++  has
  |*  [b=* c=*]
  !=(~ (get b c))
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)

> (~(has bi:libmip mymip) 1 2)
%.y

> (~(has bi:libmip mymip) 2 3)
%.n
```

---

### `++key:bi`

Get keys of inner map in `mip`

Get the `set` of keys of the inner map matching key `b` in the outer map. If
`b` doesn't exist, an empty set is returned.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

#### Produces

A `(set [type])` where `[type]` is the type of the keys in the inner map.

#### Source

```hoon
++  key
  |*  b=*
  ~(key by (~(gut by a) b ~))
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)

> (~(key bi:libmip mymip) 1)
{2}

> (~(key bi:libmip mymip) 2)
{}
```

---

### `++put:bi`

Insert value in `mip`

Add value `d` with key `c` to the inner map with key `b` in the outer map. If
`b` doesn't exist, an inner map is also added with that key. If `c` already
exists, its value is replaced with `d`.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

`b` is a key matching the key type of the outer map.

`c` is a key matching the key type of the inner maps.

`d` is a noun matching the type of the values in the `mip`.

#### Produces

A new, modified `mip`.

#### Source

```hoon
++  put
  |*  [b=* c=* d=*]
  %+  ~(put by a)  b
  %.  [c d]
  %~  put  by
  (~(gut by a) b ~)
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)
> =mymip (~(put bi:libmip mymip) 1 1 42)
> =mymip (~(put bi:libmip mymip) 2 12 99)

> ~(tap bi:libmip mymip)
~[[x=2 y=12 v=99] [x=1 y=2 v=3] [x=1 y=1 v=42]]
```

---

### `++tap:bi`

Convert `mip` to `list`

The `mip` is flattened to a `list` of the triple `[x y v]`, where `x` is a key
in the outer map, `y` is a key in an inner map, and `v` is its value.

#### Accepts

`a` is a [`mip`](#mip), and is the sample of the [`++bi`](#bi) door.

#### Produces

A triple cell of `[x y v]`, where:

- `x` is a key in the outer map.
- `y` is a key in an inner map.
- `v` is its value.

#### Source

```hoon
++  tap
  ::NOTE  naive turn-based implementation find-errors ):
  =<  $
  =+  b=`_?>(?=(^ a) *(list [x=_p.n.a _?>(?=(^ q.n.a) [y=p v=q]:n.q.n.a)]))`~
  |.  ^+  b
  ?~  a
    b
  $(a r.a, b (welp (turn ~(tap by q.n.a) (lead p.n.a)) $(a l.a)))
--
```

#### Examples

```
> =libmip -build-file /=landscape=/lib/mip/hoon

> =mymip (~(put bi:libmip *(mip:libmip @ @ @)) 1 2 3)
> =mymip (~(put bi:libmip mymip) 1 1 42)
> =mymip (~(put bi:libmip mymip) 2 12 99)

> ~(tap bi:libmip mymip)
~[[x=2 y=12 v=99] [x=1 y=2 v=3] [x=1 y=1 v=42]]
```

--- 
