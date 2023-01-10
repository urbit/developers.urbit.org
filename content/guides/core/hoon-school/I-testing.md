+++
title = "8. Testing Code"
weight = 18
nodes = [170, 190]
objectives = ["Run existing unit tests.", "Produce a unit test.", "Employ a debugging strategy to identify and correct errors in Hoon code."]
+++

_This module will discuss how we can have confidence that a program does what it claims to do, using unit testing and debugging strategies.  It may be considered optional and skipped if you are speedrunning Hoon School._

> Code courageously.
>
> If you avoid changing a section of code for fear of awakening the demons therein, you are living in fear. If you stay in the comfortable confines of the small section of the code you wrote or know well, you will never write legendary code. All code was written by humans and can be mastered by humans.
>
> It's natural to feel fear of code; however, you must act as though you are able to master and change any part of it. To code courageously is to walk into any abyss, bring light, and make it right.
>
> ~wicdev-wisryt

When you produce software, how much confidence do you have that it does what you think it does?  Bugs in code are common, but judicious testing can manifest failures so that the bugs can be identified and corrected.  We can classify a testing regimen for Urbit code into a couple of layers:  fences and unit tests.

### Fences

_Fences_ are barriers employed to block program execution if the state isn’t adequate to the intended task. Typically, these are implemented with `assert` or similar enforcement.  In Hoon, this means `?>` wutgar, `?<` wutgal, and `?~` wutsig, or judicious use of `^-` kethep and `^+` ketlus. For conditions that must succeed, the failure branch in Hoon should be `!!`, which crashes the program.

### Unit Tests

