---
title: Learn
courses:
  - title: 1. Environment Setup Guide
    duration: 1 hour
    course: Urbit 101
    link: https://urbit.org/docs/development/environment
    description: This guide contains the best practices for configuring your environment for Urbit development, like setting up your text editor and working with “fakeships”. This guide also serves as a reference for environment-related issues.
  - title: 2. Hoon Tutorial
    duration: 1-2 weeks
    course: Urbit 101
    link: https://urbit.org/docs/hoon/hoon-school/intro
    description: This is the recommended starting point for anyone that wants to learn full stack Urbit development. It walks you through the Hoon programming language, generators, and the basics of Urbit programming.
  - title: 3. Gall Tutorial
    duration: 1-2 weeks
    course: Urbit 101
    link: https://urbit.org/docs/userspace/gall-guide/intro
    description: This course picks up where Hoon School left off by teaching you how to use the language to build a real-world application using a gall agent. This covers the entirety of the gall API, best practices for developing agents over time, and exercises to push your knowledge.
  - title: 4. Client-side Integration Guide
    duration: 1 day
    course: Urbit 101
    link: https://urbit.org/docs/arvo/eyre/guide
    description: The vane eyre allows clients to interact with Urbit over an HTTP interface. Urbit’s architecture is organized around command query responsibility segregation (CQRS), which makes heavy use of pub/sub patterns. Working with this API is different than more typical request/response architecture, and this guide gives you a comprehensive overview of how to do so.
  - title: Guide to Working with JSON
    course: Urbit 201
    link: https://urbit.org/docs/hoon/guides/json-guide
    description: JSON is a dynamically-defined datastructure, and Hoon is a statically-typed language, which means that the two don’t play together really well. This guide gives a comprehensive overview of how to parse and serialize JSON from Hoon.
  - title: HTTP-API Guide
    course: Urbit 201
    link: https://urbit.org/docs/userspace/http-api-guide
    description: The @urbit/http-api NPM module makes it easy to talk to a ship from a Javascript front-end. This guide and reference goes over how to use it.
  - title: Software Distribution Guide
    course: Urbit 201
    link: https://urbit.org/docs/userspace/dist/guide
    description: After you’ve created something on Urbit you’ll probably want to share it with other people. This guide walks you through the mechanisms for distributing software over the network.
  - title: Fullstack Development Walkthrough
    course: Urbit 201
    link: https://urbit.org/docs/userspace/full-stack/1-intro
    description: This tutorial walks though everthing you’ve learned to date -- writing a gall agent in Hoon from scratch, writing a React front-end that talks to the agent through Eyre, and then packaging up the entire application for distribution over the network.
  - title: Graph Store Tutorial
    course: Urbit 201
    link: https://urbit.org/docs/userspace/graph-store/overview
    description: Graph store is a gall agent that’s designed to be a general-purpose database for storing graph-like data. Comprising the bulk of the backend for Tlon’s Landscape applciation, it’s battle tested and optimized for real-world use. This guide walks you through its architecture and implementation, and then shows you how to use it as a data store for your own application.
  - title: Guide to Threads
    course: Urbit 201
    link: https://urbit.org/docs/userspace/threads/basics/fundamentals
    description: Threads are monadic functions primarily used to spin out complex IO operations from Gall agents. If you're writing an app that must make a series of external API calls where the next call depends on the result of the last, threads are the proper solution. This guide walks through the basics of writing threads, and the Gall section beneath it demonstrates how to work with threads from Gall agents.
---

We’ve made several self-guided tutorials and guides available to get your started on your journey, which should be read in order. All-in-all, a programmer with some experience should be able to work through this material and become proficient at Urbit programming in under a month of regular study.
