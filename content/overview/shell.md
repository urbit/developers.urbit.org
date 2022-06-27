+++
title = "Shell"
template = "doc.html"
weight = 2
+++

The Dojo is our shell; it processes system commands and returns output. It's a
good place to quickly experiment with Urbit. On the surface the Dojo is just a
Hoon REPL. On the inside, the Dojo is a system for operating on and transforming
data in Urbit.

### Quickstart

You can use the Dojo to run arbitrary Hoon code, as well as non-Hoon system
commands.

#### Math

Evaluate a Hoon expression (whitespace matters):

```
~your-urbit:dojo> (add 2 2)
~your-urbit:dojo> %+  add  2  2
```

Tall-form Hoon may require multiple lines:

```
~your-urbit:dojo> %+  add
~your-urbit:dojo< 2
~your-urbit:dojo< 2
```

Hoon uses something called [the subject](/docs/hoon/hoon-school/the-subject-and-its-legs).
The Dojo has its own subject and that's where Hoon's equivalent of variables,
called faces, are stored.

Use `=var` to save faces to the Dojo subject.

```
~your-urbit:dojo> =foo (add 2 2)
```

Note, however, that `=var` is Dojo syntax, not Hoon syntax. You cannot bind a
face in a `.hoon` file in this way.

#### System commands

Use `=dir` to set the current working directory:

```
~your-urbit:dojo> =dir %/gen
```

