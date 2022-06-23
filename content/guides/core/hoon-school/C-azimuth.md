---
title: The Structure of Azimuth
nodes: 102, 112
objectives:
  - "Understand the role of the public-key infrastructure in Urbit."
  - "Describe the high-level architecture of the Urbit ID address space and distinguish types of points."
  - "Interpret and apply the Azimuth point naming scheme."
  - "Identify point features such as activity."
  - "List at least two services/roles provided by a galaxy for the network."
  - "List at least two services provided by a star for its planets."
  - "Use Hoon to map the Azimuth address space domains and boundaries."
  - "Identify points, sponsors, neighbors, etc. from `@p` identifiers and simple operations."
---

#   The Structure of Azimuth

_This module introduces how Urbit ID is structured and provides practice in converting and working with `@p` identity points.  It may be considered optional and skipped if you are speedrunning Hoon School._

##  A Public-Key Infrastructure

What is the purpose of a [public-key infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure)?  Essentially a PKI defines a protocol for asymmetrically revealing a public key (which anyone can use to check that a message came from where it says it came) and retaining a private key, used by the owner as a cryptographically secure tool for signing electronic transactions.  Azimuth functions as a PKI so that Urbit ID points can be uniquely controlled, transferred, and used to work with instances of Urbit OS (ships).

Urbit ID (=Azimuth) provides persistent and stable futureproof identity to its users through a hierarchical address space.  Any particular Urbit ID plays a particular role in the overall Urbit system which is determined by its point number and classified into ranks.

### The Urbit Address Space

Each Urbit ID point is a 128-bit address.  Urbit is structured with a hierarchy of addressable points, and bands of smaller values (preceded by many zeroes) have more “weight” in the system and broker access for higher-addressed points.

- **Galaxies** represent the “governing council” of Urbit, primarily concerned with peer discovery and packet routing as well as network protocol governance. Galaxies allocate star address space.
- **Stars** provide peer discovery services, handle distribution of software updates, and allocate planet address space.
- **Planets** are the primary single-user identities.
- **Moons** are intended to represent devices and associated accounts for the owning planet, but are currently only rarely used. Each planet has 2³² moons available to it.
- **Comets** are zero-reputation instances, in principle spammers or bots.  Comets require a star sponsor to access the network, but once online they are persistent.  They are also free to spin up.

In total there are 2¹²⁸ addressable points, of which the vast majority are available as unclaimed “comet space.”

#### Naming

Urbit uses a system of mnemonic syllables to uniquely identify each address point.  These mnemonic names, called “`patp`s” after their Hoon representation `@p`, occur in a set of 256 suffixes (such as “zod”) and 256 prefixes (such as “lit”).  They were selected to be memorable and pronounceable but not meaningful.

| Number | Prefix | Suffix |
| -----: | :----: | :----: |
| 0    | doz | zod |
| 1    | mar | nec |
| 2    | bin | bud |
| 3    | wan | wes |
| 4    | sam | sev |
| …    | …   | …   |
| 254  | mip | nev |
| 255  | fip | fes | 

Many points may be determined from the prefix and suffix alone, but planet names are obfuscated, meaning that they are scrambled so that the sponsor is not readily apparent to a peer.

#### Galaxy

Galaxies span the first 2⁸ addresses of Azimuth.  There are 255 (`0xff` - 1)
associated stars; counting the galaxy yields 256 points (not counting moons).  Galaxy names are suffix-only.

|              | First Address | Last Address |
| ------------ | ------------- | ------------ |
|  Decimal     | `0`           | `255`        |
|  Hexadecimal | `0x0`         | `0xff`       |
|  `@p`        | ~zod          | ~fes         |

As galaxies have no sponsors, they instead have an IP address determined by `gal.urbit.org` at port `13337`+galaxy number.

At the current time, galaxies play the role of network peer discovery, but at some future time this will fall to the stars instead.

#### Star

