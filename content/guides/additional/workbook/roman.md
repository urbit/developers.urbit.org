+++
title = "Roman Numerals"
weight = 50
+++

## Challenge: Printing and Parsing Roman Numerals

Roman numerals constitute a numeral system capable of expressing positive integers by additive values (rather than place-number notation).  Additive series are produced by summing values in a series, as `iii` → 3, while subtractive values are produced by prepending certain smaller values ahead of a larger value, as `ix` → 9.

- Produce a library which converts to and from Roman numeral representations according to the standard values:

    | Character | Value |
    | --------- | ----- |
    | `i` | 1 |
    | `v` | 5 |
    | `x` | 10 |
    | `l` | 50 |
    | `c` | 100 |
    | `d` | 500 |
    | `m` | 1,000 |

    There are many incorrect formulations, as `iix` → 8 or `id` → 499, and the code is not expected to parse these “correctly”.  (It should not produce them!)  However, both `iv` and `iiii` are frequently used to represent 4 (e.g. look at a clock face), so you should support this variation.

    For this task, produce two files:

    - `/lib/roman/hoon`

        Your library `/lib/roman/hoon` should expose two arms:

        - `++parse` accepts a `tape` text string containing a Roman numeral expression in lower or upper case and returns the corresponding `@ud` unsigned decimal value.  On failure to parse, call `!!` zapzap.
        - `++yield` accepts a `@ud` unsigned decimal value and returns the corresponding `tape` text string in lower case.

    - `/gen/roman/hoon`

        Provide a `%say` generator at `/gen/roman/hoon` which accepts a `tape` text string or a `@ud` unsigned decimal value and performs the appropriate conversion on the basis of the sample's type.

        **Note**:  This design pattern is not optimal since analysis over a union of some types can be difficult to carry out, and it would be better to either separate the generators or use a flag.  In this case, the pattern works because we are distinguishing an atom from a cell.

## Unit Tests

Following a principle of test-driven development, we compose a series of tests which allow us to rigorously check for expected behavior.