(`%` represents your current directory. For a complete explanation on urbit
paths, see the [filesystem section](#filesystem).)

Generators (files in `/gen`) are run with `+`:

```
~your-urbit:dojo> +hello 'world'
```

Save output to a file in `%clay` with `*`:

```
~your-urbit:dojo> *some/file/path/hoon 'hello world'
```

Run system commands from `:hood`, like `reload`, using `|`:

```
~your-urbit:dojo> |reload %eyre
```

### Generators

Generators are short Hoon scripts, saved as `.hoon` files in the `/gen`
directory. Many Dojo commands exist in the form of generators. The syntax for
running a generator is `+genname` for a generator saved as `genname.hoon` in the
`%base` desk. For generators on other desks, you can use the syntax
`+desk!genname`.

#### `+cat`

Accepts a path and displays the file. Similar to Unix `cat`.

```
~your-urbit:dojo> +cat %/gen/curl/hoon
```

#### `+code`

Generates a code that is used to remotely log into your ship. No
arguments.

```
~your-urbit:dojo> +code
```

You can change your code to a new randomly generated one by entering `|code %reset`. Please note that this will prevent [Bridge](/reference/glossary/bridge)
from being able to derive your code in the future.

#### `+ls`

Similar to Unix `ls`. Accepts a path.

```
~your-urbit:dojo> +ls %/gen
~your-urbit:dojo> +ls /~talsur-todres/base/2/gen/program
```

#### `+solid`

Compile the current state of the kernel and output a noun. Usually downloaded to
a file in unix. This generator takes a series of desks to include as its
argument. The first desk must be the base desk that contains the Arvo kernel,
standard library and related files - typically `%base`.

```
~your-urbit:dojo> .urbit/pill +solid %base %garden %landscape %webterm %bitcoin
```

#### `+tree`

Generate a recursive directory listing. Takes a path.

```
~your-urbit:dojo> +tree %/sys
```

### Hood

The hood is the system daemon. See `gen/hood` and `app/hood`.

`|hi` - Sends a direct message. Sort of like Unix `write`. Accepts
an urbit name (`@p`) and a string (`tape`, which is text wrapped with double-quotes).

```
~your-urbit:dojo> |hi ~binzod "you there?"
```

`|link` / `|unlink` - Link / unlink a CLI app - may or may not be remote.
Accepts an optional ship name and a mandatory app name.

```
~your-urbit:dojo> |link ~talsur-todres %octo

~your-urbit:dojo> |link %chat-cli
```

`|mass` - Prints the current memory usage of all the kernel modules.
No arguments.

```
~your-urbit:dojo> |mass
```

`|breload` - Reloads a kernel module (vane) from source. Accepts any
number of vane names.

```
~your-urbit:dojo> |breload %clay %eyre
```

---

### Dojo manual

#### Sources and sinks

A Dojo command is either a **source** or a **sink**. A source is just something
that can be printed to your console or the result of some computation. A
sink is an **effect**: a change to the filesystem, a network message, a
change to your environment, or a typed message to an app.

Sources can be chained together, but we can only produce one effect per
command.

#### Sinks

#### `=` - Set variable

Set any environment variable:

```
~your-urbit:dojo> =foo 42
~your-urbit:dojo> (add 2 foo)

44
```

Make sure to note that `=var` is Dojo syntax, not Hoon syntax. You cannot bind a
variable in a `.hoon` file in this way.

#### Special variables

There are a few special variables that the Dojo maintains.

#### `:` - Send to app

`:app` goes to a local `app`, `:~ship/app` goes to the `app` on `~ship`.

Send a `helm-hi` message to `hood`:

```
~your-urbit:dojo> :hood &helm-hi 'hi'
```

Apps usually expect marked data, so `&` is often used here.

#### `*` - Save in `%clay`

Save a new `.hoon` file in `gen`:

```
~your-urbit:dojo> *%/gen/foo/hoon '# hello'
```

The last component of the path is expected to be the mark (or mime
type).

#### `.` - Export to Unix

Export a noun to Unix with `.`:

```
~your-urbit:dojo> .foo/bar/baz (add 2 2)
```

Which creates a file at `pier/.urb/put/foo/bar.baz`.

This is very often used with `+solid`:

```
~your-urbit:dojo> .urbit/pill +solid
```

Which outputs a new `urbit.pill` to `pier/.urb/put/urbit.pill`

### Sources

#### `_` - Run a function

Use `_` to run a gate (or function):

Write an arbitrary function and pass data to it:

```
~your-urbit:dojo> _|=([a=@] (mul a 3)) 3
9
```

Use a function to get the status code from an http request:

```
~your-urbit:dojo> _|=([p=@ud q=* r=*] p) +http://google.com
301
```

#### `+` `-` - HTTP requests

`+http[s]://example.com` - sends a GET request

`+http[s]://example.com &json [%s 'hi']` - sends a POST request with the
JSON `"hi"` in the body.

`-http[s]://example.com &json [%s 'hi']` - sends a PUT request with the
JSON `"hi"` in the body.

Note that the first of these is a source while the last two are sinks.

#### `+` - Generators

Generators are simple Hoon scripts loaded from the filesystem. They live
in `gen/`.

An example of a generator that is built into your urbit is `+code`. It produces
the code needed to log into your ship remotely.

```
~your-urbit:dojo> +code
fintyr-haldet-fassev-solhex
```

Generators on desks other than `%base` can be run with the syntax
`+desk!generator`.

### Variables

You can use `=` to set an environment variable in Dojo, but there are
a few reserved names that have special uses.

#### `dir`

Current working `%clay` desk and revision. Read / write.

**Examples:**

```
~your-urbit:dojo> =dir %/gen
~your-urbit:dojo> +ls %
404/hoon docs/ dojo/hoon lib/ listen/hoon md static/udon talk/ testing/udon tree/main/ unmark/ womb/
```

#### `now`

The current (128-bit `@da`) time. Read-only.

**Example:**

```
~your-urbit:dojo> now
~2016.3.21..21.10.57..429a
```

#### `our`

The current urbit ship. Read-only.

**Example:**

```
~your-urbit:dojo> our
~your-urbit
```

#### `eny`

512 bits of entropy. Read-only.

**Example:**

```
~your-urbit:dojo> eny
0v27k.n4atp.fovm6.f7ggm.jdkn5.elct5.11tna.4qtid.g4so7.a1h6g.grp7u.qml4i.0ed1v.sl0r0.97d4b.6aepr.6v6qm.ls5ve.60kgb.j6521.2fqcb
```

### Troubleshooting

If you encounter `%dy-edit-busy` while entering commands, it is
because your Dojo is blocked on a timer or an HTTP request. Type backspace
and your Dojo will end the blocked command.