> Unit tests are so called because they exercise the functionality of the code by interrogating individual functions and methods. Functions and methods can often be considered the atomic units of software because they are indivisible. However, what is considered to be the smallest code unit is subjective. The body of a function can be long are short, and shorter functions are arguably more unit-like than long ones.
>
> (Katy Huff, [“Python Testing and Continuous Integration”](https://mq-software-carpentry.github.io/python-testing/05-units/))
    
In many languages, unit tests refer to functions, often prefixed `test`, that specify (and enforce) the expected behavior of a given function. Unit tests typically contain setup, assertions, and tear-down. In academic terms, they’re a grading script.

In Hoon, the `tests/` directory contains the relevant tests for the testing framework to grab and utilize.  These can be invoked with the `-test` thread:

```hoon
> -test /=landscape=/tests ~  
built   /tests/lib/pull-hook-virt/hoon  
built   /tests/lib/versioning/hoon  
>   test-supported: took 1047µs  
OK      /lib/versioning/test-supported  
>   test-read-version: took 28317µs  
OK      /lib/versioning/test-read-version  
>   test-is-root: took 28786µs  
OK      /lib/versioning/test-is-root  
>   test-current-version: took 507µs  
OK      /lib/versioning/test-current-version  
>   test-append-version: took 4804µs  
OK      /lib/versioning/test-append-version  
>   test-mule-scry-bad-time: took 8437µs  
OK      /lib/pull-hook-virt/test-mule-scry-bad-time  
>   test-mule-scry-bad-ship: took 8279µs  
OK      /lib/pull-hook-virt/test-mule-scry-bad-ship  
>   test-kick-mule: took 4614µs  
OK      /lib/pull-hook-virt/test-kick-mule  
ok=%.y    
```

(Depending on when you built your fakeship, particular tests may or may not be present.  You can download them from [the Urbit repo](https://github.com/urbit/urbit) and add them manually if you like. Regarding the example above (`%landscape` desk), the tests are likely missing, so download them from [here](https://github.com/urbit/urbit/tree/master/pkg/landscape) if you want to run them.)

Hoon unit tests come in two categories:

1.   `++expect-eq` (equality of two values)
2.   `++expect-fail` (failure/crash)

Let's look at a practical example first, then dissect these.

### Exercise:  Testing a Library

Consider an absolute value arm `++absolute` for `@rs` values. The unit tests for `++absolute` should accomplish a few things:

-   Verify correct behavior for positive numeric input.
-   Verify correct behavior for negative numeric input.
-   For the purpose of demonstrating `++expect-fail`, verify an exception is raised on input of zero. (Properly speaking Hoon doesn't have exceptions because Nock is crash-only; tools like `unit` are a way of dealing with failed computations.)

(You may also think we would need to verify `++absolute` calls only succeed if the input is an `@rs`, but arvo already handles this for us, as a hoon file will not build if a gate call contains an argument that does not match the sample type. So even if you wanted to add an `++expect-fail` test for it, your test file would not build.)

By convention any testing suite has the import line `/+  *test` at the top.

**/tests/lib/absolute.hoon**

```hoon {% copy=true mode="collapse" %}
/+  *test, *absolute
|%
++  test-absolute
  ;:  weld
  %+  expect-eq
    !>  .1
    !>  (absolute .-1)
  %+  expect-eq
    !>  .1
    !>  (absolute .1)
  %-  expect-fail
    |.  (absolute .0)
  ==
--
```

Note that at this point we don’t care what the function looks like, only how it behaves.

**/lib/absolute.hoon**

```hoon {% copy=true %}
|%
++  absolute
  |=  a=@rs
  ?:  (gth a .0)  a
  (sub:rs .0 a)
--
```

- Use the tests to determine what is wrong with this library code and correct it.

The dcSpark blog post [“Writing Robust Hoon — A Guide To Urbit Unit Testing”](https://medium.com/dcspark/writing-robust-hoon-a-guide-to-urbit-unit-testing-82b2631fe20a) covers some more good ideas about testing Hoon code.

### `/lib/test.hoon`

In `/lib/test.hoon` we find a core with a few gates:  `++expect`, `++expect-eq`, and `++expect-fail`, among others.

`++expect-eq` checks whether two vases are equal and pretty-prints the result of that test.  It is our workhorse.  The source for `++expect-eq` is:

```hoon {% copy=true mode="collapse" %}
++  expect-eq
  |=  [expected=vase actual=vase]
  ^-  tang
  ::
  =|  result=tang
  ::
  =?  result  !=(q.expected q.actual)
    %+  weld  result
    ^-  tang
    :~  [%palm [": " ~ ~ ~] [leaf+"expected" (sell expected) ~]]
        [%palm [": " ~ ~ ~] [leaf+"actual  " (sell actual) ~]]
    ==
  ::
  =?  result  !(~(nest ut p.actual) | p.expected)
    %+  weld  result
    ^-  tang
    :~  :+  %palm  [": " ~ ~ ~]
        :~  [%leaf "failed to nest"]
            (~(dunk ut p.actual) %actual)
            (~(dunk ut p.expected) %expected)
    ==  ==
  result
```

Test code deals in `vase`s, which are produced by [`!>` zapgar](/reference/hoon/rune/zap#-zapgar) as a cell of the type of a value and the value.

`++expect-fail` by contrast take a `|.` bardot trap (a trap that has the `$` buc arm but hasn't been called yet) and verifies that the code within fails.

```hoon
> (expect-fail:test |.(!!))
~

> (expect-fail:test |.((sub 0 1)))
~

> (expect-fail:test |.((sub 1 1)))
~[[%leaf p="expected failure - succeeded"]]
```

(Recall that `~` null is `%.y` true.)


##  Producing Error Messages

Formal error messages in Urbit are built of tanks.

- A `tank` is a structure for printing data.
  - `leaf` is for printing a single noun.
  - `palm` is for printing backstep-indented lists.
  - `rose` is for printing rows of data.
- A `tang` is a `(list tank)`.

As your code evaluates, the Arvo runtime maintains a _stack trace_, or list of the evaluations and expressions that got the program to its notional point of computation.  When the code fails, any error hints currently on the stack are dumped to the terminal for you to see what has gone wrong.

- The [`~_` sigcab](/reference/hoon/rune/sig/#_-sigcab) rune, described as a “user-formatted tracing printf”, can include an error message for you, requiring you to explicitly build the `tank`.  (`printf` is a reference to [C's I/O library](https://en.wikipedia.org/wiki/Printf_format_string).)
- The [`~|` sigbar](/reference/hoon/rune/sig/#-sigbar) rune, a “tracing printf”, can include an error message from a simple `@t` cord.

    What this means is that these print to the stack trace if something fails, so you can use either rune to contribute to the error description:

    ```hoon {% copy=true %}
    |=  [a=@ud]
      ~_  leaf+"This code failed"
      !!
    ```

- The [`!:` zapcol](/reference/hoon/rune/zap/#-zapcol) rune turns on line-by-line stack tracing, which is extremely helpful when debugging programs.  Drop it in on the first Hoon line (after `/` fas imports) of a generator or library while developing.

    ```hoon
    > (sub 0 1)
    subtract-underflow
    dojo: hoon expression failed

    > !:((sub 0 1))
    /~zod/base/~2022.6.14..20.47.19..3b7a:<[1 4].[1 13]>
    subtract-underflow
    dojo: hoon expression failed
    ```

When you compose your own library cores, include error messages for likely failure modes.


##  Test-Driven Development

_In extremis_, rigorous unit testing yields test-driven development (TDD). Test-driven development refers to the practice of fully specifying desired function behavior before composing the function itself. The advantage of this approach is that it forces you to clarify ahead of time what you expect, rather than making it up on the fly.

For instance, one could publish a set of tests which characterize the behavior of a Roman numeral translation library sufficiently that when such a library is provided it is immediately demonstrable.

**/tests/lib/roman.hoon**

```hoon {% copy=true mode="collapse" %}
/+  *test, *roman
|%
++  test-output-one
  =/  src  "i"
  =/  trg  1
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (from-roman src)
  %+  expect-eq
    !>  trg
    !>  (from-roman (cuss src))
  ==
++  test-output-two
  =/  src  "ii"
  =/  trg  2
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (from-roman src)
  %+  expect-eq
    !>  trg
    !>  (from-roman (cuss src))
  ==
:: and so forth
++  test-input-one
  =/  trg  "i"
  =/  src  1
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (to-roman src)
  ==
++  test-input-two
  =/  trg  "ii"
  =/  src  2
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (to-roman src)
  ==
:: and so forth
--
```

By composing the unit tests ahead of time, you exercise a discipline of thinking carefully through details of the interface and implementation before you write a single line of implementation code.


##  Debugging Common Errors

Let’s enumerate the errors you are likely to have encountered by this point:

### `nest-fail`

`nest-fail` may be the most common.  Likely you are using an atom or a cell where the other is expected.

```hoon
> (add 'a' 'b')
195

> (add "a" "b")
-need.@
-have.[i=@tD t=""]
nest-fail
dojo: hoon expression failed
```

### `mint-nice`

`mint-nice` arises from typechecking errors:

```hoon
> ^-(tape ~[78 97 114 110 105 97])
mint-nice  
-need.?(%~ [i=@tD t=""])  
-have.[@ud @ud @ud @ud @ud @ud %~]  
nest-fail  
dojo: hoon expression failed
```

Conversion without casting via auras fails because the atom types (auras) don't nest without explicit downcasting to `@`.

```hoon
> `(list @ud)`~[0x0 0x1 0x2]
mint-nice
-need.?(%~ [i=@ud t=it(@ud)])
-have.[@ux @ux @ux %~]
nest-fail
dojo: hoon expression failed

> `(list @ud)``(list @)`~[0x0 0x1 0x2]
~[0 1 2]
```

### `fish-loop`

A `fish-loop` arises when using a recursive mold definition like `list`.  (The relevant mnemonic is that `++fish` goes fishing for the type of an expression.)  Alas, this fails today:

```hoon
> ?=((list @) ~[1 2 3 4])
[%test ~[[%.y p=2]]]
fish-loop
```

although a promised `?#` wuthax rune should match it once implemented.

### `generator-build-fail`

A `generator-build-fail` most commonly results from composing code with mismatched runes (and thus the wrong children including hanging expected-but-empty slots).

Also check if you are using Windows-style line endings, as Unix-style line endings should be employed throughout Urbit.

### Misusing the `$` buc Arm

Another common mistake is to attempt to use the default `$` buc arm in something that doesn't have it.  This typically happens for one of two reasons:

- `$.+2` means that `%-` cenhep or equivalent function call cannot locate a battery.  This can occur when you try to use a non-gate as a gate.  In particular, if you mask the name of a mold (such as `list`), then a subsequent expression that requires the mold will experience this problem.

    ```hoon
    > =/  list  ~[1 2 3]
     =/  a  ~[4 5 6]
     `(list @ud)`a
    -find.$.+2
    ```

- `-find.$` similarly looks for a `$` buc arm in something that _is_ a core but doesn't have the `$` buc arm present.

    ```hoon
    > *tape
    ""
    > (tape)
    ""
    > *(tape)
    -find.$
    ```

- [“Hoon Errors”](/reference/hoon/hoon-errors)

### Debugging Strategies

What are some strategies for debugging?

-   **Debugging stack.**  Use the `!:` zapcol rune to turn on the debugging stack, `!.` zapdot to turn it off again.  (Most of the time you just pop this on at the top of a generator and leave it there.)
-   **`printf` debugging.**  If your code will compile and run, employ `~&` sigpam frequently to make sure that your code is doing what you think it’s doing.
-   **Typecast.**  Include `^` ket casts frequently throughout your code.  Entire categories of error can be excluded by satisfying the Hoon typechecker.
-   **The only wolf in Alaska.**  Essentially a bisection search, you split your code into smaller modules and run each part until you know where the bug arose (where the wolf howled).  Then you keep fencing it in tighter and tighter until you know where it arose.  You can stub out arms with `!!` zapzap.
-   **Build it again.**  Remove all of the complicated code from your program and add it in one line at a time.  For instance, replace a complicated function with either a `~&` sigpam and `!!` zapzap, or return a known static hard-coded value instead.  That way as you reintroduce lines of code or parts of expressions you can narrow down what went wrong and why.
-  **Run without networking**.  If you run the Urbit executable with `-L`, you cut off external networking.  This is helpful if you want to mess with a _copy_ of an actual ship without producing remote effects.  That is, if other parts of Ames don’t know what you’re doing, then you can delete that copy (COPY!) of your pier and continue with the original.  This is an alternative to using fakezods which is occasionally helpful in debugging userspace apps in Gall.  You can also develop using a moon if you want to.
