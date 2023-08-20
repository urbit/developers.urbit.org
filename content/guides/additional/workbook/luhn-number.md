+++
title = "Luhn Number"
weight = 128
+++

## Challenge: Luhn Number

The Luhn test is used by some credit card companies to distinguish valid credit card numbers from what could be a random selection of digits.

A Luhn number is a sequence of digits that passes the following test:

1. Reverse the order of the digits.
2. Take the first, third, and every odd-numbered digit in the reversed digits and sum them to form `s1`
3. Taking the second, fourth, and every even-numbered digit in the reversed digits:
     1. Multiply each by two. Within each doubled digit, sum those digits (if the answer is greater than nine) to form partial sums.
     2. Sum the partial sums of the even digits to form `s2`
4. If `s1 + s2` ends in zero then the original number is in the form of a valid credit card number as verified by the Luhn test.

For example, if the trial number is 49927398716:

```
Reverse the digits:
  61789372994
Sum the odd digits:
  6 + 7 + 9 + 7 + 9 + 4 = 42 = s1
The even digits:
    1,  8,  3,  2,  9
  Two times each even digit:
    2, 16,  6,  4, 18
  Sum the digits of each multiplication:
    2,  7,  6,  4,  9
  Sum the last:
    2 + 7 + 6 + 4 + 9 = 28 = s2

s1 + s2 = 70 ends in zero, which means that 49927398716 passes the Luhn test
```

Your task for this challenge is as follows. First you will write a library file `lib/luhn-number` with a core containing an arm named `++validate`. `validate` will be a gate that takes as input a `tape` which is a sequence of digits, and returns either a `%.y` or `%.n` if the number is a Luhn number or not. 

Example usage:
```
> =ln -build-file %/lib/luhn-number/hoon
> (validate:ln "49927398716")
%.y
> (validate:ln "1234")
%.n
```

Next you will write a generator file `gen/luhn-number` which takes as input a `tape` which consists of digits or the `*` character, such as:
```
"*1*25**574*18403"
"****"
"584"
```

It will return a `(list tape)` which contains all of the Luhn numbers that fit that format. The numbers should be in lexicographic order (smallest to largest by first digit, then second digit, and so on). You may choose to import and use your `++validate` arm, or perhaps use some other strategy.

Example usage:
```
> +luhn-number "**123"
["01123" "15123" "20123" "39123" "44123" "58123" "63123" "77123" "82123" "96123" ~]

> +luhn-number "123"
~

> +luhn-number "49927398716"
[49927398716 ~]
```

Some notes: 
* We take the input as a `tape` rather than a `@ud` because a potential credit card number can have leading zeros.

* Note that in Hoon, we index starting from 0 -- so the first digit will be in the 0th index, second in 1st index, and so on.

* This website may be of use for both checking if a number is Luhn and generating a list from missing digits: https://www.dcode.fr/luhn-algorithm

* Don't worry about numbers with less than 2 digits, or improperly formatted input (with letters and spaces etc.). You can assume that the input tape will have the correct format.

##  Unit Tests

Following a principle of test-driven development, we compose a series of tests which allow us to rigorously check for expected behavior.

