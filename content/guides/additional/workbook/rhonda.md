+++
title = "Rhonda Numbers"
weight = 48
+++

#   Challenge:  Rhonda Numbers

A Rhonda number is a positive integer _n_ that satisfies the property that, for [a given base _b_](https://en.wikipedia.org/wiki/Radix), the product of the base-_b_ digits of _n_ is equal to _b_ times the sum of _n_'s prime factors.  Only composite bases (non-prime bases) have Rhonda numbers.

For instance, consider 10206₁₀ = 2133132₄, that is, 2×4⁶ + 1×4⁵ + 3×4⁴ + 3×4³ + 1×4² + 3×4¹ + 2×4⁰ = 2×4096₁₀ + 1×1024₁₀ + 3×256₁₀ + 3×64₁₀ + 1×16₁₀ + 3×4₁₀ + 2 = 8192₁₀ + 1024₁₀ + 768₁₀ + 192₁₀ + 16₁₀ + 12₁₀ + 2 = 10206₁₀.  10206₁₀ has the prime factorization (2, 3, 3, 3, 3, 3, 3, 7) because 2×3⁶×7 = 10206₁₀.  This is a base-4 Rhonda number because 2×1×3×3×1×3×2 = 108₁₀ and 4×(2+3+3+3+3+3+3+7) = 4×27₁₀ = 108₁₀.

The [Wolfram MathWorld entry for “Rhonda Number”](https://mathworld.wolfram.com/RhondaNumber.html) provides tables of many Rhonda numbers.  Further information on Rhonda numbers may be found at [Numbers Aplenty](https://www.numbersaplenty.com/set/Rhonda_number/).  You may also find this [base conversion tool](https://www.rapidtables.com/convert/number/base-converter.html) helpful.

- Produce three files to carry out this task:

    - `/lib/rhonda/hoon`

        Your library `/lib/rhonda/hoon` should expose two arms:

        - `++check` accepts a `@ud` unsigned decimal value for the base and a `@ud` unsigned decimal value for the number, and returns `%.y` or `%.n` depending on whether the given number is a Rhonda number in that base or not.
        - `++series` accepts a base as a `@ud` unsigned decimal value and a number of values to return `n`, and either returns `~` if the base is prime or the `n` first Rhonda numbers in that base.

    - `/gen/rhonda-check/hoon`

        You should provide a `%say` generator at `/gen/rhonda-check/hoon` which accepts a `@ud` unsigned decimal value and applies `++check` to verify if that value is a Rhonda number or not.

    - `/gen/rhonda-series/hoon`

        You should provide a `%say` generator at `/gen/rhonda-series/hoon` which accepts a `@ud` unsigned decimal value `b` and a `@ud` unsigned decimal value `n`, where `b` is the base _b_, and returns the first _n_ Rhonda numbers in that base.

##  Unit Tests

Following a principle of test-driven development, we compose a series of tests which allow us to rigorously check for expected behavior.

```hoon
/+  *test, *rhonda
|%
++  test-check-four
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 4 10.000)
  %+  expect-eq
    !>  %.y
    !>  (check 4 10.206)
  %+  expect-eq
    !>  %.n
    !>  (check 4 10.500)
  %+  expect-eq
    !>  %.y
    !>  (check 4 11.935)
  %+  expect-eq
    !>  %.n
    !>  (check 4 50.000)
  %+  expect-eq
    !>  %.y
    !>  (check 4 94.185)
  ==
++  test-check-six
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 6 800)
  %+  expect-eq
    !>  %.y
    !>  (check 6 855)
  %+  expect-eq
    !>  %.n
    !>  (check 6 1.000)
  %+  expect-eq
    !>  %.y
    !>  (check 6 1.029)
  %+  expect-eq
    !>  %.n
    !>  (check 6 18.181)
  %+  expect-eq
    !>  %.y
    !>  (check 6 19.136)
  ==
++  test-check-eight
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 8 1.200)
  %+  expect-eq
    !>  %.y
    !>  (check 8 1.836)
  %+  expect-eq
    !>  %.n
    !>  (check 8 4.800)
  %+  expect-eq
    !>  %.y
    !>  (check 8 6.622)
  %+  expect-eq
    !>  %.n
    !>  (check 8 18.181)
  %+  expect-eq
    !>  %.y
    !>  (check 8 25.398)
  ==
++  test-check-nine
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 9 15.000)
  %+  expect-eq
    !>  %.y
    !>  (check 9 15.540)
  %+  expect-eq
    !>  %.n
    !>  (check 9 20.000)
  %+  expect-eq
    !>  %.y
    !>  (check 9 21.054)
  %+  expect-eq
    !>  %.n
    !>  (check 9 45.000)
  %+  expect-eq
    !>  %.y
    !>  (check 9 47.652)
  ==
++  test-check-ten
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 10 1.000)
  %+  expect-eq
    !>  %.y
    !>  (check 10 1.568)
  %+  expect-eq
    !>  %.n
    !>  (check 10 2.000)
  %+  expect-eq
    !>  %.y
    !>  (check 10 2.835)
  %+  expect-eq
    !>  %.n
    !>  (check 10 12.000)
  %+  expect-eq
    !>  %.y
    !>  (check 10 12.985)
  ==
++  test-check-twelve
  ;:  weld
  %+  expect-eq
    !>  %.n
    !>  (check 12 500)
  %+  expect-eq
    !>  %.y
    !>  (check 12 560)
  %+  expect-eq
    !>  %.n
    !>  (check 12 1.000)
  %+  expect-eq
    !>  %.y
    !>  (check 12 3.993)
  %+  expect-eq
    !>  %.n
    !>  (check 12 50.000)
  %+  expect-eq
    !>  %.y
    !>  (check 12 58.504)
  ==
++  test-series-three
  ;:  weld
  %+  expect-eq
    !>  ~
    !>  (series 3 5)
  ==
++  test-series-four
  ;:  weld
  %+  expect-eq
    !>  `(list @ud)`~[10.206]
    !>  (series 4 1)
  %+  expect-eq
    !>  `(list @ud)`~[10.206 11.935 12.150 16.031]
    !>  (series 4 4)
  %+  expect-eq
    !>  `(list @ud)`~[10.206 11.935 12.150 16.031 45.030 94.185]
    !>  (series 4 6)
  ==
++  test-series-six
  ;:  weld
  %+  expect-eq
    !>  `(list @ud)`~[855]
    !>  (series 6 1)
  %+  expect-eq
    !>  `(list @ud)`~[855 1.029 3.813 5.577]
    !>  (series 6 4)
  %+  expect-eq
    !>  `(list @ud)`~[855 1.029 3.813 5.577 7.040 7.304]
    !>  (series 6 6)
  ==
++  test-series-nine
  ;:  weld
  %+  expect-eq
    !>  `(list @ud)`~[15.540]
    !>  (series 9 1)
  %+  expect-eq
    !>  `(list @ud)`~[15.540 21.054 25.331]
    !>  (series 9 3)
  %+  expect-eq
    !>  `(list @ud)`~[15.540 21.054 25.331 44.360 44.660 44.733 47.652]
    !>  (series 9 7)
  ==
++  test-series-ten
  ;:  weld
  %+  expect-eq
    !>  `(list @ud)`~[1.568]
    !>  (series 10 1)
  %+  expect-eq
    !>  `(list @ud)`~[1.568 2.835 4.752 5.265 5.439 5.664 5.824]
    !>  (series 10 7)
  %+  expect-eq
    !>  `(list @ud)`~[1.568 2.835 4.752 5.265 5.439 5.664 5.824 5.832 8.526 12.985]
    !>  (series 10 10)
  ==
++  test-series-sixteen
  ;:  weld
  %+  expect-eq
    !>  `(list @ud)`~[1.000 1.134]
    !>  (series 16 2)
  %+  expect-eq
    !>  `(list @ud)`~[1.000 1.134 6.776 15.912 19.624]
    !>  (series 16 5)
  %+  expect-eq
    !>  `(list @ud)`~[1.000 1.134 6.776 15.912 19.624 20.043 20.355 23.946 26.296]
    !>  (series 16 9)
  ==
--
```

##  Solutions

_These solutions were submitted by the Urbit community as part of a competition in ~2022.6.  They are made available under both the [MIT license](https://mit-license.org/) and the [CC0 license](https://creativecommons.org/share-your-work/public-domain/cc0).  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_This solution was produced by ~mocmex-pollen.  This code includes the `~_` sigcab error message rune and demonstrates the use of a helper core in a library and shows `^` ket skipping of `$` buc._

**`/lib/rhonda.hoon`**

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

**`/gen/rhonda-check.hoon`**

```hoon
::  %say the product of the check arm of /lib/rhonda/hoon
::
/+  *rhonda
::
:-  %say
|=  [* [b=@ud n=@ud ~] *]
^-  [%noun ?]
[%noun (check b n)]
```

**`/gen/rhonda-series.hoon`**

```hoon
::  %say the product of the series arm of /lib/rhonda/hoon
::
/+  *rhonda
::
:-  %say
|=  [* [b=@ud n=@ud ~] *]
^-  [%noun (list @ud)]
[%noun (series b n)]
```

### Solution #2

_This solution was produced by ~ticlys-monlun.  This code demonstrates using a `++map` data structure and a different square-root solution algorithm._

**`/lib/rhonda.hoon`**

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

**`/gen/rhonda-check.hoon`**

```hoon
/+  *rhonda
:-  %say
|=  [* [n=@ud base=@ud ~] ~]
:-  %noun
(check n base)
```

**`/gen/rhonda-series.hoon`**

```hoon
/+  *rhonda
:-  %say
|=  [* [base=@ud many=@ud ~] ~]
:-  %noun
(series base many)
```

### Solution #3

_This solution was produced by ~tamlut-modnys.  This code demonstrates a clean prime factorization algorithm and the use of `++roll`._

**`/lib/rhonda.hoon`**

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

**`/gen/rhonda-check.hoon`**

```hoon
::  say generator that calls the check function to see if a number is a Rhonda number
::
/+  rhonda
:-  %say
|=  [* [base=@ud n=@ud ~] *]
:-  %noun
(check:rhonda [base n])
```

**`/gen/rhonda-series.hoon`**

```hoon
::  say generator that calls the series function to get the first n Rhonda numbers in a base
::
/+  rhonda
:-  %say
|=  [* [base=@ud n=@ud ~] *]
:-  %noun
(series:rhonda [base n])
```

### Solution #4

_This solution was produced by ~sidnym-ladrut.  This code demonstrates using multiple cores in a library._

**`/lib/rhonda.hoon`**

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

**`/gen/rhonda-check.hoon`**

```hoon
/+  *rhonda
:-  %say
|=  [* [n=@ud ~] ~]
:-  %noun
^-  bean
:: 4 is the minimum rhonda base (lowest non-prime integer).
:: n is *a* maximum because n != n * (v >= 2), but likely not the best maximum.
?&  (gte n 4)
  %+  lien  (gulf 4 n)
  |=  b=@ud
  ^-  bean
  (check b n)
==
```

**`/gen/rhonda-series.hoon`**

```hoon
/+  *rhonda
:-  %say
|=  [* [b=@ud n=@ud ~] ~]
:-  %noun
^-  (list @ud)
(series b n)
```
