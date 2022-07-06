+++
title = "Hoon School Live Competition"
date = "2022-07-06"
description = "Reporting out on the HSL competition and rebooting the Hoon Workbook."
[extra]
author = "N E Davis"
ship = "~lagrev-nocfep"
image = "https://storage.googleapis.com/media.urbit.org/blog/hsl-competition.png"
+++

![](https://storage.googleapis.com/media.urbit.org/blog/hsl-competition.png)

#   Hoon School Live Competition

##  The Competition

At the conclusion of Hoon School Live, the Urbit Foundation sponsored a short coding competition for finishers.  Three challenges were issued in June:

1. Calculating [Rhonda numbers](https://mathworld.wolfram.com/RhondaNumber.html)
2. Parsing and producing Roman numerals
3. Making tools for titling CLI/terminal applications

The challenges were largely based on the [Rosetta Code](https://rosettacode.com/) code illustration examples, enabling us to give more exemplary instances of Hoon code to the broader development community.

Two prizes were recognized for each:  one for the first over the finish line, and another for the most stylistically expressive Hoon, as judged blindly by Hoon School Live's graders, ~tinnus-napbus, ~hodzod-walrus, and ~dinleb-rambep.

The remainder of this blog post [first introduces the Hoon Workbook](#the-hoon-workbook) and then [summarizes the competition results](#the-results).

##  The Hoon Workbook

We are also using the opportunity of this competition to reboot the [Hoon Workbook](/guides/additional/workbook).  The original [Hoon workbook](https://github.com/urbit/hoon-workbook/) was a showcase of material that had at one time been in the documentation but didn't stylistically flow with docs demands at a later date, so was removed but kept as still valuable.  We are going to treat the Hoon Workbook as a set of standalone tutorials which illustrate useful principles of code architecture and design, including some light tutorial-style commentary.  We will expand it from time to time and link it from Hoon School and App School as appropriate.

The first two pages in the Hoon Workbook are comparison code constructions selected from the submissions to the HSL Competition.  We commend them to your study:

- [Roman Numerals](/guides/additional/workbook/roman)
- [Rhonda Numbers](/guides/additional/workbook/rhonda)

##  The Results

One of the signal advantages of watching a code competition is laterally discovering ways of thinking that other coders employ.  As you examine the top code submissions, consider the relative variety of approaches (e.g. for Rhonda numbers) and the high degree of similarity apparent for others (e.g. for Roman numeral production).

### Rhonda Numbers

A Rhonda number is a positive integer _n_ that satisfies the property that, for [a given base _b_](https://en.wikipedia.org/wiki/Radix), the product of the base-_b_ digits of _n_ is equal to _b_ times the sum of _n_'s prime factors.  Only composite bases (non-prime bases) have Rhonda numbers.

For instance, consider 10206₁₀ = 2133132₄, that is, 2×4⁶ + 1×4⁵ + 3×4⁴ + 3×4³ + 1×4² + 3×4¹ + 2×4⁰ = 2×4096₁₀ + 1×1024₁₀ + 3×256₁₀ + 3×64₁₀ + 1×16₁₀ + 3×4₁₀ + 2 = 8192₁₀ + 1024₁₀ + 768₁₀ + 192₁₀ + 16₁₀ + 12₁₀ + 2 = 10206₁₀.  10206₁₀ has the prime factorization (2, 3, 3, 3, 3, 3, 3, 7) because 2×3⁶×7 = 10206₁₀.  This is a base-4 Rhonda number because 2×1×3×3×1×3×2 = 108₁₀ and 4×(2+3+3+3+3+3+3+7) = 4×27₁₀ = 108₁₀.

For this task, you will produce three files:

- `/lib/rhonda/hoon`

    Your library `/lib/rhonda/hoon` should expose two arms:

    - `++check` accepts a `@ud` unsigned decimal value for the base and a `@ud` unsigned decimal value for the number, and returns `%.y` or `%.n` depending on whether the given number is a Rhonda number in that base or not.
    - `++series` accepts a base as a `@ud` unsigned decimal value and a number of values to return `n`, and either returns `~` if the base is prime or the `n` first Rhonda numbers in that base.

- `/gen/rhonda-check/hoon`

    You should provide a `%say` generator at `/gen/rhonda-check/hoon` which accepts a `@ud` unsigned decimal value and applies `++check` to verify if that value is a Rhonda number or not.

- `/gen/rhonda-series/hoon`

    You should provide a `%say` generator at `/gen/rhonda-series/hoon` which accepts a `@ud` unsigned decimal value `b` and a `@ud` unsigned decimal value `n`, where `b` is the base _b_, and returns the first _n_ Rhonda numbers in that base.

#### Results

| Submitter | Rank |
| --------- | ---- |
| `~sidnym-ladrut` | #1 (speed) |
| `~mocmex-pollen` | #1 (style) |
| `~ticlys-monlun` | #2 (honorable mention, style) |
| `~tamlut-modnys` | #3 (honorable mention, style) |

The winning libraries are:

~mocmex-pollen

```hoon
::
::  A library for producing Rhonda numbers and testing if numbers are Rhonda.
::
::    A number is Rhonda if the product of its digits of in base b equals 
::    the product of the base b and the sum of its prime factors.
::    see also: https://mathworld.wolfram.com/RhondaNumber.html
::
=<
::
|%
::  +check: test whether the number n is Rhonda to base b
::
++  check
  |=  [b=@ud n=@ud]
  ^-  ?
  ~_  leaf+"base b must be >= 2"
  ?>  (gte b 2)
  ~_  leaf+"candidate number n must be >= 2"
  ?>  (gte n 2)
  ::
  .=  (roll (base-digits b n) mul)
  %+  mul
    b
  (roll (prime-factors n) add)
::  +series: produce the first n numbers which are Rhonda in base b
::
::    produce ~ if base b has no Rhonda numbers
::
++  series
  |=  [b=@ud n=@ud]
  ^-  (list @ud)
  ~_  leaf+"base b must be >= 2"
  ?>  (gte b 2)
  ::
  ?:  =((prime-factors b) ~[b])
    ~
  =/  candidate=@ud  2
  =+  rhondas=*(list @ud)
  |-
  ?:  =(n 0)
    (flop rhondas)
  =/  is-rhonda=?  (check b candidate)
  %=  $
    rhondas    ?:(is-rhonda [candidate rhondas] rhondas)
    n          ?:(is-rhonda (dec n) n)
    candidate  +(candidate)
  ==
--
::
|%
::  +base-digits: produce a list of the digits of n represented in base b
::
::    This arm has two behaviors which may be at first surprising, but do not
::    matter for the purposes of the ++check and ++series arms, and allow for
::    some simplifications to its implementation.
::    - crashes on n=0
::    - orders the list of digits with least significant digits first
::
::    ex: (base-digits 4 10.206) produces ~[2 3 1 3 3 1 2]
::
++  base-digits
  |=  [b=@ud n=@ud]
  ^-  (list @ud)
  ?>  (gte b 2)
  ?<  =(n 0)
  ::
  |-
  ?:  =(n 0)
    ~
  :-  (mod n b)
  $(n (div n b))
::  +prime-factors: produce a list of the prime factors of n
::    
::    by trial division
::    n must be >= 2
::    if n is prime, produce ~[n]
::    ex: (prime-factors 10.206) produces ~[7 3 3 3 3 3 3 2]
::
++  prime-factors
  |=  [n=@ud]
  ^-  (list @ud)
  ?>  (gte n 2)
  ::
  =+  factors=*(list @ud)
  =/  wheel  new-wheel
  ::  test candidates as produced by the wheel, not exceeding sqrt(n) 
  ::
  |-
  =^  candidate  wheel  (next:wheel)
  ?.  (lte (mul candidate candidate) n)
    ?:((gth n 1) [n factors] factors)
  |-
  ?:  =((mod n candidate) 0)
    ::  repeat the prime factor as many times as possible
    ::
    $(factors [candidate factors], n (div n candidate))
  ^$
::  +new-wheel: a door for generating numbers that may be prime
::
::    This uses wheel factorization with a basis of {2, 3, 5} to limit the
::    number of composites produced. It produces numbers in increasing order
::    starting from 2.
::
++  new-wheel
  =/  fixed=(list @ud)  ~[2 3 5 7]
  =/  skips=(list @ud)  ~[4 2 4 2 4 6 2 6]
  =/  lent-fixed=@ud  (lent fixed)
  =/  lent-skips=@ud  (lent skips)
  ::
  |_  [current=@ud fixed-i=@ud skips-i=@ud]
  ::  +next: produce the next number and the new wheel state
  ::
  ++  next
    |.
    ::  Exhaust the numbers in fixed. Then calculate successive values by
    ::  cycling through skips and increasing from the previous number by
    ::  the current skip-value.
    ::
    =/  fixed-done=?  =(fixed-i lent-fixed)
    =/  next-fixed-i  ?:(fixed-done fixed-i +(fixed-i))
    =/  next-skips-i  ?:(fixed-done (mod +(skips-i) lent-skips) skips-i)
    =/  next
    ?.  fixed-done
      (snag fixed-i fixed)
    (add current (snag skips-i skips))
    :-  next
    +.$(current next, fixed-i next-fixed-i, skips-i next-skips-i)
  --
--
```

~ticlys-monlun

```hoon
|%
++  check
  |=  [n=@ud base=@ud]
  ::  if base is prime, automatic no
  ::
  ?:  =((~(gut by (prime-map +(base))) base 0) 0)
    %.n
  ::  if not multiply the digits and compare to base x sum of factors
  ::
  ?:  =((roll (digits [base n]) mul) (mul base (roll (factor n) add)))
    %.y
  %.n
++  series
  |=  [base=@ud many=@ud]
  =/  rhondas  *(list @ud)
  ?:  =((~(gut by (prime-map +(base))) base 0) 0)
    rhondas
  =/  itr  1
  |-
  ?:  =((lent rhondas) many)
    (flop rhondas)
  ?:  =((check itr base) %.n)
    $(itr +(itr))
  $(rhondas [itr rhondas], itr +(itr))
::  digits: gives the list of digits of a number in a base
::
::    We strip digits least to most significant.
::    The least significant digit (lsd) of n in base b is just n mod b.
::    Subtract the lsd, divide by b, and repeat.
::    To know when to stop, we need to know how many digits there are.
++  digits
  |=  [base=@ud num=@ud]
  ^-  (list @ud)
  |-
  =/  modulus=@ud  (mod num base)
  ?:  =((num-digits base num) 1)
    ~[modulus]
  [modulus $(num (div (sub num modulus) base))]
::  num-digits: gives the number of digits of a number in a base
::
::    Simple idea: k is the number of digits of n in base b if and
::    only if k is the smallest number such that b^k > n.
++  num-digits
  |=  [base=@ud num=@ud]
  ^-  @ud
  =/  digits=@ud  1
  |-
  ?:  (gth (pow base digits) num)
    digits
  $(digits +(digits))
::  factor: produce a list of prime factors
::
::    The idea is to identify "small factors" of n, i.e. prime factors less than
::    the square root. We then divide n by these factors to reduce the
::    magnitude of n. It's easy to argue that after this is done, we obtain 1
::    or the largest prime factor.
::
++  factor
  |=  n=@ud
  ^-  (list @ud)
  ?:  ?|(=(n 0) =(n 1))
    ~[n]
  =/  factorization  *(list @ud)
  ::  produce primes less than or equal to root n
  ::
  =/  root  (sqrt n)
  =/  primes  (prime-map +(root))
  ::  itr = iterate; we want to iterate through the primes less than root n
  ::
  =/  itr  2
  |-
  ?:  =(itr +(root))
  ::  if n is now 1 we're done
  ::
    ?:  =(n 1)
      factorization
    ::  otherwise it's now the original n's largest primes factor
    ::
    [n factorization]
  ::  if itr not prime move on
  ::
  ?:  =((~(gut by primes) itr 0) 1)
    $(itr +(itr))
  ::  if it is prime, divide out by the highest power that divides num
  ::
  ?:  =((mod n itr) 0)
    $(n (div n itr), factorization [itr factorization])
  ::  once done, move to next prime
  ::
  $(itr +(itr))
::  sqrt: gives the integer square root of a number
::
::    Yes, this is a square root algorithm I wrote just because.
::    It's based on an algorithm that predates the Greeks:
::    To find the square root of A, think of A as an area.
::    Guess the side of the square x. Compute the other side y = A/x.
::    If x is an over/underestimate then y is an under/overestimate.
::    So (x+y)/2 is the average of an over and underestimate, thus better than x.
::    Repeatedly doing x --> (x + A/x)/2 converges to sqrt(A).
::
::    This algorithm is the same but with integer valued operations.
::    The algorithm either converges to the integer square root and repeats,
::    or gets trapped in a two-cycle of adjacent integers.
::    In the latter case, the smaller number is the answer.
::
++  sqrt
  |=  n=@ud
  =/  guess=@ud  1
  |-
  =/  new-guess  (div (add guess (div n guess)) 2)
  ::  sequence stabilizes
  ::
  ?:  =(guess new-guess)
    guess
  ::  sequence is trapped in 2-cycle
  ::
  ?:  =(guess +(new-guess))
    new-guess
  ?:  =(new-guess +(guess))
    guess
  $(guess new-guess)
::  prime-map: (effectively) produces primes less than a given input
::
::    This is the sieve of Eratosthenes to produce primes less than n.
::    I used a map because it had much faster performance than a list.
::    Any key in the map is a non-prime. The value 1 indicates "false."
::    I.e. it's not a prime.
++  prime-map
  |=  n=@ud
  ^-  (map @ud @ud)
  =/  prime-map  `(map @ud @ud)`(my ~[[0 1] [1 1]])
  ::  start sieving with 2
  ::
  =/  sieve  2
  |-
  ::  if sieve is too large to be a factor we're done
  ::
  ?:  (gte (mul sieve sieve) n)
    prime-map
  ::  if not too large but not prime, move on
  ::
  ?:  =((~(gut by prime-map) sieve 0) 1)
    $(sieve +(sieve))
  ::  sequence: explanation
  ::
  ::    If s is the sieve number, we start sieving multiples
  ::    of s at s^2 in sequence: s^2, s^2 + s, s^2 + 2s, ...
  ::    We start at s^2 because any number smaller than s^2
  ::    has prime factors less than s and would have been
  ::    eliminated earlier in the sieving process.
  ::
  =/  sequence  (mul sieve sieve)
  |-
  ::  done sieving with s once sequence is past n
  ::
  ?:  (gte sequence n)
    ^$(sieve +(sieve))
  ::  if sequence position is known not prime we move on
  ::
  ?:  =((~(gut by prime-map) sequence 0) 1)
    $(sequence (add sequence sieve))
  ::  otherwise we mark position of sequence as not prime and move on
  ::
  $(prime-map (~(put by prime-map) sequence 1), sequence (add sequence sieve))
--
```

~tamlut-modnys

```hoon
|%
::
:: check if a given input is a Rhonda number for a given base
::
++  check
  |=  [base=@ud num=@ud]
  ^-  ?
  ?:  (lte base 1)
    !!
  =((roll (get-base-digits base num) mul) (mul base (roll (prime-factors num) add)))
::
:: returns the first n Rhonda numbers in a base or ~ if the base is prime
::
++  series
  |=  [base=@ud n=@ud]
  ^-  (list @ud)
  ?:  (lte base 1)
    !!
  ::  checking if the base is prime.
  ::
  ?:  =((prime-factors base) ~[base])
    ~
  ::  variable for the output
  ::
  =/  result  *(list @ud)
  ::  iteration variable to check if it's a Rhonda number
  ::
  =/  iter  1
  ::  iteration variable in base digit representation as a list, to save time by preventing repeated conversion
  ::
  =/  iterbase  (limo [1 ~])
  :: length variable to prevent repeated calls of lent on the result
  ::
  =/  length  0
  |-
    ::  output if finished
    ::
    ?:  =(length n)
      (flop result)
    ::  check if the current number is a Rhonda number in the base
    ::
    ?:  =((roll iterbase mul) (mul base (roll (prime-factors iter) add)))
      ::  if so add it to the result and check higher
      ::
      $(result [iter result], length +(length), iter +(iter), iterbase (increment-num-in-base iterbase base))
    ::  otherwise just check higher
    ::
    $(iter +(iter), iterbase (increment-num-in-base iterbase base))
::
::  returns the base decomposition of a number as a list of digits
::
++  get-base-digits
  |=  [base=@ud num=@ud]
  ^-  (list @ud)
  ?:  (lte base 1)
    !!
  ::  define the output
  ::
  =/  result  *(list @ud)
  |-
    ::  loop until there are no more digits
    ::
    ?:  =(num 0)
      (flop result)
    =/  division  (dvr num base)
    ::  divide the number by the base, prepend the remainder to the result and loop
    ::
    $(result [q.division result], num p.division)
::
:: returns the prime factorization of a number as a list
::
++  prime-factors
  |=  num=@ud
  ^-  (list @ud)
  ::  define the output
  ::
  =/  result  *(list @ud)
  ::  used to iterate on possible prime factors starting from 2
  ::
  =/  iter  2
  |-
    ::  if the number is 1, there are no more factors
    ::
    ?:  =(num 1)
      result
    ::  divide the number by the current factor, get result and remainder
    ::
    =/  division  (dvr num iter)
    ::  if it divides cleanly, then add the current factor to the list of prime factors and loop on the result
    ::
    ?:  =(q.division 0)
      $(num p.division, result [iter result])
    ::  if the current factor is greater than the square root of the number, then add the number as a factor and terminate
    ::
    ?:  (gth iter p.division)
      [num result]
    :: in all other cases just increment the factor and keep testing
    ::
    $(iter +(iter))
::
::  increments a base decomposition of a number (a list of digits) by 1.
::  this functionality is implemented to speed up the series function and avoid repeated calls to get-base-digits
::
++  increment-num-in-base
  ::  input is a number as a list of digits and a base
  ::
  |=  [num=(list @ud) base=@ud]
  ^-  (list @ud)
  ::  length variable to avoid repeated calls to lent
  ::
  =/  length  (lent num)
  ::  iterate to potentially carry a digit when adding
  ::
  =/  index  0
  |-
    ::  if we carry a digit to the end (e.g. 999 + 1) then append a 1
    ::
    ?:  =(index length)
      (snoc num 1)
    ::  incrementation
    ::
    =/  num  (snap num index (add (snag index num) 1))
    ::  if we need to carry a digit
    ::
    ?:  (gte (snag index num) base)
      ::  then make the current digit 0 and loop
      ::
      $(index +(index), num (snap num index 0))
    :: otherwise return the incremented number
    ::
    num
--
```

~sidnym-ladrut

```hoon
::  rhonda number validator/generator
::  https://www.numbersaplenty.com/set/Rhonda_number/
::
|%
  ++  as-base                     :: convert n to base b
    |=  [b=@ud n=@ud]
    ^-  (list @ud)
    =+  p=(log-base b n)
    =|  l=(list @ud)
    |-
    ?:  =(p 0)
      [n l]
    =+  btop=(pow b p)
    =+  next=(div n btop)
    $(p (dec p), n (sub n (mul next btop)), l [next l])
  ++  log-base                    :: b-based unsigned log of value n
    |=  [b=@ud n=@ud]
    ^-  @ud
    =+  p=1
    |-
    ?:  (lth n (pow b p))
      (dec p)
    $(p +(p))
  ++  prime-factors               :: prime number factors of n
    |=  n=@ud
    ^-  (list @ud)
    ~+
    =|  l=(list @ud)
    =/  i=@ud  2
    |-
    ?:  (gth i -:(sqt n))
      ?:  (gth n 2)
        [n l]
      l
    |-
    ?:  !=((mod n i) 0)
      ^$(i +(i))
    $(n (div n i), l [i l])
  ++  is-prime                    :: is given @ud a prime number?
    |=  n=@ud
    ^-  bean
    ~+
    ?:  (lte n 1)  %.n
    ?:  (lte n 3)  %.y
    %+  levy  (gulf 2 -:(sqt n))
    |=(i=@ud !=((mod n i) 0))
--
::
|%
  ++  check                       :: check if n is rhonda in base b
    :: rhonda(b, n) := Π_digits(n_b) == b * Σ_values(prime-factors(n))
    |=  [b=@ud n=@ud]
    ^-  bean
    :: https://mathworld.wolfram.com/RhondaNumber.html
    :: "Rhonda numbers exist only for bases that are composite since
    :: there is no way for the product of integers less than a prime b
    :: to have b as a factor."
    ?:  (is-prime b)
      %.n
    =+  baseb=(as-base b n)
    =+  facts=(prime-factors n)
    .=  (roll baseb mul)
    (mul b (roll facts add))
  ++  series                      :: list first n rhondas of base b
    |=  [b=@ud n=@ud]
    ^-  (list @ud)
    =|  l=(list @ud)
    =/  i=@ud  2
    =/  c=@ud  0
    ?:  (is-prime b)
      l
    |-
    ?:  =(c n)
      (flop l)
    ?.  (check b i)
      $(i +(i))
    $(i +(i), c +(c), l [i l])
```

### Roman Numerals

Roman numerals constitute a numeral system capable of expressing positive integers by additive values (rather than place-number notation).  Additive series are produced by summing values in a series, as `iii` → 3, while subtractive values are produced by prepending certain smaller values ahead of a larger value, as `ix` → 9.

You should produce a library which converts to and from Roman numeral representations according to the standard values:

| Character | Value |
| --------- | ----- |
| `i` | 1 |
| `v` | 5 |
| `x` | 10 |
| `l` | 50 |
| `c` | 100 |
| `d` | 500 |
| `m` | 1,000 |

![](https://img-9gag-fun.9cache.com/photo/aGzNz27_460swp.webp)

There are many incorrect formulations, as `iix` → 8 or `id` → 499, and your code is not expected to parse these “correctly”.  (It should not produce them!)  However, both `iv` and `iiii` are frequently used to represent 4 (e.g. look at a clock face), so you should support this variation.

For this task, you will produce two files:

- `/lib/roman/hoon`

    Your library `/lib/roman/hoon` should expose two arms:

    - `++parse` accepts a `tape` text string containing a Roman numeral expression in lower or upper case and returns the corresponding `@ud` unsigned decimal value.  On failure to parse, call `!!` zapzap.
    - `++yield` accepts a `@ud` unsigned decimal value and returns the corresponding `tape` text string in lower case.

- `/gen/roman/hoon`

    You should also provide a `%say` generator at `/gen/roman/hoon` which accepts a `tape` text string or a `@ud` unsigned decimal value and performs the appropriate conversion on the basis of the sample's type.

#### Results

| Submitter | Rank |
| --------- | ---- |
| `~fonnyx-nopmer` | #1 (speed) |
| `~sidnym-ladrut` | #1 (style) |
| `~mocmex-pollen` | #2 (honorable mention, style) |
| `~mashex-masrex` | #3 (honorable mention, style) |

~sidnym-ladrut

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

~mocmex-pollen

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

~mashex-masrex

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


~fonnyx-nopmer

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

### Alignment and Titling

This challenge will have you implement tooling to left-align, center, and right-align a given tape, and to draw various kinds of boxes around the text.

Given text and an overall width, you should left-align, center, or right-align the text:

```hoon
> (align %left 80 "Welcome to Mars!")
"Welcome to Mars!                                                                "

> (align %right 60 "Welcome to Mars!")
"                                            Welcome to Mars!"

> (align %center 40 "Welcome to Mars!")
"            Welcome to Mars!            "
```

In case of misalignment on odd/even lengths, move one to the left:

```hoon
> (align %center 16 "cat")
"      cat       "
```

To make boxes, you should produce a block of box-drawing characters at the specified distance from the text.  E.g. `(box-text 0 "Welcome to Mars")` should produce a [`wall`](https://urbit.org/docs/hoon/reference/stdlib/2q#wall) (`list tape`) containing the text tightly bound in a box:

```
┌────────────────┐
│Welcome to Mars!│
└────────────────┘
```

or `~["┌────────────────┐" "│Welcome to Mars!│" "└────────────────┘"]`

whereas `(box-text 1 "Welcome to Mars")` should produce a `tape` containing the text with one unit of breathing space around it:

```
┌──────────────────┐
│                  │
│ Welcome to Mars! │
│                  │
└──────────────────┘
```

`++double-box-text` should do the same but using the `═` series.

Finally, there should also be a generic symbol boxer:

```hoon
> (symbol-box '*' 1 "Welcome to Mars!")
********************
*                  *
* Welcome to Mars! *
*                  *
********************

> (symbol-box '*' 1 (align %center 24 "Welcome to Mars!"))
****************************
*                          *
*     Welcome to Mars!     *
*                          *
****************************
```

Solutions will benefit if you spend some time looking at the available text processors and printers defined in the standard library.

Our other task is to take a long block of text and break it into a number of columns.  Given a text file of many lines, where fields within a line are delineated by a single `$` buc character, write a program that aligns each column of fields by ensuring that words in each column are separated by at least one space.  Further, allow for each word in a column to be either left justified, right justified, or center justified within its column.

```hoon
> =sample ~["Given$a$text$file$of$many$lines,$where$fields$within$a$line$"
  "are$delineated$by$a$single$'dollar'$character,$write$a$program"
  "that$aligns$each$column$of$fields$by$ensuring$that$words$in$each$"
  "column$are$separated$by$at$least$one$space."
  "Further,$allow$for$each$word$in$a$column$to$be$either$left$"
  "justified,$right$justified,$or$center$justified$within$its$column."]

> (columnify %left sample)
~["Given      a          txt        file   of     many      lines,     where    fields  within  a      line"
"are        delineated by         a      single 'dollar'  character, write    a       program            "
"that       aligns     each       column of     fields    by         ensuring that    words   in     each"
"column     are        separated  by     at     least     one        space.                              "
"Further,   allow      for        each   word   in        a          column   to      be      either left"
"justified, right      justified, or     center justified within     its      column.                    "]

> (columnify %center sample)
~["  Given        a         txt      file    of     many      lines,    where   fields  within    a    line"
"   are     delineated     by       a    single 'dollar'  character,  write      a    program            "
"   that      aligns      each    column   of    fields       by     ensuring  that    words    in   each"
"  column      are     separated    by     at     least      one      space.                              "
" Further,    allow       for      each   word     in         a       column    to      be    either left"
"justified,   right    justified,   or   center justified   within     its    column."]

> (columnify %right sample)
~["     Given          a        txt   file     of      many     lines,    where  fields  within      a line"
"       are delineated         by      a single  'dollar' character,    write       a program            "
"      that     aligns       each column     of    fields         by ensuring    that   words     in each"
"    column        are  separated     by     at     least        one   space.                            "
"  Further,      allow        for   each   word        in          a   column      to      be either left"
"justified,      right justified,     or center justified     within      its column.                    "]
```

For this task, you will produce two files:

- `/lib/titling/hoon`

    Your library `/lib/titling/hoon` should expose the following arms:

    - `++align` accepts a `?(%left %center %right)` tag indicating the kind of alignment; a total width which should be checked to make sure it is greater than the input string; and a `tape` string containing the text to be aligned.  It should return the appropriately aligned text as described above.
    - `++box-text` accepts a `@ud` gap distance and a string, and returns the corresponding `wall` text string with single-line box-drawing characters surrounding the given text.
    - `++double-box-text` accepts a `@ud` gap distance and a string, and returns the corresponding `wall` text string with double-line box-drawing characters surrounding the given text.
    - `++symbol-box-text` accepts a `@t` single character symbol, a `@ud` gap distance, and a string, and returns the corresponding `wall` text string with the given symbol surrounding the given text at the correct gap distance.

- `/lib/columns/hoon`

    Your library `/lib/columns/hoon` should expose the following arm:
    
    - `++columnify` accepts a `?(%left %center %right)` tag indicating the kind of alignment and a `wall` of strings containing the text to be aligned.  It reformats the text into a `wall` with the appropriate behavior as shown above.

#### Results

| Submitter | Rank |
| --------- | ---- |
| `~fonnyx-nopmer` | #1 (speed) |
| `~mocmex-pollen` | #1 (style) |
| `~sidnym-ladrut` | #2 (honorable mention, style) |
| `~libryl-palryl` | #3 (honorable mention, style) |

Judging this challenge ended up requiring more flexibility due to ambiguity in how line-terminal spaces and UTF-8 value in `tape`s should be handled.

~mocmex-pollen

**`/lib/titling.hoon`**

```hoon
::
::  A library for producing aligned text and boxed text.
::
=<
::
|%
::  +align: produce a tape padded with aces to width characters where
::  the given text is aligned within according to mode
::
++  align
  |=  [mode=?(%left %center %right) width=@ud text=tape]
  ^-  tape
  ?>  (gte width (lent text))
  ::
  =/  aces-n=@ud  (sub width (lent text))
  =/  ace=@t  ' '
  ?-  mode
    %left  (weld text (reap aces-n ace))
    ::
    %center
      =/  [quot=@ud rem=@ud]  (dvr aces-n 2)
      =/  left-n  quot
      =/  right-n  (add quot rem)
      (weld (runt [left-n ace] text) (reap right-n ace))
    ::
    %right  (runt [aces-n ace] text)
  ==
::  +box-single: surround text with single-width box-drawing characters
::
++  box-single
  |=  [gap=@ud text=tape]
  ^-  wall
  ::
  =/  symbols  ['│' '─' '┌' '┐' '└' '┘']
  (~(box boxer symbols) gap text)
::  +box-double: surround text with double-width box-drawing characters
::
++  box-double
  |=  [gap=@ud text=tape]
  ^-  wall
  ::
  =/  symbols  ['║' '═' '╔' '╗' '╚' '╝']
  (~(box boxer symbols) gap text)
::  +box-symbol: surround text with the given symbol
::  
::    symbol must represent a single character or the box will be malformed.
::
++  box-symbol
  |=  [symbol=@t gap=@ud text=tape]
  ^-  wall
  ::
  =/  symbols  [symbol symbol symbol symbol symbol symbol]
  (~(box boxer symbols) gap text)
--
::
|%
::
++  boxer
  |_  [vertical=@t horizontal=@t upper-left=@t upper-right=@t lower-left=@t lower-right=@t]
  ::
  ++  box
    |=  [gap=@ud text=tape]
    ^-  wall
    ::  Base all text inputs on @c so that box-drawing characters can be
    ::  represented as the tests expect (ex: need "╔" as ~[226 149 148]
    ::  not as ~[9.737.698]) and to keep the list operations below as
    ::  simple as possible (converting to tape would add an extra layer
    ::  of lists to deal with).
    ::
    =/  vertical=@c     (taft vertical)
    =/  horizontal=@c   (taft horizontal)
    =/  upper-left=@c   (taft upper-left)
    =/  upper-right=@c  (taft upper-right)
    =/  lower-left=@c   (taft lower-left)
    =/  lower-right=@c  (taft lower-right)
    =/  text=(list @c)  (tuba text)
    ::
    =/  ace=@c  (taft ' ')
    =/  inner-n=@ud  (add (mul 2 gap) (lent text))
    =/  body  |=(content=(list @c) (snoc [vertical content] vertical))
    ::
    =/  top=(list @c)     (snoc [upper-left (reap inner-n horizontal)] upper-right)
    =/  bottom=(list @c)  (snoc [lower-left (reap inner-n horizontal)] lower-right)
    =/  empty=(list @c)   (body (reap inner-n ace))
    =/  main=(list @c)    (body ;:(weld (reap gap ace) text (reap gap ace)))
    ::
    %+  turn
      ;:(weld ~[top] (reap gap empty) ~[main] (reap gap empty) ~[bottom])
    tufa
  --
--
```

**`/lib/columns.hoon`**

```hoon
::
::  A library for turning delimited text into columns of text.
::
/+  titling
::
=<
::
|%
::  +columnify: produce a list of lines where buc-delimited text from the input
::  lines has been transformed to spaced columns with contents aligned by the
::  given mode
::
::    Trailing whitespace is trimmed.
::
++  columnify
  |=  [mode=?(%left %center %right) lines=wall]
  ^-  wall
  ::
  =/  rows=(list wall)  (turn lines parse-row)
  =/  max-widths=(list @ud)  (roll (turn rows |=([r=wall] (turn r lent))) pairwise-max)
  %+  turn
    rows
  |=  [columns=wall]
  ^-  tape
  %-  zing
  ::  Align contents, interleave with aces, and remove trailing whitespace from
  ::  the last column.
  ::  ex: ~["Given" " " "a" " " "text"]
  ::
  |-
  ?~  max-widths  !!
  ?~  columns  !!
  =/  contents=tape  (align:titling mode i.max-widths i.columns)
  ?~  t.columns  
    ~[(chomp-aces contents)]
  :+  contents
    " "
  $(columns t.columns, max-widths t.max-widths)
--
::
|%
::  +parse-row: split tape into a list of tapes on the delimiter buc
::
::    Trailing empty columns are discarded.
::
++  parse-row
  |=  [row=tape]
  ^-  wall
  ::
  =/  columns=wall  ~
  |-
  =/  column=tape  ~
  |-
  ?~  row
    (flop (pop-empties (turn [column columns] flop)))
  ?:  =('$' i.row)
    ^$(columns [column columns], row t.row)
  $(column [i.row column], row t.row)
::  +pop-empties: remove all ~ from the front of a list
::
::    Useful to remove empty columns from the end of a row.
::
++  pop-empties
  |=  [columns=wall]
  ^-  wall
  ::
  |-
  ?~  columns
    ~
  ?~  i.columns
    $(columns t.columns)
  columns
::  +chomp-aces: remove all aces from the end of a tape
::
++  chomp-aces
  |=  [text=tape]
  ^-  tape
  ::
  =/  text  (flop text)
  |-
  ?~  text
    ~
  ?:  =(' ' i.text)
    $(text t.text)
  (flop text)
::  +pairwise-max: produce a list of the max value of corresponding elements
::  of two lists
::
::    When the lists have uneven lengths, values from the longer list are
::    taken as the max where the shorter list has no values.
::    ex: (pairwise-max ~[1 2 3] ~[4 1]) -> ~[4 2 3]
::
++  pairwise-max
  |=  [l1=(list @) l2=(list @)]
  ^-  (list @)
  ::
  |-
  ?:  &(=(~ l1) =(~ l2))
    ~
  ?~  l1
    ?~  l2  !!
    [i.l2 $(l2 t.l2)]
  ?~  l2
    ?~  l1  !!
    [i.l1 $(l1 t.l1)]
  [(max i.l1 i.l2) $(l1 t.l1, l2 t.l2)]
--
```

~sidnym-ladrut

**`/lib/titling.hoon`**

```hoon
::  titling: tui title generation library
::
=<
::  public core
|%
::  +align: align given text to left, right, or center of a character window
::
::    > (align %left 6 "abc")
::    "abc   "
::    > (align %right 6 "abc")
::    "   abc"
::    > (align %center 6 "abc")
::    " abc  "
::
++  align  ^align
::  +box-single: render given text in padded single-bar-wreathed title
::
::    > (box-single "Welcome to Mars!" 1)
::    <<
::      "┌──────────────────┐"
::      "│                  │"
::      "│ Welcome to Mars! │"
::      "│                  │"
::      "└──────────────────┘"
::    >>
::
++  box-single
  |=  [padding=@ud text=tape]
  ^-  wall
  =+  single-joints=["│" "─" "└" "┘" "┌" "┐"]
  (box-joints single-joints padding text)
::  +box-double: render given text in padded double-bar-wreathed title
::
::    > (box-double "Welcome to Mars!" 1)
::    <<
::      "╔══════════════════╗"
::      "║                  ║"
::      "║ Welcome to Mars! ║"
::      "║                  ║"
::      "╚══════════════════╝"
::    >>
::
++  box-double
  |=  [padding=@ud text=tape]
  ^-  wall
  =+  double-joints=["║" "═" "╚" "╝" "╔" "╗"]
  (box-joints double-joints padding text)
::  +box-symbol: render given text in padded symbol-bar-wreathed title
::
::    > (box-symbol '*' 1 "Welcome to Mars!")
::    <<
::      "********************"
::      "*                  *"
::      "* Welcome to Mars! *"
::      "*                  *"
::      "********************"
::    >>
::
++  box-symbol
  |=  [symbol=@t padding=@ud text=tape]
  ^-  wall
  =+  =>((trip symbol) symbol-joints=[. . . . . .])
  (box-joints symbol-joints padding text)
--
::  private core
|%
::  $joints: sequence of tapes encoding the joints of a tui-like box
::
::    All tui-like boxes consist of 3 major character classes: verticals,
::    horizontals, and corners. Corners can be divided into 4 subcategories,
::    one for each unique box corner.
::
::    This structure uses fully-expanded tapes instead of cords to force
::    up-front type coercion for non-ASCII characters (e.g. '└'), which
::    greatly simplifies all subsequent tape operations.
::
+$  joints  $:  vertical=tape
                horizontal=tape
                bot-left=tape
                bot-right=tape
                top-left=tape
                top-right=tape
            ==
::  +align: align text to left, right, or center of a given padding window
::
::    See the public core's `+align` for more information.
::
++  align
  |=  [type=?(%left %center %right) align-width=@ud text=tape]
  ^-  tape
  =+  text-width=(lent text)
  ?>  (gte align-width text-width)
  =+  space-count=(sub align-width text-width)
  ?-  type
    %left    (weld text (reap space-count ' '))
    %right   (weld (reap space-count ' ') text)
    %center  =+  left-count=(div space-count 2)
             =+  right-count=(add left-count (mod space-count 2))
             ;:(weld (reap left-count ' ') text (reap right-count ' '))
  ==
::  +box-joints: render given text in padded box constructed from joints
::
::    > (box-joints ["|" "-" "a" "b" "c" "d"] 1 "Welcome to Mars!")
::    <<
::      "c------------------d"
::      "|                  |"
::      "| Welcome to Mars! |"
::      "|                  |"
::      "a------------------b"
::    >>
::
++  box-joints
  |=  [=joints padding=@ud text=tape]
  ^-  wall
  ::  box characteristics and components
  ::
  =+  box-width=(add (lent text) (mul 2 padding))
  =+  horizontal-bar=`tape`(zing (reap box-width horizontal.joints))
  =+  vertical-row=;:(weld vertical.joints (reap box-width ' ') vertical.joints)
  =+  vertical-rows=(reap padding vertical-row)
  ::  box construction
  ::
  ;:  weld
    ~[;:(weld top-left.joints horizontal-bar top-right.joints)]
    vertical-rows
    ~[;:(weld vertical.joints (align %center box-width text) vertical.joints)]
    vertical-rows
    ~[;:(weld bot-left.joints horizontal-bar bot-right.joints)]
  ==
--
```

**`/lib/columns.hoon`**

```hoon
::  columns: tui text alignment library
::
/+  *titling
|%
::  +columnify: render given $-delimited text rows as adjusted columns
::
::    > (columnify %left ~["1$11$111" "222$22$2" "3$3"])
::    <<
::      "1   11 111"
::      "222 22 2  "
::      "3   3 "
::    >>
::    > (columnify %right ~["1$11$111" "222$22$2" "3$3"])
::    <<
::      "  1 11 111"
::      "222 22   2"
::      "  3  3"
::    >>
::    > (columnify %center ~["1$11$111" "222$22$2" "3$3"])
::    <<
::      " 1  11 111"
::      "222 22  2 "
::      " 3  3 "
::    >>
::
++  columnify
  |=  [type=?(%left %center %right) rows=wall]
  ^-  wall
  |^  =+  split-rows=(turn rows (symbol-split '$'))
      =+  split-widths=(column-widths split-rows)
      %+  turn  split-rows
      |=  row=(list tape)
      %-  zing
      %+  join  " "
      %+  turn  (inner-zip split-widths row)
      |=(i=[@ud tape] (align type i))
  ::  +symbol-split: create gate that parses tape into symbol-split list
  ::
  ++  symbol-split
    |=  symbol=@t
    ^-  $-(tape (list tape))
    |=  text=tape
    ^-  (list tape)
    %-  skim  :_  |=(i=tape !=(i ~))
    %+  scan  text
    %+  more  (just symbol)
    %-  star
    %-  sear  :_  next
    |=(i=@t ?:(!=(i symbol) (some i) ~))
  ::  +column-widths: given a table of tapes, calculate per-column widths
  ::
  ++  column-widths
    |=  table=(list (list tape))
    ^-  (list @ud)
    %-  roll
    :-  (turn table |=(row=(list tape) (turn row lent)))
    |=  [curr=(list @ud) best=(list @ud)]
    (turn (outer-zip curr best 0) max)
  ::  +inner-zip: make list of pairs between parallel lists, dropping excess
  ::
  ::    > (inner-zip ~['a' 'b' 'c'] ~[1 2 3])
  ::    ~[['a' 1] ['b' 2] ['c' 3]]
  ::    > (inner-zip ~['a' 'b'] ~[1 2 3 4])
  ::    ~[['a' 1] ['b' 2]]
  ::    > (inner-zip ~['a' 'b' 'c' 'd'] ~[1])
  ::    ~[['a' 1]]
  ::
  ++  inner-zip
    |*  [a=(list *) b=(list *)]
    ?~  a  ~
    ?~  b  ~
    [[i.a i.b] $(a t.a, b t.b)]
  ::  +outer-zip: make list of pairs between parallel lists, defaulting absent
  ::
  ::    > (outer-zip ~[1 2 3] ~[4 5 6] 0)
  ::    ~[[1 4] [2 5] [3 6]]
  ::    > (outer-zip ~[1 2] ~[3 4 5 6] 0)
  ::    ~[[1 3] [2 4] [0 5] [0 6]]
  ::    > (outer-zip ~[1 2 3 4] ~[5] 0)
  ::    ~[[1 5] [2 0] [3 0] [4 0]]
  ::
  ++  outer-zip
    |*  [a=(list *) b=(list *) default=*]
    =>  .(a ^.(homo a), b ^.(homo b))
    |-
    ?~  a
      ?~  b
        ~
      [[default i.b] $(b t.b)]
    ?~  b
      [[i.a default] $(a t.a)]
    [[i.a i.b] $(a t.a, b t.b)]
  --
--
```

~libryl-palryl

**`/lib/titling.hoon`**

```hoon
|%
++  align
  |=  [kind=?(%left %center %right) width=@ud text=tape]
  ^-  tape
  ::
  :: Accepts a `?(%left %center %right)` tag indicating the kind of alignment;
  :: a total width which should be checked to make sure it is greater than the
  :: input string; and a `tape` string containing the text to be aligned. It
  :: returns the appropriately aligned text.
  ::
  ?:  (gth (lent text) width)  !!
  =/  gap  (sub width (lent text))
  ?-  kind
    %left  (append text " " gap)
    %right  (prepend text " " gap)
    %center  (append (prepend text " " (div gap 2)) " " (add (div gap 2) (mod gap 2)))
  ==
++  box-text
  |=  [gap=@ud text=tape]
  ^-  wall
  ::
  :: Accepts a `@ud` gap distance and a string, and returns the corresponding
  :: `wall` text string with single-line box-drawing characters surrounding the
  :: given text.
  ::
  (inhomogeneous-box-text '┌' '─' '┐' '│' '│' '└' '─' '┘' gap text)
++  double-box-text
  |=  [gap=@ud text=tape]
  ^-  wall
  ::
  :: accepts a `@ud` gap distance and a string, and returns the corresponding
  :: `wall` text string with double-line box-drawing characters surrounding the
  :: given text.
  ::
  (inhomogeneous-box-text '╔' '═' '╗' '║' '║' '╚' '═' '╝' gap text)
++  symbol-box-text
  |=  [symbol=@t gap=@ud text=tape]
  ^-  wall
  ::
  :: accepts a `@t` single character symbol, a `@ud` gap distance, and a string,
  :: and returns the corresponding `wall` text string with the given symbol
  :: surrounding the given text at the correct gap distance.
  ::
  =/  s  symbol
  (inhomogeneous-box-text s s s s s s s s gap text)
++  box-single
  |=  [gap=@ud text=tape]
  ^-  wall
  (box-text gap text)
++  box-double
  |=  [gap=@ud text=tape]
  ^-  wall
  (double-box-text gap text)
++  box-symbol
  |=  [symbol=@t gap=@ud text=tape]
  ^-  wall
  (symbol-box-text symbol gap text)
++  inhomogeneous-box-text
  |=  [sym7=@t sym8=@t sym9=@t sym4=@t sym6=@t sym1=@t sym2=@t sym3=@t gap=@ud text=tape]
  ^-  wall
  ::
  :: accepts eight `@t` single characters, a `@ud` gap distance, and a string,
  :: and returns the corresponding `wall` text string with the given symbols
  :: surrounding the given text at the correct gap distance, with symbols numbered
  :: as relative positions on keyboard's number pad:
  ::                                                 7 8 9
  ::                                                 4   6
  ::                                                 1 2 3
  ::
  =/  lw  (add (add (lent text) (mul 2 gap)) 2)
  =/  header  (prepend (append (prepend "" (trip sym8) (sub lw 2)) (trip sym9) 1) (trip sym7) 1)
  =/  pdunit  (prepend (append (prepend "" (trip ' ') (sub lw 2)) (trip sym6) 1) (trip sym4) 1)
  =/  footer  (prepend (append (prepend "" (trip sym2) (sub lw 2)) (trip sym3) 1) (trip sym1) 1)
  =/  body  (prepend (append (append (prepend text " " gap) " " gap) (trip sym6) 1) (trip sym4) 1)
  ?:  =(0 gap)  ~[header body footer]
    =/  padder  (wall-multiply ~[pdunit] gap)
    (weld (weld (weld (weld ~[header] padder) ~[body]) padder) ~[footer])
++  append
  |=  [text=tape fix=tape rep=@ud]
  ^-  tape
  :: append `fix` to `text` for `rep` times
  ?:  =(rep 0)
    text
  (weld $(rep (dec rep)) fix)
++  prepend
  |=  [text=tape fix=tape rep=@ud]
  ^-  tape
  :: prepend `fix` to `text` for `rep` times (like runt but with tapes)
  ?:  =(rep 0)
    text
  (weld fix $(rep (dec rep)))
++  wall-multiply
  |=  [l=wall rep=@ud]
  ^-  wall
  :: wall-integer multiplication, forming a new wall by repeating its input
  ?:  =(rep 0)  !!
  ?:  =(rep 1)
    l
  (weld l $(rep (dec rep)))
--
```

**`/lib/columns.hoon`**

```hoon
/+  *titling
|%
++  columnify
  |=  [kind=?(%left %center %right) table=wall]
  ^-  wall
  ::
  :: accepts a `?(%left %center %right)` tag indicating the kind of alignment
  :: and a `wall` of strings containing the text to be aligned.  It reformats the
  :: text into a `wall` with the appropriate behavior.
  ::
  ?:  =(0 (lent table))  table
  =/  column-widths  (get-column-widths table)
  =/  res  `wall`~[(columnify-row kind column-widths (snag 0 table))]
  =/  i  1
  |-
  ?:  =(i (lent table))  res
  %=  $
    res  (weld res ~[(columnify-row kind column-widths (snag i table))])
    i  (add 1 i)
  ==
++  columnify-row
  |=  [kind=?(%left %center %right) width=(list @ud) row=tape]
  ^-  tape
  =/  res  `tape`""
  =/  col  `tape`""
  =/  i  0
  =/  ic  0
  |-
  ?:  =(i (lent row))  (weld res (align kind (snag ic width) col))
  ?:  =('$' (snag i row))
  %=  $
    res  (weld (weld res (align kind (snag ic width) col)) " ")
    col  `tape`""
    i  (add 1 i)
    ic  (add 1 ic)
  ==
  %=  $
    col  (weld col (trip (snag i row)))
    i  (add 1 i)
  ==
++  get-max-number-of-columns
  |=  [table=wall]
  ^-  @ud
  =/  nc  0
  =/  i  0
  |-
  ?:  =(i (lent table))  nc
  %=  $
    nc  (max nc (get-number-of-columns (snag i table)))
    i  (add 1 i)
  ==
++  get-number-of-columns
  |=  [row=tape]
  ^-  @ud
  ?:  =(0 (lent row))  !!
  =/  nc  1
  =/  i  0
  |-
  ?:  =(i (lent row))  nc
  ?:  =('$' (snag i row))
  %=  $
    nc  (add 1 nc)
    i  (add 1 i)
  ==
  %=  $
    i  (add 1 i)
  ==
++  get-column-widths
  |=  [table=wall]
  ^-  (list @ud)
  =/  nc  (get-max-number-of-columns table)
  =/  cw  `(list @ud)`(reap nc 0)
  =/  ic  0
  =/  i  0
  =/  j  0
  =/  k  0
  |-
  ?:  =(i (lent table))  cw
  ?:  =(j (lent (snag i table)))
  %=  $
    i  (add 1 i)
    j  0
    k  0
    ic  0
    cw  (snap cw ic (max k (snag ic cw)))
  ==
  ?:  =('$' (snag j (snag i table)))
  %=  $
    j  (add 1 j)
    k  0
    ic  (add 1 ic)
    cw  (snap cw ic (max k (snag ic cw)))
  ==
  %=  $
    j  (add 1 j)
    k  (add 1 k)
  ==
--
```

~fonnyx-nopmer

**`/lib/titling.hoon`**

```hoon
|%
++  align
  |=  [alignment=?(%left %center %right) width=@ud t=tape]  ^-  tape
  ?:  (lth width (lent t))
    ~|  'width too short'
    !!
  ?-    alignment
      %left
    =/  padding  (reap (sub width (lent t)) ' ')
    "{t}{padding}"
  ::
      %center
    =+  (dvr (sub width (lent t)) 2)
    =/  padding-left  (reap p ' ')
    =/  padding-right  (reap (add p q) ' ')
    "{padding-left}{t}{padding-right}"
  ::
      %right  
    =/  padding  (reap (sub width (lent t)) ' ')
    "{padding}{t}"
  ==
++  box-single
  |=  [gap=@ud t=tape]  ^-  wall
  (box gap t '│' '─' '┐' '┌' '└' '┘')
++  box-double
  |=  [gap=@ud t=tape]  ^-  wall
  (box gap t '║' '═' '╗' '╔' '╚' '╝')
++  box-symbol
  |=  [c=@t gap=@ud t=tape]
  (box gap t c c c c c c)
++  box
  |=  [gap=@ud t=tape v=@t h=@t tr=@t tl=@t bl=@t br=@t]
  =/  len  :(add (lent t) 2 (mul gap 2))
  =/  top  (trip (crip "{(trip tl)}{(reap (sub len 2) h)}{(trip tr)}"))
  =/  middle  (trip (crip "{(trip v)}{(reap gap ' ')}{t}{(reap gap ' ')}{(trip v)}"))
  =/  bottom  (trip (crip "{(trip bl)}{(reap (sub len 2) h)}{(trip br)}"))
  =/  else  (trip (crip "{(trip v)}{(reap (sub len 2) ' ')}{(trip v)}"))
  :(weld ~[top] (reap gap else) ~[middle] (reap gap else) ~[bottom])
--
```

**`/lib/columns.hoon`**

```hoon
/+  *titling
|%
++  columnify
  |=  [just=?(%left %center %right) w=wall]  ^-  wall
  =/  lines=(list wall)  (turn w split)
  =/  lengths  (turn lines |=(words=wall (turn words lent)))
  =/  max-lengths  (roll lengths zip-max)
  =/  justified-lines  (turn lines |=(words=wall (justify-line just max-lengths words)))
  (turn justified-lines |=(words=wall (strip-right (zing (join " " words)))))
++  split
  |=  [t=tape]  ^-  wall
  =/  ix  (find "$" t)
  ?~  ix
    ~[t]
  :- 
    (scag (need ix) t)
  $(t (slag +((need ix)) t))
++  zip-max
  |=  [t=(list @) u=(list @)]  ^-  (list @)
  ?~  t
    ?~  u
      ~
    [i.u $(u t.u)]
  ?~  u
    [i.t $(t t.t)]
  [(max i.u i.t) $(t t.t, u t.u)]
++  justify-line
  |=  [just=?(%left %center %right) lengths=(list @) w=wall]  ^-  wall
  ?~  w
    ~
  [(align just -.lengths i.w) $(lengths +.lengths, w t.w)]
++  strip-right
  |=  [t=tape]
  ?.  =(' ' (snag (sub (lent t) 1) t))
    t
  $(t (scag (sub (lent t) 1) t))
--
```

