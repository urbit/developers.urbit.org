# Contributing

If you are contributing a simple typo correction, you don't need to supply an
associated issue.  Otherwise, read on.

## Workflow

Before beginning any nontrivial unit of work, you should ensure you have a GitHub
issue detailing the motivation and scope of the work. This could be an issue
someone else filed and has been assigned to you (or you've assigned to yourself)
or a new issue you filed specifically for this unit of work. As much as possible,
discussion of the work should take place in the issue. When this is not possible,
please update the issue with relevant details from any offline conversations. Each
issue should provide a clear and thorough history of the work from inception to
completion.

### Branch Names

Every branch that you intend to put up for review must adhere to the form
`i/<N>/<...>`, where `<N>` is the number of the issue that the branch corresponds
to and `<...>` is an optional short description of the branch to aid in
readability. If `<...>` is omitted, the `/` should be omitted as well, which
makes `i/<N>` a well-formed branch name.

### Commits

Commit messages should be written in an imperative style and include a mandatory
short description and optional long description.

```
Require a short description

Optionally add a long description.
```

### Pull Requests and Merges

When your work is ready for review, open a pull request, making sure to link
to the tracking issue in the description, which should be formatted as follows
(where `<N>` is the number of this work's tracking issue):

```
### Description

Resolves #<N>.

Thoroughly describe the changes made.

### Related

Reference any related issues, links, papers, etc. here.
```

Once you've collected and addressed feedback and are ready to merge, merge the
pull request. Use the default commit message which should default to your PR
title and description. Assuming that you properly included the "Resolves #N."
directive in the pull request description, merging will automatically close the
tracking issue associated with the pull request.


## Development Environment

Details for building the site locally and using Vercel's preview integration are
provided in README.md.
