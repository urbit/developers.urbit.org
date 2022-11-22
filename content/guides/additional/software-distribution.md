+++
title = "Software Distribution"
weight = 98
+++

In this document we'll walk through an example of creating and publishing a desk that others can install. We'll create a simple "Hello World!" front-end with a "Hello" tile to launch it. For simplicity, the desk won't include an actual Gall agent, but we'll note everything necessary if there were one.

## Create desk

To begin, we'll need to clone the [Urbit Git repo](https://github.com/urbit/urbit) from the Unix terminal:

```sh
[user@host ~]$ git clone https://github.com/urbit/urbit urbit-git
```

Once that's done, we can navigate to the `pkg` directory in our cloned repo:

```sh
[user@host ~]$ cd urbit-git/pkg
[user@host pkg]$ ls .
arvo      btc-wallet    garden        grid  interface   npm                webterm
base-dev  docker-image  garden-dev    herb  landscape   symbolic-merge.sh
bitcoin   ent           ge-additions  hs    libaes_siv  urbit
```

Each desk defines its own `mark`s, in its `/mar` folder. There are no longer shared system marks that all userspace code knows, nor common libraries in `/lib` or `/sur`. Each desk is completely self-contained. This means any new desk will need a number of base files.

To make the creation of a new desk easier, `base-dev` and `garden-dev` contain symlinks to all `/sur`, `/lib` and `/mar` files necessary for interacting with the `%base` and `%garden` desks respectively. These dev desks can be copied and merged with the `symbolic-merge.sh` included.

Let's create a new `hello` desk:

```sh
[user@host pkg]$ mkdir hello
[user@host pkg]$ ./symbolic-merge.sh base-dev hello
[user@host pkg]$ ./symbolic-merge.sh garden-dev hello
[user@host pkg]$ cd hello
[user@host hello]$ ls
lib  mar  sur
```

### `sys.kelvin`

Our desk must include a `sys.kelvin` file which specifies the kernel version it's compatible with. Let's create that:

```sh
[user@host hello]$ echo "[%zuse 418]" > sys.kelvin
[user@host hello]$ cat sys.kelvin
[%zuse 418]
```

### `desk.ship`

We can also add a `desk.ship` file to specify the original publisher of this desk. We'll try this on a fakezod so let's just add `~zod` as the publisher:

```sh
[user@host hello]$ echo "~zod" > desk.ship
[user@host hello]$ cat desk.ship
~zod
```

### `desk.bill`

If we had Gall agents in this desk which should be automatically started when the desk is installed, we'd add them to a `hoon` list in the `desk.bill` file. It would look something like this:

```hoon
:~  %some-app
    %another
==
```

In this example we're not adding any agents, so we'll simply omit the `desk.bill` file.

### `desk.docket-0`

The final file we need is `desk.docket-0`. This one's more complicated, so we'll open it in our preferred text editor:

```
[user@host hello]$ nano desk.docket-0
```

In the text editor, we'll add the following:

```hoon
:~  title+'Hello'
    info+'A simple hello world app.'
    color+0x81.88c9
    image+'https://media.urbit.org/guides/additional/dist/wut.svg'
    base+'hello'
    glob-ames+[~zod 0v0]
    version+[0 0 1]
    website+'https://developers.urbit.org/guides/additional/dist/guide'
    license+'MIT'
==
```

You can refer to the [Docket File](/reference/additional/dist/docket) documentation for more details of what is required. In brief, the `desk.docket-0` file contains a `hoon` list of [clauses](/reference/additional/dist/docket) which configure the appearance of the app tile, the source of the [glob](/reference/additional/dist/glob), and some other metadata.

