+++
title = "Filesystem Hierarchy"
weight = 20
+++

Here we describe what each of the primary folders present in a Clay desk. This
organization is merely a convention, and the exact location of any file does
not affect its operation. That being said, some [Ford
runes](/reference/hoon/rune/fas) are designed with this structure in
mind, and applications such as dojo and spider look in specific folders for
code to run. Furthermore, this organization is not perfectly adhered to -
sometimes you may find structure definitions in `/lib`, for example.

- `/app` contains userspace applications, i.e. [Gall
  agents](/reference/arvo/gall/gall).
- `/gen` contains generators. Many applications make use of generators, but also
  each generator in this folder may be run from dojo using `+`. For example,
  `/gen/foo/hoon` in the `%base` desk is run with `+foo`. Generators on desks
  other than `%base` can be run with `+desk!generator` like `+garden!foo`.
- `/lib` contains libraries that may be shared by multiple agents, threads,
  generators, etc. However, this is not the location of the standard libraries
  (see `/sys`). Libraries are imported from `/lib` with `/+`.
- `/mar` contains [mark](/reference/arvo/clay/marks/marks) definitions.
- `/sur` contains shared [structure](/reference/hoon/rune/) definitions.
  Whenever you expect structures to be used by code across multiple files, it is
  recommended to place their shared structures in `/sur`. Structures are
  imported from `/sur` with `/-`.
- `/sys` contains the code that defines the kernel and standard libraries. Note
  that only the `%base` desk should contain these `/sys` files, other desks
  omit the directory and instead just depend on `%base`. `/sys/vane` contains
  the code for the vanes, aka kernel modules. `/sys` is the exception to the
  rule - structures and functions that are central to Hoon, Arvo, and its vanes,
  are all located within this folder rather than in `/lib` and `/sur`. See
  [below](#sys) for more information on `/sys`.
- `/ted` contains [threads](/reference/arvo/threads/overview). These may be run
  from dojo using `-`. For example, `/ted/foo/hoon` on the `%base` desk is run
  with `-foo`. Threads on desks other than the `%base` desk can be run with
  `-desk!thread` like `-garden!foo`.
- `/tests` contains unit tests intended to be run using the `test` thread. To
  run a particular test `+test-bar` in `/tests/foo.hoon` in dojo, enter `-test %/tests/foo/test-bar ~`. If a file is specified, every test in that file will
  run. If a folder is specified, every test in that folder will run.

## `/sys` {% #sys %}

`/sys` contains four files: `hoon.hoon`, `arvo.hoon`, `lull.hoon`, and
`zuse.hoon`. These are the files used to construct kernelspace. Only the `%base`
desk contains these files, other desks omit the `/sys` directory and instead
just depend on `%base`. The chain of dependencies is `hoon.hoon` -> `arvo.hoon`
-> `lull.hoon` -> `zuse.hoon`. We give a brief description of each of them.

- `hoon.hoon` contains the Hoon compiler and the [Hoon standard
  library](/reference/hoon/stdlib). The Hoon
  compiler is self-hosted. This is the first file loaded by the Nock virtual
  machine, [Vere](/reference/runtime/runtime), in order for it to learn how to
  interpret Hoon. The kelvin version number is the subject of `hoon.hoon`,
  currently at 140. One may see this from dojo by inspecting the subject with
  `.` and noting that `%140` is the final entry of the subject.
- `arvo.hoon` contains the [Arvo kernel](/reference/arvo/overview) and
  additional structures and functions directly relevant to the kernel. This is
  Urbit's "traffic cop", and as such contains the structure definitions for
  call stacks such as `duct`s and `bone`s. Once Vere understands Hoon, it loads
  and interprets `arvo.hoon` to create the kernel. `hoon.hoon` is the subject
  of `arvo.hoon`.
- `lull.hoon` primarily contains structures shared among the kernel and its
  vanes, as well as a few functions. In particular, this includes the
  definitions of the `task`s and `gift`s utilized by each vane, each of which
  are documented in their respective documentation. `lull.hoon` is loaded by the
  kernel during the [larval stage](/reference/arvo/overview#larval-stage-core) in
  order to prepare to create the vanes. `arvo.hoon` is the subject of
  `lull.hoon`.
- `zuse.hoon` is the Arvo standard library. It consists primarily of functions
  shared by the kernel and vanes, such as the ones related to
  [cryptography](/reference/arvo/reference/cryptography). `zuse.hoon` is loaded by
  the larval kernel following `lull.hoon`. `lull.hoon` is the subject of
  `zuse.hoon`. Then `zuse` is the subject of the vanes. Some of the functions in
  Zuse are documented [here](/reference/hoon/zuse/table-of-contents).

## Desks

A desk is an independently revision-controlled branch of a ship that uses the
Clay filesystem. Each desk contains its own apps, mark definitions, files, and
so forth. The basic filesystem structure is the same for all desks, with the
exception that only the `%base` desk contains a [`/sys`](#sys) directory.
Additionally, there are a handful of special files related to the management of
desks and their Gall agents:

- `sys.kelvin` - This specifies the version of Arvo the desk is compatible with.
  This file is mandatory in all desks.
- `desk.bill` - This file specifies the Gall agents on a desk which should be
  automatically started when it's installed. This file may be omitted if there
  are no agents to start.
- `desk.docket-0` - This file configures the tile,
  [glob](/reference/additional/dist/glob) and other metadata for apps with a
  front-end. This file may be omitted if the desk does not have a tile or
  front-end to be installed. This file is versioned so the number appended may
  change in the future as changes to its specification are made. See the [Docket
  File](/reference/additional/dist/docket) documentation for more details.
- `desk.ship` - This specifies the original publisher of the desk and is useful
  if a desk is being republished. It is optional and may be omitted.

For more details of creating and distributing desks, see the [Software
Distribution](/guides/additional/software-distribution) documentation.