```hoon
/+  *test
/+  ln=luhn-number
/=  luhn-number  /gen/luhn-number
|%
::  test valid numbers
::
++  test-01
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "49927398716")
++  test-02
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "1234567812345670")
++  test-03
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "4417123456789105")
++  test-04
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "20210917131347022")
++  test-05
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "1806040794512")
++  test-06
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "9856849794512")
++  test-07
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "5995841300227")
++  test-08
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "00")
++  test-09
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "34")
++  test-10
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "00005991")
++  test-11
  %+  expect-eq
    !>  %.y
    !>  (validate:ln "02310568590238405")
::  test invalid numbers
::
++  test-12
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "1234")
++  test-13
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "92")
++  test-14
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "00001463")
++  test-15
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "754717798")
++  test-16
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "507274573")
++  test-17
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "2342352356198234238")
++  test-18
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "02310568590238406")
++  test-19
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "5019876543217144")
++  test-20
  %+  expect-eq
    !>  %.n
    !>  (validate:ln "220743131719012023")
::  test number generation
::
++  test-21
  %+  expect-eq
    !>  `(list tape)`["01123" "15123" "20123" "39123" "44123" "58123" "63123" "77123" "82123" "96123" ~]
    !>  (luhn-number "**123")
++  test-22
  %+  expect-eq
    !>  `(list tape)`~
    !>  (luhn-number "123")
++  test-23
  %+  expect-eq
    !>  `(list tape)`["12345690" ~]
    !>  (luhn-number "12345690")
++  test-24
  %+  expect-eq
    !>  `(list tape)`["023259872" "123259871" "223259870" "323259879" "423259878" "523259877" "623259876" "723259875" "823259874" "923259873" ~]
    !>  (luhn-number "*2325987*")
++  test-25
  %+  expect-eq
    !>  `(list tape)`["845927593912820" ~]
    !>  (luhn-number "8459275*3912820")
++  test-26
  %+  expect-eq
    !>  `(list tape)`["00" "18" "26" "34" "42" "59" "67" "75" "83" "91" ~]
    !>  (luhn-number "**")
++  test-27
  %+  expect-eq
    !>  `(list tape)`["4002" "4192" "4242" "4382" "4432" "4572" "4622" "4762" "4812" "4952" ~]
    !>  (luhn-number "4**2")
++  test-28
  %+  expect-eq
    !>  `(list tape)`["10017" "10157" "10207" "10397" "10447" "10587" "10637" "10777" "10827" "10967" "11007" "11197" "11247" "11387" "11437" "11577" "11627" "11767" "11817" "11957" "12047" "12187" "12237" "12377" "12427" "12567" "12617" "12757" "12807" "12997" "13037" "13177" "13227" "13367" "13417" "13557" "13607" "13797" "13847" "13987" "14027" "14167" "14217" "14357" "14407" "14597" "14647" "14787" "14837" "14977" "15057" "15107" "15297" "15347" "15487" "15537" "15677" "15727" "15867" "15917" "16097" "16147" "16287" "16337" "16477" "16527" "16667" "16717" "16857" "16907" "17087" "17137" "17277" "17327" "17467" "17517" "17657" "17707" "17897" "17947" "18077" "18127" "18267" "18317" "18457" "18507" "18697" "18747" "18887" "18937" "19067" "19117" "19257" "19307" "19497" "19547" "19687" "19737" "19877" "19927" ~]
    !>  (luhn-number "1***7")
--
```

##  Solutions

_These solutions were submitted by the Urbit community as part of a competition in ~2023.6.  They are made available under the MIT License and CC0.  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_By ~dozreg-toplud._

`lib/luhn-number.hoon`
```hoon
::  lib/luhn-number.hoon
::  Library for HSL challenge #3
::
|%
::  ++validate: gate defined in the challenge
::
++  validate
  |=  a=tape
  ^-  ?
  =.  a  (flop a)
  =/  a-digits=(list @)  (turn a (cury slav %ud))
  =/  s1=@  (roll (skim-odd a-digits) add)
  =;  s2=@
    =(0 (mod (add s1 s2) 10))
  %+  roll
    (skim-even a-digits)
  ::  (gate that adds digits of 2*i to the accumulator)
  ::
  |=  [i=@ acc=@]
  =+  i2=(mul i 2)
  :(add acc (div i2 10) (mod i2 10))
::  ++skim-odd: return elements of a list with odd indices (1-indexed)
::
++  skim-odd
  |*  a=(list)
  ^+  a
  ?~  a
    ~
  ?~  t.a
    ~[i.a]
  [i.a $(a t.t.a)]
::  ++skim-even: return elements of a list with even indices (1-indexed)
::
++  skim-even
  |*  a=(list)
  ^+  a
  ?:  |(?=(~ a) ?=(~ t.a))
    ~
  [i.t.a $(a t.t.a)]
::
--
```

