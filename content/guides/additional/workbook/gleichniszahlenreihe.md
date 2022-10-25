+++
title = "Gleichniszahlenreihe"
weight = 30
+++

_Gleichniszahlenreihe_, or the look-and-say sequence, is constructed from an aural description of a sequence of numbers.

Consider the sequence of numbers that begins with `1, 11, 21, 1211, 111221, 312211, 13112221, ...`.  Each number in the sequence represents what would result if the digits in the preceding value were counted and spoken aloud.  For instance, "1" yields "one 1 → 11"; "11" yields "two 1s → 21"; "21" yields "one 2, one 1 → 1211", and so forth.  The next number in the sequence after "13112221" is thus "one 1, one 3, two 1s, three 2s, one 1 → 1113213211".

This is a fairly complicated program.  You need a few parts:  the ability to take a tape and parse it into components, the ability to count components, and the ability to produce a new tape.  Then a recursing bit to produce a list of these values and (ultimately) return the last one.  Think about the Caesar cipher's structure.

- Compose a `%say` generator which carries out the look-and-say sequence calculation for a given input.  The input should be a number which indicates which value in the sequence is desired (e.g. 1→1, 2→11, 3→21).
