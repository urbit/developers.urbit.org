+++
title = "3. Gates (Functions)"
weight = 13
nodes = [111, 115, 120]
objectives = ["Use the `+ls` generator to show a directory's contents.", "`|mount` and `|commit` a desk.", "Identify current known irregular syntax.", "Convert between regular and irregular forms of runes to date.", "Employ a gate to defer a computation.", "Produce a gate as a generator.", "Annotate Hoon code with comments.", "Produce a generator to convert a value between auras."]
+++

_This module will teach you how to produce deferred computations for later use, like functions in other languages._

##  A Spoonful of Sugar

Until this point in Hoon School, we have rigorously adhered to the regular syntax of runes so that you could get used to using them.  In fact, the only two irregular forms we used were these:

- Cell definition `[a b]` which represents the [`:-` colhep](/reference/hoon/rune/col#-colhep) rune, `:-  a  b`.

    That is, these expressions are all the same for Hoon:

    ```hoon
    > [1 2]
    [1 2]

    > :-  1  2
    [1 2]

    > :-
    1
    2
    [1 2]
    ```

- Aura application `` `@ux`500 `` which represents a double [`^-` kethep](/reference/hoon/rune/ket#-kethep), `^-  @ux  ^-  @  500`.

    These are equivalent in Hoon:

    ```hoon
    > ^-  @p  ^-  @  255
    ~fes

    > `@p`255
    ~fes
    ```

    (Why two `^-`s?  We have to clear the type information in general to be able to apply new type information.)

Hoon developers often employ irregular forms, sometimes called “sugar syntax”.  Besides the `:-` colhep and `^-` kethep forms, we will commonly use a new form for [`%-` cenhep](/reference/hoon/rune/cen#-cenhep) “function calls”:

```hoon
> %-  add  [1 2]
3

> (add 1 2)
3
```

You should get used to reading and interpreting these forms.  We will start to use them actively during this lesson.  You can find other irregular forms in the [irregular forms reference](/reference/hoon/irregular).

##  Exercise:  Converting Between Forms

Convert each of the following irregular forms into the correct regular runic syntax.

1. `(add 1 2)`
2. `` `@ub`16 ``
3. `[%lorem %ipsum]`
4. `[%lorem %ipsum %dolor]` (can do two ways)

Convert each of the following regular forms into the correct irregular syntax.

1. `:-  %lemon  %jello`
2. `^-  @p  ^-  @  256`
3. `%-  pow  :-  2  16`


##  Deferring Computations

So far, every time we have calculated something, we have had to build it from scratch in Dojo.  This is completely untenable for nontrivial calculations, and clearly the Urbit OS itself is built on persistent code structures defining the behavior.

```hoon {% copy=true %}
::  Confirm whether a value is greater than one.
=/  a  5
?:  (gth a 1)
  'yes'
'no'
```

This has no flexibility:  if we want to change `a` we have to rewrite the whole thing every time!

(Note also our introduction of the [`::` colcol](/reference/hoon/rune/col#-colcol) digraph in the above code block.  This marks anything following it as a _comment_, meaning that it is meant for the developer and reader, and ignored by the computer.)

Hoon uses _gates_ as deferred computations.  What this means is that we can build a Hoon expression now and use it at need later on, perhaps many times.  More than that, we can also use it on different data values.  A gate is the Hoon analogue of a [function or subroutine](https://en.wikipedia.org/wiki/Subroutine) in other programming languages.

The word "function" is used in various ways, but let's start by talking about them in the [mathematical sense](https://en.wikipedia.org/wiki/Function_%28mathematics%29).  Roughly put, a function takes one or more arguments (i.e., input values) and returns a value.  The return value depends solely on the argument(s), and nothing else. For example, we can understand multiplication as a function:  it takes two numbers and returns another number.  It doesn't matter where you ask, when you ask, or what kind of hat you're wearing when you ask.  If you pass the same two numbers (e.g., `3` and `4`), you get the same answer returned every time (`12`).

That output value depends solely upon input value(s) is an important property of functions. This property is called [referential transparency](https://en.wikipedia.org/wiki/Referential_transparency), and it's one of the key ingredients to building a secure Urbit stack.

Functions are implemented in Hoon with a special kind of [core](/reference/glossary/core/) called a _gate_.  In this lesson you'll learn what a gate is and how a gate represents a function.  (We _won't_ talk about what a core is quite yet.)  Along the way you'll build some example gates of your own.

### Building a Gate

Syntactically, a gate is a [`|=` bartis](/reference/hoon/rune/bar#-bartis) rune with two children:  a [`spec`](/reference/hoon/stdlib/4o#spec) (specification of input) and a [`hoon`](/reference/hoon/stdlib/4o#hoon) (body).  Think of just replacing the `=/` tisfas with the `|=` bartis:

```hoon {% copy=true %}
::  Confirm whether a value is greater than one.
|=  a=@ud
?:  (gth a 1)
  'yes'
'no'
```

Compare this to other programming languages, if you know any:
- Does it have a name?
- Does it have a return value?

Beyond those, what is the purpose of each line?

The [`spec`](/reference/hoon/stdlib/4o#spec) gives the type as a mold and attaches a face to it for use in the gate.

The [`hoon`](/reference/hoon/stdlib/4o#hoon) body expression evaluates and yields a result, ultimately sent back to the call site.  Frequently it is wise to explicitly require a particular type for the return value using the [`^-` kethep](/reference/hoon/rune/ket#-kethep) rune:

```hoon {% copy=true %}
::  Confirm whether a value is greater than one.
|=  a=@ud
^-  @t
?:  (gth a 1)
  'yes'
'no'
```

The input value, what is included in the `spec`, is sometimes called the argument or parameter in mathematics and other programming languages.  It's basically the input value.  Hoon prefers to call it the `sample` for reasons that will become apparent later on, but you won't confuse other developers if you call it the argument or input.

Note as well that the backbone of the program runs straight down the left-hand margin.  This makes it easier to read the essential mainline logic of the program.

Gates enforce the type of incoming and outgoing values.  In other words, a `spec` is a kind of type which is fixing the possible noun inputs.  (The lesson on types which follows this one will go into greater detail.)

Gates can take multiple arguments as a cell:

```hoon {% copy=true %}
::  Return which of two numbers is larger.
|=  [a=@ud b=@ud]
?:  (gth a b)
  a
b
```

You can also call them different ways with raw [`%` cen](/reference/hoon/rune/cen) runes:

```hoon {% copy=true %}
%-  max  [100 200]
%+  max  100  200
```

### Creating Your Own Gate

You can type the above Hoon code snippets directly into Dojo, but there's no way to actually use them yet!  The Dojo recognizes the expression as valid Hoon code, but can't actually apply it to an input `sample` yet.

```hoon
> |=  [a=@ud b=@ud]
  ?:  (gth a b)
    a
  b
< 1.tfm
  [ [a=@ud b=@ud]
    [our=@p now=@da eny=@uvJ]
    <17.bny 33.ehb 14.dyd 53.vlb 77.lrt 232.oiq 51.qbt 123.zao 46.hgz 1.pnw %140>
  ]
```

We need to attach a _name_ or a `face` to the expression.  Then we'll be able to use it directly.  Somewhat confusingly, there are three common ways to do this:

1. Attach the face (name) directly in Dojo.  (This is a good quick solution, and we'll use it when teaching and testing code, but it doesn't work inside of code files.)
2. Save the gate as a _generator_ file and call it using the name of the file.  (We'll do this in the next section of this lesson.)
3. Attach the face (name) as an _arm_ in a _core_.  (We don't know what those are yet, so we'll set them aside for a couple of lessons.)

To name a gate in Dojo (or any expression resulting in a value, which is _every_ expression), you can use the Dojo-specific syntax `=name value`:

```hoon
> =inc |=  [a=@]
       (add 1 a)

> (inc 1)
2

> (inc 12)
13

> (inc 5)
6
```

Notice that there is _one_ space (`ace`) after the `=name` term and then regular `gap`s thereafter.  We could also do this in one line using wide form:

```hoon
> =inc |=(a=@ (add 1 a))

> (inc 123)
124
```

To reiterate:  we typically use the `|=` bartis rune to create a gate.  In the expression above the `|=` is immediately followed by a set of parentheses containing two subexpressions: `a=@` and `(add 1 a)`.  The first defines the gate's `sample` (input value type), and the second defines the gate's product (output value).

In the example gate above, `inc`, the sample is defined by `a=@`.  This means that the sample is defined as an atom `@` meaning that the gate will take as input anything of that type (so, not a cell).  The `sample` is given the face `a`.  With a face it's easier to refer to the `sample` value in later code.

The second subexpression after the `|=` bartis rune is used to build the gate's body, where all the computations go.  In `inc`, the product is defined by `(add 1 a)`.  There's not much to it—it returns the value of `a+1`!

##  Exercise:  Double a Value

- Produce a gate which accepts any `@` unsigned integer value and doubles it.  Call it `double`.

    ```hoon
    > =double |=(a=@ (mul a 2))

    > (double 5)
    10
    ```

##  Exercise:  Convert Between Auras

- Produce a gate which accepts any `@` unsigned integer value and converts it to the `@p` equivalent.  Call it `myship`.

- Produce a gate which accepts any `@` unsigned integer value and calculates the next neighbor (the `@p` of the number plus one).  Call it `myneighbor`.

- Produce a gate which accepts a `@p` ship name and produces the `@ux` unsigned hexadecimal integer value of the ship.  Call it `mynumber`.

### Output Values

How can we control what kind of value a gate returns?  Many programming languages (such as C and Java) are _extremely_ concerned about this specification.  Others, like Python and MATLAB, are _laissez-faire_.  Hoon tends to be strict, but leaves some discretion over _how_ strict to you, the developer.

Remember `^-` kethep?  We will use `^-` as a _fence_, a way of making sure only data matching the appropriate structure get passed on.

```hoon {% copy=true %}
::  Confirm whether a value is greater than one.
|=  a=@ud
^-  @ud
?:  (gth a 1)
  %.n
%.y
```

**This is the correct way to define a gate.**  Frequent annotation of type with `^-` kethep fences is _essential_ to producing good Hoon code.  From this point forward in Hoon School, we will hew to this standard.

In technical language, we describe Hoon as a _statically typed_ language.  This means that it enforces type constraints on all values very aggressively.  If you are used to a dynamic language like Python or Ruby, this will seem very restrictive at first.  The flip side is that once your code compiles correctly, you will often find that it is very much along the way towards being a working correct product.


##  Coordinating Files

In pragmatic terms, an Urbit ship is what results when you successfully boot a new ship.  If you are in the host OS, what you see is an apparently-empty folder:

```sh
$ ls zod
$
```

(For this lesson in particular take pains to distinguish the host OS prompt `$ ` from the Urbit Dojo prompt `> `.  You should look into particular system setup instructions for Windows, macOS, and Linux hosts.) <!-- TODO -->

Contrast that apparently empty folder with what the `+ls %` command shows you from inside of your Urbit (at the Dojo prompt):

```hoon
> +ls %
app/ desk/bill gen/ lib/ mar/ sur/ sys/ ted/
```

Urbit organizes its internal view of data and files as _desks_, which are associated collections of code and data.  These are not visible to the host operating system unless you explicitly mount them, and changes on one side are not made clear to the other until you “commit” them.  (Think of Dropbox, except that you have to explicitly synchronize to see changes somewhere else.)

Inside of your ship (“Mars”), you can mount a particular desk to the host operating system (“Earth”):

```hoon
> |mount %base
```

Now check what happens outside of your ship:

```sh
$ ls zod
base/
$ ls zod/base
app/  desk.bill gen/ lib/ mar/ sur/ sys/ ted/
```

If we make a change in the folder on Earth, the contents will only update on Mars if we explicitly tell the two systems to coordinate.

On Earth:

```sh
$ cp zod/base/desk.bill zod/base/desk.txt
```

On Mars:

```hoon
> |commit %base
+ /~zod/base/2/desk/txt
```

You can verify the contents of the copied files are the same using the `+cat` command:

```hoon
> +cat %/desk/bill

> +cat %/desk/txt
```

(Dojo does know what a `bill` file is, so it displays the contents slightly formatted.  They are actually identical.)

We will use this `|commit` pattern to store persistent code as files, editing on Earth and then synchronizing to Mars.


##  Building Code

The missing piece to really tie all of this together is the ability to store a gate and use it at a later time, not just in the same long Dojo session.  Enter the _generator_.

A generator is a simple program which can be called from the Dojo.  It is a gate, so it takes some input as sample and produces some result.  Naked generators are the simplest generators possible, having access only to information passed to them directly in their `sample`.

In this section, we will compose our first generator.

### The Gate

```
::  Square a number.
|=  a=@ud
^-  @ud
%+  mul
  a
a
```

(Any time you write code to use later, you should include some comments to explain what the code does and perhaps how it does that.)

### The Process

1. Open a text editor.
2. Copy the gate above into the text editor.  (Double-check that two-space gaps are still gaps; some text editors chew them up into single-space aces.)
3. Save the gate as `square.hoon` in the `base/gen` folder of your fakeship.
4. In the Dojo, `|commit %base`.  _You should see a message indicating that the file has been loaded._
5. Run the generator with `+square 5`.

Any generator can be run the same way, beginning with the `+` lus character and followed by the name of a file in the `base/gen` directory.

### Hoon Source and Special Characters

Hoon source files are composed almost entirely of the printable ASCII characters.  Hoon does not accept any other characters in source files except for [UTF-8](https://en.wikipedia.org/wiki/UTF-8) in quoted strings.  Hard tab characters are illegal; use two spaces instead.

```hoon
> "You can put ½ in quotes, but not elsewhere!"
"You can put ½ in quotes, but not elsewhere!"

> 'You can put ½ in single quotes, too.'
'You can put ½ in single quotes, too.'

> "Some UTF-8: ἄλφα"
"Some UTF-8: ἄλφα"
```

**Note**: If you're using VS Code on Windows, you might need to manually change the line endings from Windows-style `CRLF` to Unix-style `LF` in the status bar at the bottom.  Urbit requires Unix-style line endings for Hoon files.

##  Exercise:  Triangular Function
 
- Implement the triangular function as a gate and save it as a generator `tri.hoon`.

    ![](https://lh4.googleusercontent.com/zdauTDEWvhhOkFEb6VcDEJ4SITsHOgcStf4NYFQSIVjTDPjaCqYGdin9TDCCeTG3OyMrUUdq-JtViiu_c9wuojim_mHpV6-DoTNwZzYz5_6qVVvN5fc3hEuSna2GwY15RQ=w740)

### Coding Piecemeal

If you need to test code without completing it, you can stub out as-yet-undefined arms with the [`!!` zapzap](/reference/hoon/rune/zap#-zapzap) crash rune.  `!!` is the only rune which has no children, and it's helpful when you need something to satisfy Hoon syntax but aren't ready to flesh out the program yet.

### Building Code Generally

A generator gives us on-demand access to code, but it is helpful to load and use code from files while we work in the Dojo.

A conventional library import with [`/+` faslus](/reference/hoon/rune/fas#-faslus) will work in a generator or another file, but won't work in Dojo, so you can't use `/+` faslus interactively.

Instead, you need to use the `-build-file` thread to load the code.  Most commonly, you will do this with library code when you need a particular core's functionality.

`-build-file` accepts a file path and returns the built operational code, to which you can then attach a `face`.  For instance:

```hoon
> =ntw -build-file %/lib/number-to-words/hoon

> one-hundred:numbers:ntw  
100

> (to-words:eng-us:numbers:ntw 19)
[~ "nineteen"]
```

There are also a number of other import runes which make library, structure, and mark code available to you.  Right now, the only one you need to worry about is `/+` faslus.

For simplicity, everything we do will take place on the `%base` desk for now.  We will learn how to create a library in a subsequent lesson.

##  Exercise:  Loading a Library

In a generator, load the `number-to-words` library using the `/+` faslus rune.  (This must take place at the very top of your file.)
 
Use this to produce a gate which accepts an unsigned decimal integer and returns the text interpretation of its increment.
