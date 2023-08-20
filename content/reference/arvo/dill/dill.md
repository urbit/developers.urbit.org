+++
title = "Overview"
weight = 1
+++

The terminal driver vane.

Keyboard events and the like from Unix are received by Dill as
[%belt](/reference/arvo/dill/tasks#belt) `task`s, and Dill sends `%blit`
`gift`s containing [$blit](/reference/arvo/dill/data-types#blit)s back to the
runtime to be displayed in the Unix terminal. The manner of interacting with
Dill differs depending on whether you're in userspace or kernelspace, as we'll
explore below.

## Kernelspace

For technical reasons, Dill performs a handful of system tasks related to
booting a ship and some memory operations. Aside from those, other Vanes mostly
just pass Dill [tasks](/reference/arvo/dill/tasks) to print error messages and
the like to the terminal.

## Userspace

Unlike in kernelspace, userspace applications are unlikely to `%pass` Dill
`task`s directly. Instead, Dill looks at things in terms of sessions. A session
is a pipeline between a client and a handler, where:

- The client is an external input source and output sink; a terminal with
  dimensions and so forth.
- The handler is an application in Urbit that interprets input, maybe does
  something with it, maybe produces output to be displayed in the client,
  etc. The handler may itself handle and multiplex terminal interfaces for
  other applications, as is the case with the `%hood` module `%drum`, or it
  may be a stand-alone application.

Currently, Dill supports multiple *sessions*, but Vere (the runtime) only
supports a single Unix terminal *client* for the default session (`%$`). This
means any non-default sessions will need to be linked through the default
session handler `%drum` (a module of the `%hood` app) if they are to work in
the Unix terminal. Alternatively, a client could be built that talks to Dill
via the HTTP server Eyre in a similar way to the `%webterm` app, and
interacts with sessions entirely separately from the Unix terminal and its
`%drum` handler.

`%drum` is Arvo's CLI app manager. By default you'll have one CLI application
running: the `%dojo`. You may also have additional CLI apps which you have
started or attached with the `|link` command. It's `%drum` that keeps track of
which one is active, which one input should be routed to, which one should be
displayed, what each prompt should look like, and so forth. Dill itself is
oblivious to the distinction between these CLI apps. It only sees the session
with `%drum`, so it just passes all input to `%drum` and display whatever
`%drum` gives it.

While `%drum` talks with Dill in `$dill-belt`s and `$dill-blit`s, it talks to
CLI apps with `$sole-action`s and `$sole-event`s, which are defined in the
`sole` library. For more information on the `sole` library and the related
`shoe` library, and for information on how to build CLI apps, you can refer to
the [CLI app tutorial](/guides/additional/cli-tutorial).

To give a basic idea of how keyboard events flow through these systems and
produce terminal output, here's a diagram showing the messages in pseudo-Hoon:

![Dill userspace diagram](https://media.urbit.org/docs/arvo/dill/dill-userspace.svg)

You can use a [move trace](/reference/arvo/tutorials/move-trace) to get a
hands-on feel for this data flow.

## Sections

[API Reference](/reference/arvo/dill/tasks) - The `task`s Dill takes and the
`gift`s it returns.

[Scry Reference](/reference/arvo/dill/scry) - The scry endpoints of Dill.

[Data Types](/reference/arvo/dill/data-types) - Reference documentation of the
data types used by Dill.
