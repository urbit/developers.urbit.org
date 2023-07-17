+++
title = "Tasks"
weight = 4
+++

Here are a couple of practical examples of using Behn's `%wait` and `%rest` `task`s.

## %wait

Here we'll look at setting a timer by passing Behn a `%wait` `task` and taking the `%wake` `gift` it returns when the timer fires.

Below is a thread which will take a `@dr` as its argument and `%pass`es Behn a `%wait` `task` to fire `@dr` in the future. When the timer fires, it'll then take the `%wake` `gift` and print it to the terminal along with the time that has elapsed.

`wait.hoon`

```hoon
/-  spider
/+  *strandio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=/  delay=@dr  (need !<((unit @dr) arg))
;<  t1=@da  bind:m  get-time
=/  =task:behn  [%wait (add delay t1)]
=/  =card:agent:gall  [%pass /timer %arvo %b task]
;<  ~  bind:m  (send-raw-card card)
;<  res=(pair wire sign-arvo)  bind:m  take-sign-arvo
?>  ?=([%timer ~] p.res)
?>  ?=([%behn %wake *] q.res)
%-  (slog ~[leaf+"Gift: {<+.q.res>}"])
?~  error.q.res
  ;<  t2=@da  bind:m  get-time
  %-  (slog ~[leaf+"Time elapsed: {<`@dr`(sub t2 t1)>}"])
  (pure:m !>(~))
%-  (slog u.error.q.res)
(pure:m !>(~))
```

Save the thread to `/ted/wait.hoon` and `|commit %base`. Then we can try running the thread with a `@dr` of `~s2`:

```
> -wait ~s2
Gift: [%wake error=~]
Time elapsed: ~s2..0154
```

As you can see, the timer has fired successfully after `~s2` and Behn has given us a `%wake` `gift`.

## %rest

Here we'll look at cancelling a previously set timer by passing Behn a `%rest` `task`.

Below is a variation on the [%wake](#wake) thread. It takes a `@dr` as its argument and sets a timer that far in the future, as before. However, it also sets a second timer twice the `@dr` in the future, and then cancels the first with a `%rest` `task`. If the `%rest` `task` succeeds in cancelling the first timer, the `%wake` `gift` will arrive after double the specified delay.

`rest.hoon`

```hoon
/-  spider
/+  *strandio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=/  delay=@dr  (need !<((unit @dr) arg))
;<  t1=@da  bind:m  get-time
=/  timer1=@da  (add t1 delay)
=/  timer2=@da  (add t1 (mul delay 2))
;<  ~  bind:m  (send-raw-card [%pass /timer %arvo %b %wait timer1])
;<  ~  bind:m  (send-raw-card [%pass /timer %arvo %b %wait timer2])
;<  ~  bind:m  (send-raw-card [%pass /timer %arvo %b %rest timer1])
;<  res=(pair wire sign-arvo)  bind:m  take-sign-arvo
?>  ?=([%timer ~] p.res)
?>  ?=([%behn %wake *] q.res)
%-  (slog ~[leaf+"Gift: {<+.q.res>}"])
?~  error.q.res
  ;<  t2=@da  bind:m  get-time
  %-  (slog ~[leaf+"Time elapsed: {<`@dr`(sub t2 t1)>}"])
  (pure:m !>(~))
%-  (slog u.error.q.res)
(pure:m !>(~))
```

Save the above thread to `/ted/rest.hoon`, and `|commit %base`. Let's try run it with an argument of `~s2`:

```
> -rest ~s2
Gift: [%wake error=~]
Time elapsed: ~s4..00d4
```

As you can see, the timer fired after four seconds, which means the two second timer was successfully cancelled by the `%rest` `task`.