Peer discovery, the primary role of stars besides planet allocation, is an important step in responsibly controlling network traffic. “The basic idea is, you need someone to sponsor your membership on the network. An address that can’t find a sponsor is probably a bot or a spammer” ([docs](https://urbit.org/understanding-urbit/)).

Stars span the remaining addresses to 2¹⁶. There are thus 65,536 -
256 = 65,280 stars. Star names have prefix and suffix. They share the
suffix with their sponsoring galaxy.

|              | First Address | Last Address |
| ------------ | ------------- | ------------ |
|  Decimal     | `256`         | `65.535`     |
|  Hexadecimal | `0x100`       | `0xffff`     |
|  `@p`        | ~marzod       | ~fipfes      |

A star's sponsor can be calculated as modulo 2⁸. The first star of
~zod is `0x100` ~marzod.  The last star of ~zod is `0xffff` - `0xff` =
`0xff00` ~fipzod.  The last star (of ~fes) is `0xffff` ~fipfes.

#### Planet

Planets span the remaining addresses to 2³².  There are thus
4,294,967,296 - 65,536 = 4,294,901,760 planets.  Planet names occur in
pairs separated by a single hyphen.  A planet's name is obfuscated so it
is not immediately apparent who its sponsor is.

|              | First Address | Last Address |
| ------------ | ------------- | ------------ |
|  Decimal     | `65.536`      | `4.294.967.295` |
|  Hexadecimal | `0x1.0000`    | `0xffff.ffff` |
|  `@p`        | ~dapnep-ropmyl | ~dostec-risfen |

A planet's sponsor can be calculated as modulo 2¹⁶.

Galaxy planets occupy points beginning with `0x1.0000` ~dapnep-ronmyl
(for ~zod); ~zod's last galaxy planet is `0xffff.ffff` - `0xffff` =
`0xffff.0000` ~lodnyt-ranrud.  The last galaxy planet (of ~fes) is
`0xffff.ffff` - `0xffff` + `0x100` = `0xffff.0100` ~hidwyt-mogbud.

Star planets span the remaining space.  The first star planet (of
~marzod) is `0x1.000` + `0x100` = `0x1.0100` ~wicdev-wisryt.  The last star
planet (of ~fipfes) is `0xffff.ffff` ~dostec-risfen.  Remember that star
planet recur module 2¹⁶.

#### Moon

Moons occupy the block to 2⁶⁴, with 2³² moons for each planet.  Moon
names have more than two blocks (three or four) separated by single
hyphens.

|              | First Address | Last Address |
| ------------ | ------------- | ------------ |
|  Decimal     | `4.294.967.296` | `18.446.744.073.709.551.615` |
|  Hexadecimal | `0x1.0000.0000` | `0xffff.ffff.ffff.ffff` |
|  `@p`        | ~doznec-dozzod-dozzod | ~fipfes-fipfes-dostec-risfen |

Moons recur modulo 2³² from their sponsor.  Thus dividing a moon's
address by 2³² and taking the remainder yields the address of the
sponsor.

Any moon that begins with the prefix ~dopzod-dozzod-doz___ is a
galaxy moon, but not every galaxy moon begins with that prefix. The
first galaxy moon of ~zod is 0x1.0000.0000 ~doznec-dozzod-dozzod; the
last is `0xffff.ffff.ffff.ffff` - `0xffff.ffff` = `0xffff.ffff.0000.0000` ~fipfes-fipfes-dozzod-dozzod.

Any moon that begins with the prefix ~dopzod-dozzod-______ is a
star moon (other than galaxy moons), but not every star moon begins with
that prefix. The first star moon of ~marzod is `0x1.0000.0000.0100`
~doznec-dozzod-dozzod-marzod; the last is `0xffff.ffff.ffff.ffff` -
`0xffff.ffff` + `0x100` = `0xffff.ffff.0000.0100`
~fipfes-fipfes-dozzod-marzod.

Any moon from ~dopzod-______-______ onwards is a planet
moon.

#### Comet

Comets occupy the upper portion of the Urbit address space.  There are
approximately 3.4×10³⁸ comets, a fantastically large number.  Comet
names occur in blocks of five to eight syllable pairs, separated by a double hyphen at the fourth.

|              | First Address | Last Address |
| ------------ | ------------- | ------------ |
| Decimal      | `18.446.744.073.709.551.616` | `340.282.366.920.938.463.463.374.607.431.768.211.456` |
| Hexadecimal  | `0x1.0000.0000.0000.0000` | `0xffff.ffff.ffff.ffff.ffff.ffff.ffff.ffff` |
| @p           | ~doznec--dozzod-dozzod-dozzod-dozzod | ~fipfes-fipfes-fipfes-fipfes--fipfes-fipfes-fipfes-fipfes |

A comet is sponsored by a star.  Currently star sponsors are determined
randomly from a list supplied to `u3_dawn_come` in
`pkg/urbit/vere/dawn.c` from a [jamfile](https://urbit.org/docs/hoon/reference/stdlib/2p#jam) provided by urbit.org at
`https://bootstrap.urbit.org/comet-stars.jam`.

Comets cannot be breached or rekeyed:  possession of the comet is *ipso
facto* attestation of ownership.

##  Calculating with Addresses

### Sponsors

Each point other than a galaxy has a sponsor.  To determine the sponsor of any point, use `++sein:title`:

```hoon
%-(sein:title [our now ~marzod])
```

where ~marzod is the point in question; or more succinctly:

```hoon
(sein:title our now ~marzod)
```

(This previews the irregular syntax of `%-` cenhep; it is equivalent to `%-  sein:title  [our now ~marzod]`.)

#### Exercise:  Finding neighbors

A neighbor of a point is a point which occupies the point immediately above or below that point's `@ud` number.

For instance, the `@ud` of ~sampel-palnet may be found by:

```hoon
> `@ud`~sampel-palnet
1.624.961.343
```

The previous neighbor of ~sampel-palnet is thus:

```hoon
> %-(sub [1.624.961.343 1])
1.624.961.342

> `@p`1.624.961.342
~datwyn-lavrud
```

- Find the next neighbor of ~sampel-palnet.

#### Exercise:  Finding the sponsor of a neighbor

The sponsor of ~sampel-palnet may be found by:

```hoon
> (sein:title our now ~sampel-palnet)
~talpur
```

The sponsor of the previous neighbor of ~sampel-palnet is thus:

```hoon
> %-(sub [1.624.961.343 1])
1.624.961.342

> `@p`1.624.961.342
~datwyn-lavrud

> (sein:title our now ~datwyn-lavrud)
~talnep
```

- Find the sponsor of the next neighbor of ~sampel-palnet.

#### Exercise:  Finding the child of a point

A point has many children, but the first moon of a planet is located at that point plus 2³² = `4.294.967.296`.

The first moon of ~sampel-palnet is:

```hoon
> `@p`%-(add [~sampel-palnet 4.294.967.296])
~doznec-sampel-palnet
```

- What are the first moon children of ~sampel-palnet's neighbors?

- What is the first planet of the star ~sampel?  (Check the above text to determine the offset.)
