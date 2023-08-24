+++
title = "Suggested Structure"
weight = 15
template = "doc.html"
+++

Here we'll discuss recommendations and best practices for your docs. The
%docs app doesn't impose any restrictions on the structure of your docs, so
you're free to do things differently if you feel it's appropriate.

## User docs

For the most part, user documentation depends on the nature of your app, so it's
up to you how you document it. There are, however, a couple of things that are
advisable to include:

### General info

You should include some of the following information (as appropriate) in either
a distinct informational document or at the top of the first document:

- **Publisher/developer/contributors**: Your `@p`, the `@p` you distribute the app
  from, people who have helped build the app, etc.
- **License**: MIT, GPL, etc.
- **Source**: Github link (or similar) for the repo containing the source code.
- **Issues**: Where to file issues (typically also the Github repo).
- **Group**: If you have a group associated with your app (for support, discussion,
  or what have you), you can include the `~host/group-name`.
- Any other metadata, links, info, etc, you feel are appropriate to include.

### Changelog

Another useful document is a changelog. For each version you release, you can
add a new section at the top with the version number, release date, and a brief
summary of the changes.

---

## Developer docs

Like user docs, you're free to document things as you see fit, but it's helpful
to include particular things with a standard format. These are documented
below.

{% callout %}
**Note**: If your desk has a dev version, it's advisable to link to it
somewhere sensible in the developer documentation.
{% /callout %}

### API Reference

If there's any chance other developers will want to interface with agents on
your desk, you should include reference information about the scry endpoints,
pokes, subscription paths, and (if appropriate) data types of each agent.

These things can either be on a single page, or each have their own separate
page, depending on their complexity.

#### Scry endpoints

Scry endpoints may either be organised by their paths or by short summaries of
each endpoint's purpose. Scry paths should be in the format
`/[care]/rest/of/path`, like `/x/foo/bar`. Any variable parts of the scry path
should have square brackets like `/x/foo/[ship]`. The data type of the response
should be specified, and it's helpful to include an example of a scry and the
pretty-printed response in a codeblock.

#### Pokes

Any poke actions an agent will accept should be documented. It's helpful to
include an example poke. You may also wish to provide a JSON example if people
can interact with your agent through Eyre's channel system or similar.

If your agent's pokes are organised around something like an "action" tagged
union structure, the poke reference might work better as a kind of data type
reference for that action structure rather than specifically pokes.

#### Subscriptions

Subscription paths should be documented in a similar manner to the scry
reference. If the updates your agent can send out to subscribers are organised
around something like an "update" tagged union structure, the subscription
reference might work better as just a brief path reference, and documentation of
the updates can be done separately.

#### Data types

The inclusion of a data types section depends on the complexity of an agent's
data types. If such a reference is appropriate, it's best to structure it with a
separate section for each type. The type definition should be included in a
codeblock, as well as a brief description of its purpose.