```hoon
/+  *test, *roman
|%
++  test-output-one
  =/  src  "i"
  =/  trg  1
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-two
  =/  src  "ii"
  =/  trg  2
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-three
  =/  src  "iii"
  =/  trg  3
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-four
  =/  src  "iv"
  =/  trg  4
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-four-var
  =/  src  "iiii"
  =/  trg  4
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-five
  =/  src  "v"
  =/  trg  5
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-six
  =/  src  "vi"
  =/  trg  6
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-seven
  =/  src  "vii"
  =/  trg  7
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-eight
  =/  src  "viii"
  =/  trg  8
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-nine
  =/  src  "ix"
  =/  trg  9
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-ten
  =/  src  "x"
  =/  trg  10
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-eleven
  =/  src  "xi"
  =/  trg  11
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-twelve
  =/  src  "xii"
  =/  trg  12
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-thirteen
  =/  src  "xiii"
  =/  trg  13
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-fourteen
  =/  src  "xiv"
  =/  trg  14
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-fifteen
  =/  src  "xv"
  =/  trg  15
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-sixteen
  =/  src  "xvi"
  =/  trg  16
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-seventeen
  =/  src  "xvii"
  =/  trg  17
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-eighteen
  =/  src  "xviii"
  =/  trg  18
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-nineteen
  =/  src  "xix"
  =/  trg  19
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-twenty
  =/  src  "xx"
  =/  trg  20
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-twenty-three
  =/  src  "xxiii"
  =/  trg  23
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-twenty-five
  =/  src  "xxv"
  =/  trg  25
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-twenty-seven
  =/  src  "xxvii"
  =/  trg  27
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-thirty-one
  =/  src  "xxxi"
  =/  trg  31
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-thirty-nine
  =/  src  "xxxix"
  =/  trg  39
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-forty-two
  =/  src  "xlii"
  =/  trg  42
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-forty-nine
  =/  src  "xlix"
  =/  trg  49
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-fifty
  =/  src  "l"
  =/  trg  50
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-sixty-two
  =/  src  "lxii"
  =/  trg  62
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-seventy-eight
  =/  src  "lxxviii"
  =/  trg  78
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-ninety-four-var
  =/  src  "xciiii"
  =/  trg  94
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-one-hundred
  =/  src  "c"
  =/  trg  100
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-one-hundred-thirty-three
  =/  src  "cxxxiii"
  =/  trg  133
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-four-hundred-ninety-nine
  =/  src  "cdxcix"
  =/  trg  499
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-five-hundred
  =/  src  "d"
  =/  trg  500
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-five-hundred-forty-eight
  =/  src  "dxlviii"
  =/  trg  548
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-six-hundred-sixty-nine
  =/  src  "dclxix"
  =/  trg  669
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-eight-hundred-eighty-eight
  =/  src  "dccclxxxviii"
  =/  trg  888
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-nine-hundred-ninety-nine
  =/  src  "cmxcix"
  =/  trg  999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-one-thousand
  =/  src  "m"
  =/  trg  1.000
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-one-thousand-nine-hundred-ninety-nine
  =/  src  "mcmxcix"
  =/  trg  1.999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-two-thousand-twenty-two
  =/  src  "mmxxii"
  =/  trg  2.022
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-output-three-thousand-nine-hundred-ninety-nine
  =/  src  "mmmcmxcix"
  =/  trg  3.999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (parse src)
  %+  expect-eq
    !>  trg
    !>  (parse (cuss src))
  ==
++  test-input-one
  =/  trg  "i"
  =/  src  1
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-two
  =/  trg  "ii"
  =/  src  2
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-three
  =/  trg  "iii"
  =/  src  3
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-four
  =/  trg  "iv"
  =/  src  4
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-five
  =/  trg  "v"
  =/  src  5
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-six
  =/  trg  "vi"
  =/  src  6
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-seven
  =/  trg  "vii"
  =/  src  7
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-eight
  =/  trg  "viii"
  =/  src  8
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-nine
  =/  trg  "ix"
  =/  src  9
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-ten
  =/  trg  "x"
  =/  src  10
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-eleven
  =/  trg  "xi"
  =/  src  11
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-twelve
  =/  trg  "xii"
  =/  src  12
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-thirteen
  =/  trg  "xiii"
  =/  src  13
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-fourteen
  =/  trg  "xiv"
  =/  src  14
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-fifteen
  =/  trg  "xv"
  =/  src  15
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-sixteen
  =/  trg  "xvi"
  =/  src  16
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-seventeen
  =/  trg  "xvii"
  =/  src  17
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-eighteen
  =/  trg  "xviii"
  =/  src  18
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-nineteen
  =/  trg  "xix"
  =/  src  19
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-twenty
  =/  trg  "xx"
  =/  src  20
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-twenty-three
  =/  trg  "xxiii"
  =/  src  23
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-twenty-five
  =/  trg  "xxv"
  =/  src  25
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-twenty-seven
  =/  trg  "xxvii"
  =/  src  27
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-thirty-one
  =/  trg  "xxxi"
  =/  src  31
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-thirty-nine
  =/  trg  "xxxix"
  =/  src  39
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-forty-two
  =/  trg  "xlii"
  =/  src  42
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-forty-nine
  =/  trg  "xlix"
  =/  src  49
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-fifty
  =/  trg  "l"
  =/  src  50
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-sixty-two
  =/  trg  "lxii"
  =/  src  62
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-seventy-eight
  =/  trg  "lxxviii"
  =/  src  78
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-one-hundred
  =/  trg  "c"
  =/  src  100
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-one-hundred-thirty-three
  =/  trg  "cxxxiii"
  =/  src  133
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-four-hundred-ninety-nine
  =/  trg  "cdxcix"
  =/  src  499
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-five-hundred
  =/  trg  "d"
  =/  src  500
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-five-hundred-forty-eight
  =/  trg  "dxlviii"
  =/  src  548
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-six-hundred-sixty-nine
  =/  trg  "dclxix"
  =/  src  669
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-eight-hundred-eighty-eight
  =/  trg  "dccclxxxviii"
  =/  src  888
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-nine-hundred-ninety-nine
  =/  trg  "cmxcix"
  =/  src  999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-one-thousand
  =/  trg  "m"
  =/  src  1.000
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-one-thousand-nine-hundred-ninety-nine
  =/  trg  "mcmxcix"
  =/  src  1.999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-two-thousand-twenty-two
  =/  trg  "mmxxii"
  =/  src  2.022
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
++  test-input-three-thousand-nine-hundred-ninety-nine
  =/  trg  "mmmcmxcix"
  =/  src  3.999
  ;:  weld
  %+  expect-eq
    !>  trg
    !>  (yield src)
  ==
--
```