We've given the app a [`%title`](/reference/additional/dist/docket#title) of "Hello", which will be displayed on the app tile and will be the name of the app when others browse to install it. We've given the app tile a [`%color`](/reference/additional/dist/docket#color) of `#8188C9`, and also specified the URL of an [`%image`](/reference/additional/dist/docket#image) to display on the tile.

The [`%base`](/reference/additional/dist/docket#base) clause specifies the base URL path for the app. We've specified "hello" so it'll be `http://localhost:8080/apps/hello/...` in the browser. For the [glob](/reference/additional/dist/glob), we've used a clause of [`%glob-ames`](/reference/additional/dist/docket#glob-ames), which means the glob will be served from a ship over Ames, as opposed to being served over HTTP with a [`%glob-http`](/reference/additional/dist/docket#glob-http) clause or having an Eyre binding with a [`%site`](/reference/additional/dist/docket#site) clause. You can refer to the [glob](/reference/additional/dist/glob) documentation for more details of the glob options. In our case we've specified `[~zod 0v0]`. Since `~zod` is the fakeship we'll install it on, the `%docket` agent will await a separate upload of the `glob`, so we can just specify `0v0` here as it'll get overwritten later.

The [`%version`](/reference/additional/dist/docket#version) clause specifies the version as a triple of major version, minor version and patch version. The rest is just some additional informative metadata which will be displayed in _App Info_.

So let's save that to the `desk.docket-0` file and have a look at our desk:

```
[user@host hello]$ ls
desk.docket-0  desk.ship  lib  mar  sur  sys.kelvin
```

That's everything we need for now.

## Install

Let's spin up a fakezod in which we can install our desk. By default a fakezod will be out of date, so we need to bootstrap with a pill from our urbit-git repo. The pills are stored in git lfs and need to be pulled into our repo first:

```
[user@host hello]$ cd ~/urbit-git
[user@host urbit-git]$ git lfs install
[user@host urbit-git]$ git lfs pull
[user@host urbit-git]$ cd ~/piers/fake
[user@host fake]$ urbit -F zod -B ~/urbit-git/bin/multi-brass.pill
```

Once our fakezod is booted, we'll need to create a new `%hello` desk for our app and mount it. We can do this in the dojo like so:

```
> |merge %hello our %base
>=
> |mount %hello
>=
```

Now, back in the Unix terminal, we should see the new desk mounted:

```
[user@host fake]$ cd zod
[user@host zod]$ ls
hello
```

Currently it's just a clone of the `%base` desk, so let's delete its contents:

```
[user@host zod]$ rm -r hello/*
```

Next, we'll copy in the contents of the `hello` desk we created earlier. We must use `cp -LR` to resolve all the symlinks:

```
[user@host zod]$ cp -LR ~/urbit-git/pkg/hello/* hello/
```

Back in the dojo we can commit the changes and install the desk:

```
> |commit %hello
> |install our %hello
kiln: installing %hello locally
docket: awaiting manual glob for %hello desk
```

The `docket: awaiting manual glob for %hello desk` message is because our `desk.docket-0` file includes a [`%glob-ames`](/reference/additional/dist/docket#glob-ames) clause which specifies our ship as the source, so it's waiting for us to upload the glob.

If we open a browser now, navigate to `http://localhost:8080` and login with the default fakezod code `lidlut-tabwed-pillex-ridrup`, we'll see our tile's appeared but it says "installing" with a spinner due to the missing glob:

![Installing Tile](https://media.urbit.org/guides/additional/dist/local-install-1.png)

## Create files for glob

We'll now create the files for the glob. We'll use a very simple static HTML page that just displayes "Hello World!" and an image. Typically we'd have a more complex JS web app that talked to apps on our ship through Eyre's channel system, but for the sake of simplicity we'll forgo that. Let's hop back in the Unix terminal:

```
[user@host zod]$ cd ~
[user@host ~]$ mkdir hello-glob
[user@host ~]$ cd hello-glob
[user@host hello-glob]$ mkdir img
[user@host hello-glob]$ wget -P img https://media.urbit.org/guides/additional/dist/pot.svg
[user@host hello-glob]$ tree
.
└── img
    └── pot.svg

1 directory, 1 file
```

We've grabbed an image to use in our "Hello world!" page. The next thing we need to add is an `index.html` file in the root of the folder. The `index.html` file is mandatory; it's what will be loaded when the app's tile is clicked. Let's open our preferred editor and create it:

```
[user@host hello-glob]$ nano index.html
```

In the editor, paste in the following HTML and save it:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      div {
        text-align: center;
      }
    </style>
  </head>
  <title>Hello World</title>
  <body>
    <div>
      <h1>Hello World!</h1>
      <img src="img/pot.svg" alt="pot" width="219" height="196" />
    </div>
  </body>
</html>
```

Our `hello-glob` folder should now look like this:

```
[user@host hello-glob]$ tree
.
├── img
│   └── pot.svg
└── index.html

1 directory, 2 files
```

## Upload to glob

We can now create a glob from the directory. To do so, navigate to `http://localhost:8080/docket/upload` in the browser. This will bring up the `%docket` app's [Globulator](/reference/additional/dist/glob#globulator) tool:

![Globulator](https://media.urbit.org/guides/additional/dist/globulator.png)

Simply select the `hello` desk from the drop-down, click `Choose file` and select the `hello-glob` folder in the the file browser, then hit `glob!`.

Now if we return to our ship's homescreen, we should see the tile looks as we specified in the docket file:

![Installed Tile](https://media.urbit.org/guides/additional/dist/local-install-2.png)

And if we click on the tile, it'll load the `index.html` in our glob:

![Hello World!](https://media.urbit.org/guides/additional/dist/local-install-3.png)

Our app is working!

## Publish

The final step is publishing our desk with the `%treaty` agent so others can install it. To do this, there's a simple command in the dojo:

```
> :treaty|publish %hello
>=
```

Note: For desks without a docket file (and therefore without a tile and glob), treaty can't be used. Instead you can make the desk public with `|public %desk-name`.

## Remote install

Let's spin up another fake ship so we can try install it:

```
[user@host hello-glob]$ cd ~/piers/fake
[user@host fake]$ urbit -F bus
```

Note: For desks without a docket file (and therefore without a tile and glob), users cannot install them through the web interface. Instead remote users can install it from the dojo with `|install ~our-ship %desk-name`.

In the browser, navigate to `http://localhost:8081` and login with `~bus`'s code `riddec-bicrym-ridlev-pocsef`. Next, type `~zod/` in the search bar, and it should pop up a list of `~zod`'s published apps, which in this case is our `Hello` app:

![Remote install search](https://media.urbit.org/guides/additional/dist/remote-install-1.png)

When we click on the app, it'll show some of the information from the clauses in the docket file:

![Remote app info](https://media.urbit.org/guides/additional/dist/remote-install-2.png)

Click `Get App` and it'll ask as if we want to install it:

![Remote app install](https://media.urbit.org/guides/additional/dist/remote-install-3.png)

Finally, click `Get "Hello"` and it'll be installed as a tile on `~bus` which can then be opened:

![Remote app finished](https://media.urbit.org/guides/additional/dist/remote-install-4.png)
