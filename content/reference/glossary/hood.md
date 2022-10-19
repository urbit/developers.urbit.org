+++
title = "Hood"

[extra]
category = "arvo"

[glossaryEntry.hood]
name = "hood"
symbol = ""
usage = "arvo"
desc = "The system app: comprised of Kiln, Drum and Helm."

+++

**Hood** is the "system app", it controls various basic functions of Arvo and
provides an interface for some of those functions with
[generators](/reference/glossary/generator) in the
[dojo](/reference/glossary/dojo). While Hood is technically a single app, it's really three different apps under the hood:

- `%kiln`: Manages desk and agent installation, updates, etc.
- `%drum`: Provides an interface to [Dill](/reference/glossary/dill), the
  terminal driver [vane](/reference/glossary/vane), for userspace apps.
- [`%helm`](/reference/glossary/helm): Provides a user interface for various
  low-level settings, kernel functions and reports.
