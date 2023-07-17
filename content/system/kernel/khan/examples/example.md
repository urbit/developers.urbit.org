+++
title = "Running a Thread"
weight = 4
+++

Here we'll look at a simple example of running a thread from a Gall agent via
Khan. The Gall agent will take a boolean poke. If it's `%.y`, the thread will
succeed and return some text. If it's `%.n`, the thread will fail with an error
message.

Here's the thread, which you can save in the `/ted` directory of the `%base`
desk on a fake ~zod:

#### `mythread.hoon`

```hoon
/-  spider
=,  strand=strand:spider
=,  strand-fail=strand-fail:libstrand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
?.  !<(? arg)
  (strand-fail %i-have-failed 'foo' 'bar' 'baz' ~)
(pure:m !>('success!!!'))
```

Here's the Gall agent, which you can save in the `/app` directory of the `%base`
desk on a fake ~zod:

#### `myapp.hoon`

```hoon
/+  default-agent
=+  ~
=*  state  -
^-  agent:gall
|_  bowl=bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?>  ?=(%noun mark)
  =+  !<(succeed=? vase)
  :_  this
  [%pass /result %arvo %k %fard q.byk.bowl %mythread %noun !>(succeed)]~
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
  ?>  ?=([%result ~] wire)
  ?>  ?=([%khan %arow *] sign)
  ?:  ?=(%.n -.p.sign)
    ((slog leaf+<p.p.sign> ~) `this)
  ((slog !<(@t q.p.p.sign) ~) `this)
::
++  on-init   on-init:def
++  on-save   on-save:def
++  on-load   on-load:def
++  on-watch  on-watch:def
++  on-agent  on-agent:def
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-fail   on-fail:def
--
```

Let's try it out. First, we commit the files:

```
> |commit %base
>=
+ /~zod/base/31/app/myapp/hoon
+ /~zod/base/31/ted/mythread/hoon
```

Next, we'll start the agent:

```
> |start %myapp
>=
gall: installing %myapp
```

Let's try poking it with `%.y` so the thread succeeds:

```
> :myapp %.y
>=
success!!!
```

The thread succeeded and our Gall agent printed its result.

Now we'll try poking it with `%.n` so it fails:

```
> :myapp %.n
>=
khan-fact
i-have-failed
foo
bar
baz
[mote=%thread-fail tang=~['i-have-failed' 'foo' 'bar' 'baz']]
```

Khan automatically prints the error message, and our app has also pretty-printed
the `goof` it received.

---
