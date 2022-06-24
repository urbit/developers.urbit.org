+++
title = "System Overview"
weight = 200
sort_by = "weight"
template = "sections/docs/chapters.html"
+++

Urbit is a clean-slate software stack designed to implement an encrypted P2P
network of general-purpose personal servers. Each server on this network is a
deterministic computer called an ‘urbit’ that runs on a Unix-based virtual
machine.

The Urbit stack primarily comprises:

- [Arvo](/overview/arvo): the functional operating system of
  each Urbit instance, written in Hoon.
- [Hoon](/overview/hoon): a strictly typed functional
  programming language whose standard library includes a Hoon-to-Nock compiler.
- [Nock](/overview/nock): a low-level combinator language whose
  formal specification fits readably on a t-shirt.
- [Vere](/overview/vere): a Nock interpreter and Unix-based
  virtual machine that mediates between each urbit and the Unix software layer.
- [Azimuth](/overview/azimuth): the Urbit identity layer, built
  on the Ethereum blockchain as a public-key infrastructure.
- [Dojo](/overview/shell): the
  [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)
  command-line interface to your Urbit instance.

Central to the operation of Urbit are cryptographic methods. We give a
high-level overview on the usage of cryptography in Urbit and how it is
implemented [here](/overview/cryptography).


## Anatomy of a Personal Server

Your Urbit instance is a deterministic computer in the sense that its state is
a pure function of its event history. Every event in this history is a
[transaction](https://en.wikipedia.org/wiki/Transaction_processing); your
Urbit instance's state is effectively an
[ACID database](https://en.wikipedia.org/wiki/ACID).

Because each Urbit instance is deterministic we can describe its role
appropriately in purely functional terms: it maps an input event and the old
Urbit instance's state to a list of output actions and the subsequent state.
This is the Urbit transition function.

```
<input event, old state> -> <output actions, new state>
```

For example, one input event could be a keystroke from the terminal, say
`[enter]` after having already typed `(add 2 2)`; and an output action could be
to print in the terminal window the resulting value of a computation performed
when the user hit `[enter]`, in this case `4`. The input event is stored in the
Urbit instance's event history.

Events always start from outside of your Urbit instance, whether they're local
to the computer running the urbit (e.g., a keystroke in the terminal) or they
originate elsewhere (e.g., a packet received from another Urbit instance). When
an event is processed, various parts of the Urbit instance's state can be
modified before the resulting list of output actions is returned.

Can output actions from your urbit cause side-effects in the outside world?
The answer had better be "yes," because a personal server without side effects
isn't useful for much. In another sense the answer had better be "no," or else
there is a risk of losing functional purity; your Urbit instance cannot
_guarantee_ that the side effects in question actually occur. What's the
solution?

Each urbit is
[sandboxed](https://en.wikipedia.org/wiki/Sandbox_%28computer_security%29) in a
virtual machine, Vere, which runs on Unix. Code running in your urbit cannot
make Unix system calls or otherwise directly affect the underlying platform.
Strictly speaking, internal Urbit code can only change internal Urbit state; it
has no way of sending events outside of its runtime environment. Functional
purity is preserved.

In practical terms, however, you don't want your Urbit instance to be an
impotent [brain in a vat](https://en.wikipedia.org/wiki/Brain_in_a_vat). That's
why Vere also serves as the intermediary between your urbit and Unix. Vere
observes the list of output events, and when external action is called for makes
the appropriate system calls itself. When external events relevant to your Urbit
occur in the Unix layer, Vere encodes and delivers them as input events.
