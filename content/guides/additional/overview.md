+++
title = "Additional Guides"
weight = 2
+++

Once you have mastered the content of [Hoon School](/guides/core/hoon-school)
and [App School](/guides/core/app-school), you can venture into more advanced
application development topics like thread management, or take a look at how
the runtime implements jet-accelerated code.

Other material, like documentation for the Graph Store collection of social
media primitives, are hosted directly in the `%docs` app on Urbit.

## [Graph Store](/docs/userspace/graph-store)

Graph Store is the graph database utilized for Landscape applications and social
media primitives and common factors.  The docs for Graph Store have been moved
to the Urbit-native `%docs` app.

```hoon
|install ~pocwet %docs
```

## [Threads](reference/arvo/threads/)

Resources on threads - monadic functions useful for complex IO.

## [Distribution](/guides/additional/dist/dist)

Learn how to distribute apps on Urbit.

## [HTTP API](/guides/additional/http-api-guide)

The HTTP API guide explores how an external interface can interact with an agent
using the `@urbit/http-api` Javascript module.

## [Hoon Topics](/guides/additional/hoon)

- [Aqua](/guides/additional/hoon/aqua) serves as a testbed for ships.
- [CLI apps](/guides/additional/hoon/cli-tutorial) are be built using the
  `%shoe` and `%sole` libraries.
- [JSON parsing and production](/guides/additional/hoon/json-guide) is a key
  part of many web-based Urbit apps.
- [Text parsing](/guides/additional/hoon/parsing) allows you to flexibly ingest
  and validate text.
- [Sail](/guides/additional/hoon/sail) is an Urbit-native HTML/XML
  representation used to serve static web-pages entirely from your Urbit ship.
- [Strings](/guides/additional/hoon/strings) encompass the several ways Hoon
  uses to represent text.
- [Unit tests](/guides/additional/hoon/unit-tests) afford the developer
  confidence in designing code and avoiding certain categories of bugs.
