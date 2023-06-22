+++
title = "Data Streaming to an External Process"
weight = 41
+++

`%slick` is a [Snake game](https://en.wikipedia.org/wiki/Snake_%28video_game_genre%29) by [~mopfel-winrux](https://github.com/mopfel-winrux/slick) which uses the `%lick` IPC vane to coordinate an Urbit backend with a Python `pygame` instance for rendering the gameplay and handling user controls and input.  This tutorial demonstrates how `%slick` works to coordinate Urbit and Python to build a minimal working example for Snake.

Since `%slick` is designed to work with Python 3.10, you will need to have a 3.10 or higher installation available on your system to complete this tutorial.

The original Urbit Snake code, `%snek`, was written by [~palfun-foslup](https://github.com/urbit/urbit/tree/wip/tui-toys/pkg/demo) and directly interacts with Dill using the [`etui`](https://github.com/urbit/urbit/blob/wip/tui-toys/pkg/demo/lib/etui.hoon) library.  There are no special `/sur` or `/mar` files for `%snek`.  `%slick` itself rips out the terminal front-end that `%snek` supplies in favor of driving an external Python `pygame` interface.

<!--
##  `/lib` Library File

[`/lib/etui.hoon`](https://github.com/urbit/urbit/blob/wip/tui-toys/pkg/demo/lib/etui.hoon) bills itself as an “everyday text ui toolkit”.  It provides coordinate operations, screen zones, scrolling, and generic input handling from the keyboard.
-->

##  `/app` Agent File


