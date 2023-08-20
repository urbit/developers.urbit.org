+++
title = "ABC Blocks"
weight = 11
+++

## Challenge: ABC Blocks

You are given a collection of blocks with two letters of the alphabet on each block. A complete alphabet is guaranteed among all sides of the blocks. You would like to check if a given word can be written with the provided set of blocks.

An example set of blocks:
```
 (F E)
 (A W)
 (Q V)
 (B M)
 (X H)
 (N P)
 (I Z)
 (G U)
 (S R)
 (K Y)
 (T L)
 (O C)
 (J D)
 (A N)
 (O B)
 (E R)
 (F S)
 (L Y)
 (P C)
 (Z M)
```

Your task for this challenge is to write a generator `abc-blocks`. It takes a cell of two arguments. The first argument is a `(list (pair @t @t))` which represents the input set of blocks. The second argument is a `@t` which represents the word that you'd like to check.

Your generator should first check if the input blocks cover all letters of the alphabet. If not, the generator should fail (possibly returning an error message). It should also check if the input word only has alphabetical characters (no spaces, numbers, or special characters). Otherwise it should fail. Then, it should check whether the word can be spelled with the blocks, either returning a `%.y` or `%.n`. It should not care about case, for the blocks or for the word.

Example usage:
```
> +abc-blocks [[['a', 'b'] ['c' 'd'] ['e' 'f'] ~] 'fad']
dojo: naked generator failure

> +abc-blocks [[['a', 'b'] ['c' 'd'] ['e' 'f'] ['g' 'h'] ['i' 'j'] ['k' 'l'] ['m' 'n'] ['o' 'p'] ['q' 'r'] ['s' 't'] ['u 'v'] ['w' 'x] ['y' z] ~] '12%-3']
dojo: naked generator failure

> +abc-blocks [[['a', 'B'] ['C' 'd'] ['e' 'F'] ['G' 'h'] ['i' 'J'] ['K' 'l'] ['m' 'N'] ['o' 'P'] ['Q' 'r'] ['s' 'T'] ['U 'v'] ['w' 'X'] ['y' Z'] ~] 'cat']
%.y

> +abc-blocks [[['a', 'B'] ['C' 'd'] ['e' 'F'] ['G' 'h'] ['i' 'J'] ['K' 'l'] ['m' 'N'] ['o' 'P'] ['Q' 'r'] ['s' 'T'] ['U 'v'] ['w' 'X'] ['y' Z'] ~] 'CAT']
%.y

> +abc-blocks [[['a', 'B'] ['C' 'd'] ['e' 'F'] ['G' 'h'] ['i' 'J'] ['K' 'l'] ['m' 'N'] ['o' 'P'] ['Q' 'r'] ['s' 'T'] ['U 'v'] ['w' 'X'] ['y' Z'] ~] 'BAT']
%.n
```

##  Unit Tests

Following a principle of test-driven development, we compose a series of tests which allow us to rigorously check for expected behavior.

