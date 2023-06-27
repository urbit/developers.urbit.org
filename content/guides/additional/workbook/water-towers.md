+++
title = "Water Towers"
weight = 48
+++

## Challenge: Water between Towers

In a two-dimensional world, we begin with a bar-chart, or rows of unit-width 'towers' of arbitrary height. Then it rains, completely filling all convex enclosures in the chart with water.

```
9               ██           9               ██    
8               ██           8               ██    
7     ██        ██           7     ██≈≈≈≈≈≈≈≈██    
6     ██  ██    ██           6     ██≈≈██≈≈≈≈██    
5 ██  ██  ██  ████           5 ██≈≈██≈≈██≈≈████    
4 ██  ██  ████████           4 ██≈≈██≈≈████████    
3 ██████  ████████           3 ██████≈≈████████    
2 ████████████████  ██       2 ████████████████≈≈██
1 ████████████████████       1 ████████████████████
```

Your task for this challenge is to write a generator `water-towers`. It will take as input a `(list @ud)`, with each number representing the height of a tower from left to right. It will output a `@ud` representing the units of water that can be contained within the structure.

Example usage:
```
> +water-towers [5 3 7 2 6 4 5 9 1 2 ~]
14
```

##  Unit Tests

Following a principle of test-driven development, we compose a series of tests which allow us to rigorously check for expected behavior.

``` 
/+  *test
/=  water-towers  /gen/water-towers
|%
++  test-01
  %+  expect-eq
    !>  `@ud`2
    !>  (water-towers [1 5 3 7 2 ~])
++  test-02
  %+  expect-eq
    !>  `@ud`14
    !>  (water-towers [5 3 7 2 6 4 5 9 1 2 ~])
++  test-03
  %+  expect-eq
    !>  `@ud`35
    !>  (water-towers [2 6 3 5 2 8 1 4 2 2 5 3 5 7 4 1 ~])
++  test-04
  %+  expect-eq
    !>  `@ud`0
    !>  (water-towers [5 5 5 5 ~])
++  test-05
  %+  expect-eq
    !>  `@ud`0
    !>  (water-towers [5 6 7 8 ~])
++  test-06
  %+  expect-eq
    !>  `@ud`0
    !>  (water-towers [8 7 7 6 5 4 3 2 ~])
++  test-07
  %+  expect-eq
    !>  `@ud`0
    !>  (water-towers [0 1 6 7 10 7 6 1 0 ~])
++  test-08
  %+  expect-eq
    !>  `@ud`0
    !>  (water-towers [100 0 0 0 0 0 0 0 ~])
++  test-09
  %+  expect-eq
    !>  `@ud`7
    !>  (water-towers [100 0 0 0 0 0 0 0 1 ~])
++  test-10
  %+  expect-eq
    !>  `@ud`50
    !>  (water-towers [10 0 0 0 0 0 10 ~])
++  test-11
  %+  expect-eq
    !>  `@ud`4
    !>  (water-towers [8 7 8 7 8 7 8 7 8 ~])
++  test-12
  %+  expect-eq
    !>  `@ud`40
    !>  (water-towers [0 1 2 3 4 5 4 3 2 1 1 2 3 4 5 4 3 2 1 1 2 3 4 5 4 3 2 1 0 ~])
--
```

##  Solutions

_These solutions were submitted by the Urbit community as part of a competition in ~2023.6.  They are made available under the GNU License.  We ask you to acknowledge authorship should you utilize these elsewhere._

### Solution #1

_By ~dannul-bortux. A model for literate programming._

