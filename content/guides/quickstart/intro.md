+++
title = "Introduction"
weight = 1
+++

This series of quickstart guides will show you how decentralized, networked
applications can be quickly built and published on Urbit. These guides are
intended for developers with limited knowledge of Urbit and who aren't fluent in
Hoon (Urbit's programming language). They don't delve deeply into the code, but
instead focus on the broader process, to give you a basic idea of the platform.
If instead you want to learn Hoon and app development on Urbit, the best place
to start is [Hoon School](/guides/core/hoon-school/A-intro), and then after that
[App School](/guides/core/app-school/intro).

There are so-far three guides in this series:

1. [Build a Groups App](/guides/quickstart/groups-guide)
2. [Build a Chat App](/guides/quickstart/chat-guide)
3. [Build a Voting App](/guides/quickstart/voting-guide)

The theme is a suite of apps for groups of people to collaborate and
communicate. The groups app is called Squad, and lets you create public and
private groups that others can join. The chat app is called Hut, and lets you
create chat rooms which members of your Squad groups can join. The third app is
called Tally and lets group members create polls, which other members can vote
on. Tally uses linked ring signatures so members of a group can verify votes but
don't know who voted for what.

These apps are quite basic and are intended as educational tools rather that
full-featured apps for everyday use. For the front-ends, the chat app uses
React, and the other two use Sail, which is Urbit's native server-side HTML
language. Note these are not the only ways to build front-ends: you can also
build CLI apps, desktop apps, mobile apps, or use any other browser-based
front-end framework, and have them talk to Urbit ships.

If you'd like to try out these apps immediately, you can search for `~pocwet` in
the search bar of your ship's homescreen, and install them from there.