```hoon
/+  *test
/=  abc-blocks  /gen/abc-blocks
|%
::  test for failure of incomplete alphabet
::
++  test-01
  =/  blocks  `(list (pair @t @t))`[['a' 'b'] ['c' 'd'] ['e' 'f'] ['g' 'h'] ['i' 'j'] ['k' 'l'] ['m' 'n'] ['o' 'p'] ['q' 'q'] ['s' 't'] ['u' 'v'] ['w' 'x'] ['y' 'z'] ~]
  =/  word  `@t`'foo'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-02
  =/  blocks  `(list (pair @t @t))`[['a' 'b'] ['c' 'd'] ['e' 'f'] ['g' 'h'] ['i' 'j'] ['k' 'l'] ['m' 'n'] ['q' 'r'] ['s' 't'] ['u' 'v'] ['w' 'x'] ['y' 'z'] ~]
  =/  word  `@t`'foo'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-03
  =/  blocks  `(list (pair @t @t))`[['A' 'B'] ['C' 'D'] ['E' 'F'] ['G' 'H'] ['I' 'J'] ['K' 'L'] ['M' 'N'] ['O' 'P'] ['Q' 'R'] ['S' 'A'] ['U' 'V'] ['W' 'X'] ['Y' 'Z'] ~]
  =/  word  `@t`'foo'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-04
  =/  blocks  `(list (pair @t @t))`[['A' 'B'] ['C' 'D'] ['e' 'f'] ['G' 'H'] ['I' 'J'] ['K' 'L'] ['M' 'N'] ['O' 'P'] ['Q' 'R'] ['S' 'A'] ['U' 'V'] ['W' 'X'] ['Y' 'Z'] ['A' 'B'] ['j' 'x']~]
  =/  word  `@t`'foo'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-05
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'foo'
  %-  expect-fail  |.  (abc-blocks blocks word)
::  test for failure of input word
::
++  test-06
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'foo bar'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-07
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'foo1bar'
  %-  expect-fail  |.  (abc-blocks blocks word)
++  test-08
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'foo!bar'
  %-  expect-fail  |.  (abc-blocks blocks word)
::  test for success with various capitalizations and alphabets
::
++  test-09
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'TRAP'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
++  test-10
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'trap'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
++  test-11
  =/  blocks  `(list (pair @t @t))`[['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'tRaP'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
++  test-12
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'a'] ['c' 't'] ['r' 'o'] ['p' 'n'] ['e' 'y'] ~]
  =/  word  `@t`'TRAP'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
++  test-13
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'A'] ['c' 't'] ['R' 'o'] ['p' 'n'] ['e' 'y'] ~]
  =/  word  `@t`'trap'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
++  test-14
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'A'] ['c' 't'] ['R' 'o'] ['p' 'n'] ['e' 'y'] ['x' 'y'] ['a' 'b'] ~]
  =/  word  `@t`'fsixqhgjvtrnyyb'
  %+  expect-eq
    !>  %.y
    !>  (abc-blocks blocks word)
::  test for being unable to make a word
::
++  test-15
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'A'] ['c' 't'] ['R' 'o'] ['p' 'n'] ['e' 'y'] ['x' 'y'] ['a' 'b'] ~]
  =/  word  `@t`'fsixqhgjvtrnyyyb'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
++  test-16
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'A'] ['c' 't'] ['R' 'o'] ['p' 'n'] ['e' 'y'] ['x' 'y'] ['a' 'b'] ~]
  =/  word  `@t`'fsixqhgujvtrnyyb'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
++  test-17
  =/  blocks  `(list (pair @t @t))`[['f' 'm'] ['w' 's'] ['i' 'b'] ['d' 'x'] ['q' 'k'] ['z' 'h'] ['g' 'l'] ['u' 'j'] ['v' 'A'] ['c' 't'] ['R' 'o'] ['p' 'n'] ['e' 'y'] ['x' 'y'] ['a' 'b'] ~]
  =/  word  `@t`'AAA'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
++  test-18
  =/  blocks  `(list (pair @t @t))`[['A' 'B'] ['C' 'D'] ['E' 'F'] ['G' 'H'] ['I' 'J'] ['K' 'L'] ['M' 'N'] ['O' 'P'] ['Q' 'R'] ['S' 'T'] ['U' 'V'] ['W' 'X'] ['Y' 'Z'] ~]
  =/  word  `@t`'AGENTT'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
++  test-19
  =/  blocks  `(list (pair @t @t))`[['A' 'B'] ['C' 'D'] ['E' 'F'] ['G' 'H'] ['I' 'J'] ['K' 'L'] ['M' 'N'] ['O' 'P'] ['Q' 'R'] ['S' 'T'] ['U' 'V'] ['W' 'X'] ['Y' 'Z'] ['S' 'T'] ~]
  =/  word  `@t`'AGENTtT'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
++  test-20
  =/  blocks  `(list (pair @t @t))`[['A' 'Z'] ['A' 'Z'] ['F' 'M'] ['W' 'S'] ['I' 'B'] ['D' 'X'] ['Q' 'K'] ['Z' 'H'] ['G' 'L'] ['U' 'J'] ['V' 'A'] ['C' 'T'] ['R' 'O'] ['P' 'N'] ['E' 'Y'] ~]
  =/  word  `@t`'ZAZAZ'
  %+  expect-eq
    !>  %.n
    !>  (abc-blocks blocks word)
--
```

##  Solutions

