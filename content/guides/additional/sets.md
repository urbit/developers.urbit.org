#   Set Identities and Relations

While the developer documentation on `$set`s and the `+in` core is comprehensive, it is organized alphabetically which can make it difficult to see what's going on with set relations.  This article will describe [set identities and relations](https://en.wikipedia.org/wiki/List_of_set_identities_and_relations) through the Hoon standard library.

A `$set` is a tree with a particular internal order based on the hash of the value.  This tends to balance the values and make lookup and access more efficient over large sets.

##  Set Creation & Membership

### Define a Set

![](https://media.urbit.org/docs/hoon-syntax/set-identity.png)

[`++silt`](https://developers.urbit.org/reference/hoon/stdlib/2l#silt) produces a `$set` from a `$list`.

```hoon
> `(set @tas)`(silt `(list @tas)`~[%a %b %c %a])
{%b %a %c}
```

### Add Members

![](https://media.urbit.org/docs/hoon-syntax/set-addition.png)

[`++put:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#putin) adds an element $x$ to a set $A$.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  `(set @tas)`(~(put in a) %d)
{%b %d %a %c}
```

[`++gas:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#gasin) adds each element $x, y, z$ of a list to a set $A$.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  =/  b  `(list @tas)`~[%d %e %f]
  `(set @tas)`(~(gas in a) b)
{%e %b %d %f %a %c}
```

### Remove Members

![](https://media.urbit.org/docs/hoon-syntax/set-deletion.png)

[`++del:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#delin) removes an element $x$ from a set $A$.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c %d])
  `(set @tas)`(~(del in a) %d)
{%b %a %c}
```

### Membership

![](https://media.urbit.org/docs/hoon-syntax/set-membership.png)

[`++has:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#hasin) checks if an element $x$ is in a set $A$.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  (~(has in a) %a)
%.y

> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  (~(has in a) %d)
%.n
```

### Size

[`++wyt:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#wytin) produces the number of elements in $A$ as an atom (width).

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  ~(wyt in a)
3
```

### Export as List

[`++tap:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#tapin) produces the elements of set $A$ as a `$list`.  The order is the same as a depth-first search of the `$set`'s representation as a `$tree`, reversed.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  ~(tap in a)
~[%c %a %b]

> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
    =/  b  `(list @tas)`~[%d %e %f]
    ~(tap in `(set @tas)`(~(gas in a) b))
~[%c %a %f %d %b %e]
```

##  Set Relations

First we consider the elementary operations between two sets.

### Union ($A \cup B$)

$$
A \cup B \equiv \{ x : x \in A \;\textrm{or}\; x \in B \}
$$

![](https://media.urbit.org/docs/hoon-syntax/set-union.png)

[`++uni:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#uniin) produces a set containing all values from $A$ or $B$.  The types of $A$ and $B$ must match.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  =/  b  `(set @tas)`(silt `(list @tas)`~[%c %d %e])
  `(set @tas)`(~(uni in a) b)
{%e %b %d %a %c}
```

### Intersection ($A \cap B$)

$$
A \cap B \equiv \{ x : x \in A \;\textrm{and}\; x \in B \}
$$

![](https://media.urbit.org/docs/hoon-syntax/set-intersection.png)

[`++int:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#intin) produces a set containing all values from $A$ and $B$.  The types of $A$ and $B$ must match.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  =/  b  `(set @tas)`(silt `(list @tas)`~[%c %d %e])
  `(set @tas)`(~(int in a) b)
{%c}
```

If two sets are disjoint, then their intersection is $\varnothing$.

```hoon
=/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  =/  b  `(set @tas)`(silt `(list @tas)`~[%d %e %f])
  `(set @tas)`(~(int in a) b)
{}
```

### Complement ($A^{\textrm{C}}$)

$$
A^{\textrm{C}} = X \backslash A \equiv {x \in X; x \notin A}
$$

![](https://media.urbit.org/docs/hoon-syntax/set-complement.png)

The complement of a set $A$, $A^{\textrm{C}}$, may be found using [`++dif`](https://developers.urbit.org/reference/hoon/stdlib/2h#difin) (difference).

For instance, if $X = \{a, b, c, d\}$ and $A = \{c, d\}$, then $A^{\textrm{C}} = \{a, b\}$.

```hoon
> =/  x  `(set @tas)`(silt `(list @tas)`~[%a %b %c %d])
  =/  a  `(set @tas)`(silt `(list @tas)`~[%c %d])
  `(set @tas)`(~(dif in x) a)
{%b %a}
```


### Symmetric Difference ($A \bigtriangleup B$)

$$
A \bigtriangleup B \equiv \{x : x\,\textrm{belongs to exactly one of}\, A\, \textrm{and}\, B\}
$$

![](https://media.urbit.org/docs/hoon-syntax/set-symmetric-difference.png)

The symmetric difference of two sets $A$ and $B$ consists of those elements in exactly one of the sets.  Use `++uni:in` with `++dif:in` to identify this set.

For instance, if $A = \{a, b, c\}$ and $B = \{c, d, e\}$, then $A \bigtriangleup B = \{a, b, d, e\}$.

```hoon
=/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
=/  b  `(set @tas)`(silt `(list @tas)`~[%c %d %e])
=/  lhs  (~(dif in a) b)
=/  rhs  (~(dif in b) a)
`(set @tas)`(~(uni in lhs) rhs)
```


##  Set Operations

### Logical `AND` ($\land$)

[`++all:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#allin) computes the logical `AND` on every element in set $A$ against a logical function $f$, producing  a flag.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  (~(all in a) (curr gth 32))
%.y
```

### Logical `OR` ($\lor$)

[`++any:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#anyin) computes the logical `OR` on every element in set $A$ against a logical function $f$, producing  a flag.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  (~(any in a) (curr gth 32))
%.y
```

### Operate with Function

[`++run:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#runin) applies a function $f$ to every member of set $A$.

```hoon
> =/  a  `(set @tas)`(silt `(list @tas)`~[%a %b %c])
  (~(run in a) @ud)
{98 97 99}
```

### Accumulate with Function

[`++rep:in`](https://developers.urbit.org/reference/hoon/stdlib/2h#repin) applies a binary function $f$ to every member of set $A$ and accumulates the result.

```hoon
=/  a  `(set @ud)`(silt `(list @ud)`~[1 2 3 4 5])
    (~(rep in a) mul)
b=120
```

While there are a few other set functions in `+in`, they are largely concerned with internal operations such as consistency checking.
