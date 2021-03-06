+++
title = "Wings"
weight = 2
+++
`[%wing p=(list limb)]`

A wing is a limb search path into the subject.

### Produces

A wing is a list of limbs (including a trivial list of one limb).  The limbs are resolved in succession.  The result of the last limb resolution is the value produced by the wing expression.

### Syntax

Irregular: `a.b.c`.  Read this as '`a` in `b` in `c`'. Finds limb `a` within limb `b` within limb `c` of the subject.

### Discussion

Intuitively, Hoon wings are written in the opposite order
from attribute dot-paths in most languages.  Hoon `a.b.c` is Java's
`c.b.a`; it means "a within b within c."

Any item in the wing can resolve to a leg (fragment) or arm
(computation).  But if a non-terminal item in the wing would
resolve to an arm, it resolves instead to the subject of the arm
-- in other words, the core exporting that name.

The mysterious idiom `..b` produces the leg `b` if `b`
is a leg; the core exporting `b` if `b` is an arm.  Since `.`
is the same limb as `+`, `..b` is the same wing as `+1.foo`.

### Examples

```
~zod:dojo> =a [fod=3 bat=[baz=1 moo=2]]

~zod:dojo> bat.a
[baz=1 moo=2]

~zod:dojo> moo.bat.a
2
```