_These solutions were submitted by the Urbit community as part of a competition in ~2023.6.  They are made available under the MIT License and CC0.  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_By ~dozreg-toplud.  In the process, he found and fixed a bug in the implementation of `++curr`._

```hoon
::  +abc-blocks: a solution to the HSL challenge #2
::
::    https://github.com/tamlut-modnys/template-hsl-abc-blocks
::    Takes a cell of arguments [blocks=(list (pair @t @t)) word=@t],
::    produces a flag.
::    Crashes if the alphabet is not represented in the blocks, or if there are
::    non-alphabetical characters in the blocks or in the word.
::    Produces %.y if the word can be written with the given list of blocks,
::    %.n otherwise
::
::    Solving this challenge revealed a bug in ++curr implementation! Refer to
::    the bottom of the file.
::
|^
::  Main part:
::
|=  [blocks=(list (pair @t @t)) word=@t]
^-  ?
=/  word-tape=tape  (trip word)
::  Convert input values to lowercase
::
=.  word-tape  (cass word-tape)
=.  blocks
  %+  turn
    blocks
  |=  [a=@t b=@t]
  ^-  (pair @t @t)
  :-  (crip (cass (trip a)))
  (crip (cass (trip b)))
::  Define alphabet
::
=/  alphabet=(set @t)  (silt "abcdefghijklmnopqrstuvwxyz")
::  Assert: only alphabetical characters in the blocks
::
?.  %+  levy
      blocks
    |=  [a=@t b=@t]
    ^-  ?
    &((~(has in alphabet) a) (~(has in alphabet) b))
  ~_  leaf+"non-alphabetical character in blocks"
  !!
::  Assert: only alphabetical characters in the word
::
?.  %+  levy
      word-tape
    |=  =cord
    ^-  ?
    (~(has in alphabet) cord)
  ~_  leaf+"non-alphabetical character in word"
  !!
::  Assert: complete alphabet among the blocks
::
?.  ::  Iterate for block list indices i:
    ::
    =+  i=0
    |-  ^-  ?
    ::  if the alphabet set is empty, then the blocks contain all the letters
    ::
    ?:  =(~ alphabet)
      %.y
    ::  else, if we reached the end of the block list, then the opposite is true
    ::
    ?:  =(i (lent blocks))
      %.n
    ::  else, delete letters on a block from the alphabet and continue
    ::
    =+  [a b]=(snag i blocks)
    $(i +(i), alphabet (~(del in (~(del in alphabet) b)) a))
  ~_  leaf+"not complete alphabet in blocks"
  !!
::  check if we can compose the word with the blocks
::
(check blocks word-tape)
::
::  Helping functions
::  ++check: checks if the word can be composed with the given blocks
::
++  check
  |=  [blocks=(list (pair @t @t)) word=tape]
  ^-  ?
  ::  Self-reference
  ::
  =*  this-gate  ..$
  ::  The word can be composed if it's empty, ...
  ::
  ?~  word  %.y
  ::  ... or if the list of indices of blocks that contain i.word is not empty
  ::  and t.word can be composed with at least one list of the blocks made by
  ::  removing one of the blocks that contain i.word.
  ::
  ::  Logical OR on a list (%.n if the list is empty)
  ::
  %+  lien
    ::  (list of lists of blocks made by removing one block that contains
    ::  i.word for each such block)
    ::
    %+  turn
      ::  (list of block indices that contain i.word)
      ::
      (find-in-blocks i.word blocks)
    ::  (gate that removes a block from a list of blocks by an index)
    ::
    (curr (curr oust blocks) 1)
  ::  (gate that applies ++check to a given list of blocks and t.word)
  ::
  (curr this-gate t.word)
::  ++  find-in-blocks: returns a list of block indices that contain
::  a given letter
::
++  find-in-blocks
  |=  [letter=@t blocks=(list (pair @t @t))]
  ^-  (list @)
  =+  i=0
  =|  =(list @)
  ::  Iterate over elements of blocks
  ::
  |-
  ?~  blocks
    list
  ::  If a block contains the letter, append its index to the list
  ::
  =?  list  |(=(letter -:i.blocks) =(letter +:i.blocks))  (snoc list i)
  $(i +(i), blocks t.blocks)
::  ++curr: rewrite ++curr from stdlib because the original has a bug
::  (https://github.com/urbit/urbit/issues/6655)
::
++  curr
  |*  [a=$-(^ *) c=*]
  |*  b=_,.+<-.a
  (a b c)
::
--
```

