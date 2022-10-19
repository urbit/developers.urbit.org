+++
title = "Kelvin versioning"

[extra]
category = "hoon-nock"

[glossaryEntry."kelvin versioning"]
name = "kelvin versioning"
symbol = ""
usage = "hoon-nock"
desc = "A software versioning system that counts downwards to zero, at which point it will be permanently fixed and final."

+++

Typical software versioning schemes (e.g. v3.1.45) count ever upwards with each
new revision. **Kelvin versioning** does the opposite, counting down towards
absolute zero. When the code in question reaches version 0, it is considered
final and frozen, and there will be no further revisions. This system is used
when a piece of code is intended to become a permanent fixed standard, that can
be depended upon to not change ever.

Kelvin versioning is most notably used for [Nock](/reference/glossary/nock),
which is currently at version 4K - four versions away from its final, permanent
form. The standard libraries and kernel modules of
[Arvo](/reference/glossary/arvo) are also versioned in this way.
