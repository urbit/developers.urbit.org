+++
title = "Getting Started"
description = "How to get started developing on Urbit."
weight = 10
+++

There are many ways to get involved as a developer. This guide serves to give
you a "lay of the land" for developing on Urbit. Let's start with what you can
contribute to. At a high level, you can:

- [Build clients](#clients), which use Urbit as their back-end to store data and
  interact with the network
- [Develop agents](#agents), or more precisely [_gall_
  agents](/reference/arvo/gall/gall), which are written in [Hoon](/reference/glossary/hoon)
  and can best be thought of as microservices
- [Contribute to Urbit's core](#core), which involves contributing to Urbit
  itself &mdash; either the operating system
  ([Arvo](https://github.com/urbit/urbit/tree/master/pkg/arvo)), runtime
  ([Vere](https://github.com/urbit/urbit/tree/master/pkg/urbit)), or public key
  infrastructure ([Azimuth](https://github.com/urbit/azimuth))

Below we'll go into more detail about each of these options and do our best to
point you towards a number of additional helpful resources that can be found
throughout the docs.

### Build Clients {% #clients %}

Urbit ships with [Landscape](/reference/glossary/landscape), which can be thought
of as its flagship client. Landscape can be broken into two different technical
components: there's the collection of [agents](#agents) that utilize the
Urbit for networking and data persistence, and the JavaScript client, which is
an [interface](https://github.com/urbit/urbit/tree/master/pkg/interface) built
with [React](https://reactjs.org).

Additionally, you can [contribute to
Landscape](https://github.com/urbit/urbit/blob/master/pkg/interface/CONTRIBUTING)
by tackling issues in its [issue
tracker](https://github.com/urbit/landscape/issues) and/or running the
[development stream](https://groups.google.com/a/urbit.org/g/dev/c/r2hv4ajCLwk).

You can create your own clients that uses Urbit to store data and interact with
other Urbit ships without writing any Hoon code thanks to Urbit's HTTP APIs.
This could be a chat client, a writing app, a game, or anything else that can
communicate over HTTP.

To get started quickly with the language of your choice, see the list
libraries that provide HTTP interfaces to Urbit [here](https://github.com/urbit/awesome-urbit#http-apis-airlock).

To learn more about how to work with Urbit's HTTP interface, follow [this
guide](/reference/arvo/eyre/external-api-ref).

Alternatively, command-line interface (CLI) applications can be built using a
library called `shoe`, which you can learn more about
[here](/guides/additional/hoon/cli-tutorial). This does require Hoon knowledge.

### Develop Agents {% #agents %}

Gall agents can be best thought of as individual services with a
statically-typed interface and built-in database. They're written in
[Hoon](/reference/glossary/hoon) and all conform to a specific
[interface](/reference/arvo/gall/gall-api) that's defined by the kernel vane
called [Gall](/reference/arvo/gall/gall).

Applications built on Urbit utilize a collection of different agents, each of
which handle specific functionality.

If you want to learn how to build gall agents, your best bet is to first [learn
the Hoon programming language with Hoon School](/guides/core/hoon-school/), and then [follow that
up with the App School guides](/guides/core/app-school/intro).

### Contribute to Urbit Core {% #core %}

Working on the core means improving the Urbit project itself, working with the
existing community of Urbit developers. The kernel is much more stable, but
generally more challenging from an engineering standpoint.

Just arrived and unsure what to work on? An ideal way to get started is by
experimenting with the system, talking to other developers, and reading (or
[contributing to](https://github.com/urbit/developers.urbit.org)) the documentation.

Prefer learning with an instructor? Our community runs an online course that
covers the basics of Urbit development called
[Hooniversity](https://hooniversity.org/). If course-based learning works well
for you, we recommend you sign up.

The Urbit developer community congregates around [the urbit-dev mailing
list](https://groups.google.com/a/urbit.org/forum/#!forum/dev), the
`~bitbet-bolbel/urbit-community` group on Landscape, and [Urbit’s GitHub
repository](https://github.com/urbit/urbit). It’s a good idea to sign up, see
what people are talking about, and introduce yourself.

Once you’re comfortable working with Urbit, check out the [project’s issues on
GitHub](https://github.com/urbit/urbit/issues) or some of our [contribution
bounties](https://grants.urbit.org/).

If you’re looking for some guidance, need help, or would prefer direct
communication for your ideas, you can also always reach out to us directly at
[support@urbit.org](mailto:support@urbit.org).

## Next Steps

From here, you'll probably want to learn more about:

- How to set up a [development environment](/guides/additional/development/environment)
- Our [grants program](/guides/additional/development/grants), where you can earn address
  space for helping the project grow
- The different [project
  repositories](/guides/additional/development/project-repositories), both official and
  community-maintained
- Our development [Precepts](/guides/additional/development/precepts), which outline the
  philosophies that drive Urbit development
