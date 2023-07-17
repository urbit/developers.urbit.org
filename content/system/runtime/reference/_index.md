+++
title = "Reference"
weight = 600
sort_by = "weight"
insert_anchor_links = "right"
+++

The Nock runtime system, written in C.

Keep reading if you're planning to work on the Urbit interpreter, you're a
language implementation geek, or you don't really understand anything until
you've seen the actual structs.

## [C runtime system](/reference/runtime/runtime)

The Urbit interpreter is built on a Nock runtime system written
in C, `u3`. This section is a relatively complete description.

## [c3: C in Urbit](/reference/runtime/c)

Under `u3` is the simple `c3` layer, which is just how we write C
in Urbit.

## [u3: Land of nouns](/reference/runtime/nouns)

The division between `c3` and `u3` is that you could theoretically
imagine using `c3` as just a generic C environment. Anything to do
with nouns is in `u3`.

## [u3: API overview by prefix](/reference/runtime/api)

A walkthrough of each of the `u3` modules.

## [How to write a jet](/reference/runtime/jetting)

A jetting guide by for new Urbit developers.

## [Cryptography](/reference/runtime/cryptography)

References on the cryptography libraries utilized by jets.
