+++
title = "Index File"
weight = 10
template = "doc.html"
+++

Each desk with docs may include a `doc.toc` file in its root. A `doc.toc` file
looks something like this:

```
/dev                  Developer
  /hark-store         Hark-store
    /overview/udon    Overview
    /types/udon       Data Types
    /pokes/udon       Pokes
    /paths/udon       Subscription Paths
    /scry/udon        Scry Endpoints
  /settings-store     Settings-store
    /overview/udon    Overview
    /types/udon       Data Types
    /pokes/udon       Pokes
    /paths/udon       Subscription Paths
    /scry/udon        Scry Endpoints
```

Each line contains a pair of path and title with at least one space in between.
A path with a single element (such as `/dev` and `/hark-store`) denotes a
directory. A path with two elements (such as `/overview/udon`) denotes a file,
where the first element is the name and the second is the mark.

Any directory structure and depth is allowed. The hierarchy is determined by
indentation. Each double-space indent denotes a nesting level. Two spaces is one
level, four spaces is two levels, etc.

The root is the `/doc` directory of your desk, it should not be explicitly
listed.

The title specified will be displayed at the top of the document and in the
table of contents for the desk.

If no `doc.toc` file is included, but a desk does have other files under
`/doc`, the Docs app will infer a table of contents from the directory
structure, and _all_ files will be included. Files are ordered alphabetically,
except that 'overview' always come first. For titles, hyphens in the filename
are replaced with spaces and the whole is converted to Title Case.
