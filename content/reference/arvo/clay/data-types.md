+++
title = "Data Types"
weight = 4
+++

This section will be reference documentation for the data types used by our
filesystem.

## Internal types

These types are only used inside of Clay. These are only relevant if you're
working directly on Clay itself, or trying to understand its inner workings.

### `$cane`

The set of changes between the mergebase and one of the desks being merged.

```hoon
+$  cane
  $:  new=(map path lobe)
      cal=(map path lobe)
      can=(map path cage)
      old=(map path ~)
  ==
```

- `new` is the set of files in the new desk and not in the mergebase.
- `cal` is the set of changes in the new desk from the mergebase except for any
  that are also in the other new desk.
- `can` is the set of changes in the new desk from the mergebase and that are
  also in the other new desk (potential conflicts).
- `old` is the set of files in the mergebase and not in the new desk.

---

### `$cult`

Subscriptions

```hoon
+$  cult  (jug wove duct)
```

`cult`s keep track of subscribers. [`$wove`](#wove)s are associated to requests,
and each `wove` is mapped to a set of `duct`s associated to subscribers who
should be notified when the request is filled/updated.

---

### `$melt`

State for ongoing `%fuse` merges.

```hoon
+$  melt  [bas=beak con=(list [beak germ]) sto=(map beak (unit dome:clay))]
```

- `con` maintains the ordering.
- `sto` stores the data needed to merge.
- `bas` is the base `beak` for the merge.

---

### `$dojo`

Domestic desk state

```hoon
+$  dojo
  $:  qyx=cult                        ::  subscribers
      dom=dome                        ::  desk state
      per=regs                        ::  read perms per path
      pew=regs                        ::  write perms per path
      fiz=melt                        ::  state for mega merges
  ==
```

This is the all the data that is specific to a particular `desk` on a domestic
ship.

- `qyx` is the set of subscribers to this `desk`.
- `dom` is the data in the `desk`.
- `per` is a `map` of read permissions by path.
- `pew` is a `map` of write permissions by path.
- `fiz` is the state for ongoing `%fuse` merges.

---

### `$dome`

Desk data

```hoon
+$  dome
  $:  let=aeon                                          ::  top id
      hit=(map aeon tako)                               ::  versions by id
      lab=(map @tas aeon)                               ::  labels
      tom=(map tako norm)                               ::  tomb policies
      nor=norm                                          ::  default policy
      mim=(map path mime)                               ::  mime cache
      fod=flue                                          ::  ford cache
      wic=(map weft yoki)                               ::  commit-in-waiting
      liv=zest                                          ::  running agents
      ren=rein                                          ::  force agents on/off
  ==                                                    ::
```

A `dome` is the state of a `desk` and associated data.

- `let` is the number of the most recently numbered commit. This is also the
  total number of numbered commits.
- `hit` is a map of numerical IDs to commit hashes. These hashes are mapped into
  their associated commits in the [`$rang`](#rang) of the the [`$raft`](#raft)
  of Clay. In general, the keys of this map are exactly the numbers from 1 to
  `let`, with no gaps. Of course, when there are no numbered commits, `let` is
  0, so `hit` is null. Additionally, each of the commits is an ancestor of every
  commit numbered greater than this one. Thus, each is a descendant of every
  commit numbered less than this one. Since it is true that the date in each
  commit (`t.yaki`) is no earlier than that of each of its parents, the numbered
  commits are totally ordered in the same way by both pedigree and date. If that
  sounds too complicated to you, don't worry about it. It basically behaves
  exactly as you would expect.
- `lab` is a map of textual labels to numbered commits. Labels must be unique
  across a desk.
- `tom` contains the tombstoning policies for all files in the desk.
- `nor` is the default tombstoning policy.
- `mim` is a cache of the content in the directories that are mounted to Unix.
- `fod` is the Ford cache, which keeps a cache of the results of builds
  performed at this `desk`'s current revision, including a full transitive
  closure of dependencies for each completed build.
- `wic` contains commits waiting for future kernel versions.
- `liv` says whether agents on the desk are running or suspended.
- `ren` records which agents have been forced on or off, differing from the
  desk's `desk.bill` manifest.
  
---

### `$flow`

Global Ford cache

```hoon
+$  flow  (map leak [refs=@ud =soak])
```

Refcount includes references from other items in the cache, and from `spill`s in
each desk.

This is optimized for minimizing the number of rebuilds, and given that,
minimizing the amount of memory used. It is relatively slow to lookup, because
generating a cache key can be fairly slow (for files, it requires parsing; for
`tube`s, it even requires building the marks).

---

### `$flue`

Per-desk build cache

```hoon
+$  flue  [spill=(set leak) sprig=(map mist [=leak =soak])]
```

- `spill` is the set of "roots" we have into the [global ford cache](#flow). We
  add a root for everything referenced directly or indirectly on a desk, then
  invalidate them on commit only if their dependencies change.
- `sprig` is a fast-lookup index over the global ford cache. The only goal is to
  make cache hits fast.

---

### `$mist`

Ford build without content

```hoon
+$  mist
  $%  [%file =path]
      [%nave =mark]
      [%dais =mark]
      [%cast =mars]
      [%tube =mars]
      [%vale =path]
      [%arch =path]
  ==
```

This is used at the index of `sprig`s in [`$flue`](#flue)s.

---

### `$pour`

Ford build with content.

```hoon
+$  pour
  $%  [%file =path]
      [%nave =mark]
      [%dais =mark]
      [%cast =mars]
      [%tube =mars]
      ::  leafs
      ::
      [%vale =path =lobe]
      [%arch =path =(map path lobe)]
  ==
```

Like a [`$mist`](#mist) except the leaf nodes (files and directories) contain
the [`$lobe:clay`](#lobeclay) (content hash).

---

### `$soak`

Ford result

```hoon
+$  soak
  $%  [%cage =cage]
      [%vase =vase]
      [%arch dir=(map @ta vase)]
      [%dais =dais]
      [%tube =tube]
  ==
```

The actual data in the Ford cache.

---

### `$leak`

Ford cache key

```hoon
+$  leak
  $~  [*pour ~]
  $:  =pour
      deps=(set leak)
  ==
```

This includes all build inputs, including transitive dependencies, recursively.

---

### `$nako`

New desk data

```hoon
+$  nako                                                ::  subscription state
  $:  gar=(map aeon tako)                               ::  new ids
      let=aeon                                          ::  next id
      lar=(set yaki)                                    ::  new commits
      bar=~                                             ::  new content
  ==                                                    ::
```

Sent to other ships to update them about a particular desk. Includes a map of
all new aeons to hashes of their commits, the most recent aeon, and sets of all
new commits and data. `bar` is always empty now because we expect you to request
any data you don't have yet.

---

### `$raft`

Formal state

```hoon
+$  raft                                    ::  filesystem
  $:  rom=room                              ::  domestic
      hoy=(map ship rung)                   ::  foreign
      ran=rang                              ::  hashes
      fad=flow                              ::  ford cache
      mon=(map term beam)                   ::  mount points
      hez=(unit duct)                       ::  sync duct
      cez=(map @ta crew)                    ::  permission groups
      tyr=(set duct)                        ::  app subs
      tur=rock:tire                         ::  last tire
      pud=(unit [=desk =yoki])              ::  pending update
      bug=[veb=@ mas=@]                     ::  verbosity
  ==                                        ::
```

This is the state of the vane. Anything that must be remembered between
calls to Clay is stored in this state.

- `rom`: the state for all local desks. It consists of a `duct` to
  [Dill](/reference/arvo/dill/dill) and a collection of `desk`s.
- `hoy`: the state for all foreign desks.
- `ran`: the global, hash-addressed object store. It has maps of commit hashes
  to commits and content hashes to content.
- `fad`: the global build cache. Each desk has its own fast-lookup index over
  this global cache.
- `mon`: a collection of Unix mount points. `term` is the mount point
  (relative to th pier) and `beam` is a domestic Clay directory.
- `hez`: the duct used to sync with Unix.
- `cez`: a collection of named aermission groups.
- `tyr`: app subscriptions.
- `tur`: records whether apps are running and which kernel versions they're
  compatible with.
- `pud`: an update that's waiting on a kernel upgrade.
- `bug`: sets Clay's verbosity.

---

### `$rand`

Unvalidated response to a request.

```hoon
+$  rand                                                ::  unvalidated rant
          $:  p=[p=care q=case r=@tas]                  ::  clade release book
              q=path                                    ::  spur
              r=page                                    ::  data
          ==                                            ::
```

Like a [`$rant`](#rant), but with a page of data rather than a cage of it.

---

### `$rede`

Generic desk state

```hoon
+$  rede                                                ::  universal project
          $:  lim=@da                                   ::  complete to
              ref=(unit rind)                           ::  outgoing requests
              qyx=cult                                  ::  subscribers
              dom=dome                                  ::  revision state
              per=regs                                  ::  read perms per path
              pew=regs                                  ::  write perms per path
              fiz=melt                                  ::  domestic mega merges
          ==                                            ::
```

This is our knowledge of the state of a desk, either foreign or
domestic.

- `lim`: the most recent `@da` for which we're confident we have all the
  information for. For local `desk`s, this is always `now`. For foriegn `desk`s,
  this is the last time we got a full update from the foreign ship.
- `ref`: the request manager for the desk. For domestic `desk`s, this is null
  since we handle requests ourselves. For foreign `desk`s, this keeps track of
  all pending foriegn requests plus a cache of the responses to previous
  requests.
- `qyx`: the `set` of subscriptions to this desk, with listening `duct`s. These
  subscriptions exist only until they've been filled. For domestic `desk`s, this
  is simply `qyx:dojo` - all subscribers to the `desk`. For foreign `desk`s this
  is all the subscribers from our ship to the foreign `desk`.
- `dom`: the data in the `desk`.
- `per`: a `map` of read permissions by path.
- `pew`: a `map` of write permissions by path.
- `fiz`: the state for ongoing `%fuse` merges.

---

### `$rind`

Foreign request manager

```hoon
+$  rind                                                ::  request manager
  $:  nix=@ud                                           ::  request index
      bom=(map @ud update-state)                        ::  outstanding
      fod=(map duct @ud)                                ::  current requests
      haw=(map mood (unit cage))                        ::  simple cache
  ==                                                    ::
```

When we send a request to a foreign ship, we keep track of it in here.

- `nix`: request counter.
- `bom`: a `map` of request numbers to requests.
- `fod`: reverse `map` of requesters to request numbers.
- `haw`: a simple cache of common `%sing` requests.

---

### `$bill`

The list of agents that should be automatically started on a desk

```hoon
+$  bill  (list dude:gall)
```

### `$update-state`

State of outstanding foreign request

```hoon
+$  update-state
  $:  =duct
      =rave
      need=(list lobe)
      nako=(qeu (unit nako))
      busy=_|
  ==
```

An `update-state` is used to represent the status of an outstanding request to a
foreign `desk`.

- `duct`: the duct along which the request was made.
- `rave`: the request itself.
- `need`: a list of hashes yet to be acquired.
- `nako`: a queue of data yet to be validated.
- `busy`: tracks whether or not the request is currently being fulfilled.

---

### `$room`

Filesystem per domestic ship

```hoon
+$  room                                         ::  fs per ship
          $:  hun=duct                           ::  terminal duct
              dos=(map desk dojo)                ::  native desk
          ==                                     ::
```

This is the representation of the filesystem of a ship on our pier.

- `hun`: the duct we use to send messages to [Dill](/reference/arvo/dill/dill)
  to display notifications of filesystem changes. Only `%note` `%gift`s should
  be produced along this `duct`. This is set by the `%init` `move`.
- `dos`: the set of `desk`s on this ship, mapped to their `desk` state.

---

### `$cach`

Cached result of a request

```hoon
+$  cach  (unit (unit cage))                            ::  cached result
```

---

### `$wove`

Stored source and request

```hoon
+$  wove  [for=(unit [=ship ver=@ud]) =rove]          ::  stored source + req
```
 
---

### `$rove`

Stored request

```hoon
+$  rove                                                ::  stored request
          $%  [%sing =mood]                             ::  single request
              [%next =mood aeon=(unit aeon) =cach]      ::  next version of one
              $:  %mult                                 ::  next version of any
                  =mool                                 ::  original request
                  aeon=(unit aeon)                      ::  checking for change
                  old-cach=(map [=care =path] cach)     ::  old version
                  new-cach=(map [=care =path] cach)     ::  new version
              ==                                        ::
              [%many track=? =moat lobes=(map path lobe)] ::  change range
          ==                                            ::
```

Like a [`$rave:clay`](#raveclay) but with caches of current versions for `%next`
and `%many`. Generally used when we store a request in our state somewhere.

---

### `$rung`

Foreign desk data

```hoon
+$  rung
          $:  rus=(map desk rede)                       ::  neighbor desks
          ==
```

This contains the filesystem of a neighbour ship. The keys to this `map` are all
the `desk`s we know about on their ship.

---

## External types

These types are defined in `lull.hoon`, and are used in Clay's external
interface.

### `$aeon:clay`

Desk revision number

```hoon
+$  aeon  @ud                                         ::  version number
```

---

### `$beam:clay`

Global name

```hoon
+$  beam  [[p=ship q=desk r=case] s=path]             ::  global name
```

The full path to a file or directory.

---

### `$beak:clay`

Path prefix

```hoon
+$  beak  [p=ship q=desk r=case]                      ::  path prefix
```

A [`$beam:clay`](#beamclay) sans the specific file path.

---

### `$cable:clay`

`/lib`, `/sur` or `mark` reference

```hoon
+$  cable                                             ::  lib/sur/mark ref
  $:  face=(unit term)                                ::
      file-path=term                                  ::
  ==                                                  ::
```

---

### `$care:clay`

Clay submodule

```hoon
  +$  care                                              ::  clay submode
    ?(%a %b %c %d %e %f %p %r %s %t %u %v %w %x %y %z)  ::
```

This specifies what type of information is requested in a subscription
or a scry.

- `%a`: build a Hoon file at a `path`.
- `%b`: build a dynamically typed `mark` by name (a `$dais` mark-interface
  core).
- `%c`: build a dynamically typed `mark` conversion gate (a `$tube`) by "from"
  and "to" `mark` names.
- `%d`: returns a `(set desk)` of the `desk`s that exist on your ship.
- `%e`: builds a statically typed `mark` by name (a `$nave` mark-interface
  core).
- `%f`: builds a statically typed mark converstion gate.
- `%p`: produces the permissions for a directory, returned as a `[dict:clay
  dict:clay]`.
- `%r`: requests the file in the same fashion as `%x`, but wraps the result in a
  `vase`.
- `%s`: has miscellaneous debug endpoints.
- `%t`: produces a `(list path)` of descendent `path`s for a directory within a
  `yaki`.
- `%u`: produces a `?` depending on whether or not the specified file exists. It
  does not check any of its children.
- `%v`: requests the entire `dome` for a specified `desk` at a particular
  `aeon`. When used on a foreign `desk`, this get us up-to-date to the requested
  version.
- `%w`: requests the revision number and date of the specified path, returned as
  a `cass:clay`.
- `%x`: requests the file at a specified path at the specified commit, returned
  as an `@`. If there is no node at that path or if the node has no contents
  (that is, if `fil:ankh` is null), then this crashes.
- `%y`: requests an `arch` of the specfied commit at the specified path. It will
  return the bunt of an `arch` if the file or directory is not found.
- `%z`: requests a recursive hash of a node and all its children, returned as a
  `@uxI`.

See the [scry reference](/reference/arvo/clay/scry) for more details.

---

### `$case:clay`

Revision reference

```hoon
+$  case                                              ::  ship desk case spur
  $%  [%da p=@da]                                     ::  date
      [%tas p=@tas]                                   ::  label
      [%ud p=@ud]                                     ::  number
  ==                                                  ::
```

A commit can be referred to in up to three ways:

- `%da`: commit date
- `%tas`: label (seldom used currently)
- `%ud`: sequential revision number

---

### `$cash:clay`

`case` or `tako`

```hoon
+$  cash                                              ::  case or tako
  $%  [%tako p=tako]                                  ::
      case                                            ::
  ==                                                  ::
```

---

### `$cass:clay`

Cases for revision

```hoon
+$  cass  [ud=@ud da=@da]                             ::  cases for revision
```

This is returned by a `%w` read.

---

### `$clue:clay`

Tombstone target

```hoon
+$  clue                                              ::  murder weapon
  $%  [%lobe =lobe]                                   ::  specific lobe
      [%all ~]                                        ::  all safe targets
      [%pick ~]                                       ::  collect garbage
      [%norm =ship =desk =norm]                       ::  set default norm
      [%worn =ship =desk =tako =norm]                 ::  set commit norm
      [%seek =ship =desk =cash]                       ::  fetch source blobs
  ==                                                  ::
```

---

### `$cone:clay`

Domes

```hoon
+$  cone  (map [ship desk] foam)                      ::  domes
```

---

### `$foam:clay`

Desk state with additional metadata

```hoon
+$  foam
  $:  dome
      tom=(map tako norm)
      nor=norm
      liv=zest
      ren=(map dude:gall ?)
  ==
```

- `dome`: desk state
- `tom`: specific tombstone policies
- `nor`: default tombstone policy
- `liv`: agent activation status
- `ren`: `%rein`'d agents (forced on/off)

---

### `$crew:clay`

Permission group

```hoon
+$  crew  (set ship)                                  ::  permissions group
```

---

### `$dict:clay`

Effective permission

```hoon
  +$  dict  [src=path rul=real]                         ::  effective permission

```

---

### `$dome:clay`

```hoon
+$  dome                                              ::  project state
  $:  let=@ud                                         ::  top id
      hit=(map @ud tako)                              ::  changes by id
      lab=(map @tas @ud)                              ::  labels
  ==                                                  ::
```

- `let`: current revision number
- `hit`: map of revisions to their commit hashes
- `lab`: map of labels to their revision numbers

---

### `$germ:clay`

Merge strategy

```hoon
+$  germ                                              ::  merge style
  $?  %init                                           ::  new desk
      %fine                                           ::  fast forward
      %meet                                           ::  orthogonal files
      %mate                                           ::  orthogonal changes
      %meld                                           ::  force merge
      %only-this                                      ::  ours with parents
      %only-that                                      ::  hers with parents
      %take-this                                      ::  ours unless absent
      %take-that                                      ::  hers unless absent
      %meet-this                                      ::  ours if conflict
      %meet-that                                      ::  hers if conflict
  ==                                                  ::
```

See the [Strategies](/reference/arvo/clay/using#strategies) section of "Using
Clay" for further details of their meaning.

---

### `$lobe:clay`

File reference

```hoon
+$  lobe  @uvI                                        ::  blob ref
```

This is a hash of a [`page`](#pageclay). These are most notably used in
[`lat.rang`](#rangclay), where they are associated with the actual `page`, and
as the values in [`q.yaki`](#yakiclay), where `path`s are associated with their
content hashes in a commit.

---

### `$miso:clay`

File delta

```hoon
+$  miso                                              ::  file delta
  $%  [%del ~]                                        ::  delete
      [%ins p=cage]                                   ::  insert
      [%dif p=cage]                                   ::  mutate from diff
      [%mut p=cage]                                   ::  mutate from raw
  ==                                                  ::
```

There are four kinds of changes that may be made to a node in a `desk`.

- `%del`: deletes the node.
- `%ins`: inserts a file given by `p`.
- `%dif`: currently unimplemented. This may seem strange, so we remark that
  diffs for individual files are implemented using `+diff` and `+pact` in
  `mark`s. So for an `ankh`, which may include both files and directories,
  `%dif` being unimplemented really just means that we do not yet have a formal
  concept of changes in directory structure.
- `%mut`: mutates the file using raw data given by `p`.

---

### `$moar:clay`

Normal change range

```hoon
+$  moar  [p=@ud q=@ud]                               ::  normal change range
```

---

### `$moat:clay`

Range subscription request

```hoon
+$  moat  [from=case to=case =path]                   ::  change range
```

This represents a request for all changes between `from` and `to` on `path`. You
will be notified when a change is made to the node referenced by the `path` or
to any of its children.

---

### `$mode:clay`

External files

```hoon
+$  mode  (list [path (unit mime)])                   ::  external files
```

This is used when there's a commit from the host system.

---

### `$mood:clay`

Single subscription request

```hoon
+$  mood  [=care =case =path]                         ::  request in desk
```

This represents a request for data related to the state of the `desk` at a
particular commit, specfied by `case`. The `care` specifies what kind of
information is desired, and the `path` specifies the path we are requesting.

---

### `$nori:clay`

Repository action

```hoon
+$  nori                                              ::  repository action
  $%  [%& p=soba]                                     ::  delta
      [%| p=@tas q=(unit aeon)]                       ::  label
  ==                                                  ::
```

This describes a change that we are asking Clay to make to the `desk`. There are
two kinds of changes that may be made: we can modify files or we can apply a
label to a commit.

In the `&` case, we will apply the given changes. In the `|` case, we will apply
the given label to the commit specified in `q`, or the current one if it's null.

---

### `$norm:clay`

Tombstone policy.

```hoon
+$  norm  (axal ?)
```

An `axal` is a recursive directory structure. For each file, a `?` says whether
it should be tombstoned or not.

---

### `$page:clay`

A raw, unvalidated file.

```hoon
+$  page  ^page                                       ::  export for compat
```

This is just the `page` defined in `arvo.hoon`: a pair of a mark and a noun.

---

### `$rang:clay`

Data repository

```hoon
+$  rang                                              ::  repository
  $:  hut=(map tako yaki)                             ::  changes
      lat=(map lobe page)                             ::  data
  ==                                                  ::
```

This is a data repository keyed by hash. Thus, this is where the "real" data is
stored, but it is only meaningful if we know the hash of what we're looking for.

`hut` is a `map` from commit hashes ([`tako`](#takoclay)s) to commits
([`yaki`](#yakiclay)s). We often get the hashes from [`hit.dome`](#domeclay),
which keys them by numerical id.

`lat` is a `map` from content hashes ([`lobe`](#lobeclay)s) to the actual
content ([`page`](#pageclay)s). We often get the hashes from a
[`yaki`](#yakiclay), which references this `map` to get the data. There is no
`page` in `yaki:clay`. They are only accessible through `lat`.

---

### `$rant:clay`

Response data

```hoon
+$  rant                                              ::  response to request
  $:  p=[p=care q=case r=desk]                        ::  clade release book
      q=path                                          ::  spur
      r=cage                                          ::  data
  ==                                                  ::
```

This is the data associated to the response to a request.

- `p.p`: specifies the type of data that was requested (and is produced).
- `q.p`: gives the specific version reported (since a range of versions may be
  requested in a subscription).
- `r.p`: the `desk`.
- `q`: the path to the filesystem node.
- `r`: is the data itself (in the format specified by `p.p`).

---

### `$rave:clay`

General subscription request

```hoon
+$  rave                                              ::  general request
  $%  [%sing =mood]                                   ::  single request
      [%next =mood]                                   ::  await next version
      [%mult =mool]                                   ::  next version of any
      [%many track=? =moat]                           ::  track range
  ==                                                  ::
```

This represents a subscription request for a `desk`.

- `%sing`: asks for data at single revision.

- `%next`: asks to be notified the next time there’s a change to the specified
  file.
- `%mult`: asks to be notified the next time there's a change to a specified set
  of files.
- `%many`: asks to be notified on every change in a `desk` for a range of
  changes (including into the future).

---

### `$real:clay`

Resolved permissions

```hoon
+$  real                                              ::  resolved permissions
  $:  mod=?(%black %white)                            ::
      who=(pair (set ship) (map @ta crew))            ::
  ==                                                  ::
```

- `mod`: whether it's a blacklist or whitelist.
- `who`: the ships who are blacklisted/whitelisted. It can have both individual
  ships as well as [`crew`](#crewclay) (permission groups).

---

### `$regs:clay`

Permission rules for paths

```hoon
+$  regs  (map path rule)                             ::  rules for paths
```

A map from file/directory paths to permission [`rule`](#ruleclay)s.

---

### `$rein:clay`

Forced on/off apps

```hoon
+$  rein  (map dude:gall ?)                           ::  extra apps
```

A `dude:gall` is the name of a Gall agent and the `?` is whether it's forced on
or off. An app is forced when it's started despite not being on the `desk.bill`
manifest or stopped when it *is* on the manifest.

---

### `$riff:clay`

Request/desist

```hoon
+$  riff  [p=desk q=(unit rave)]                      ::  request+desist
```

This represents a request for data about a particular `desk`. If `q` contains a
`rave`, then this opens a subscription to the `desk` for that data. If `q` is
null, then this tells Clay to cancel the subscription along this duct.

---

### `$rite:clay`

New permissions

```hoon
+$  rite                                              ::  new permissions
  $%  [%r red=(unit rule)]                            ::  for read
      [%w wit=(unit rule)]                            ::  for write
      [%rw red=(unit rule) wit=(unit rule)]           ::  for read and write
  ==                                                  ::
```

- `%r`: read permissions.
- `%w`: write permissions.
- `%rw`: both read and write permissions.

---

### `$riot:clay`

Response

```hoon
+$  riot  (unit rant)                                 ::  response+complete
```

A `riot` is a response to a subscription. If null, the subscription has been
completed, and no more responses will be sent. Otherwise, the `rant` is the
produced data.

---

### `$rule:clay`

Node permission

```hoon
+$  rule  [mod=?(%black %white) who=(set whom)]       ::  node permission
```

- `mod`: whether it's a blacklist or whitelist.
- `who`: the ships or permission groups on the list.

---

### `$soba:clay`

Delta

```hoon
+$  soba  (list [p=path q=miso])                      ::  delta
```

This describes a `list` of changes to make to a `desk`. The `path`s are `path`s
to files to be changed, and the corresponding `miso` value is a description of
the change itself.

---

### `$tako:clay`

Commit reference

```hoon
+$  tako  @uvI                                        ::  yaki ref
```

This is a hash of a [`yaki`](#yakiclay), a commit. These are most notably used
as the keys in [`hut.rang`](#rangclay), where they are associated with the
actual `yaki`, and as the values in [`hit.dome`](#domeclay), where sequential
numerical ids are associated with these.

---

### `+unce:clay`

Change part of a list.

```hoon
++  unce                                              ::  change part
  |*  a=mold                                          ::
  $%  [%& p=@ud]                                      ::  skip[copy]
      [%| p=(list a) q=(list a)]                      ::  p -> q[chunk]
  ==                                                  ::
```

This is a single change in a list of elements of type `a`. For example,
`(unce @t)` is a single change in lines of text.

- `%&`: the next `p` lines are unchanged.
- `%|`: the lines `p` have changed to `q`.

---

### `+urge:clay`

List change

```hoon
++  urge  |*(a=mold (list (unce a)))                  ::  list change
```

This is a parametrized type for list changes. For example, `(urge @t)` is a list
change for lines of text.

---

### `$waft:clay`

Kelvin range

```hoon
+$  waft                                              ::  kelvin range
  $^  [[%1 ~] p=(set weft)]                           ::
  weft                                                ::
```

A `waft` is the result of reading a `sys.kelvin` file in a desk. It lists all
the `weft`s (kernel versions) a desk is compatible with. It may
either be a single `weft` like `[%zuse 417]`, or a range like:

```hoon
[[%1 ~] (silt zuse+417 zuse+416 ~)]
```

---

### `$whom:clay`

Ship or named crew

```hoon
+$  whom  (each ship @ta)                             ::  ship or named crew
```

Either a single ship or a set of ships in a [`crew`](#crewclay) (permission
group). This is used for read/write permissions.

---

### `$yoki:clay`

Commit

```hoon
  +$  yoki  (each yuki yaki)                            ::  commit
```

Either a [`yuki`](#yukiclay) or a [`yaki`](#yakiclay). A `yuki` is a
proto-commit, a `yaki` is a final commit whose data is entirely in the general
object store.

---

### `$yuki:clay`

Proto-commit

```hoon
+$  yuki                                              ::  proto-commit
  $:  p=(list tako)                                   ::  parents
      q=(map path (each page lobe))                   ::  namespace
  ==                                                  ::
```

A `yuki` is a proto-commit: a new, proposed commit that has not yet been
finalized. This is in contrast to a [`yaki`](#yakiclay). The main difference is
that a `yuki` may contain actual data, while a `yaki` only contains
[`lobe`](#lobeclay)s ( content hashes used as references to data in the general
object store).

- `p`: commit references of any parents.
- `q`: a `map` from file paths to either [`page`](#page:clay) data or `lobe`s.

---

### `$yaki:clay`

Finalized commit

```hoon
+$  yaki                                              ::  commit
  $:  p=(list tako)                                   ::  parents
      q=(map path lobe)                               ::  namespace
      r=tako                                          ::  self-reference
      t=@da                                           ::  date
  ==                                                  ::
```

- `p`: a `list` of the hashes of the parents of this commit. In most cases,
  this will be a single commit, but in a merge there may be more parents.
- `q`: is a `map` of the `path`s on a desk to the content hashes at that
  location. If you understand what a [`lobe`](#lobeclay) and a
  [`page`](#pageclay) is, then the type signature here tells the whole story.
- `r`: is the hash associated with this commit.
- `t`: is the date at which this commit was made.

---

### `$zest:clay`

How live

```hoon
+$  zest  $~(%dead ?(%dead %live %held))              ::  how live
```

This represents the state of apps on the desk.

- `%dead`: suspended.
- `%held`: suspended pending compatible system update.
- `%live`: running.

---
