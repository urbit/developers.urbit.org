+++
title = "Gleichniszahlenreihe"
weight = 30
+++

## Challenge: The Look-and-Say Sequence

_Gleichniszahlenreihe_, or the [look-and-say sequence](https://en.wikipedia.org/wiki/Look-and-say_sequence), is constructed from an aural description of a sequence of numbers.

Consider the sequence of numbers that begins with `1, 11, 21, 1211, 111221, 312211, 13112221, ...`.  Each number in the sequence represents what would result if the digits in the preceding value were counted and spoken aloud.  For instance, "1" yields "one 1 → 11"; "11" yields "two 1s → 21"; "21" yields "one 2, one 1 → 1211", and so forth.  The next number in the sequence after "13112221" is thus "one 1, one 3, two 1s, three 2s, one 1 → 1113213211".

This is a fairly complicated program.  You need a few parts:  the ability to take a tape and parse it into components, the ability to count components, and the ability to produce a new tape.  Then a recursing bit to produce a list of these values and (ultimately) return the last one.  Think about the Caesar cipher's structure.

- Compose a `%say` generator which carries out the look-and-say sequence calculation for a given input.  The input should be a number which indicates which value in the sequence is desired (e.g. 1→1, 2→11, 3→21).

## Solutions

_These solutions were submitted by the Urbit community as part of the Hoon School Live ~2022.2 cohort.  They are made available under both the [MIT license](https://mit-license.org/) and the [CC0 license](https://creativecommons.org/share-your-work/public-domain/cc0).  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_This solution was produced by ~midsum-salrux.  This code exhibits good core structure and code encapsulation in arms._

**`/gen/look-and-say.hoon`**

```hoon
:-  %say
|=  [* [n=@ud ~] *]
:-  %noun
=<  (compute-sequence n)
|%
+$  counted-digit  [count=@ud digit=@t]
++  compute-sequence
  |=  n=@ud
  ^-  tape
  =/  sequence  "1"
  |-
  ?:  =(n 1)
    sequence
  $(sequence (progress sequence), n (dec n))
++  progress
  |=  sequence=tape
  ^-  tape
  (speak (count-digits sequence))
++  speak
  |=  cd=(list counted-digit)
  ^-  tape
  (zing (turn cd |=(d=counted-digit ~[(crip ~(rud at count.d)) digit.d])))
++  count-digits
  |=  sequence=tape
  ^-  (list counted-digit)
  (scan sequence several-repeated-digits)
++  several-repeated-digits  (plus (cook unreap many-same-digit))
++  unreap
  |=  a=tape
  ^-  counted-digit
  [(lent a) (snag 0 a)]
++  many-same-digit
  ;~  pose
    (many-particular-digit '1')
    (many-particular-digit '2')
    (many-particular-digit '3')
    (many-particular-digit '4')
    (many-particular-digit '5')
    (many-particular-digit '6')
    (many-particular-digit '7')
    (many-particular-digit '8')
    (many-particular-digit '9')
  ==
++  many-particular-digit  (corl plus just)
--
```


Usage:

```hoon
> +look-and-say 1
"1"

> +look-and-say 2
"11"

> +look-and-say 5
"111221"

> +look-and-say 10
"13211311123113112211"

> +look-and-say 20
"11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211"
```


### Solution #2

_This solution was produced by ~nallux-dozryl.  This code exemplifies parsimonious use of parsing rules and can parse any arbitrary sequence of digits._

**`/gen/look-and-say.hoon`**

```hoon
:-  %say
|=  [* [in=tape ~] ~]
:-  %noun
^-  tape
=|  final=tape
|-
?~  in  final
=+  nums=`tape`(scan in (star nud))
=+  slot=(head nums)
=+  parsed=((star (just slot)) [[1 1] nums])
=+  count=(scow %ud (dec (tail (head (tail (need (tail parsed)))))))
=+  return=:(weld final count (trip slot))
=+  newin=(tail (tail (need (tail parsed))))
$(final return, in newin)
```

Usage:

```hoon
> +look-and-say "12"
"1112"

> +look-and-say "123"
"111213"

> +look-and-say "1234"
"11121314"

> +look-and-say "123455"
"1112131425"
```
