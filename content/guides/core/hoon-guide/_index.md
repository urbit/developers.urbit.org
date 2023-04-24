+++
title = "Hoon Guide"
weight = 5
sort_by = "weight"
insert_anchor_links = "right"
+++

## Table of Contents

- **[Introduction](/guides/core/hoon-guide/A-intro)**

#### Lessons

1. **[Hoon Syntax](/guides/core/hoon-guide/B-syntax)** - This module will discuss the fundamental data concepts of Hoon and how programs effect control flow.
2. [Azimuth (Urbit ID)](/guides/core/hoon-guide/C-azimuth) - This module introduces how Urbit ID is structured and provides practice in converting and working with `@p` identity points. (Optional)
3. **[Gates (Functions)](/guides/core/hoon-guide/D-gates)** - This module will teach you how to produce deferred computations for later use, like functions in other languages.
4. **[Molds (Types)](/guides/core/hoon-guide/E-types)** - This module will introduce the Hoon type system and illustrate how type checking and type inference work.
5. **[Cores](/guides/core/hoon-guide/F-cores)** - This module will introduce the key Hoon data structure known as the **core**, as well as ramifications.
6. **[Trees and Addressing](/guides/core/hoon-guide/G-trees)** - This module will elaborate how we can use the structure of nouns to locate data and evaluate code in a given expression.  It will also discuss the important `list` mold builder and a number of standard library operations.
7. **[Libraries](/guides/core/hoon-guide/H-libraries)** - This module will discuss how libraries can be produced, imported, and used.
8. [Testing Code](/guides/core/hoon-guide/I-testing) - This module will discuss how we can have confidence that a program does what it claims to do, using unit testing and debugging strategies. (Optional)
9. **[Text Processing I](/guides/core/hoon-guide/J-stdlib-text)** - This module will discuss how text is represented in Hoon, discuss tools for producing and manipulating text, and introduce the `%say` generator, a new generator type.
10. **[Cores & Doors](/guides/core/hoon-guide/K-doors)** - This module will start by introducing the concept of gate-building gates; then it will expand our notion of cores to include doors; finally it will introduce a common door, the `++map`, to illustrate how doors work.
11. **[Data Structures](/guides/core/hoon-guide/L-struct)** - This module will introduce you to several useful data structures built on the door, then discuss how the compiler handles types and the sample.
12. **[Type Checking](/guides/core/hoon-guide/M-typecheck)** - This module will cover how the Hoon compiler infers type, as well as various cases in which a type check is performed.
13. **[Conditional Logic](/guides/core/hoon-guide/N-logic)** - This module will cover the nature of loobean logic and the rest of the `?` wut runes.
14. **[Subject-Oriented Programming](/guides/core/hoon-guide/O-subject)** - This module discusses how Urbit's subject-oriented programming paradigm structures how cores and values are used and maintain state, as well as how deferred computations and remote value lookups (“scrying”) are handled.
15. [Text Processing II](/guides/core/hoon-guide/P-stdlib-io) - This module will elaborate on text representation in Hoon, including formatted text, and `%ask` generators. (Optional)
16. **[Functional Programming](/guides/core/hoon-guide/Q-func)** - This module will discuss some gates-that-work-on-gates and other assorted operators that are commonly recognized as functional programming tools.
17. [Text Processing III](/guides/core/hoon-guide/Q2-parsing) - This module will cover text parsing. (Optional)
18. [Generic and Variant Cores](/guides/core/hoon-guide/R-metals) - This module introduces how cores can be extended for different behavioral patterns. (Optional)
19. [Mathematics](/guides/core/hoon-guide/S-math) - This module introduces how non-`@ud` mathematics are instrumented in Hoon. (Optional)
