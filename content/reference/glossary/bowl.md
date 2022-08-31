+++
title = "Bowl"
+++

The **bowl** contains useful data about the current
[ship](/reference/glossary/ship) and context. It is given to a
[thread](/reference/glossary/thread) or [Gall](/reference/glossary/gall)
[agent](/reference/glossary/agent) whenever it processes an event. It contains
the current time, some entropy, the name of the ship, the source of the event,
and other relevant information.

#### Further reading

- [Gall data-types reference](/reference/arvo/gall/data-types#bowl): Details of
  the `bowl` data structure used by Gall.
- [The threads guide](/guides/additional/threads/input#bowl): This includes
  details about the bowl given to threads.
