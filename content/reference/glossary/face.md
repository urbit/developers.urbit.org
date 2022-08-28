+++
title = "Face"

[extra]
category = "hoon-nock"
+++

A **face** is a name for a value, type or expression in
[Hoon](/reference/glossary/hoon). In the expression `foo=42`, `foo` is the face
of the value `42`. When that value is pinned to the
[subject](/reference/glossary/subject) like `=+ foo=42`, subsequent expressions
can reference `foo` and it will be substituted with `42`. Faces are part of
Hoon's type system, and are replaced with tree addresses when compiled to
[Nock](/reference/glossary/nock).

#### Further reading

- [Hoon school lesson
  1](/guides/core/hoon-school/B-syntax#preserving-values-with-faces): This
  lesson discusses faces in more detail.
