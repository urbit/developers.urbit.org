+++
title = "Docket File"
weight = 3
template = "doc.html"
+++

The docket file sets various options for desks with a tile and (usually) a browser-based front-end of some kind. Mainly it configures the appearance of an app's tile, the source of its [glob](/docs/userspace/dist/glob), and some additional metadata.

The docket file is read by the `%docket` agent when a desk is `|install`ed. The `%docket` agent will fetch the glob if applicable and create the tile as specified on the homescreen. If the desk is published with `:treaty|publish`, the information specified in the docket file will also be displayed for others who are browsing apps to install on your ship.

The docket file is _optional_ in the general case. If it is omitted, however, the app cannot have a tile in the homescreen, nor can it be published with the `%treaty` agent, so others will not be able to browse for it from their homescreens.

The docket file must be named `desk.docket-0`. The `%docket` `mark` is versioned to facilitate changes down the line, so the `-0` suffix may be incremented in the future.

The file must contain a `hoon` list with a series of clauses. The clauses are defined in `/sur/docket.hoon` as:

```hoon
+$  clause
  $%  [%title title=@t]
      [%info info=@t]
      [%color color=@ux]
      [%glob-http url=cord hash=@uvH]
      [%glob-ames =ship hash=@uvH]
      [%image =url]
      [%site =path]
      [%base base=term]
      [%version =version]
      [%website website=url]
      [%license license=cord]
  ==
```

The `%image` clause is optional. It is mandatory to have exactly one of either `%site`, `%glob-http` or `%glob-ames`. All other clauses are mandatory.

Here's what a typical docket file might look like:

```hoon
:~
  title+'Foo'
  info+'An app that does a thing.'
  color+0xf9.8e40
  glob-ames+[~zod 0v0]
  image+'https://example.com/tile.svg'
  base+'foo'
  version+[0 0 1]
  license+'MIT'
  website+'https://example.com'
==
```

Details of each clause and their purpose are described below.

---

## `%title`

_required_

The `%title` field specifies the name of the app. The title will be the name shown on the app's tile, as well as the name of the app when others search for it.

#### Type

```hoon
[%title title=@t]
```

#### Example

```hoon
title+'Bitcoin'
```

---

## `%info`

_required_

The `%info` field is a brief summary of what the app does. It will be shown as the subtitle in _App Info_.

#### Type

```hoon
[%info info=@t]
```

#### Example

```hoon
info+'A Bitcoin Wallet that lets you send and receive Bitcoin directly to and from other Urbit users'
```

---

## `%color`

_required_

The `%color` field specifies the color of the app tile as an `@ux`-formatted hex value.

#### Type

```hoon
[%color color=@ux]
```

#### Example

```hoon
color+0xf9.8e40
```

---

## `%glob-http`

_exactly one of either this, [glob-ames](#glob-ames) or [site](#site) is required_

The `%glob-http` field specifies the URL and hash of the app's [glob](/docs/userspace/dist/glob) if it is distributed via HTTP.

#### Type

```hoon
[%glob-http url=cord hash=@uvH]
```

#### Example

```hoon
glob-http+['https://example.com/glob-0v1.s0me.h4sh.glob' 0v1.s0me.h4sh]
```

---

## `%glob-ames`

_exactly one of either this, [glob-http](#glob-http) or [site](#site) is required_

The `%glob-ames` field specifies the ship and hash of the app's [glob](/docs/userspace/dist/glob) if it is distributed from a ship over Ames. If the glob will be distributed from our ship, the hash can initially be `0v0` as it will be overwritten with the hash produced by the [Globulator](/docs/userspace/dist/glob#globulator).

#### Type

```hoon
[%glob-ames =ship hash=@uvH]
```

#### Example

```hoon
glob-ames+[~zod 0v0]
```

---

## `%site`

_exactly one of either this, [glob-ames](#glob-ames) or [glob-http](#glob-http) is required_

It's possible for an app to handle HTTP requests from the client directly rather than with a separate [glob](/docs/userspace/dist/glob). In that case, the `%site` field specifies the `path` of the Eyre endpoint the app will bind. If `%site` is used, clicking the app's tile will simply open a new tab with a GET request to the specified Eyre endpoint.

For more information on direct HTTP handling with a Gall agent or generator, see the [Eyre Internal API Reference](/docs/arvo/eyre/tasks) documentation.

#### Type

```hoon
[%site =path]
```

#### Example

```hoon
site+/foo/bar
```

---

## `%image`

_optional_

The `%image` field specifies the URL of an image to be displayed on the app's tile. This field is optional and may be omitted entirely.

The given image will be displayed on top of the [color](#color)ed tile. The app [title](#title) (and hamburger menu upon hover) will be displayed on top of the given image, in small rounded boxes with the same background color as the main tile. The given image will be displayed at 100% of the width of the tile. The image's corners will be hidden by the rounded corners of the tile, so the image itself needn't have rounded corners. The tile is a perfect square, so if the image should occupy the whole tile, it should also be a perfect square. If the image should be a smaller icon in the center of the tile (like the bitcoin tile), it should just have a square of transparent negative space around it.

It may be tempting to set the image URL as a root-relative path like `/apps/myapp/img/tile.svg` and bundle it in the glob. While this would work locally, it means the image would fail to load for those browsing apps to install. Therefore, the image should be hosted somewhere globally available.

#### Type

```hoon
[%image =url]
```

The `url` type is a simple `cord`:

```hoon
+$  url  cord
```

#### Example

```hoon
image+'http://example.com/icon.svg'
```

---

## `%base`

_required_

The `%base` field specifies the base of the URL path of the glob resources. In the browser, the path will begin with `/apps`, then the specified base, then the rest of the path to the particular glob resource like `http://localhost:8080/apps/my-base/index.html`. Note the `path`s of the glob contents themselves should not include this base element.

#### Type

```hoon
[%base base=term]
```

#### Example

```hoon
base+'bitcoin'
```

---

## `%version`

_required_

The `%version` field specifies the current version of the app. It's a triple of three `@ud` numbers representing the major version, minor version and patch version. In the client, `[1 2 3]` will be rendered as `1.2.3`. You would typically increase the appropriate number each time you published a change to the app.

#### Type

```hoon
[%version =version]
```

The `version` type is just a triple of three numbers:

```hoon
+$  version
  [major=@ud minor=@ud patch=@ud]
```

#### Example

```hoon
version+[0 0 1]
```

---

## `%website`

_required_

The `%website` field is for a link to a relevant website. This might be a link to the app's github repo, company website, or whatever is appropriate. This field will be displayed when people are browsing apps to install.

#### Type

```hoon
[%website website=url]
```

The `url` type is a simple `cord`:

```hoon
+$  url  cord
```

#### Example

```hoon
website+'https://example.com'
```

---

## `%license`

_required_

The `%license` field specifies the license for the app in question. It would typically be a short name like `MIT`, `GPLv2`, or what have you. The field just takes a `cord` so any license can be specified.

#### Type

```hoon
[%license license=cord]
```

#### Example

```hoon
license+'MIT'
```
