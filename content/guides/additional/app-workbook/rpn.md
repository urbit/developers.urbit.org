##  Tutorial:  Building a CLI App

We will utilize the basic calculator app logic from the [parsing guide](/guides/additional/parsing#recursive-parsers) to produce a linked calculator agent `%rpn` supporting the following operators by the appropriate parsers:

- numbers (as `@rs` without `.` dot prefix) (`royl-rs:so`)
- `+` lus, addition (`lus`)
- `-` hep, subtraction (`hep`)
- `*` tar, multiplication (`tar`)
- `/` fas, division (`fas`)
- `.` dot, display top of stack (`dot`)

We will leave all regular Gall arms as their defaults, but of course poking, subscribing, and peeking should be supported in a full application.


##  Agent Logic

**`/sur/rpn.hoon`**

We just need to define the expected operators that will show up in the stack.  These are `@t` text constants.

```hoon
|%
+$  op  $?  [%op %add]
            [%op %sub]
            [%op %mul]
            [%op %div]
            [%op %sho]
        ==
+$  num  @rs
+$  command  ?(@rs op)
--
```

(`+$command` doesn't really feel like the right name here, but we're pattern-matching with the demo `/app/shoe.hoon`.)

**`/lib/rpn.hoon`**

These are the parsing rules that the CLI agent will use.  We could include these directly in the agent file but we'll post them to a library file.

```hoon
|%
++  num     royl-rs:so
++  op-add  (cook |=(p=@ ?:(=('+' p) op+%add ~)) lus)
++  op-sub  (cook |=(p=@ ?:(=('-' p) op+%sub ~)) hep)
++  op-mul  (cook |=(p=@ ?:(=('*' p) op+%mul ~)) tar)
++  op-div  (cook |=(p=@ ?:(=('/' p) op+%div ~)) fas)
++  op-sho  (cook |=(p=@ ?:(=('.' p) op+%sho ~)) dot)
++  ops     ;~(pose op-add op-sub op-mul op-div op-sho)
--
```

**`/app/rpn.hoon`**

```hoon
++  state-0
  $:  %0
      stack=(list ?(@rs op:rpn))
  ==
```

**`++command-parser`**

We want this arm to wait until `RETURN` is pressed so we `++stag` the value with `|` `FALSE`/`%.n`.

```hoon
++  command-parser
  |=  =sole-id:shoe
  ^+  |~(nail *(like [? command:rpn]))
  %+  stag  |
  (cook command:rpn ;~(pose num:rpnlib ops:rpnlib))
```

**`++on-command`**

This arm pushes values onto the stack, displays the stack, then checks to parse for the result of an operation.

```hoon
++  on-command
  |=  [=sole-id:shoe =command:rpn]
  ^-  (quip card _this)
  =/  old-stack  (weld stack ~[command])
  =/  new-stack  (process:rpnlib old-stack)
  :_  this(stack new-stack)
  :~  [%shoe ~ sole+klr+~[(crip "{<old-stack>} →")]]
      [%shoe ~ sole+klr+~[[[`%br ~ `%g] (crip "{<new-stack>}") ~]]]
  ==
```

For this we add a helper arm to `/lib/rpn.hoon` which takes each entry, makes sure it is a `@rs` atom, and carries out the operation.  (This could probably be made more efficient.)

**`/lib/rpn.hoon`**

```hoon
/-  rpn
:: * * *
++  process
  |=  stack=(list command:rpn)
  ^-  (list command:rpn)
  ~|  "Failure processing operation on stack {<stack>}"
  ?~  stack  !!
  ?-    `command:rpn`(snag 0 (flop stack))
      [%op %add]
    =/  augend        ;;(@rs `command:rpn`(snag 1 (flop stack)))
    =/  addend        ;;(@rs `command:rpn`(snag 2 (flop stack)))
    (flop (weld ~[(add:rs augend addend)] (slag 3 (flop stack))))
    ::
      [%op %sub]
    =/  minuend       ;;(@rs `command:rpn`(snag 1 (flop stack)))
    =/  subtrahend    ;;(@rs `command:rpn`(snag 2 (flop stack)))
    (flop (weld ~[(sub:rs minuend subtrahend)] (slag 3 (flop stack))))
    ::
      [%op %mul]
    =/  multiplicand  ;;(@rs `command:rpn`(snag 1 (flop stack)))
    =/  multiplier    ;;(@rs `command:rpn`(snag 2 (flop stack)))
    (flop (weld ~[(mul:rs multiplicand multiplier)] (slag 3 (flop stack))))
    ::
      [%op %div]
    =/  numerator     ;;(@rs `command:rpn`(snag 1 (flop stack)))
    =/  denominator   ;;(@rs `command:rpn`(snag 2 (flop stack)))
    (flop (weld ~[(div:rs numerator denominator)] (slag 3 (flop stack))))
    ::
      [%op %sho]
    ~&  >  "{<(snag 1 (flop stack))>}"
    (flop (slag 1 (flop stack)))
    ::
      @rs
    stack
  ==
```

### Linking

After a `%sole` agent has been `|install`ed, it should be registered for Dojo to cycle input to it using `|link`.

```hoon
|link %rpn
```

Now `Ctrl`+`X` allows you to switch to that app and evaluate expressions using it.

```hoon
gall: booted %rpn
> 50
~ →
~[.50]

> 25
~[.50] →
~[.50 .25]

> -
~[.50 .25] →
~[.-25]

> 5
~[.-25] →
~[.-25 .5]

> /
~[.-25 .5] →
~[.-0.19999999]

> 5
~[.-0.19999999] →
~[.-0.19999999 .5]

> *
~[.-0.19999999 .5] →
~[.-0.99999994]

> 1
~[.-0.99999994] →
~[.-0.99999994 .1]

> /
~[.-0.99999994 .1] →
~[.-1]
```


##  Exercises

- Extend the calculator app to support modulus as `%` cen.
- Extend the calculator app so it instead operates on `@rd` values.  Either use `++cook` to automatically convert the input values from a `1.23`-style input to the `.~1.23` `@rd` style or build a different input parser from the entries in `++royl:so`.
- Extend the calculator app so that it can support named variables (using `@tas`) with `=` tis.  What new data structure do you need?  For convenience, expose the result of the last operation as `ans` (a feature of TI graphing calculators and MATLAB, among other programs).
- The calculator app stack isn't really a proper CS stack with push and pop operations.  Refactor it to use such a type.
