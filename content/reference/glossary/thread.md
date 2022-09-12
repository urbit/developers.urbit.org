+++
title = "Thread"

[extra]
category = "arvo"
+++

A **thread** is like a transient [Gall](/reference/glossary/gall)
[agent](/reference/glossary/agent). Unlike an agent, it can end and it can fail.
The primary uses for threads are:

1. Complex IO, like making a bunch of external API calls where each call depends
   on the last. Doing this in an agent significantly increases its complexity
   and the risk of a mishandled intermediary state corrupting permanent state.
   If you spin the IO out into a thread, your agent only has to make one call to
   the thread and receive one response.
2. Testing - threads are very useful for writing complex tests for your agents.

[Spider](/reference/glossary/spider) is the [Gall](/reference/glossary/gall)
[agent](/reference/glossary/agent) that manages
[threads](/reference/glossary/thread).

### Further Reading

- [Threads guide](/guides/additional/threads/fundamentals): learn how to write
  threads.
