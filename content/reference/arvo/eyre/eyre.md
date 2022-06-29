+++
title = "Overview"
weight = 1
+++

Eyre is the webserver vane.

HTTP messages come in from outside and Eyre produces HTTP messages in response. In general, apps do not call Eyre; rather, Eyre calls apps. Eyre has a number of ways to handle such HTTP requests which we'll briefly describe.

## Authentication

Most types of requests require the client provide a valid session cookie which is obtained by authenticating with your ship's web login code. Authentication is documented in the [Authentication](/reference/arvo/eyre/external-api-ref#authentication) section of the [External API Reference](/reference/arvo/eyre/external-api-ref) documentation.

## The Channel System

Eyre's channel system is the primary way of interacting with Gall agents from outside of Urbit. It provides a simple JSON API that allows you to send data to apps and subscribe for updates from apps. Updates come back on a SSE ([Server Sent Event](https://html.spec.whatwg.org/#server-sent-events)) stream which you can easily handle with an EventSource object in Javascript or the equivalent in whichever language you prefer.

The channel system is designed to be extremely simple with just a handful of `action` and `response` JSON objects to deal. Essentially it's a thin layer on top of the underlying Gall agent interface. You can poke agents, subscribe for updates, etc, just like you would from within Urbit.

Detailed documentation of the channel system's JSON API is provided in the [External API Reference](/reference/arvo/eyre/external-api-ref) document with corresponding examples in the [Guide](/reference/arvo/eyre/guide#using-the-channel-system) document.

## Scrying

Along with the channel system, Eyre also provides a way to make read-only requests for data which are called scries. Eyre's scry interface is separate to the channel system but may be useful in conjunction with it.

Details of Eyre's scry API are in the [Scry](/reference/arvo/eyre/external-api-ref#scry) section of the [External API Reference](/reference/arvo/eyre/external-api-ref) document.

## Spider Threads

Spider (the Gall agent that manages threads) has an Eyre binding that allows you to run threads through Eyre. Spider's [HTTP API](/guides/additional/threads/http-api) is not part of Eyre proper, so is documented separately in the [Threads](/guides/additional/threads/overview) documentation.

## Generators

Generators, which are like Hoon scripts, can also be used through Eyre. Rather than having a predefined JSON API, they instead handle HTTP requests and return HTTP responses directly, and are therefore a more complex case that you're less likely to use.

Their usage is explained in the [%serve](/reference/arvo/eyre/tasks#serve) section of the [Internal API Reference](/reference/arvo/eyre/tasks) documentation and a practical example is provided in the [Generators](/reference/arvo/eyre/guide#generators) section of the [Guide](/reference/arvo/eyre/guide) document.

## Direct HTTP Handling With Gall Agents

As well as the [Channel System](#the-channel-system) and [Scries](#scrying), it's also possible for Gall agents to deal directly with HTTP requests. This method is much more complicated than the channel system so you're unlikely to use it unless you want to build a custom HTTP-based API or something like that.

This method is explained in the [%connect](/reference/arvo/eyre/tasks#connect) section of the [Internal API Reference](/reference/arvo/eyre/tasks) document and a detailed example is provided in the [Agents: Direct HTTP](/reference/arvo/eyre/guide#agents-direct-http) section of the [Guide](/reference/arvo/eyre/guide) document.

## Cross-Origin Resource Sharing

Eyre supports both simple [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) requests and OPTIONS preflight requests. It has a CORS registry with three categories - `approved`, `rejected` and `requests`. Eyre will respond positively for origins in its `approved` list and negatively for all others. Eyre will add origins in requests that it doesn't have in either its `approved` or `rejected` lists to its `requests` list. Eyre always allows all methods and headers over CORS.

There are three generators - `+cors-registry`, `|cors-approve`, and `|cors-reject` to view, approve, and deny origins respectively from the dojo. Eyre also has [tasks](/reference/arvo/eyre/tasks) to [approve](/reference/arvo/eyre/tasks#approve-origin) and [reject](/reference/arvo/eyre/tasks#reject-origin) origins programmatically, and a number of [scry endpoints](/reference/arvo/eyre/scry) to query them. Examples are also included in the [Managing CORS Origins](/reference/arvo/eyre/guide#managing-cors-origins) section of the Guide document.

## Sections

[External API Reference](/reference/arvo/eyre/external-api-ref) - Details of Eyre's external API including the channel system's JSON API.

[Internal API Reference](/reference/arvo/eyre/tasks) - The `task`s Eyre takes and the `gift`s it returns.

[Scry Reference](/reference/arvo/eyre/scry) - The scry endpoints of Eyre.

[Data Types](/reference/arvo/eyre/data-types) - Reference documentation of the various data types used by Eyre.

[Guide](/reference/arvo/eyre/guide) - Practical examples of the different ways of using Eyre.
