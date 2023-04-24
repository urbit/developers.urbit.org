+++
title = "Introduction"
weight = 1
+++

This guide will walk through everything you need to know to write your own Gall
agents.

The App Guide is suitable for anyone with an intermediate knowledge of Hoon. If
you've worked through [Hoon Guide](/guides/core/hoon-guide/) or something
equivalent, you should be fine.

## What are Gall agents?

Gall is one of the nine vanes (kernel modules) of Arvo, Urbit's operating
system. Gall's purpose is to manage userspace applications called _agents_.

An agent is a piece of software that is primarily focused on maintaining and
distributing a piece of state with a defined structure. It exposes an interface
that lets programs read, subscribe to, and manipulate the state. Every event
happens in an atomic transaction, so the state is never inconsistent. Since the
state is permanent, when the agent is upgraded with a change to the structure of
the state, the developer provides a migration function from the old state type
to the new state type.

It's not too far off to think of an agent as simply a database with
developer-defined logic. But an agent is significantly less constrained than a
database. Databases are usually tightly constrained in one or more ways because
they need to provide certain guarantees (like atomicity) or optimizations (like
indexes). Arvo is a [single-level store](/reference/arvo/overview#single-level-store), so atomicity comes for free. Many
applications don't use databases because they need relational indices; rather,
they use them for their guarantees around persistence. Some do need the indices,
though, and it's not hard to imagine an agent which provides a SQL-like
interface.

On the other hand, an agent is also a lot like what many systems call a
"service". An agent is permanent and addressable -- a running program can talk
to an agent just by naming it. An agent can perform [IO](https://urbit.org/blog/io-in-hoon), unlike most databases.
This is a critical part of an agent: it performs IO along the same transaction
boundaries as changes to its state, so if an effect happens, you know that the
associated state change has happened.

But the best way to think about an agent is as a state machine. Like a state
machine, any input could happen at any time, and it must react coherently to
that input. Output (effects) and the next state of the machine are a pure
function of the previous state and the input event.

## Table of Contents

#### Lessons

1. [Arvo](/guides/core/app-school/1-arvo) - This lesson provides an
   overview of the Arvo operating system, and some other useful background
   information.
2. [The Agent Core](/guides/core/app-school/2-agent) - This lesson goes over
   the basic structure of a Gall agent.
3. [Imports and Aliases](/guides/core/app-school/3-imports-and-aliases) -
   This lesson covers some useful libraries, concepts and boilerplate commonly
   used when writing Gall agents.
4. [Lifecycle](/guides/core/app-school/4-lifecycle) - This lesson introduces
   the state management arms of an agent.
5. [Cards](/guides/core/app-school/5-cards) - This lesson covers `card`s -
   the structure used to pass messages to other agents and vanes.
6. [Pokes](/guides/core/app-school/6-pokes) - This lesson covers sending and
   receiving one-off messages called "pokes" between agents.
7. [Structures and Marks](/guides/core/app-school/7-sur-and-marks) - This
   lesson talks about importing type defintions, and writing `mark` files.
8. [Subscriptions](/guides/core/app-school/8-subscriptions) - This lesson
   goes through the mechanics of subscriptions - both inbound and outbound.
9. [Vanes](/guides/core/app-school/9-vanes) - This lesson explains how to
   interact with vanes (kernel modules) from an agent.
10. [Scries](/guides/core/app-school/10-scry) - This lesson gives an overview
    of scrying Gall agents, and how scry endpoints are defined in agents.
11. [Failure](/guides/core/app-school/11-fail) - This lesson covers how Gall
    handles certain errors and crashes, as well as the concept of a helper core.
12. [Next Steps](/guides/core/app-school/12-next-steps) - App School I is
    now complete - here are some things you can look at next.

#### Appendix

- [Types](/guides/core/app-school/types) - A reference for a few of
  the types used in App School.
