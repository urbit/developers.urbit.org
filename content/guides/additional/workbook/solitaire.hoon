#   Solitaire Cipher

##  Challenge:  Solitaire Encryption Cipher

The [Solitaire or Pontifex algorithm](https://en.wikipedia.org/wiki/Solitaire_%28cipher%29) is a cryptographic algorithm designed by cryptographer [Bruce Schneier](https://www.schneier.com/academic/solitaire/) based on coordinating two decks of cards so that they can be used to communicate between two field agents.  Given a standard deck of 52 playing cards and two distinguishable jokers, a message may be encrypted as a keystream, or sequence of values combined with the message to encrypt or decrypt it.  The algorithm features prominently in Neal Stephenson's novel _Cryptonomicon_.

Playing cards are conventionally numbered as clubs (1–13); diamonds (14–26); hearts (27–39); and spades (40–52).  The two jokers (53 and 54) are used to track the position of variables in the keystream.

Per Wikipedia:

> To encrypt a message:
>
> 1.  Remove all punctuation and spaces, leaving only the 26 letters A–Z.
> 2.  Convert each letter to its natural numerical value, A = 1, B = 2, ..., Z = 26.
> 3.  Generate one keystream value for each letter in the message using the keystream algorithm below.
> 4.  Add each keystream value to the corresponding plaintext number, subtracting 26 if the resulting value is greater than 26. (In mathematics this is called [modular arithmetic](https://en.wikipedia.org/wiki/Modular_arithmetic "Modular arithmetic").)
> 5.  Convert the resulting numbers back to letters. This sequence of letters is the [ciphertext](https://en.wikipedia.org/wiki/Ciphertext "Ciphertext").
>
> To decrypt a ciphertext:
>
> 1.  Convert each letter in the ciphertext to its natural numerical value.
> 2.  Generate one keystream value for each letter in the ciphertext.
> 3.  Subtract each keystream value from the corresponding ciphertext value, adding 26 if the resulting value is less than 1.
> 4.  Convert the resulting numbers back to letters.

The keystream algorithm generates the overall value by moving cards within the deck.  The algorithm is deterministic, which means that the values depend on the initial order of the deck (and thus why two decks are necessary).  The deck is circular (a card moved past the bottom cycles back in at the top and vice versa).

The mesage is converted to ALLUPPERCASE, conventionally in groups of five:  ALLUP PERCA SEXXX.

To generate one character:

> 1.  Locate the A joker (value 27) and move it down the deck by one place. If it is the last card, it becomes the second card. There is no way for it to become the first card.
> 2.  Locate the B joker (value 28) and move it down the deck by two places. Notice that if it is the second to last card, it becomes the second card by wrapping around. If it is the last card, it becomes the third card. There is no way for it to become the first card.
> 3.  Perform a "triple cut": split the deck into three sections. Everything above the top joker (which, after several repetitions, may not necessarily be the A joker) and everything below the bottom joker will be exchanged. The jokers themselves, and the cards between them, are left untouched.
> 4.  Perform a "count cut": observe the value of the card at the bottom of the deck. If the card is either joker take its value to be 27. Remove that number of cards from the top of the deck and insert them just above the last card in the deck.
> 5.  Now, look at the value of the top card. Again, either joker counts as 27. Count this many places below that card and take the value of that card as the next value in the keystream. If the card counted to is either joker, ignore it and repeat the keystream algorithm. In this example the top card is 23, so we count to the 24th card, which is 11; thus the keystream value is 11. (Note that no cards change places in this step, this step simply determines the keystream value).

The foregoing hyperlinks showcase worked examples of Solitaire in action.


##  Solutions

_This solution was produced by ~rabsef-bicrym.  It is made available under the [GNU GPL](https://github.com/rabsef-bicrym/urbitasofia/blob/master/LICENSE).  (Note that this is different from the other code snippets on this site, which are made available under the [MIT license](https://mit-license.org/)._

The following Hoon generator can be used to encrypt a message with a default or custom deck.  With the default deck:

```hoon
> +pontifex "hello" %encode  
"eek`z"

> +pontifex "eek`z" %decode  
"hello"
```

A custom deck would look like `~[5 31 4 51 ...]` for all 54 values in a specified or random order.  One could compose a `shuffle` gate to randomize card order within that range:

```hoon
|=  [count=@ud eny=@uvJ]
^-  (list @ud)
=/  rng  ~(. og eny)
=/  index  1
=/  deck  (gulf 1 count)
|-  ^-  (list @ud)
?:  =(index count)  deck
=^  other  rng  (rads:rng count)
=/  value  (snag other deck)
%=  $
  index  +(index)
  deck   (snap (snap deck (dec index) value) other (snag (dec index) deck))
==
```

and invoke this as

```hoon
+pontifex "hello" %encode, =customdeck (shuffle 52 eny)
```

The generator will print the deck, so you can recover the random deck as needed.

E.g., for a given starting deck:

```hoon
> +pontifex "hello" %encode, =customdeck ~[30 41 7 39 31 23 20 12 48 36 16 24 33 5 4 14 38 43 28 32 6 44 8 10 3 35 50 1 2 18 21 37 42 53 52 27 46 15 13 29 34 26 11 40 49 45 54 19 51 9 25 17 22 47]
"rduqh"

> +pontifex "rduqh" %decode, =customdeck ~[30 41 7 39 31 23 20 12 48 36 16 24 33 5 4 14 38 43 28 32 6 44 8 10 3 35 50 1 2 18 21 37 42 53 52 27 46 15 13 29 34 26 11 40 49 45 54 19 51 9 25 17 22 47]
"hello"
```

**`/gen/pontifex.hoon`**

```hoon
!:
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] [incometape=tape action=@tas ~] [customdeck=(list @ud) ~]]
:-  %noun
|^
=/  tempvaltape=(list @ud)  (convert incometape)
=/  swapdeck=deckform  ?~(customdeck deckbuilder (customdeckbuilder customdeck))
=/  tempvalcard=@ud  `@ud`(keystreamcard (findoperant (triplecut (jokerbfunc (jokerafunc swapdeck)))))
=/  passone=@ud  0
=|  numencodemsg=(list @ud)
^-  tape
|-
?~  tempvaltape
  (alphashift numencodemsg)
%=  $
  tempvalcard  `@ud`(keystreamcard (findoperant (triplecut (jokerbfunc (jokerafunc (findoperant (triplecut (jokerbfunc (jokerafunc swapdeck)))))))))
  numencodemsg  [?:(=(%encode action) (add i.tempvaltape tempvalcard) ?:((gte tempvalcard i.tempvaltape) (sub (add 26 i.tempvaltape) ?:((gth tempvalcard 26) (mod tempvalcard 26) tempvalcard)) (sub i.tempvaltape ?:((gth tempvalcard 26) (mod tempvalcard 26) tempvalcard)))) numencodemsg]
  tempvaltape  t.tempvaltape
  swapdeck  `deckform`(findoperant (triplecut (jokerbfunc (jokerafunc swapdeck))))
==
+$  suits  ?(%heart %spade %club %diamond %joker)
+$  value  ?(%ace %1 %2 %3 %4 %5 %6 %7 %8 %9 %10 %jack %queen %king %a %b)
+$  card  ?([s=suits v=value])
+$  deckform  (list card)
++  suitlist  `(list suits)`~[%club %heart %spade %diamond]
++  suitpoints
  ^-  (map suits @ud)
  %-  my
  :~  :-  %club  0
      :-  %diamond  13
      :-  %heart  26
      :-  %spade  39
  ==
++  valuelist  `(list value)`~[%ace %2 %3 %4 %5 %6 %7 %8 %9 %10 %jack %queen %king]
++  valuepoints
  =/  valuepl=(list value)  valuelist
  =/  counter=@ud  1
  =|  valuemap=(map value @ud)
  |-  ^-  (map value @ud)
  ?~  valuepl
    valuemap
  $(valuemap (~(put by valuemap) i.valuepl counter), valuepl t.valuepl, counter +(counter))
++  deckbuilder
::  This deck's head is the bottom card in the deck, if using a physical deck
::  We recommend doing the manipulations with cards face up, if using a physical deck
::  Assuming the two above, your physical deck's top card (facing you) should be the Ace of Diamonds
::
  =/  deckvalue=(list value)  valuelist
  =/  decksuit=(list suits)  (flop suitlist)
  =|  deck=(list card)
  |-  ^-  deckform
  ?~  decksuit
    (into (into deck 13 `card`[%joker %a]) 27 `card`[%joker %b])
  ?~  deckvalue
    $(decksuit t.decksuit, deckvalue valuelist)
  $(deck [[i.decksuit i.deckvalue] deck], deckvalue t.deckvalue)
++  convert
  |=  msg=tape
  =.  msg  (cass msg)
  ^-  (list @ud)
  %+  turn  msg
  |=  a=@t
  (sub `@ud`a 96)
++  cardtovalue
  |=  crd=card
  ^-  @ud
  =/  suitpt=(map suits @ud)  suitpoints
  =/  valuept=(map value @ud)  valuepoints
  ?:  =(s.crd %joker)
      53
  (add (~(got by suitpt) s.crd) (add 1 (~(got by valuept) v.crd)))
++  jokerafunc
  |=  incomingdeck1=deckform
  ^-  deckform
  =/  startera  (find [%joker %a]~ incomingdeck1)
  =/  posita=@ud  ?~(startera ~|("No Joker A in Deck" !!) ?:(=(0 u.startera) 100 (dec u.startera)))
  ?:  =(posita 100)
    `deckform`(into `deckform`(oust [0 1] incomingdeck1) 51 `card`[%joker %a])
  `deckform`(into `deckform`(oust [+(posita) 1] incomingdeck1) posita `card`[%joker %a])
++  jokerbfunc
  |=  incomingdeck2=deckform
  ^-  deckform
  =/  starterb  (find [%joker %b]~ incomingdeck2)
  =/  positb=@ud  ?~(starterb ~|("No Joker B in Deck" !!) ?:((lth u.starterb 2) ?:(=(0 u.starterb) 100 101) (dec (dec u.starterb))))
  ?:  (gth positb 53)
    ?:  =(positb 100)
      `deckform`(into `deckform`(oust [0 1] incomingdeck2) 50 `card`[%joker %b])
    `deckform`(into `deckform`(oust [1 1] incomingdeck2) 51 `card`[%joker %b])
  `deckform`(into `deckform`(oust [(add positb 2) 1] incomingdeck2) positb `card`[%joker %b])
++  triplecut
  |=  incomingdeck3=deckform
  ^-  deckform
  =/  startera  (find [%joker %a]~ incomingdeck3)
  =/  starterb  (find [%joker %b]~ incomingdeck3)
  =/  posita=@ud  ?~(startera !! u.startera)
  =/  positb=@ud  ?~(starterb !! u.starterb)
  =/  higherjoker=@ud  ?:((gth posita positb) posita positb)
  =/  lowerjoker=@ud  ?:((lth posita positb) posita positb)
  =/  toptobottom=deckform  (slag +(higherjoker) incomingdeck3)
  =/  topcutlength=@ud  (lent toptobottom)
  =/  middle=deckform  (slag lowerjoker (oust [+(higherjoker) topcutlength] incomingdeck3))
  =/  midcutlength=@ud  (lent middle)
  =/  bottomtotop=deckform  (oust [lowerjoker (add midcutlength topcutlength)] incomingdeck3)
  `deckform`(weld (weld toptobottom middle) bottomtotop)
++  findoperant
  |=  incomingdeck4=deckform
  ^-  deckform
  =/  bcardval=@ud  (cardtovalue `card`(snag 0 incomingdeck4))
  =/  tempcutcards=deckform  (slag (sub 54 bcardval) incomingdeck4)
  =/  tempcardcut=deckform  (slag 1 (oust [(sub 54 bcardval) bcardval] incomingdeck4))
  =/  primacard=card  (snag 0 incomingdeck4)
  ?:  =(53 bcardval)
    `deckform`(findoperant (triplecut (jokerbfunc (jokerafunc incomingdeck4))))
  `deckform`(weld (into tempcutcards 0 primacard) tempcardcut)
++  keystreamcard
  |=  incomingdeck5=deckform
  ^-  @ud
  =/  opc=card  `card`(snag 53 incomingdeck5)
  =/  tempval=@ud  (cardtovalue opc)
  =/  keycard=card  (snag (sub 53 tempval) incomingdeck5)
  `@ud`(cardtovalue keycard)
++  alphashift
  |=  inclist=(list @ud)
  =|  outlist=tape
  |-
  ?~  inclist
    outlist
  $(outlist [`@t`(add 96 ?:((gth i.inclist 26) (mod i.inclist 26) i.inclist)) outlist], inclist t.inclist)
++  customdeckbuilder
  |=  decksettings=(list @ud)
  =/  valuefrom=(list value)  valuelist
  =|  outputdeck=deckform
  |-  ^-  deckform
  ?~  decksettings
    (flop outputdeck)
  ?:  &((gth i.decksettings 0) (lte i.decksettings 13))
    $(decksettings t.decksettings, outputdeck [`card`[%club (snag i.decksettings valuefrom)] outputdeck])
  ?:  &((gte i.decksettings 14) (lte i.decksettings 26))
    $(decksettings t.decksettings, outputdeck [`card`[%diamond (snag (sub i.decksettings 13) valuefrom)] outputdeck])
  ?:  &((gte i.decksettings 27) (lte i.decksettings 39))
    $(decksettings t.decksettings, outputdeck [`card`[%heart (snag (sub i.decksettings 26) valuefrom)] outputdeck])
  ?:  &((gte i.decksettings 40) (lte i.decksettings 52))
    $(decksettings t.decksettings, outputdeck [`card`[%spade (snag (sub i.decksettings 39) valuefrom)] outputdeck])
  ?:  =(53 i.decksettings)
    $(decksettings t.decksettings, outputdeck [`card`[%joker %a] outputdeck])
  ?:  =(54 i.decksettings)
    $(decksettings t.decksettings, outputdeck [`card`[%joker %b] outputdeck])
  !!
--
```