## Solutions

_These solutions were submitted by the Urbit community as part of a competition in ~2022.6.  They are made available under both the [MIT license](https://mit-license.org/) and the [CC0 license](https://creativecommons.org/share-your-work/public-domain/cc0).  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_This solution was produced by ~sidnym-ladrut.  This code utilizes the Hoon parser tools like `++cook` and `++scan`, and in particular illustrates a strong ethic of [function encapsulation](https://en.wikipedia.org/wiki/Encapsulation_%28computer_programming%29)._

**`/lib/roman.hoon`**

```hoon
::  roman: roman numeral conversion library
::
=<
::  public core
|%
::  +parse: given a roman numeral, produce the equivalent arabic numeral
::
++  parse
  |=  roman=tape
  ^-  @ud
  ~|  'Input numeral has invalid syntax.'
  ?>  !=((lent roman) 0)
  |^  %+  scan  (cass roman)
      %+  cook  sum-up
      ;~  plug
        (parse-just (pow 10 3) 0 3)
        (parse-base (pow 10 2) 3)
        (parse-base (pow 10 1) 3)
        (parse-base (pow 10 0) 4)
        (easy ~)
      ==
  ::  +sum-up: sum up the contents of a given list
  ::
  ++  sum-up
    |=  l=(list @)
    (roll l add)
  ::  +parse-just: parse just the roman equivalent of given arabic [range] times
  ::
  ++  parse-just
    |=  [value=@ud range=[@ud @ud]]
    %+  cook  sum-up
    %+  stun  range
    %+  cold  value
    (jest (~(got by glyph-map) value))
  ::  +parse-base: parse the roman base of given base-10 arabic [0, reps] times
  ::
  ::    This function parses the *contextualized* roman base equivalent of a
  ::    given base-10 arabic value up to a given number of times. Crucially,
  ::    this applies roman numeral contextual rules, such as numeral ordering
  ::    and subtraction rules (e.g. iv=4, ix=9, id=invalid, etc.), to the given
  ::    base. In concrete terms, this means enforcing the following regex:
  ::
  ::    ```
  ::    R: Reps | N: Next (B*10)
  ::    B: Base | H: Half (B*5)
  ::
  ::    (BN|BH|H?B{0,R})
  ::    ```
  ::
  ++  parse-base
    |=  [base=@ud reps=@ud]
    =+  next=(mul base 10)
    =+  half=(mul base 5)
    ;~  pose
      (parse-just (sub next base) 1 1)
      (parse-just (sub half base) 1 1)
      %+  cook  sum-up
      ;~  plug
        (parse-just half 0 1)
        (parse-just base 0 reps)
        (easy ~)
      ==
      (easy 0)
    ==
  --
::  +yield: given an arabic numeral, produce the equivalent roman numeral
::
++  yield
  |=  arabic=@ud
  ^-  tape
  ~|  'Input value is out of range (valid range: [1, 3.999]).'
  ?>  &((gth arabic 0) (lth arabic 4.000))
  =<  +>
  %^  spin  glyph-list  [arabic ""]
  |=  [n=[@ud @t] a=[@ud tape]]
  ?:  (lth -.a -.n)  [n a]
  $(a [(sub -.a -.n) (weld +.a (trip +.n))])
--
::  private core
|%
::  +glyph-map: map of arabic glyphs to their roman equivalents
::
++  glyph-map
  ^-  (map @ud @t)
  (malt glyph-list)
::  +glyph-list: list of pairs of equivalent [arabic roman] glyphs
::
++  glyph-list
  ^-  (list [@ud @t])
  :~  :-  1.000   'm'
      :-  900    'cm'
      :-  500     'd'
      :-  400    'cd'
      :-  100     'c'
      :-  90     'xc'
      :-  50      'l'
      :-  40     'xl'
      :-  10      'x'
      :-  9      'ix'
      :-  5       'v'
      :-  4      'iv'
      :-  1       'i'
  ==
--
```

**`/gen/roman.hoon`**

```hoon
::  +roman: given arabic or roman numeral, produce the opposite
::
::    +roman @ud
::      given arabic numeral, generate roman equivalent
::    +roman tape
::      given roman numeral, generate arabic equivalent
::
/+  *roman
::
:-  %say
|=  [* [i=?(@ud tape) ~] ~]
:-  %noun
^-  ?(@ud tape)
?-  i
  ~   (parse i)
  @   (yield i)
  ^   (parse i)
==
```

### Solution #2

_This solution was produced by ~mocmex-pollen.  It particularly illustrates the use of `++cook` and `++pose` in constructing a parser-based solution._

**`/lib/roman.hoon`**

```hoon
::
::  A library for parsing and producing Roman numeral expressions.
::
=<
::
|%
::  +parse: produce the value of a Roman numeral expression
::
++  parse
  |=  expression=tape
  ^-  @ud
  %+  scan
    (cass expression)
  %-  full
  ;~  (comp |=([a=@ud b=@ud] (add a b)))
    (cook roman-value-unit (punt (numeral-rule %m)))
    (cook roman-value-unit (punt (numeral-rule %d)))
    (cook roman-value-unit (punt (numeral-rule %c)))
    (cook roman-value-unit (punt (numeral-rule %l)))
    (cook roman-value-unit (punt (numeral-rule %x)))
    (cook roman-value-unit (punt (numeral-rule %v)))
    (cook roman-value-unit (punt (numeral-rule %i)))
  ==
::  +yield: produce the Roman numeral for a given value
::
++  yield
  |=  n=@ud
  ^-  tape
  ?>  (gte n 1)
  ::
  =/  options  numerals-and-subtractives
  =/  final  *tape
  |-
  ?:  =(n 0)
    final
  ?~  options
    !!
  =/  roman=tape  -.i.options
  =/  value=@ud  +.i.options
  =/  expression=tape  (zing (reap (div n value) roman))
  %=  $
    n        (mod n value)
    options  t.options
    final    (weld final expression)
  ==
--
::
|%  
::  +numeral-rule: match valid sequences that begin with the given numeral
::
++  numeral-rule
  |=  numeral=?(%i %v %x %l %c %d %m)
  ?-  numeral
    %i  ;~(pose (jest 'iiii') (jest 'iii') (jest 'ii') (jest 'iv') (jest 'ix') (just 'i'))
    %v  (just 'v')
    %x  ;~(pose (jest 'xxx') (jest 'xx') (jest 'xc') (jest 'xl') (just 'x'))
    %l  (just 'l')
    %c  ;~(pose (jest 'ccc') (jest 'cc') (jest 'cm') (jest 'cd') (just 'c'))
    %d  (just 'd')
    %m  ;~(pose (jest 'mmm') (jest 'mm') (just 'm'))
  ==
::  +roman-value-unit: 0 if the unit is empty otherwise ++roman-value
::
++  roman-value-unit
  |=  roman=(unit @t)
  ^-  @ud
  ?~  roman
    0
  (roman-value (trip u.roman))
::  +roman-value: produce the value of a simple expression
::
::    "Simple" here means a single numeral, an additive series or 
::    a subtractive pair. ex: "i", "ii", "iv" but not "xi"
:: 
::    Caution: this will produce a value for an invalid Roman numeral and
::    a wrong value for "complex" expressions.
::
++  roman-value
  |=  roman=tape
  ^-  @ud
  ?~  roman
    !!
  ::
  =/  value-map  (malt numerals-and-subtractives)
  %+  fall
    ::  roman is a single numeral or a subtractive
    ::
    (~(get by value-map) roman)
  ::  roman is an additive series
  ::
  %+  mul
    (lent roman)
  (~(got by value-map) (trip i.roman))
::  +numerals-and-subtractives: a list of pairs of single numerals 
::  and valid subtractive pairs in descending order of value
::
++  numerals-and-subtractives
  ^-  (list [tape @ud])
  :~  ["m" 1.000]
      ["cm" 900]
      ["d" 500]
      ["cd" 400]
      ["c" 100]
      ["xc" 90]
      ["l" 50]
      ["xl" 40]
      ["x" 10]
      ["ix" 9]
      ["v" 5]
      ["iv" 4]
      ["i" 1]
  ==
--
```

**`/gen/roman.hoon`**

```hoon
::
::  %say the product of the conversion to/from a Roman numeral expression
::
::    The direction of conversion is determined by the type of the input.
::    tape -> Roman numeral expression to a quantity
::    @ud -> quantity to a Roman numeral expression
::
/+  *roman
::
:-  %say
::  caution - the type union in this spec is sensitive to the order of
::  its arguments: ?(tape @ud) results in fish-loop
::
|=  [* [value=?(@ud tape) ~] *]
^-  [%noun ?(@ud tape)]
:-  %noun
?:  ?=(@ud value)
  (yield value)
(parse value)
```

### Solution #3

_This solution was produced by ~mashex-masrex.  Notice how it utilizes a well-structured parser based on `++jest` and `++cold`._

**`/lib/roman.hoon`**

```hoon
::  Convert Roman numerals to Arabic numbers, or vice versa.
::
|%
::  +parse: accept a tape containing a roman numeral and produce the number
::
++  parse
  |=  numeral=tape  ^-  @ud
  ::  (the sum of arabic numbers that are found in the roman numeral)
  ::
  |^  (roll (scan (cuss numeral) (star as-arabic)) add)
  ::  +as-arabic: convert numeral characters into their numeric value
  ::
  ++  as-arabic
    ;~  pose
      (cold 4 (jest 'IV'))
      (cold 9 (jest 'IX'))
      (cold 1 (just 'I'))
      (cold 5 (just 'V'))
      (cold 40 (jest 'XL'))
      (cold 90 (jest 'XC'))
      (cold 10 (just 'X'))
      (cold 50 (just 'L'))
      (cold 400 (jest 'CD'))
      (cold 900 (jest 'CM'))
      (cold 100 (just 'C'))
      (cold 500 (just 'D'))
      (cold 1.000 (just 'M'))
    ==
  --
::  +yield: accept a decimal number and produce the corresponding roman numeral
::
++  yield
  |=  number=@ud  ^-  tape
  :: if, number is zero
  ::
  ?:  =(0 number)
    ::  then, end the list (i.e. conclude the tape)
    ::
    ~
  ::  else, if, number is one-thousand or greater
  ::
  ?:  (gte number 1.000)
    ::  then, append "m", and recurse subtracting one-thousand
    ::
    :-  'm'
    $(number (sub number 1.000))
  ::  else, if, number is nine-hundred or greater
  ::
  ?:  (gte number 900)
    ::  then, append "cm", and recurse subtracting nine-hundred
    ::
    :-  'c'  :-  'm'
    $(number (sub number 900))
  ::  else, if, number is five-hundred or greater
  ::
  ?:  (gte number 500)
    ::  then, append "d", and recurse subtracting five-hundred
    ::
    :-  'd'
    $(number (sub number 500))
  ::  else, if, number is four-hundred or greater
  ::
  ?:  (gte number 400)
    ::  then, append "cd", and recurse subtracting four-hundred
    ::
    :-  'c'  :-  'd'
    $(number (sub number 400))
  ::  else, if, number is one-hundred or greater
  ::
  ?:  (gte number 100)
    ::  then, append "c", and recurse subtracting one-hundred
    ::
    :-  'c'
    $(number (sub number 100))
  ::  else, if, number is ninety or greater
  ::
  ?:  (gte number 90)
    ::  then, append "xc", and recurse subtracting ninety
    ::
    :-  'x'  :-  'c'
    $(number (sub number 90))
  ::  else, if, number is fifty or greater
  ::
  ?:  (gte number 50)
    ::  then, append "l", and recurse subtracting fifty
    ::
    :-  'l'
    $(number (sub number 50))
  ::  else, if, number is forty or greater
  ::
  ?:  (gte number 40)
    ::  then, append "xl", and recurse subtracting forty
    ::
    :-  'x'  :-  'l'
    $(number (sub number 40))
  ::  else, if, number is ten or greater
  ::
  ?:  (gte number 10)
    ::  then, append "x", and recurse subtracting ten
    ::
    :-  'x'
    $(number (sub number 10))
  ::  else, if, number is nine or greater
  ::
  ?:  (gte number 9)
    ::  then, append "ix", and recurse subtracting nine
    ::
    :-  'i'  :-  'x'
    $(number (sub number 9))
  ::  else, if, number is five or greater
  ::
  ?:  (gte number 5)
    ::  then, append "v", and recurse subtracting five
    ::
    :-  'v'
    $(number (sub number 5))
  ::  else, if, number is four or greater
  ::
  ?:  (gte number 4)
    ::  then, append "iv", and recurse subtracting four
    ::
    :-  'i'  :-  'v'
    $(number (sub number 4))
  ::  else, append "i", and recurse subtracting one
  ::
  :-('i' $(number (sub number 1)))
--
```

**`/gen/roman.hoon`**

```hoon
::  roman: Convert Roman numerals to Arabic numbers, or vice versa.
::
/+  *roman
:-  %say
|=  [* [arabic-or-roman=$@(@ud tape) ~] ~]
:-  %noun
::  if, arabic-or-roman is null
::
?~  arabic-or-roman
  ::  then, produce zero
  0
::  else, if, arabic-or-roman is a cell
::
?^  arabic-or-roman
  ::  then, parse the tape of roman numerals
  ::
  (parse arabic-or-roman)
::  else, produce a roman numeral from the arabic number
::
(yield arabic-or-roman)
```

### Solution #4

_This solution was produced by ~fonnyx-nopmer.  It comes sans comments, and particularly demonstrates how to produce legible and idiomatic Hoon code without requiring comments._

**`/lib/roman.hoon`**

```hoon
|%
++  parse
  |=  t=tape  ^-  @ud
  =.  t  (cass t)
  =|  result=@ud
  |-
  ?~  t  result
  ?~  t.t  (add result (from-numeral i.t))
  =+  [a=(from-numeral i.t) b=(from-numeral i.t.t)]
  ?:  (gte a b)  $(result (add result a), t t.t)
  $(result (sub (add result b) a), t t.t.t)
++  yield
  |=  n=@ud  ^-  tape
  =|  result=tape
  =/  values  to-numeral
  |-
  ?~  values  result
  ?:  (gte n -.i.values)
    $(result (weld result +.i.values), n (sub n -.i.values))
  $(values t.values)
++  from-numeral
  |=  c=@t  ^-  @ud
  ?:  =(c 'i')  1
  ?:  =(c 'v')  5
  ?:  =(c 'x')  10
  ?:  =(c 'l')  50
  ?:  =(c 'c')  100
  ?:  =(c 'd')  500
  ?:  =(c 'm')  1.000
  !!
++  to-numeral
  ^-  (list [@ud tape])
  :*
    [1.000 "m"]
    [900 "cm"]
    [500 "d"]
    [400 "cd"]
    [100 "c"]
    [90 "xc"]
    [50 "l"]
    [40 "xl"]
    [10 "x"]
    [9 "ix"]
    [5 "v"]
    [4 "iv"]
    [1 "i"]
    ~
  ==
--
```

**`/gen/roman.hoon`**

```hoon
/+  *roman
:-  %say
|=  [* [x=$%([%from-roman tape] [%to-roman @ud]) ~] ~]
:-  %noun
^-  tape
?-  -.x
  %from-roman  "{<(parse +.x)>}"
  %to-roman  (yield +.x)
==
```