```
::
::  A gate for computing volume of water collected between towers.
::
::    Take a list (of type list @ud), with each value representing the height of
::    a tower from left to right. Outputs a @ud representing the units of water 
::    that can be contained within the structure.
::
::    Our approach involves calculating the total volume of rainfall or water by
::    aggregating the water volume from each tower location. For a specific 
::    tower location. water volume is determined by subtracting the “height” 
::    of the tower with maximum rainfall (“total height with water”) from the 
::    height of the tower alone. Tower heights are given by corresponding values
::    in the input list.
::  
::    The “total height with water” at a location is determined by the height of
::    surrounding boundary towers within our structure. Each tower location will
::    have at most two boundary towers: one boundary tower on either side (left 
::    and right). The left boundary tower is defined as the highest tower to the
::    left of our specified tower location. The right boundary tower is defined 
::    as the highest tower to the right of our specified tower location. The 
::    value of “total height with water” at a location is equal to the lesser of
::    the two boundary tower heights (the minimum of the left boundary tower 
::    height vs. right boundary tower height). When less than two boundary 
::    towers are present, the “total height with water” is equal to the height
::    of the tower itself because no water can be contained without boundaries.
::
|=  inlist=(list @ud)
^-  @ud
::  If, input list is empty
::
?:  =(0 (lent inlist))
  ::  Then, throw error
  ::
  ~|  'Error - input list cannot be empty'
  !!
=<  (compute-totalvol inlist)
|%
::
::  +compute-totalvol: Gets total volume of water by summing water at each 
::  individual location.
::
::    Moves left to right iterating over each location (index in list). 
::    Determines waterfall at each location and aggregates all waterfall to 
::    find and return total volume.
::
++  compute-totalvol
  |=  [n=(list @ud)]
  ^-  @ud
  ::  i is face for iterating over all index/locations
  ::
  =/  i  0
  ::  tot is face for aggregating volume of water
  ::
  =/  tot  0
  |-
  ::  If, we're at end of input list
  ::
  ?:  =(i (lent n))
    ::  then, return total
    ::
    tot
  ::  else, compute water volume at current index, add to total, and increment i
  ::
  %=  $
      tot  (add tot (compute-indvol i n))
      i  +(i)
  ==
::
::  +compute-indvol: Computes volume at an individual location.
::   
::    Computes volume at an individual location (index in input list) by 
::    subtracting tower height from “total height with water”. “Total height 
::    with water” will be determined at a particular location by the height of 
::    “boundary towers” for that location. 
::
++  compute-indvol
  |=  [loc=@ud n=(list @ud)]
  ^-  @ud
  (sub (compute-waterheight loc n) (snag loc `(list @ud)`n))
::
::  +compute-waterheight: Measures the “total height with water” at a specified 
::  index/location.
::
::    “Total height with water” at a particular location is measured using the 
::    heights (value) at the left and right boundary towers. The lesser of these
::    two values (left height vs right height) is equal to the “total height 
::    with water” at our input location. 
::  
::    Right boundary tower is the tallest tower to the right of the location--
::    i.e. highest value (height) with higher index. The left boundary tower is
::    the tallest tower to the left of the location i.e. highest value (height) 
::    with lower index. 
::
::    The “find-boundaryheight” arm iterates left to right and works for 
::    measuring height of the right boundary tower. For the left boundary tower 
::    we can use a mirror approach. We reverse the input list and adjust the 
::    input index accordinglyto move right-to-left. 
::
::    In the case where no right or left boundary tower exists, our 
::    “find-boundaryheight” arm will return the tower height at our current 
::    index (indicating no water present) and we correctly compute 0 water 
::    volume in our compute-indvol arm.
::
++  compute-waterheight
  |=  [loc=@ud n=(list @ud)]
  ^-  @ud
  ::  rbth is a face for our "right boundary tower height" computed using our 
  ::  "find-boundaryheight" arm moving left to right
  ::
  =/  rbth  (find-boundaryheight loc n)
  ::  lbth is a face for our "right boundary tower height" computed using our 
  ::  "find-boundaryheight" arm moving (mirrored) right to left
  ::
  =/  lbth  (find-boundaryheight (sub (lent n) +(loc)) (flop n))
  ::  If, right boundary tower height is less than left boundary tower height, 
  ::
  ?:  (lth rbth lbth)
  ::  then, return right boundary tower height
  ::
    rbth
  ::  else, return left boundary tower height
  ::
  lbth
::
::  +find-boundaryheight: Computes the height of the highest tower to the right 
::  of the input location
::
::    Moves left to right starting at input location until the end of input 
::    list. Tracks height of each tower location with a height greater than 
::    height at corresponding input location.
::
++  find-boundaryheight
  |=  [loc=@ud n=(list @ud)]
  ^-  @ud
  ::  i is face used to iterate over input list starting one past input index
  ::
  =/  i  +(loc)
  ::  bheight is face used to measure boundary tower heights--i.e. any tower
  ::  heights greater than height at input location. At start, bheight is set to
  ::  input location height. If no greater heights are found, input location
  ::  height is returned (indicating no higher boundary towers found).
  ::
  =/  bheight  (snag loc n)
  |-
  ::  If, we are at the end of our input
  ::
  ?:  (gte i (lent n))
    ::  then, return boundary tower height
    ::
    bheight
  ::  else, if current tower height is greater than currently stored boundary 
  ::  tower height, replace boundary tower height. Incr iteration idx.
  ::
  %=  $
      bheight  ?:  (gth (snag i n) bheight)
                 (snag i n) 
               bheight
      i        +(i)
  ==
--
```



