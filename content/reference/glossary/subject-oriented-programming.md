+++
title = "Subject Oriented Programming"

[extra]
category = "hoon-nock"

[glossaryEntry."subject oriented programming"]
name = "subject oriented programming"
symbol = ""
usage = "hoon-nock"
desc = "The programming paradigm where each expression is evaluated against a piece of data called the subject and containing the expression's context."

+++

The Urbit operating system hews to a conceptual model wherein each expression
takes place in a certain [context](/reference/glossary/context) (the
[subject](/reference/glossary/subject)). While sharing a lot of practicality
with other programming paradigms and platforms, Urbit's model is mathematically
well-defined and unambiguously specified. Every expression of
[Hoon](/reference/glossary/hoon) is evaluated relative to its subject, a piece
of data that represents the environment, or the context, of an expression.

#### Further reading

- [Hoon School: subject-oriented programming](/guides/core/hoon-school/O-subject): A guide to
  subject-oriented programming.
