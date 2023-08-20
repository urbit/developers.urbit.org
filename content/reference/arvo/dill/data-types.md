+++
title = "Data Types"
weight = 4
+++

Here are the data types used by Dill, as defined in `/sys/lull.hoon`.

## `$blew`

Terminal dimension.

```hoon
+$  blew  [p=@ud q=@ud]
```

`p` is columns, `q` is rows. This structure is passed to Dill by the
runtime in a [%blew](/reference/arvo/dill/tasks#blew) `task` whenever
the dimensions of the terminal changes.

---

## `$belt`

Terminal client input.

```hoon
+$  belt                                              ::  client input
  $?  bolt                                            ::  simple input
      [%mod mod=?(%ctl %met %hyp) key=bolt]           ::  w/ modifier
      [%txt p=(list @c)]                              ::  utf32 text
      ::TODO  consider moving %hey, %rez, %yow here   ::
  ==                                                  :: 
```

A `$belt` is passed to Dill in a
[%belt](/reference/arvo/dill/tasks#belt) `task` by the runtime whenever
there is input, such as a user typing in the console. This is only used
between the terminal client and Dill, a [$dill-belt](#dill-belt) is used
between Dill and Arvo.

May either be a [$bolt](#bolt) or one of:

- `%mod` - Modifier (Ctrl, Meta or Hyper) plus a key (see
  [`$bolt`](#bolt).
- `%txt` - A series of UTF-32 characters.

--

## `$bolt`

Simple input.

```hoon
+$  bolt                                              ::  simple input
  $@  @c                                              ::  simple keystroke
  $%  [%aro p=?(%d %l %r %u)]                         ::  arrow key
      [%bac ~]                                        ::  true backspace
      [%del ~]                                        ::  true delete
      [%hit x=@ud y=@ud]                              ::  mouse click
      [%ret ~]                                        ::  return
  ==                                                  ::
```

Either a single UTF-32 character or one of:

- `%aro` - Arrow keys.
- `%bac` - Backspace key.
- `%del` - Delete key.
- `%hit` - Mouse click - `r` is row and `c` is column. Note these are
  zero-indexed, with `[0 0]` being the _bottom left_ corner.
- `%ret` - Return (Enter) key.

---

## `$blit`

Terminal client output.

```hoon
+$  blit                                              ::  client output
  $%  [%bel ~]                                        ::  make a noise
      [%clr ~]                                        ::  clear the screen
      [%hop p=$@(@ud [x=@ud y=@ud])]                  ::  set cursor col/pos
      [%klr p=stub]                                   ::  put styled
      [%mor p=(list blit)]                            ::  multiple blits
      [%nel ~]                                        ::  newline
      [%put p=(list @c)]                              ::  put text at cursor
      [%sag p=path q=*]                               ::  save to jamfile
      [%sav p=path q=@]                               ::  save to file
      [%url p=@t]                                     ::  activate url
      [%wyp ~]                                        ::  wipe cursor line
  ==                                                  ::
```

A `$blit` is given to the terminal client by Dill in a `%blit` `gift`
when it wants to print some text, clear the screen, go _ding_ or what
have you.

This is directly used between Dill and the terminal client, while a
[$dill-blit](#dill-blit) is used between Arvo and Dill. A `$dill-blit`
includes the `$blit` union as a subset.

A `$blit` is one of:

- `%bel` - Ring the terminal bell.
- `%clr` - Clear the screen.
- `%hop` - Set cursor position. If `p` is an atom, it specifies the
  horizontal position on the prompt line. If `p` is a cell, it
  represents a 2D location where `x` is columns and `y` is
  rows.
- `%klr` - Set styled line, the `$stub` specifies the text and style.
- `%mor` - multiple `$blit`s.
- `%nel` - a newline.
- `%put` - put text (as a list of UTF-32 characters) at the current
  cursor position.
- `%sag` - Save to jamfile, typically in `/[pier]/.urb/put/`. `p` is
  `/[path]/[filename]/[extension]`. For example, `/foo/bar` will save it
  in `/[pier]/.urb/put/foo.bar`, `/a/b/c/foo/bar` will save it in
  `/[pier]/.urb/put/a/b/c/foo.bar`, and `/foo` will save it in
  `/[pier]/.urb/put.foo`. `q` is the `noun` to `jam` and save in the
  file.
- `%sav` - Save to file. Same behaviour as `%sag` except `q` is an
  `atom` rather than a `noun` and therefore doesn't need to be `jam`med.
  The `atom` is written to disk as if it were the bytestring in the tail
  of an `$octs`. That is, `%sav`ing the `cord` `'abcdef'`, whose `@ux`
  value is `0x6665.6463.6261`, results in a unix file whose hex dump
  renders as `61 62 63 64 65 66`.
- `%url` - Activate URL, `p` is the URL.
- `%wyp` - clear the cursor line.

---

## `$dill-belt`

Terminal input for Arvo.

```hoon
+$  dill-belt                                         ::  arvo input
  $%  belt                                            ::  client input
      [%cru p=@tas q=(list tank)]                     ::  errmsg (deprecated)
      [%hey ~]                                        ::  refresh
      [%rez p=@ud q=@ud]                              ::  resize, cols, rows
      [%yow p=gill:gall]                              ::  connect to app
  ==                                                  ::
```

A [$belt](#belt) is used between the terminal client and Dill, while a
`$dill-belt` is used between Dill and Arvo. A `$dill-belt` includes the
`$belt` union as a subset.

a `$dill-belt` is either [`$belt`](#belt) or one of:

- `%cru` - Echo error, `p` is some error tag and `q` is a stack trace.
- `%hey` - Refresh.
- `%rez` - Terminal resized, `p` is columns and `q` is rows.
- `%yow` - Connect to app.

---

## `$dill-blit`

Terminal output from Arvo.

```hoon
+$  dill-blit                                         ::  arvo output
  $%  blit                                            ::  client output
      [%qit ~]                                        ::  close console
  ==                                                  ::
```

While [$blit](#blit) is used between Dill and the terminal client,
`$dill-blit` is used between Arvo and Dill. A `$blit` is a subset of a
`$dill-blit`.

A `$dill-blit` is either a [`$blit`](#blit) or a:

- `%qit` - Close console.

---

## `$flog`

Wrapped Dill `task`s.

```hoon
+$  flog                                              ::  sent to %dill
  $%  [%crop p=@ud]                                   ::  trim kernel state
      $>(%crud told)                                  ::
      [%heft ~]                                       ::
      [%meld ~]                                       ::  unify memory
      [%pack ~]                                       ::  compact memory
      $>(%text told)                                  ::
      [%verb ~]                                       ::  verbose mode
  ==                                                  ::
```

These are a subset of Dill's `task`s which can be wrapped in a `%flog`
`task`. See the [API Reference](/reference/arvo/dill/tasks) document for
details of each of these `task`s.

---

## `$poke`

Dill to userspace.

```hoon
+$  poke                                              ::  dill to userspace
  $:  ses=@tas                                        ::  target session
      dill-belt                                       ::  input
  ==                                                  ::
```

A [`$dill-belt`](#dill-belt) (client input) for a particular session.

---

## `$session-task`

A subset of [Dill's `task`s](/reference/arvo/dill/tasks#session-tasks)
for interacting with a particular session.

```hoon
+$  session-task                                      ::  session request
  $%  [%belt p=belt]                                  ::  terminal input
      [%blew p=blew]                                  ::  terminal config
      [%flee ~]                                       ::  unwatch session
      [%hail ~]                                       ::  terminal refresh
      [%open p=dude:gall q=(list gill:gall)]          ::  setup session
      [%shut ~]                                       ::  close session
      [%view ~]                                       ::  watch session blits
  ==                                                  ::
```

This type is used in the [`%shot`](/reference/arvo/dill/tasks#shot)
wrapper `task`.

See the [Session Tasks](/reference/arvo/dill/tasks#session-tasks) entry
in the API reference for more details of these `task`s.

---

## `$told`

A subset of [Dill's `task`s](/reference/arvo/dill/tasks#session-tasks)
for basic text printing.

```hoon
+$  told                                              ::  system output
  $%  [%crud p=@tas q=tang]                           ::  error
      [%talk p=(list tank)]                           ::  tanks (in order)
      [%text p=tape]                                  ::  tape
  ==                                                  ::
```

See the [Told Tasks](/reference/arvo/dill/tasks#told-tasks) entry
in the API reference for more details of these `task`s.

---