### Solution #2

_By ~bantus-follus_

```hoon
|=  [blocks=(list (pair @t @t)) word=@t]
=<
=/  alphacheck  (alphabet-check merged-blocks)
?.  (character-check word)
    ~|  "Input word contains invalid characters."  !!
=/  spellcheck  (spell-check word)
spellcheck
|%
++  alphabet  "abcdefghijklmnopqrstuvwxyz"
::
::  merges all blocks into a single tape
++  merged-blocks  (merge blocks)
::
::  turns all blocks into individual tapes
++  tape-blocks    (turn (turn (turn (turn blocks pair-to-list) crip) trip) cass)
++  merge
    |=  blocks=(list (pair @t @t))
    ^-  tape
        (cass (trip (crip `(list @t)`(zing (turn blocks pair-to-list)))))
::
::  converts each pair to a (list @t)
++  pair-to-list
            |=  input=(pair @t @t)
            ^-  (list @t)
                [-:input +:input ~]
::
::  checks if input blocks cover all letters of the alphabet
++  alphabet-check
    |=  input=tape
    ^-  ?
        =/  i  0
        |-
        ?:  =(i 26)
            %.y
        ?~  (find [(snag i alphabet)]~ input)
            ~|  "Full alphabet not found. {<(snag i alphabet)>} not in blocks"  !!
        $(i +(i))
::
::  checks if input word has valid chaaracters. %.y means all characters are valid
++  character-check
    |=  word=@t
    ^-  ?
        =/  i  0
        =/  tapeword  (cass (trip word))
        |-
        ?:  =(+(i) (lent tapeword))
            %.y
        ?~  (find [(snag i tapeword)]~ alphabet)
            %.n
        $(i +(i))
::
::  checks if the word can be spelled using the input blocks
++  spell-check
    |=  word=@t
    ^-  ?
        =/  tapeword     (cass (trip word))
        =/  tape-blocks  tape-blocks
        =/  i  0
        =/  letter  (snag i tapeword)
        |-
        ?:  =(+(i) (lent tapeword))
            =/  blockcheck  (check-blocks [tape-blocks letter])
                ?.  check:blockcheck
                    %.n
            %.y
        =/  blockcheck  (check-blocks [tape-blocks letter])
        ?.  check:blockcheck
            %.n
        $(i +(i), letter (snag +(i) tapeword), tape-blocks (oust [num:blockcheck 1] tape-blocks))
::  cycles through blocks, checking for a letter
++  check-blocks
    |=  [tape-blocks=(list tape) letter=@t]
    ^-  [num=@ check=?]
        =/  i  0
        =/  block  (snag i tape-blocks)
        |-
        ?:  =(+(i) (lent tape-blocks))
            ?~  (find [letter]~ block)
                [~ %.n]
            [i %.y]
        ?~  (find [letter]~ block)
            $(i +(i), block (snag +(i) tape-blocks))
        [i %.y]
    --
```

### Solution #3
_By ~dannul-bortux_

