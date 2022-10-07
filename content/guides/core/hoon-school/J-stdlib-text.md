+++
title = "9. Text Processing I"
weight = 19
nodes = [160, 163]
objectives = ["Review Unicode text structure.", "Distinguish cords and tapes and their characteristics.", "Transform and manipulate text using text conversion arms.", "Interpolate text.", "Employ sigpam logging levels.", "Create a `%say` generator.", "Identify how Dojo sees and interprets a generator as a cell with a head tag.", "Identify the elements of a `sample` for a `%say` generator.", "Produce a `%say` generator with optional arguments."]
+++

_This module will discuss how text is represented in Hoon, discuss tools for producing and manipulating text, and introduce the `%say` generator, a new generator type.  We don't deal with formatted text (`tank`s) or parsers here, deferring that discussion.  Formatted text and text parsing are covered [in a later module](/guides/core/hoon-school/P-stdlib-io)._

##  Text in Hoon

We've incidentally used `'messages written as cords'` and `"as tapes"`, but aside from taking a brief look at how `list`s (and thus `tape`s) work with tree addressing, we haven't discussed why these differ or how text works more broadly.

There are four basic ways to represent text in Urbit:

- `@t`, a `cord`, which is an atom (single value)
- `@ta`, a `knot` or ASCII text, which is an atom (single value)
- `@tas`, a `term` or ASCII text symbol
- `tape`, which is a `(list @t)`