`gen/luhn-number.hoon`
```hoon
::  gen/luhn-number.hoon
::  Naked generator for HSL challenge #3
::
/+  *luhn-number
::
|=  a=tape
^-  (list tape)
=*  this-gate  ..$
=/  index-tar=(unit @)  (find "*" a)
::  if no * in `a`,
::
?~  index-tar
  ::  then return empty list if `a` is not a Luhn number, else return list
  ::  with `a`
  ::
  ?.  (validate a)
    ~
  ~[a]
::  else, replace first * with a digit, call this gate for each digit 0-9,
::  weld the results
::
=/  dry-snap  ^~((bake snap ,[tape @ char]))
%-  zing
%+  turn
  "0123456789"
(cork (cury (cury dry-snap a) u.index-tar) this-gate)
```

### Solution #2

_By ~pardun-nollev._

`lib/luhn-number.hoon`
```hoon
|%
++  validate
  |=  input=tape
  =/  input  (flop input)
  =(0 (mod (add (get-s1 input) (get-s2 input)) 10))
++  get-s1
  |=  input=tape
  ^-  @ud
  (roll (odd-digits input) add)
  ++  get-s2
  |=  input=tape
  ^-  @ud
  (roll (multiply-digits (convert-digits-to-text (double-digits input))) add)
:: take a tape
:: convert to @ud and sum
  ++  sum-digits
  |=  input=tape
  ^-  @ud
  (roll (turn input |=(a=@t (rash a dem))) add)
:: take list of tapes
:: convert to digits
:: multiply each list of digits
  ++  multiply-digits
  |=  input=(list tape)
  ^-  (list @ud)
  (turn input |=(a=tape (sum-digits a)))
:: take each number
:: convert to tape
++  convert-digits-to-text
  |=  input=(list @ud)
  ^-  (list tape)
  (turn input |=(a=@ud (scow %ud a)))
:: get even digits and multiply by two
++  double-digits
  |=  input=tape
  ^-  (list @ud)
  (turn (even-digits input) |=(a=@ud (mul a 2)))
++  get-element
  |=  [idx=@ud input=tape]
  ^-  tape
  ?:  (gte (lent input) +(idx))
  `tape`~[(snag idx input)]
  ~
++  odd-digits
  |=  input=tape
  ^-  (list @ud)
  =/  output=tape  ~
  |- 
  ?:  =(input ~)
    (turn output |=(a=@t (rash a dem)))
  %=  $
    output  (weld output (get-element 0 input))
    input  (oust [0 2] input)
  ==
++  even-digits
  |=  input=tape
  ^-  (list @ud)
  =/  output=tape  ~
  |- 
  ?:  =(input ~)
    (turn output |=(a=@t (rash a dem)))
  %=  $
    output  (weld output (get-element 1 input))
    input  (oust [0 2] input)
  ==
--
```

`gen/luhn-number.hoon`

```hoon
/+  luhn-number
|=  input=tape
=<
(skim `(list tape)`(get-permutations input) validate:luhn-number)
|%
++  digits  "0123456789"
++  get-permutations
  |=  input=tape
  =/  output=(list tape)  ~[input]
  =/  idx  0
  |- 
  ?:  =(idx (lent input))
    output
  %=  $
    output  (churn-numbers idx output)
    idx  +(idx)
  ==
++  churn-numbers
  |=  [idx=@ud input=(list tape)]
  ^-  (list tape)
  (zing (turn input |=(a=tape (generate-perms idx a))))
++  generate-perms
  |=  [idx=@ud input=tape]
  ^-  (list tape)
  ?:  =((snag idx input) '*')
  (turn digits |=(a=@t (snap input idx a)))
  ~[input]
--
```

### Solution #3

_By ~motdeg-bintul_

`lib/luhn-number`

