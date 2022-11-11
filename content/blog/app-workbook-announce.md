+++
title = "App Workbook"
date = "2022-11-17"
description = "Announcing a collection showcasing small apps."
[extra]
author = "N E Davis"
ship = "~lagrev-nocfep"
image = "https://media.urbit.org/site/posts/essays/blog-workbook.png"
+++

![](https://media.urbit.org/site/posts/essays/blog-workbook.png)

#  App Workbook

We introduced the [Hoon Workbook](https://developers.urbit.org/guides/additional/workbook) last summer as a way of showcasing how to solve problems with Hoon code.  The Hoon Workbook mainly focuses on library and generator code rather than apps.

As a companion piece, we are pleased to inaugurate the [App Workbook](TODO), a collection of tutorials built around real-world Gall agents that exemplify some element of practice.

We'll be expanding it with more examples over time, but to start us off we have a discussion of ~midden-fabler's `%ahoy` and ~hanfel-dovned's `%page`, as well as moving ~lagrev-nocfep's `%flap` over to the App Workbook from its current home.

Each of these exemplifies some aspect of Gall agent architecture.  For instance, `%ahoy` shows how to build a Gall agent that uses generators instead of raw pokes at the CLI to carry out target activities.  `%page` illustrates simple HTTP page hosting from an Urbit ship.

(We're also adding _Gleichniszahlenreihe_ audioactive challenge from the Hoon School Live competition in summer 2022 to the Hoon Workbook.  _Gleichniszahlenreihe_ illustrates a variety of approaches to parsing input.)

Take a look and give us suggestions for other small Gall agents you'd like to see tutorials based on as well!