This is more ways than many languages support:  most languages simply store text directly as a character array, or list of characters in memory.  Colloquially, we would only call cords and tapes [_strings_](https://en.wikipedia.org/wiki/String_%28computer_science%29), however.

What are the applications of each?

### `@t` `cord`

What is a written character? Essentially it is a representation of human semantic content (not sound strictly). (Note that we don't refer to _alphabets_, which prescribe a particular relationship of sound to symbol:  there are ideographic and logographic scripts, syllabaries, and other representations.  Thus, _characters_ not _letters_.)  Characters can be combined—particularly in ideographic languages like Mandarin Chinese.

One way to handle text is to assign a code value to each letter, then represent these as subsequent values in memory.  (Think, for instance, of [Morse code](https://en.wikipedia.org/wiki/Morse_code).)  On all modern computers, the numeric values used for each letter are given by the [ASCII](https://en.wikipedia.org/wiki/ASCII) standard, which defines 128 unique characters (2⁷ = 128).

```
65  83  67  73  73
A   S   C   I   I
```

A cord simply shunts these values together in one-byte-wide slots and represents them as an integer.

```hoon
> 'this is a cord'
'this is a cord'

> `@`'this is a cord'
2.037.307.443.564.446.887.986.503.990.470.772
```

It's very helpful to use the `@ux` aura if you are trying to see the internal structure of a `cord`.  Since the ASCII values align at the 8-bit wide characters, you can see each character delineated by a hexadecimal pair.

```hoon
> `@ux`'HELLO'
0x4f.4c4c.4548

> `@ub`'HELLO'
0b100.1111.0100.1100.0100.1100.0100.0101.0100.1000
```

You can think of this a couple of different ways.  One way is to simple think of them as chained together, with the first letter in the rightmost position.  Another is to think of them as values multipled by a “place value”:

| Letter | ASCII | Place | “Place Value” |
| ------ | ----- | ----- | ------------- |
| `H`    | 0x48  | 0     | 2⁰ = 1 → 0x48 |
| `E`    | 0x45  | 1     | 2⁸ = 256 = 0x100 → 0x4500 |
| `L`    | 0x4c  | 2     | 2¹⁶ = 65.536 = 0x1.0000 → 0x4c.0000 |
| `L`    | 0x4c  | 3     | 2²⁴ = 16.777.216 = 0x100.0000 → 0x4c00.0000 |
| `O`    | 0x4f  | 4     | 2³² = 4.294.967.296 = 0x1.0000.0000 → 0x4f.0000.0000 |

This way, each value slots in after the preceding value.

Special characters (non-ASCII, beyond the standard keyboard, basically) are represented using a more complex numbering convention.  [Unicode](https://en.wikipedia.org/wiki/Unicode) defines a standard specification for _code points_ or numbers assigned to characters, and a few specific bitwise _encodings_ (such as the ubiquitous UTF-8).  Urbit uses UTF-8 for `@t` values (thus both `cord` and `tape`).

### `(list @t)` `tape`

There are some tools to work with atom `cord`s of text, but most of the time it is more convenient to unpack the atom into a `tape`.  A `tape` splits out the individual characters from a `cord` into a `list` of character values.

![](https://storage.googleapis.com/media.urbit.org/docs/userspace/hoon-school/binary-tree-tape.png)

We've hinted a bit at the structure of `list`s before; for now the main thing you need to know is that they are cells which end in a `~` sig.  So rather than have all of the text values stored sequentially in a single atom, they are stored sequentially in a rightwards-branching binary tree of cells.

A tape is a list of `@tD` atoms (i.e., ASCII characters).  (The upper-case character at the end of the aura hints that the `@t` values are D→3 so 2³=8 bits wide.)

```hoon
> "this is a tape"
"this is a tape"

> `(list @)`"this is a tape"
~[116 104 105 115 32 105 115 32 97 32 116 97 112 101]
```

Since a `tape` is a `(list @tD)`, all of the `list` tools we have seen before work on them.

### `@ta` `knot`

If we restrict the character set to certain ASCII characters instead of UTF-8, we can use this restricted representation for system labels as well (such as URLs, file system paths, permissions).  `@ta` `knot`s and `@tas` `term`s both fill this role for Hoon.

```hoon
> `@ta`'hello'
~.hello
```

Every valid `@ta` is a valid `@t`, but `@ta` does not permit spaces or a number of other characters.  (See `++sane`, discussed below.)

### `@tas` `term`

A further tweak of the ASCII-only concept, the `@tas` `term` permits only “text constants”, values that are first and foremost only _themselves_.

> [`@tas` permits only] a restricted text atom for Hoon constants. The only characters permitted are lowercase ASCII letters, `-`, and `0-9`, the latter two of which cannot be the first character. The syntax for `@tas` is the text itself, always preceded by `%`. The empty `@tas` has a special syntax, `$`.

`term`s are rarely used for message-like text, but they are used all the time for internal labels in code.  They differ from regular text in a couple of key ways that can confuse you until you're used to them.

For instance, a `@tas` value is also a mold, and the value will _only_ match its own mold, so they are commonly used with [type unions](/guides/core/hoon-school/N-logic) to filter for acceptable values.

```hoon
> ^-  @tas  %5
mint-nice
-need.@tas
-have.%5
nest-fail
dojo: hoon expression failed

> ^-  ?(%5)  %5
%5

> (?(%5) %5)
%5
```

For instance, imagine creating a function to ensure that only a certain [classical element](https://en.wikipedia.org/wiki/Classical_element) can pass through a gate.  (This gate is superfluous given how molds work, but it shows off a point.)

```hoon {% copy=true %}
|=  input=@t
=<
(validate-element input)
|%
+$  element  ?(%earth %air %fire %water)
++  validate-element
  |=  incoming=@t
  %-  element  incoming
--
```

(See how that `=<` tisgal works with the helper core?)


##  Text Operations

Text-based data commonly needs to be _produced_, _manipulated_, or _analyzed_ (including parsing).

### Producing Text

String interpolation puts the result of an expression directly into a `tape`:

```hoon
> "{<(add 5 6)>} is the answer."
"11 is the answer."
```

`++weld` can be used to glue two `tape`s together:

```hoon
> (weld "Hello" "Mars!")
"HelloMars!"
```

```hoon {% copy=true %}
|=  [t1=tape t2=tape]
^-  tape
(weld t1 t2)
```

### Manipulating Text

If you have text but you need to change part of it or alter its form, you can use standard library `list` operators like `++flop` as well as `tape`-specific arms.

Applicable `list` operations—some of which you've seen before—include:

- [`++flop`](/reference/hoon/stdlib/2b#flop) takes a list and returns it in reverse order:

    ```hoon
    > (flop "Hello!")
    "!olleH"

    > (flop (flop "Hello!"))
    "Hello!"
    ```

- [`++sort`](/reference/hoon/stdlib/2b#sort) uses the [quicksort algorithm](https://en.wikipedia.org/wiki/Quicksort) to sort a list.  It takes a `list` to sort and a gate that serves as a comparator.  For example, if you want to sort the list `~[37 62 49 921 123]` from least to greatest, you would pass that list along with the `++lth` gate (for “less than”):

    ```hoon
    > (sort ~[37 62 49 921 123] lth)
    ~[37 49 62 123 921]
    ```

    To sort the list from greatest to least, use the gth gate ("greater than") as the basis of comparison instead:

    ```hoon
    > (sort ~[37 62 49 921 123] gth)
    ~[921 123 62 49 37]
    ```

    You can sort letters this way as well:

    ```hoon
    > (sort ~['a' 'f' 'e' 'k' 'j'] lth)
    <|a e f j k|>
    ```

    The function passed to sort must produce a flag, i.e., `?`.

- [`++weld`](/reference/hoon/stdlib/2b#weld) takes two lists of the same type and concatenates them:

    ```hoon
    > (weld "Happy " "Birthday!")
    "Happy Birthday!"
    ```

    It does not inject a separator character like a space.

- [`++snag`](/reference/hoon/stdlib/2b#snag) takes an atom `n` and a list, and returns the `n`th item of the list, where 0 is the first item:

    ```hoon
    > (snag 3 "Hello!")
    'l'

    > (snag 1 "Hello!")
    'e'

    > (snag 5 "Hello!")
    '!'
    ```

    **Exercise:  `++snag` Yourself**

    - Without using `++snag`, write a gate that returns the `n`th item of a list.  There is a solution at the bottom of the page.

- [`++oust`](/reference/hoon/stdlib/2b#oust) takes a pair of atoms `[a=@ b=@]` and a list, and returns the list with b items removed, starting at item a:

    ```hoon
    > (oust [0 1] `(list @)`~[11 22 33 44])
    ~[22 33 44]

    > (oust [0 2] `(list @)`~[11 22 33 44])
    ~[33 44]

    > (oust [1 2] `(list @)`~[11 22 33 44])
    ~[11 44]

    > (oust [2 2] "Hello!")
    "Heo!"
    ```

- [`++lent`](/reference/hoon/stdlib/2b#lent) takes a list and returns the number of items in it:

    ```hoon
    > (lent ~[11 22 33 44])
    4

    > (lent "Hello!")
    6
    ```

    **Exercise:  Count the Number of Characters in Text**

    - There is a built-in `++lent` function that counts the number of characters in a `tape`.  Build your own `tape`-length character counting function without using `++lent`.

    You may find the [`?~` wutsig](/reference/hoon/rune/wut#-wutsig) rune to be helpful.  It tells you whether a value is `~` or not.  (How would you do this with a regular `?:` wutcol?)

The foregoing are `list` operations.  The following, in contrast, are `tape`-specific operations:

- [`++crip`](/reference/hoon/stdlib/4b#crip) converts a `tape` to a `cord` (`tape`→`cord`).

    ```hoon
    > (crip "Mars")
    'Mars'
    ```

- [`++trip`](/reference/hoon/stdlib/4b#trip) converts a `cord` to a `tape` (`cord`→`tape`).

    ```hoon
    > (trip 'Earth')
    "Earth"
    ```

- [`++cass`](/reference/hoon/stdlib/4b#cass): convert upper-case text to lower-case (`tape`→`tape`)

    ```hoon
    > (cass "Hello Mars")
    "hello mars"
    ```

- [`++cuss`](/reference/hoon/stdlib/4b#cuss): convert lower-case text to upper-case (`tape`→`tape`)

    ```hoon
    > (cuss "Hello Mars")
    "HELLO MARS"
    ```

### Analyzing Text

Given a string of text, what can you do with it?

1. Search
2. Tokenize
3. Convert into data

#### Search

- [`++find`](/reference/hoon/stdlib/2b#find) `[nedl=(list) hstk=(list)]` locates a sublist (`nedl`, needle) in the list (`hstk`, haystack).  (`++find` starts counting from zero.)

    ```hoon
    > (find "brillig" "'Twas brillig and the slithy toves")
    [~ 6]
    ```

    `++find` returns a `unit`, which right now means that we need to distinguish between nothing found (`~` null) and zero `[~ 0]`.  `unit`s are discussed in more detail in [a later lesson](/guides/core/hoon-school/L-struct).

#### Tokenize/Parse

To _tokenize_ text is to break it into pieces according to some rule.  For instance, to count words one needs to break at some delimiter.

```
"the sky above the port was the color of television tuned to a dead channel"
 1   2   3     4   5    6   7   8     9  10         11    12 13 14  15
```

Hoon has a sophisticated parser built into it that [we'll use later](/guides/core/hoon-school/P-stdlib-io).  There are a lot of rules to deciding what is and isn't a rune, and how the various parts of an expression relate to each other.  We don't need that level of power to work with basic text operations, so we'll instead use basic `list` tools whenever we need to extract or break text apart for now.

##  Exercise: Break Text at a Space

Hoon has a very powerful text parsing engine, built to compile Hoon itself.  However, it tends to be quite obscure to new learners.  We can build a simple one using `list` tools.

- Compose a gate which parses a long `tape` into smaller `tape`s by splitting the text at single spaces.  For example, given a `tape`
 
    ```hoon {% copy=true %}
    "the sky above the port was the color of television tuned to a dead channel"
    ```
    
    the gate should yield
    
    ```hoon
    ~["the" "sky" "above" "the" ...]
    ```
    
    To complete this, you'll need [`++scag`](/reference/hoon/stdlib/2b#scag) and [`++slag`](/reference/hoon/stdlib/2b#slag) (who sound like villainous henchmen from a children's cartoon).

    ```hoon {% copy=true %}
    |=  ex=tape
    =/  index  0  
    =/  result  *(list tape)  
    |-  ^-  (list tape)  
    ?:  =(index (lent ex))  
      (weld result ~[`tape`(scag index ex)])
    ?:  =((snag index ex) ' ')  
      $(index 0, ex `tape`(slag +(index) ex), result (weld result ~[`tape`(scag index ex)]))    
    $(index +(index))
    ```

#### Convert

If you have a Hoon value and you want to convert it into text as such, use `++scot` and `++scow`.  These call for a value of type `+$dime`, which means the `@tas` equivalent of a regular aura.  These are labeled as returning `cord`s (`@t`s) but in practice seem to return `knot`s (`@ta`s).

- [`++scot`](/reference/hoon/stdlib/4m/#scot) renders a `dime` as a `cord` (`dime`→`cord`); the user must include any necessary aura transformation.

    ```hoon
    > `@t`(scot %ud 54.321)
    '54.321'

    > `@t`(scot %ux 54.000)  
    '0xd2f0'
    ```

    ```hoon
    > (scot %p ~sampel-palnet)
    ~.~sampel-palnet

    > `@t`(scot %p ~sampel-palnet)
    '~sampel-palnet'
    ```

- [`++scow`](/reference/hoon/stdlib/4m/#scow) renders a `dime` as a `tape` (`dime`→`tape`); it is otherwise identical to `++scot`.

- [`++sane`](/reference/hoon/stdlib/4b#sane) checks the validity of a possible text string as a `knot` or `term`.  The usage of `++sane` will feel a bit strange to you:  it doesn't apply directly to the text you want to check, but it produces a gate that checks for the aura (as `%ta` or `%tas`).  (The gate-builder is a fairly common pattern in Hoon that we've started to hint at by using molds.)  `++sane` is also not infallible yet.

    ```hoon
    > ((sane %ta) 'ångstrom')
    %.n

    > ((sane %ta) 'angstrom')
    %.y

    > ((sane %tas) 'ångstrom')
    %.n

    > ((sane %tas) 'angstrom')
    %.y
    ```

    Why is this sort of check necessary?  Two reasons:

    1.  `@ta` `knot`s and `@tas` `term`s have strict rules, such as being ASCII-only.
    2.  Not every sequence of bits has a conversion to a text representation.  That is, ASCII and Unicode have structural rules that limit the possible conversions which can be made.  If things don't work, you'll get a `%bad-text` response.

        ```hoon
        > 0x1234.5678.90ab.cdef
        0x1234.5678.90ab.cdef
        [%bad-text "[39 239 205 171 144 120 86 52 92 49 50 39 0]"]
        ```

    There's a minor bug in Hoon that will let you produce an erroneous `term` (`@tas`):

    ```hoon
    > `@tas`'hello mars'
    %hello mars
    ```

    Since a `@tas` cannot include a space, this is formally incorrect, as `++sane` reveals:

    ```hoon
    > ((sane %tas) 'hello')  
    %.y
    
    > ((sane %tas) 'hello mars')
    %.n
    ```

##  Exercise:  Building Your Own Library

Let's take some of the code we've built above for processing text and turn them into a library we can use in another generator.

- Take the space-breaking code and the element-counting code gates from above and include them in a `|%` barcen core.  Save this file as `lib/text.hoon` in the `%base` desk of your fakeship and commit.

- Produce a generator `gen/text-user.hoon` which accepts a `tape` and returns the number of words in the text (separated by spaces).  (How would you obtain this from those two operations?)


##  Logging

The most time-honored method of debugging is to simply output relevant values at key points throughout a program in order to make sure they are doing what you think they are doing.  To this end, we introduced `~&` sigpam in the last lesson.

The `~&` sigpam rune offers some finer-grained output options than just printing a simple value to the screen.  For instance, you can use it with string interpolation to produce detailed error messages.

There are also `>` modifiers which can be included to mark “debugging levels”, really just color-coding the output:

1.  No `>`:  regular
2.  `>`:  information
3.  `>>`:  warning
4.  `>>>`:  error

(Since all `~&` sigpam output is a side effect of the compiler, it doesn't map to the Unix [`stdout`/`stderr` streams](https://en.wikipedia.org/wiki/Standard_streams) separately; it's all `stdout`.)

You can use these to differentiate messages when debugging or otherwise auditing the behavior of a generator or library.  Try these in your own Dojo:

```hoon
> ~&  'Hello Mars!'  ~  
'Hello Mars!'
~  

> ~&  >  'Hello Mars!'  ~  
>   'Hello Mars!'  
~  

> ~&  >>  'Hello Mars!'  ~  
>>  'Hello Mars!'  
~  

> ~&  >>>  'Hello Mars!'  ~  
>>> 'Hello Mars!'  
~
```


##  `%say` Generators

A naked generator is merely a gate:  a core with a `$` arm that Dojo knows to call.  However, we can also invoke a generator which is a cell of a metadata tag and a core.  The next level-up for our generator skills is the `%say` generator, a cell of `[%say core]` that affords slightly more sophisticated evaluation.

We use `%say` generators when we want to provide something else in Arvo, the Urbit operating system, with metadata about the generator's output. This is useful when a generator is needed to pipe data to another program, a frequent occurrence.

To that end, `%say` generators use `mark`s to make it clear, to other Arvo computations, exactly what kind of data their output is. A `mark` is akin to a MIME type on the Arvo level. A `mark` describes the data in some way, indicating that it's an `%atom`, or that it's a standard such as `%json`, or even that it's an application-specific data structure like `%talk-command`. `mark`s are not specific to `%say` generators; whenever data moves between programs in Arvo, that data is marked.

So, more formally, a `%say` generator is a `cell`. The head of that cell is the `%say` tag, and the tail is a `gate` that produces a `cask` -- a pair of the output data and the `mark` describing that data.

Save this example as `add.hoon` in the `/gen` directory of your `%base` desk:

```hoon {% copy=true %}
:-  %say
|=  *
:-  %noun
(add 40 2)
```

Run it with:

```hoon
> |commit %base

> +add
42
```

Notice that we used no argument, something that is possible with `%say` generators but impossible with naked generators. We'll explain that in a moment. For now, let's focus on the code that is necessary to make something a `%say` generator.

```hoon {% copy=true %}
:-  %say
```

Recall that the rune `:-` produces a cell, with the first following expression as its head and the second following expression as its tail.

The expression above creates a cell with `%say` as the head. The tail is the `|= *` expression on the line that follows.

```hoon {% copy=true %}
|=  *
:-  %noun
(add 40 2)
```

`|= *` constructs a [gate](/reference/glossary/gate/) that takes a noun. This [gate](/reference/glossary/gate/) will itself produce a `cask`, which is cell formed by the prepending `:-`. The head of that `cask` is `%noun` and the tail is the rest of the program, `(add 40 2)`. The tail of the `cask` will be our actual data produced by the body of the program: in this case, just adding 40 and 2 together.

A `%say` generator has access to values besides those passed into it and the Hoon standard subject.  Namely, a `%say` generator knows about `our`, `eny`, and `now`:

- `our` is our current ship identity.
- `eny` is entropy, a source of randomness.
- `now` is the current system timestamp.
- `bec` is the current path (beak).

Dojo will automatically supply these values to the gate unless they are stubbed out with `*`.

### `%say` generators with arguments

We can modify the boilerplate code to allow arguments to be passed into a `%say` generator, but in a way that gives us more power than we would have if we just used a naked generator.

Naked generators are limited because they have no way of accessing data that exists in Arvo, such as the date and time or pieces of fresh entropy.  In `%say` generators, however, we can access that kind of subject by identifying them in the gate's sample, which we only specified as `*` in the previous few examples. But we can do more with `%say` generators if we do more with that sample.  Any valid sample will follow this 3-tuple scheme:

`[[now=@da eny=@uvJ bec=beak] [list of unnamed arguments] [list of named arguments]]`

This entire structure is a noun, which is why `*` is a valid sample if we wish to not use any of the information here in a generator. But let's look at each of these three elements, piece by piece.

##  Exercise:  The Magic 8-Ball

This Magic 8-Ball generator returns one of a variety of answers in response to a call.  In its entirety:

```hoon {% copy=true mode="collapse" %}
!:
:-  %say
|=  [[* eny=@uvJ *] *]
:-  %noun
^-  tape
=/  answers=(list tape)
  :~  "It is certain."
      "It is decidedly so."
      "Without a doubt."
      "Yes - definitely."
      "You may rely on it."
      "As I see it, yes."
      "Most likely."
      "Outlook good."
      "Yes."
      "Signs point to yes."
      "Reply hazy, try again"
      "Ask again later."
      "Better not tell you now."
      "Cannot predict now."
      "Concentrate and ask again."
      "Don't count on it."
      "My reply is no."
      "My sources say no."
      "Outlook not so good."
      "Very doubtful."
  ==
=/  rng  ~(. og eny)
=/  val  (rad:rng (lent answers))
(snag val answers)
```

`~(. og eny)` starts a random number generator with a seed from the current entropy.  Right now we don't know quite enough to interpret this line, but we'll revisit the `++og` aspect of this `%say` generator in [the lesson on subject-oriented-programming](/guides/core/hoon-school/O-subject).  For now, just know that it allows us to produce a random (unpredictable) integer using `++rad:rng`.  We slam the `++rad:rng` gate which returns a random number from 0 to _n_-1 inclusive.  This gives us a random value from the list of possible answers.

Since this is a `%say` generator, we can run it without arguments:

```hoon
> +magic-8
"Ask again later."
```


##  Exercise:  Using the Playing Card Library

Recall the playing card library `/lib/playing-cards.hoon` in `/lib`.  Let's use it with a `%say` generator.

**`/gen/cards.hoon`**

```hoon {% copy=true %}
/+  playing-cards
:-  %say
|=  [[* eny=@uv *] *]
:-  %noun
(shuffle-deck:playing-cards make-deck:playing-cards eny)
```

Having already saved the library as `/lib/playing-cards.hoon`, you can import it with the `/+` faslus rune.  When `cards.hoon` gets built, the Hoon builder will pull in the requested library and also build that.  It will also create a dependency so that if `/lib/playing-cards.hoon` changes, this file will also get rebuilt.

Below `/+  playing-cards`, you have the standard `say` generator boilerplate that allows us to get a bit of entropy from `arvo` when the generator is run. Then we feed the entropy and a `deck` created by `make-deck` into `shuffle-deck` to get back a shuffled `deck`.

#### Solutions to Exercises

- Roll-Your-Own-`++snag`:

    ```hoon {% copy=true %}
    ::  snag.hoon
    ::
    |=  [a=@ b=(list @)]
    ?~  b  !!
    ?:  =(0 a)  i.b
    $(a (dec a), b t.b)
    ```
