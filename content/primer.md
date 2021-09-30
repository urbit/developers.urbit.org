+++
title: Primer
+++

Urbit development involves a fairly typical client/server/database stack. Urbit is both a server, database, and an entire operating system—this means exposes a filesystem, HTTP server, timer, and much more to the programmer (these different parts of the operating system are called vanes).

Clients that interact with Urbit can be web browsers, mobile or desktop applications, command lines, or anything else that presents a user interface. At time of writing, most clients communicate with Urbit over HTTP by sending JSON back and forth, primarily via pub/sub APIs.

Where Urbit differs from other client/server stacks is that all users run their own servers (urbits), and those servers talk directly to one another. Because those servers are also databases, all users store their own data, which they exchange with one another based on application-level logic.

Urbit allows programmers to create what are called agents, which can be thought of as individual microservices—each one contains its own logic, defines its own API, can be started and stopped, can interact with the rest of the operating system and other agents, and is responsible for storing its own data. The lifecycle of agents is managed by the part of the operating system called gall.

Since Urbit is actually an operating system, not just a server, when we talk about an Urbit “application” we could mean any of several things:

A web or mobile interface that interacts with one or more agents to define something that looks a lot like an “app”;
A single agent that runs in the background;
A script that’s executed from Urbit’s own CLI (called the dojo)—these are called generators;

Generators, agents and supporting code is packaged up into desks. These provide a mechanism for packaging up related code, and can be shared directly with other users over the network—this is how software distribution works on Urbit.

All Urbit-side code is written in a purely functional and statically typed language called Hoon. Hoon looks kind of strange compared to most other programming languages, primarily because it’s based on runes rather than keywords. This strangeness is due to unfamiliarity rather than any form of essential complexity, in much the same way as Chinese appears more complex to an English-speaker than, say, Spanish.

It’s possible to develop for Urbit without learning Hoon by learning its client-side HTTP interface; however, investing the time to learn Hoon will make you a far more capable Urbit developer, so we definitely recommend it. Ready to get started? Begin with our Urbit 101 course.
