+++
title = "Remote Scry"
description = "Learn about scrying over the network"
weight = 5
+++

To [scry](/reference/glossary/scry) is to perform a *read* from Urbit's
referentially transparent namespace. In other words, it's a function from a
`path` to a `noun` (although in some cases, the resulting type may be more
constrained). Previously we only supported scrying within the same ship, but
from Kernel version `[%zuse 413]`, it is possible to scry from *other* ships.

## Lifecycle of a scry

When you think of scry, you probably think of [`.^`
(dotket)](/reference/hoon/rune/dot#-dotket). However, since networking is
asynchronous, this is not a suitable interface for remote scry. Instead, a ship
that wants to read from a remote part of the namespace will have to pass a
`%keen` task to its Ames, which then cooperates with Vere to produce the
desired data. In some future event when the result is available, Ames gives it
back as a `%tune` gift. From the requester's perspective, this is the entire
default lifecycle of a remote scry request.

Of course, you need to know how `%keen` and `%tune` look to be able to use
them. There are also a few exceptions to this default lifecycle. We'll go
through all of this in a moment, but first, let's look at what kind of data is
possible to scry.

## Publishing

At the moment, there are two vanes that can handle remote scry requests:
[Clay](/reference/arvo/clay/clay) and [Gall](/reference/arvo/gall/gall). Clay
uses it to distribute source code in a more efficient manner than is possible
with conventional Ames, but conceptually it only extends its [local
scries](/reference/arvo/clay/scry) over the network, with the notable
difference that you can't scry at the *current* time, since the requester
doesn't know when the request reaches the publisher. Additionally, the paths
are modified so that the vane and care are specified separately, like so:
`/c/x/1/base/sys/hoon/hoon`.

Gall is more interesting. First, let's clear up a possible misunderstanding
that could easily come up: remote scry does *not* involve calling an agent's
`+on-peek` arm. `+on-peek` scries always happen at the current time, and since
the requester can't know at which time the publisher handles the request, these
aren't possible to reliably serve.

Instead, agents *ask* Gall to `%grow` paths in the namespace on their behalf.
Gall will take care of incrementing version numbers, so that the same path
never maps to different nouns. The agent can also ask Gall to delete data,
either at a specific version number, or everything up to and including a
version number. Concretely, we've extended `$note:agent:gall` to include the
following cases:

```hoon
+$  note
  $%  ...
      [%grow =path =page]  ::  publish
      [%tomb =case =path]  ::  delete one
      [%cull =case =path]  ::  delete up to
  ==
```

Here's an example sequence of cards that use these:

```hoon
[%pass /call/back/path %grow /foo atom+'lorem']  ::  /foo version 0
[%pass /call/back/path %grow /foo atom+'ipsum']  ::  /foo version 1
[%pass /call/back/path %grow /foo atom+'dolor']  ::  /foo version 2
[%pass /call/back/path %grow /foo atom+'sit']    ::  /foo version 3

[%pass /call/back/path %tomb ud+3 /foo]          ::  delete /foo version 3
[%pass /call/back/path %cull ud+1 /foo]          ::  delete /foo 0 through 1

[%pass /call/back/path %grow /foo atom+'amet']   ::  /foo version 4
[%pass /call/back/path %grow /foo/bar atom+123]  ::  /foo/bar version 0
```

After this sequence of cards we would have the following mappings (assuming the
agent that emits them is named `%test`):

```hoon
/g/x/2/test//foo     -> [%atom 'dolor']
/g/x/4/test//foo     -> [%atom 'amet']
/g/x/0/test//foo/bar -> [%atom 123]
```

Let's pick apart the first one of these paths.

```hoon
/g     ::  g for Gall
/x     ::  a care of %x generally means "normal read"
/2     ::  version number
/test  ::  the agent that published the data
/      ::  ???
/foo   ::  the path that the data is published on
```

What's that lone `/` before the path? It signifies that this data is published
by *Gall* itself, instead of the `+on-peek` arm in the `%test` agent. As part
of the remote scry release, we will *reserve* part of the scry namespace for
Gall, effectively *preventing* any agents from directly publishing at those
paths. Though as we've seen, they can do it indirectly, by asking Gall to do it
for them using `%grow`.

As long as the extra `/` is included, Gall will serve scries with care `%x` at
both specific revision numbers and at arbitrary times. If the extra `/` is not
included, the scry has to happen at the current time, since we don't cache old
results of calling `+on-peek`.

### Additional Gall cares

Apart from supporting reads using the `%x` care, Gall now also supports three new cares:

- `%t` lists all subpaths that are bound under a path (only supported at the
  current time, i.e. not remotely!).
- `%w` gives the latest revision number for a path (only supported at the
  current time, i.e. not remotely!).
- `%z` gives the hash identifier of the value bound at the path (supported at
  any time and at specific revisions, but not remotely).

All of these require the extra `/` to be present in the path, just as with `%x`.

## Scrying tasks

With this, we're ready to look at all the new tasks to, and gifts from, Ames:

```hoon
+$  task
  $%  ...
      [%keen =ship =path]  ::  peek [ship /vane/care/case/spur]
      [%yawn =ship =path]  ::  cancel request from arvo
      [%wham =ship =path]  ::  cancels all scry requests from any vane
      ...
  ==
::
+$  gift
  $%  ...
      [%tune spar roar=(unit roar)]
      ...
  ==
```

At this point, most of these should be very clear, but briefly:

- We pass `[%keen =ship =path]` to Ames to request to read from `path` on
  `ship`.  Example:
  ```hoon
  [%pass /call/back/path %arvo %a %keen ~sampel /c/x/4/base/sys/hoon/hoon]
  ```

- We pass `[%yawn =ship =path]` to tell Ames that we're no longer interested in
  a response.  Example: 
  ```hoon
  [%pass /call/back/path %arvo %a %yawn ~sampel /g/x/4/test//foo]
  ```

- We pass `[%wham =ship =path]` to tell Ames that *no-one* on this ship is
  interested in a response.  Example:
  ```hoon
  [%pass /call/back/path %arvo %a %wham ~sampel /g/x/4/test//foo]
  ```

- Ames gives the following to the original requester(s), either when it has a
  response, or when the request gets `%wham`ed:
  ```hoon
  [%tune [=ship =path] roar=(unit roar)]
  ```
  The outer `unit` of `roar` will be `~` if Ames doesn't have a
  response, but may have one in the future. Otherwise, it will
  contain a signature and the data. The data in the
  [`$roar`](/reference/arvo/ames/data-types#roar) may be `~`,
  meaning that there is no value at this path and will never be
  one.

## `-keen`

In addition to the above interface offered to agents, there is also support for
making scry requests from threads using `+keen` in `lib/strandio`. It accepts a
`[=ship =path]` and returns a `(unit page)`. There is also a [thread `ted/keen`
that demonstrates
this](https://github.com/urbit/urbit/blob/i/5788/remote-scry/pkg/arvo/ted/keen.hoon).
You can run it from the dojo using `-keen [ship path]`. For example, this reads
the thread's own source code out of `~sampel`'s `%kids` desk, try it!

```
-keen [~sampel /c/x/1/kids/ted/keen/hoon]
```

## Additional reading

- [Gall scry reference](/reference/arvo/gall/scry): Reference documentation of
  Gall's vane-level and agent-level scry interface.

- [Ames API reference](/reference/arvo/ames/tasks): Reference documentation of `task`s that can be passed to Ames, including those for remote scries.
