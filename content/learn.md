---
title: Learn
---

We’ve made several self-guided tutorials and guides available to get your started on your journey, which should be read in order. All-in-all, a programmer with some experience should be able to work through this material and become proficient at Urbit programming in under a month of regular study.

## Urbit 101

### Environment Setup Guide (~1 hour)

This guide contains the best practices for configuring your environment for Urbit development, like setting up your text editor and working with “fakeships”. This guide also serves as a reference for environment-related issues.

### Hoon Tutorial (~1-2 weeks)

This is the recommended starting point for anyone that wants to learn full stack Urbit development. It walks you through the Hoon programming language, generators, and the basics of Urbit programming.

### Gall Tutorial (~1-2 weeks)

This course picks up where Hoon School left off by teaching you how to use the language to build a real-world application using a gall agent. This covers the entirety of the gall API, best practices for developing agents over time, and exercises to push your knowledge.

### Client-side Integration Guide (~1 day)

The vane eyre allows clients to interact with Urbit over an HTTP interface. Urbit’s architecture is organized around command query responsibility segregation (CQRS), which makes heavy use of pub/sub patterns. Working with this API is different than more typical request/response architecture, and this guide gives you a comprehensive overview of how to do so.

## Urbit 201

Equipped with knowledge of the basics of all parts of the stack, there are a number of additional supplementary tutorials and guides to deepen your knowledge:

### Guide to Working with JSON

JSON is a dynamically-defined datastructure, and Hoon is a statically-typed language, which means that the two don’t play together really well. This guide gives a comprehensive overview of how to parse and serialize JSON from Hoon.

### Software Distribution Guide

After you’ve created something on Urbit you’ll probably want to share it with other people. This guide walks you through the mechanisms for distributing software over the network.

### Fullstack Development Tutorial: TodoMVC

This tutorial walks you though everthing you’ve learned to date: writing a gall agent in Hoon from scratch, adapting the classic TodoMVC frontend to interface with that gall agent, and then package up the entire application for distribution over the network.

### Graph Store Tutorial

Graph store is a gall agent that’s designed to be a general-purpose database for storing graph-like data. Comprising the bulk of the backend for Tlon’s Landscape applciation, it’s battle tested and optimized for real-world use. This guide walks you through its architecture and implementation, and then shows you how to use it as a data store for your own application.

### Guide to Threads

TODO: Maybe this is better for 101?