```hoon
!:
|=  [inlist=(list [@t @t]) inword=@t]
^-  $?(%.y %.n)
::  If, input list is empty
::
?:  =(0 (lent inlist))
  ::  Then, throw error
  ::
  ~|  'Error - input list cannot be empty'
  !!
=<  (validate-input inlist (cass (trip inword)))
|%
++  validate-input
  |=  [blocks=(list [@t @t]) cword=tape]
  =/  lblocks  (to-lowercase blocks)
  ?:  ?&  (validate-alpha-only cword)
          (validate-complete-alpha lblocks)
          (validate-word lblocks cword)
        ==
    %.y
  %.n
++  validate-alpha-only
  |=  w=tape
  =/  i  0
  :: =/  tword  (trip w)
  |-
  ?:  =(i (lent w))
    %.y
  ?.  ?&  (gte `@ud`(snag i w) 97)
          (lte `@ud`(snag i w) 122)
      ==
    !!
  %=  $
    i  +(i)
  ==
++  validate-complete-alpha
  |=  blocks=(list [@t @t])
  =/  alphabet  "abcdefghijklmnopqrstuvwxyz"
  =/  bltape  (block-taper blocks)
  :: ~&  "bl tape is {<bltape>}"
  :: =/  bltape  "abcdefghijklmnopqrstuvwxyz"
  =/  i  0
  |-
  ?:  =(i (lent alphabet))
  :: ~&  "returning yes"
    %.y
  ?:  =(~ (find (trip (snag i alphabet)) bltape))
      :: ~&  "returning no at letter: {<(snag i alphabet)>}"
    !!
  %=  $
    :: alphabet  (remove-letters alphabet (snag i blocks))
    i  +(i)
  ==
  :: %.n
  :: ++  remove-letters
  ::   |=  [in=tape let=[@t @t]]
  ::   ~&  "removing letters"

  ::   in
++  block-taper
    |=  b=(list [@t @t])
    =/  i  0
    =/  bltape  *tape
    |-
    ?:  =(i (lent b))
      bltape
    :: ~&  +2:(snag i `(list [@t @t])`b)
    %=  $
      bltape  (snoc (snoc bltape +2:(snag i `(list [@t @t])`b)) +3:(snag i `(list [@t @t])`b))
      :: bltape  (snoc bltape 'a')
      i  +(i)
    ==
++  validate-word
    |=  [blocks=(list [@t @t]) cword=tape]
    =/  wordcombos  `(list tape)`(get-combos blocks)
    :: ~&  "validating word"
    :: ~&  wordcombos
    =/  i  0
    |-
    ?:  =(i (lent wordcombos))
      %.n
      :: ~&  (snag i wordcombos)
    ?:  (word-compare (snag i wordcombos) cword)
      %.y
      %=  $
        i  +(i)
      ==
  :: ?:  ?&  (validate-alph-aonly )
  ::         (validate-complete-alpha )
  ::         (validate-word )
  ::       ==
    :: %.y
  :: %.n
++  get-combos
|=  n=(list [@t @t])
=/  i  1
=/  outlist  `(list tape)`(snoc `(list tape)`(snoc *(list tape) (trip +2:(snag 0 `(list [@t @t])`n))) (trip +3:(snag 0 `(list [@t @t])`n)))
:: ~&  outlist
|-
?:  =(i (lent n))
  outlist
:: ?:  =(i  0)
:: %=  $
::   outlist  (snoc `(list tape)`(snoc `(list tape)`outlist (trip +2:(snag 0 `(list [@t @t])`n))) (trip +3:(snag 0 `(list [@t @t])`n)))
::   i  +(i)
:: ==
=/  j  0
=/  temp  *(list tape)
|-
?:  =(j (lent outlist))
  %=  ^$
    outlist  temp
    i  +(i)    
  ==
%=  $
  :: temp  (snoc (snoc `(list tape)`outlist (trip +2:(snag 0 `(list [@t @t])`n))) (trip +3:(snag 0 `(list [@t @t])`n)))
  temp  (snoc `(list tape)`(snoc `(list tape)`temp (snoc (snag j outlist) +2:(snag i `(list [@t @t])`n))) (snoc (snag j outlist) +3:(snag i `(list [@t @t])`n)))
  j  +(j)
==
:: %=  $
::   i  +(i)
::   j  3
:: ==
++  word-compare
|=  [combo=tape cword=tape]
=/  i  0
:: ~&  combo
:: ~&  cword
|-
:: ~&  combo
?:  =(i (lent cword))
  %.y
?:  =(~ (find (trip (snag i cword)) combo))
  %.n
%=  $
  combo  (oust [+3:(find (trip (snag i cword)) combo) 1] combo)
  i  +(i)
==
++  to-lowercase
    |=  blocks=(list [@t @t])
    =/  lcase  *(list [@t @t])
    =/  i  0
    |-
    ?:  =(i (lent blocks))
      :: lcase
      :: ~&  lcase
      lcase
    =/  m  (crip (cass (trip +2:(snag i blocks))))
    =/  n  (crip (cass (trip +3:(snag i blocks))))
    %=  $
      lcase  (snoc `(list [@t @t])`lcase [m n])
      :: lcase  (snoc `(list [@t @t])`lcase ['a' 'b'])
      i  +(i)
    ==
    :: blocks
  :: %.n
--
```
