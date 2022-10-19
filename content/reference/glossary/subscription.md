+++
title = "Subscription"

[extra]
category = "arvo"

[glossaryEntry.subscription]
name = "subscription"
symbol = ""
usage = "arvo"
desc = "One of the main methods of communication for Gall agents."

+++

**Subscriptions** are one of the main ways [Gall](/reference/glossary/gall)
[agents](/reference/glossary/agent) communicate. An agent will define a number
of subscription [paths](/reference/glossary/path) in its `++on-watch`
[arm](/reference/glossary/arm), and other agents (either local or remote) can
subscribe. Once subscribed, they'll receive any
[facts](/reference/glossary/fact) sent out on the path in question, until they
either unsubscribe or are kicked.

#### Further reading

- [App School: subscriptions](/guides/core/app-school/8-subscriptions): A lesson on
  Gall agent subscriptions.
