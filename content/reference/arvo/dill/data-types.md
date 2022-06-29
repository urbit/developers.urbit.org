+++
title = "Data Types"
weight = 4
+++

Here are the data types used by Dill, as defined in `/sys/lull.hoon`.

## `$blew`

```hoon
  +$  blew  [p=@ud q=@ud]
```

Terminal dimension; `p` is columns, `q` is rows. This structure is passed to Dill by the runtime in a [%blew](/reference/arvo/dill/tasks#blew) `task` whenever the dimensions of the terminal changes.

## `$belt`

```hoon
+$  belt
  $?  bolt
  $%  [%mod mod=?(%ctl %met %hyp) key=bolt]
      [%txt p=(list @c)]
      [%ctl p=@c]
      [%met p=@c]
  ==  ==
```

Terminal client input.

A `$belt` is passed to Dill in a [%belt](/reference/arvo/dill/tasks#belt) `task` by the runtime whenever there is input, such as a user typing in the console. This is only used between the terminal client and Dill, a [$dill-belt](#dill-belt) is used between Dill and Arvo.

May either be a [$bolt](#bolt) or one of:

- `%mod` - Modifier (Ctrl, Meta or Hyper) plus [key].
- `%txt` - A series of characters
- `%ctl` - Ctrl+[key], deprecated in favour of `%mod`.
- `%met` - Meta+[key], deprecated in favour of `%mod`.

## `$bolt`

```hoon
+$  bolt
  $@  @c
  $%  [%aro p=?(%d %l %r %u)]
      [%bac ~]
      [%del ~]
      [%hit r=@ud c=@ud]
      [%ret ~]
  ==
```

Simple input.

Either a single simple character or one of:

- `%aro` - Arrow keys.
- `%bac` - Backspace key.
- `%del` - Delete key.
- `%hit` - Mouse click - `r` is row and `c` is column. Note these are zero-indexed, with `[0 0]` being the _bottom left_ corner.
- `%ret` - Return (Enter) key.

## `$blit`

```hoon
+$  blit
  $%  [%bel ~]
      [%clr ~]
      [%hop p=@ud]
      [%klr p=stub]
      [%lin p=(list @c)]
      [%mor ~]
      [%sag p=path q=*]
      [%sav p=path q=@]
      [%url p=@t]
  ==
```

Terminal client output.

A `$blit` is given to the terminal client by Dill in a `%blit` `gift` when it wants to print some text, clear the screen, go _ding_ or what have you.

This is only used between Dill and the terminal client, a [$dill-blit](#dill-blit) is used instead between Arvo and Dill.

A `$blit` is one of:

- `%bel` - Ring the terminal bell.
- `%clr` - Clear the screen.
- `%hop` - Set cursor position, `p` specifies its position on the prompt line.
- `%klr` - Set styled line, the `$stub` specifies the text and style.
- `%lin` - Set current line, `p` contains the text.
- `%mor` - Newline.
- `%sag` - Save to jamfile, typically in `/[pier]/.urb/put/`. `p` is `/[path]/[filename]/[extension]`. For example, `/foo/bar` will save it in `/[pier]/.urb/put/foo.bar`, `/a/b/c/foo/bar` will save it in `/[pier]/.urb/put/a/b/c/foo.bar`, and `/foo` will save it in `/[pier]/.urb/put.foo`. `q` is the `noun` to `jam` and save in the file.
- `%sav` - Save to file. Same behaviour as `%sag` except `q` is an `atom` rather than a `noun` and therefore doesn't need to be `jam`med. The `atom` is written to disk as if it were the bytestring in the tail of an `$octs`. That is, `%sav`ing the `cord` `'abcdef'`, whose `@ux` value is `0x6665.6463.6261`, results in a unix file whose hex dump renders as `61 62 63 64 65 66`.
- `%url` - Activate URL, `p` is the URL.

## `$dill-belt`

```hoon
+$  dill-belt
  $%  [%aro p=?(%d %l %r %u)]
      [%bac ~]
      [%cru p=@tas q=(list tank)]
      [%ctl p=@]
      [%del ~]
      [%hey ~]
      [%met p=@]
      [%ret ~]
      [%rez p=@ud q=@ud]
      [%txt p=(list @c)]
      [%yow p=gill:gall]
  ==
```

Terminal input for Arvo.

While [$belt](#belt) is used between the terminal client and Dill, `$dill-belt` is used between Dill and Arvo.

a `$dill-belt` is one of:

- `%aro` - Arrow keys.
- `%bac` - Backspace key.
- `%cru` - Echo error, `p` is an error `@tas` and `q` is a traceback.
- `%ctl` - Ctrl+[key].
- `%del` - Delete key.
- `%hey` - Refresh.
- `%met` - Meta+[key].
- `%ret` - Return key (Enter).
- `%rez` - Terminal resized, `p` is columns and `q` is rows.
- `%txt` - Text input.
- `%yow` - Connect to app.

## `$dill-blit`

```hoon
+$  dill-blit
  $%  [%bel ~]
      [%clr ~]
      [%hop p=@ud]
      [%klr p=stub]
      [%mor p=(list dill-blit)]
      [%pom p=stub]
      [%pro p=(list @c)]
      [%qit ~]
      [%out p=(list @c)]
      [%sag p=path q=*]
      [%sav p=path q=@]
      [%url p=@t]
  ==
```

Terminal output from Arvo.

While [$blit](#blit) is used between Dill and the terminal client, `$dill-blit` is used between Arvo and Dill.

A `$dill-blit` is one of:

- `%bel` - Terminal bell.
- `%clr` - Clear screen.
- `%hop` - Set cursor position, `p` is its horizontal position on the prompt line.
- `%klr` - Styled text, the `$stub` specifies both the text and style.
- `%mor` - Multiple `$dill-blit`.
- `%pom` - Styled prompt, the `$stub` specifies both the text and style.
- `%pro` - Set prompt, `p` is the text for the prompt.
- `%qit` - Close console.
- `%out` - Print text.
- `%sag` - Save `noun` to jamfile. See [$blit](#blit) section for further details.
- `%sav` - Save `atom` to file. See [$blit](#blit) section for further details.
- `%url` - Activate URL.

## `$flog`

```hoon
+$  flog
  $%  [%crop p=@ud]
      [%crud p=@tas q=(list tank)]
      [%heft ~]
      [%meld ~]
      [%pack ~]
      [%text p=tape]
      [%verb ~]
  ==
```

Wrapped Dill `task`s.

These are a subset of Dill's `task`s which can be wrapped in a `%flog` `task`. See the [API Reference](/reference/arvo/dill/tasks) document for details of each of these `task`s.
