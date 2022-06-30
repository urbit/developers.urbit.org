+++
title = "16. Functional Programming"
weight = 26
nodes = [233, 283, 383]
objectives = ["Reel, roll, turn a list.", "Curry, cork functions.", "Change arity of a gate.", "Tokenize text simply using `find` and `trim`.", "Identify elements of parsing:  `nail`, `rule`, etc.", "Use `++scan` to parse `tape` into atoms.", "Construct new rules and parse arbitrary text fields."]
+++

_This module will discuss some gates-that-work-on-gates and other assorted operators that are commonly recognized as functional programming tools.  It will also cover text parsing._

Given a gate, you can manipulate it to accept a different number of values than its sample formally requires, or otherwise modify its behavior.  These techniques mirror some of the common tasks used in other [functional programming languages](https://en.wikipedia.org/wiki/Functional_programming) like Haskell, Clojure, and OCaml.

Functional programming, as a paradigm, tends to prefer rather mathematical expressions with explicit modification of function behavior.  It works as a formal system of symbolic expressions manipulated according to given rules and properties.  FP was derived from the [lambda calculus](https://en.wikipedia.org/wiki/Lambda_calculus), a cousin of combinator calculi like Nock.  (See also [APL](https://en.wikipedia.org/wiki/APL_%28programming_language%29).)


##  Changing Arity

If a gate accepts only two values in its sample, for instance, you can chain together multiple calls automatically using the [`;:` miccol](/reference/hoon/rune/mic#-miccol) rune.

```hoon
> (add 3 (add 4 5))
12

> :(add 3 4 5)
12

> (mul 3 (mul 4 5))
60

> :(mul 3 4 5)
60
```

This is called changing the [_arity_](https://en.wikipedia.org/wiki/Arity) of the gate.  (Does this work on `++mul:rs`?)


##  Binding the Sample

[_Currying_](https://en.wikipedia.org/wiki/Currying) describes taking a function of multiple arguments and reducing it to a set of functions that each take only one argument.  _Binding_, an allied process, is used to set the value of some of those arguments permanently.

If you have a gate which accepts multiple values in the sample, you can fix one of these.  To fix the head of the sample (the first argument), use [`++cury`](/reference/hoon/stdlib/2n#cury); to bind the tail, use [`++curr`](/reference/hoon/stdlib/2n#curr).

Consider calculating _a x² + b x + c_, a situation we earlier resolved using a door.  We can resolve the situation differently using currying:

```hoon
> =full |=([x=@ud a=@ud b=@ud c=@ud] (add (add (mul (mul x x) a) (mul x b)) c))

> (full 5 4 3 2)
117

> =one (curr full [4 3 2])  

> (one 5)  
117
```

One can also [`++cork`](/reference/hoon/stdlib/2n#cork) a gate, or arrange it such that it applies to the result of the next gate.  This pairs well with `;:` miccol.  (There is also [`++corl`](/reference/hoon/stdlib/2n#corl), which composes backwards rather than forwards.)  This example converts a value to `@ux` then decrements it by corking two molds:

```hoon
> ((cork dec @ux) 20)  
0x13
```

#### Exercise:  Bind Gate Arguments

- Create a gate `++inc` which increments a value in one step, analogous to `++dec`.

#### Exercise:  Chain Gate Values

- Write an expression which yields the parent galaxy of a planet's sponsoring star by composing two gates.

##  Working Across `list`s

turn
The turn function takes a list and a gate, and returns a list of the products of applying each item of the input list to the gate. For example, to add 1 to each item in a list of atoms:

> (turn `(list @)`~[11 22 33 44] |=(a=@ +(a)))
~[12 23 34 45]
Or to double each item in a list of atoms:

> (turn `(list @)`~[11 22 33 44] |=(a=@ (mul 2 a)))
~[22 44 66 88]
turn is Hoon's version of Haskell's map.

We can rewrite the Caesar cipher program using turn:

|=  [a=@ b=tape]
^-  tape
?:  (gth a 25)
  $(a (sub a 26))
%+  turn  b
|=  c=@tD
?:  &((gte c 'A') (lte c 'Z'))
  =.  c  (add c a)
  ?.  (gth c 'Z')  c
  (sub c 26)
?:  &((gte c 'a') (lte c 'z'))
  =.  c  (add c a)
  ?.  (gth c 'z')  c
  (sub c 26)
c


[`++roll`](/reference/hoon/stdlib/2b#roll) and [`++reel`](/reference/hoon/stdlib/2b#reel) are used to left-fold and right-fold a list, respectively.  To fold a list is similar to [`++turn`](/reference/hoon/stdlib/2b#turn), except that instead of yielding a `list` with the values having had each applied, `++roll` and `++reel` produce an accumulated value.

```hoon
> (roll `(list @)`[1 2 3 4 5 ~] add)
q=15

> (reel `(list @)`[1 2 3 4 5 ~] mul)
120
```

#### Exercise:  

- Use `++reel` to produce a gate which calculates the factorial of a number.


##  Parsing Text

We need to build a tool to accept a `tape` containing some characters, then turn it into something else, something computational.

For instance, a calculator could accept an input like `3+4` and return `7`.  A command-line interface may look for a program to evaluate (like Bash and `ls`).  A search bar may apply logic to the query (like Google and `-` for `NOT`).

The basic problem all parsers face is this:

1. You need to accept a character string.
2. You need to ingest one or more characters and decide what they “mean”, including storing the result of this meaning.
3. You need to loop back to #1 again and again until you are out of characters.

We could build a simple parser out of a trap and `++snag`, but it would be brittle and difficult to extend.  The Hoon parser is very sophisticated, since it has to take a file of ASCII characters (and some UTF-8 strings) and turn it via an AST into Nock code.  What makes parsing challenging is that we have to wade directly into a sea of new types and processes.  To wit:

-   A `tape` is the string to be parsed.
-   A `hair` is the position in the text the parser is at, as a cell of column & line, `[p=@ud q=@ud]`.
-   A `nail` is parser input, a cell of `hair` and `tape`.
-   An `edge` is parser output, a cell of `hair` and a `unit` of `hair` and `nail`.  (There are some subtleties around failure-to-parse here that we'll defer a moment.)
-   A `rule` is a parser, a gate which applies a `nail` to yield an `edge`.

Basically, one uses a `rule` on `[hair tape]` to yield an `edge`.

A substantial swath of the standard library is built around parsing for various scenarios, and there's a lot to know to effectively use these tools.  **If you can parse arbitrary input using Hoon after this lesson, you're in fantastic shape for building things later.**  It's worth spending extra effort to understand how these programs work.

There is a [full guide on parsing](/guides/additional/hoon/parsing) which goes into more detail than this quick overview.

### Scanning Through a `tape`

[`++scan`](/reference/hoon/stdlib/4g#scan) parses a `tape` or crashes, simple enough.  It will be our workhorse.  All we really need to know in order to use it is how to build a `rule`.

Here we will preview using `++shim` to match characters with in a given range, here lower-case.  If you change the character range, e.g. putting `' '` in the `++shim` will span from ASCII `32`, `' '` to ASCII `122`, `'z'`.

```hoon
> `(list)`(scan "after" (star (shim 'a' 'z')))  
~[97 102 116 101 114]  

> `(list)`(scan "after the" (star (shim 'a' 'z')))
{1 6}  
syntax error  
dojo: hoon expression failed
```

### `rule` Building

The `rule`-building system is vast and often requires various components together to achieve the desired effect.

#### `rule`s to parse fixed strings

- [`++just`](/reference/hoon/stdlib/4f/#just) takes in a single `char` and produces a `rule` that attempts to match that `char` to the first character in the `tape` of the input `nail`.

    ```hoon
    > ((just 'a') [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ [p='a' q=[p=[p=1 q=2] q="bc"]]]]
    ```

- [`++jest`](/reference/hoon/stdlib/4f/#jest) matches a `cord`.  It takes an input `cord` and produces a `rule` that attempts to match that `cord` against the beginning of the input.

    ```hoon
    > ((jest 'abc') [[1 1] "abc"])
    [p=[p=1 q=4] q=[~ [p='abc' q=[p=[p=1 q=4] q=""]]]]

    > ((jest 'abc') [[1 1] "abcabc"])
    [p=[p=1 q=4] q=[~ [p='abc' q=[p=[p=1 q=4] q="abc"]]]]
    
    > ((jest 'abc') [[1 1] "abcdef"])
    [p=[p=1 q=4] q=[~ [p='abc' q=[p=[p=1 q=4] q="def"]]]]
    ```

    (Keep an eye on the structure of the return `edge` there.)

- [`++shim`](/reference/hoon/stdlib/4f/#shim) parses characters within a given range. It takes in two atoms and returns a `rule`.

    ```hoon
    > ((shim 'a' 'z') [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ [p='a' q=[p=[p=1 q=2] q="bc"]]]]
    ```

- [`++next`](/reference/hoon/stdlib/4f/#next) is a simple `rule` that takes in the next character and returns it as the parsing result.

    ```hoon
    > (next [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ [p='a' q=[p=[p=1 q=2] q="bc"]]]]
    ```

#### `rule`s to parse flexible strings

So far we can only parse one character at a time, which isn't much better than just using `++snag` in a trap.

```hoon
> (scan "a" (shim 'a' 'z'))  
'a'  

> (scan "ab" (shim 'a' 'z'))  
{1 2}  
syntax error  
dojo: hoon expression failed
```

How do we parse multiple characters in order to break things up sensibly?

- [`++star`](/reference/hoon/stdlib/4f#star) will match a multi-character list of values.

    ```hoon
    > (scan "a" (just 'a'))
    'a'

    > (scan "aaaaa" (just 'a'))
    ! {1 2}
    ! 'syntax-error'
    ! exit

    > (scan "aaaaa" (star (just 'a')))
    "aaaaa"
    ```

- [`++plug`](/reference/hoon/stdlib/4e/#plug) takes the `nail` in the `edge` produced by one rule and passes it to the next `rule`, forming a cell of the results as it proceeds.

    ```hoon
    > (scan "starship" ;~(plug (jest 'star') (jest 'ship')))
    ['star' 'ship']
    ```

- [`++pose`](/reference/hoon/stdlib/4e/#pose) tries each `rule` you hand it successively until it finds one that works.

    ```hoon
    > (scan "a" ;~(pose (just 'a') (just 'b')))
    'a'
    
    > (scan "b" ;~(pose (just 'a') (just 'b')))
    'b'
    
    > (;~(pose (just 'a') (just 'b')) [1 1] "ab")
    [p=[p=1 q=2] q=[~ u=[p='a' q=[p=[p=1 q=2] q=[i='b' t=""]]]]]
    ```

- [`++glue`](/reference/hoon/stdlib/4e/#glue) parses a delimiter in between each `rule` and forms a cell of the results of each `rule`.  Delimiter names hew to the aural ASCII pronunciation of symbols, plus `prn` for printable characters and

    ```hoon
    > (scan "a b" ;~((glue ace) (just 'a') (just 'b')))  
    ['a' 'b']

    > (scan "a,b" ;~((glue com) (just 'a') (just 'b')))
    ['a' 'b']
    
    > (scan "a,b,a" ;~((glue com) (just 'a') (just 'b')))
    {1 4}
    syntax error
    
    > (scan "a,b,a" ;~((glue com) (just 'a') (just 'b') (just 'a')))
    ['a' 'b' 'a']
    ```

- The [`;~` micsig](/reference/hoon/rune/mic/#-micsig) will create `;~(combinator (list rule))` to use multiple `rule`s.

    ```hoon
    > (scan "after the" ;~((glue ace) (star (shim 'a' 'z')) (star (shim 'a' 'z'))))  
    [[i='a' t=<|f t e r|>] [i='t' t=<|h e|>]
    
    > (;~(pose (just 'a') (just 'b')) [1 1] "ab")  
    [p=[p=1 q=2] q=[~ u=[p='a' q=[p=[p=1 q=2] q=[i='b' t=""]]]]]
    ```

    <!-- TODO
    ~tinnus-napbus:
    btw you should almost always avoid recursive welding cos weld has to traverse the entire first list in order to weld it
    so you potentially end up traversing the list thousands of times
    which involves chasing a gorillion pointers
    as a rule of thumb you wanna avoid the recursive use of stdlib list functions in general
    -->

At this point we have two problems:  we are just getting raw `@t` atoms back, and we can't iteratively process arbitrarily long strings.  `++cook` will help us with the first of these:

- [`++cook`](/reference/hoon/stdlib/4f/#cook) will take a `rule` and a gate to apply to the successful parse.

    ```hoon
    > ((cook ,@ud (just 'a')) [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ u=[p=97 q=[p=[p=1 q=2] q="bc"]]]]

    > ((cook ,@tas (just 'a')) [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ u=[p=%a q=[p=[p=1 q=2] q="bc"]]]]

    > ((cook |=(a=@ +(a)) (just 'a')) [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ u=[p=98 q=[p=[p=1 q=2] q="bc"]]]]

    > ((cook |=(a=@ `@t`+(a)) (just 'a')) [[1 1] "abc"])
    [p=[p=1 q=2] q=[~ u=[p='b' q=[p=[p=1 q=2] q="bc"]]]]
    ```

However, to parse iteratively, we need to use the [`++knee`]() function, which takes a noun as the bunt of the type the `rule` produces, and produces a `rule` that recurses properly.  (You'll probably want to treat this as a recipe for now and just copy it when necessary.)

```hoon
|-(;~(plug prn ;~(pose (knee *tape |.(^$)) (easy ~))))
```

There is an example of a calculator [in the parsing guide](/guides/additional/hoon/parsing#recursive-parsers) that's worth a read.  It uses `++knee` to scan in a set of numbers at a time.

```hoon
|=  math=tape
|^  (scan math expr)
++  factor
  %+  knee  *@ud
  |.  ~+
  ;~  pose
    dem
    (ifix [pal par] expr)
  ==
++  term
  %+  knee  *@ud
  |.  ~+
  ;~  pose
    ((slug mul) tar ;~(pose factor term))
    factor
  ==
++  expr
  %+  knee  *@ud
  |.  ~+
  ;~  pose
    ((slug add) lus ;~(pose term expr))
    term
  ==
--
```

#### Example:  Parse a String of Numbers

A simple `++shim`-based parser:

```hoon
> (scan "1234567890" (star (shim '0' '9')))  
[i='1' t=<|2 3 4 5 6 7 8 9 0|>]
```

A refined `++cook`/`++cury`/`++jest` parser:

```hoon
> ((cook (cury slaw %ud) (jest '1')) [[1 1] "123"])  
[p=[p=1 q=2] q=[~ u=[p=[~ 1] q=[p=[p=1 q=2] q="23"]]]]  

> ((cook (cury slaw %ud) (jest '12')) [[1 1] "123"])
[p=[p=1 q=3] q=[~ u=[p=[~ 12] q=[p=[p=1 q=3] q="3"]]]]
```
