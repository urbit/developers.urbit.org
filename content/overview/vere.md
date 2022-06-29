+++
title = "Vere"
weight = 40
+++


Vere is the Nock runtime environment and Urbit VM.  It's written in C, runs on
Unix, and is the intermediate layer between your urbit and Unix.  As noted
earlier, Unix system calls are made by Vere, not Arvo; Vere must also encode
and deliver relevant external events to Arvo.  Vere is also responsible for
implementing jets and maintaining the persistent state of each urbit.

In principle, Vere keeps a comprehensive log of every event from the time you
initially booted your urbit.  What happens if the physical machine loses power
and your urbit's state is 'lost' from memory?  When your urbit restarts it will
replay its entire event history and totally recover its latest state from
scratch.

In practice, event logs become large and unwieldy over time.  Periodically a
snapshot of the permanent state is taken and the logs are pruned.  You're still
able to rebuild your state in case of power outage, down to the last keystroke.

Vere is not essential to the Urbit stack; one can imagine using Urbit on a
hypervisor, or even bare metal.  One member of the community is even working on
an independent implementation of Urbit using Graal/Truffle on the JVM.

The Urbit stack (compiler, standard library, kernel, modules, and applications,
but excluding Vere) is about 30,000 lines of Hoon.  Urbit is patent-free and MIT
licensed.

## Further Reading

* [C runtime system](/reference/vere/runtime): The Urbit interpreter is built on
a Nock runtime system written in C, `u3`. This section is a relatively complete
description.
* [c3: C in Urbit](/reference/vere/c): Under `u3` is the simple `c3` layer, which
is just how we write C in Urbit.
* [u3: Land of nouns](/reference/vere/nouns): The division between `c3` and `u3`
is that you could theoretically imagine using `c3` as just a generic C
environment. Anything to do with nouns is in `u3`.
* [u3: API overview by prefix](/reference/vere/api): A walkthrough of each of the
  `u3` modules.
* [How to write a jet](/reference/vere/jetting): A jetting guide for new Urbit
  developers.