### Solution #2
_By ~racfer-hattes. Short and elegant. Also the speed winner, clocking in at an incredible 29 minutes._

```
=>
|%
++  go 
  |=  [current=@ud previous=(list @ud) next=(list @ud)]
  =/  left-peak  (roll previous max)
  =/  right-peak  (roll next max)
  =/  min-peak  (min left-peak right-peak)
  =/  water-level  
    ?:  (lth min-peak current)  0  
    (sub min-peak current)
  ?~  next  water-level
  (add water-level $(current i.next, next t.next, previous [current previous]))
--
|=  xs=(list @ud)
?~  xs  0
%-  go  [i.xs ~ t.xs]
```

### Solution #3
_By ~dozreg-toplud. Another very literate and clean solution._


```
::  +water-towers: a solution to the HSL challenge #1
::
::    https://github.com/tamlut-modnys/template-hsl-water-towers
::    Takes a (list @ud) of tower heights, returns the number of the units of
::    water that can be held in the given structure.
::
|=  towers=(list @ud)
^-  @ud
=<
::  x, y are horizontal and vertical axes
::
=|  water-counter=@ud
=/  x-last-tower=@ud  (dec (lent towers))
=/  y-highest-tower=@ud  (roll towers max)
::  iterate along y axis from y=0
::
=/  y=@ud  0
|-
^-  @ud
::  if, y > max(towers)
::
?:  (gth y y-highest-tower)
  ::  then, return water-counter
  ::
  water-counter
::  else, iterate along x axis from x=1
::
=/  x=@ud  1
|-
^-  @ud
::  if, x = x(last tower)
::
?:  =(x x-last-tower)
  ::  then, go to the next y
  ::
  ^$(y +(y))
::  else, increment water-counter if the point [x y] is not occupied by a tower
::  and has towers to the left and right on the same y, after go to the next x
::
=?  water-counter  ?&  (not-tower x y)
                       (has-tower-left x y)
                       (has-tower-right x y)
                   ==
  +(water-counter)
$(x +(x))
::
::  Core with helping functions
::
|%
::  ++not-tower: returns %.y if the coordinate [x y] is free from a tower,
::  %.n if occupied.
::
++  not-tower
  |=  [x=@ud y=@ud]
  ^-  ?
  (gth y (snag x towers))
::  ++has-tower-left: returns %.y if there is a tower with height >= y to
::  the left from x, %.n otherwise. Enabled computation caching to only test
::  each point once.
::
++  has-tower-left
  |=  [x=@ud y=@ud]
  ~+
  ^-  ?
  ::  no towers to the left from the 0th tower
  ::
  ?:  =(x 0)
    %.n
  ::  check recursively to the left
  ::
  ?|  (gte (snag (dec x) towers) y)
      $(x (dec x))
  ==
::  ++has-tower-right: returns %.y if there is a tower with height >= y to
::  the right from x, %.n otherwise. Enabled computation caching to only test
::  each point once.
::
++  has-tower-right
  |=  [x=@ud y=@ud]
  ~+
  ^-  ?
  ::  no towers to the right from the last tower
  ::
  ?:  =(x (dec (lent towers)))
    %.n
  ::  check recursively to the right
  ::
  ?|  (gte (snag +(x) towers) y)
      $(x +(x))
  ==
::
--
```