```hoon
::  lib/luhn-number.hoon
::  Your code goes here
::
|%
++  validate
|=  a=tape
&(=((checkdits a) 0) (gth (lent a) 0)) 
++  checkdits
|=  a=tape
=/  totalsum  (add (s1 a) (s2 a))
=/  sumtape  (trip `@t`(scot %ud totalsum))
=/  digits  (scan sumtape (star dit))
::  ~&  (odds a)
::  ~&  (doubler a)
::  ~&  `(list @)`(getsums (doubler a))
::  ~&  (s1 a)
::  ~&  (s2 a)
::  ~&  totalsum
?:  (lte totalsum 9)
  +2:digits
(snag (sub (lent +3:digits) 1) `(list @ud)`+3:digits)
++  odds
|=  a=tape
=/  reverse  (flop a)
=/  count  0
|-
^-  (list @ud)
|-
?:  (gte count (lent reverse))
  ~
:-  (scan (trip (snag count reverse)) dit)
$(count (add 2 count))
++  s1
|=  a=tape
(roll `(list @ud)`(odds a) add)
++  evens
|=  a=tape
=/  reverse  (flop a)
=/  count  1
|-
^-  (list @ud)
|-
?:  (gte count (lent reverse))
  ~
:-  (scan (trip (snag count reverse)) dit)
$(count (add 2 count))
++  double
|=  [a=@]
(mul 2 a)
++  doubler
|=  a=tape
(turn `(list @ud)`(evens a) double)
++  adddit
|=  [a=(list @ud) b=@ud]
=/  list1  a
=/  list2  `(list @t)`(turn list1 (cury scot %ud))
=/  count  b
=/  digits  (scan (trip (snag count list2)) (star dit))
=/  d1  (snag 0 digits)
?:  =((lent digits) 1)
  `@ud`d1
?:  (gth (lent digits) 1)
  `@ud`(add d1 (snag 1 digits))
~
++  getsums
|=  a=(list @ud)
=/  nums  a
=/  count  0
|-
?:  (lth count (lent nums))
:-  (adddit nums count)
$(count (add 1 count))
?:  =(count (lent nums))
  ~
$(count (add 1 count))
++  s2
|=  a=tape
=/  nums  (doubler a)
(roll `(list @)`(getsums nums) add)
--
```

`gen/luhn-number`

```hoon
::  gen/luhn-number.hoon
::  Your code goes here
::
/=  ln  /lib/luhn-number
|=  a=tape
=<
(checkmissing a)
|%
  ++  missingnums
  |=  a=tape
  =/  count  0
  |-
  ?:  =(count (lent a))
    ~
  ?:  =((snag count a) '*')
  :-  count
  $(count (add 1 count))
  ?:  =(count (sub (lent a) 1))
    ~
  $(count (add 1 count))
  ++  replaceast
  |=  a=tape
  =/  pos  `(list @)`(missingnums a)
  =/  count  0
  =/  newtape  a
  =/  num  `@t`(scot %ud 0)
  |-
  ?:  =(count (sub (lent pos) 1))
    `(list @t)`(snap newtape (snag count pos) num)
  %=  $
    newtape  (snap newtape (snag count pos) num)
    count  (add count 1)
  ==
  ++  replacedigits
  |=  [a=tape b=@ud]
  =/  count  0
  =/  dits  (trip (crip (replaceast a)))
  =/  newdits  (a-co:co b) 
  =/  flopdits  (flop newdits)
  =/  indexcap  (sub (lent flopdits) 1)
  =/  pos  (flop `(list @ud)`(missingnums a))
  =/  newnum  `tape`dits
  |-
  ?:  =(count (lent newdits))
    newnum
  %=  $
    newnum  `tape`(snap newnum (snag count pos) (snag count flopdits))
    count  (add 1 count)
  ==
  ++  testnewnum
  |=  a=tape
  =/  format  a
  =/  count  0
  =/  countdit  (a-co:co count)
  =/  newnum  `tape`~
  =/  pos  `(list @ud)`(missingnums format)
  =/  dgtlent  (lent pos)
  |-
  ^-  (list tape)
  ?:  &(=((lent (a-co:co count)) (add 1 dgtlent)) =((validate:ln newnum) %.y))
    [newnum ~]
  ?:  =((lent (a-co:co count)) (add 1 dgtlent))
    ~
  ?:  =((validate:ln newnum) %.y)
  :-  newnum
  %=  $
    count  (add 1 count)
    newnum  (replacedigits format count)
    countdit  (a-co:co count)
  ==
  ?:  =((lent countdit) (add 1 dgtlent))
    ~
  %=  $
    count  (add 1 count)
    newnum  (replacedigits format count)
    countdit  (trip `@t`(scot %ud count))
  ==
  ++  checkmissing
  |=  a=tape
  ?:  &(=((missingnums a) ~) =((validate:ln a) %.y))
    `(list tape)`[a ~]
  (testnewnum a)
--
```
