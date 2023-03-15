+++
title = "6. React app setup"
weight = 7
+++

Now that we have a basic idea of how Eyre works, we can begin working on our
React app front-end.

## Create React app

Node.js must be installed, and can be downloaded from their
[website](https://nodejs.org/en/download). With that installed, we'll have the
`npm` package manager available and its utility binaries like `npx` to help
set up our project. The first thing we'll do is create a project using the
[`create-landscape-app`](https://www.npmjs.com/package/@urbit/create-landscape-app)
template with the following command:

```sh
npx @urbit/create-landscape-app
✔ What should we call your application? … journal
✔ What URL do you use to access Urbit? … http://127.0.0.1:8080
```

We can then open our new directory:

```sh {% copy=true %}
cd journal/ui
```

Its contents should look something like this:

```
ui
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src
```

## Install dependencies

Inside our React app directory, let's install the NPM packages used by
our project:

```sh {% copy=true %}
npm i
```

This command will install the Urbit interface package (i.e. `@urbit/http-api`)
and a handful of other packages for the UI components (e.g. `react-bootstrap`,
`react-bottom-scroll-listener`, `react-day-picker`). The remainder of this
tutorial will focus primarily on how the former is used to communicate with a
live ship from within a React application.

## Basic API setup

With everything now set up, we can begin work on the app itself. In this case
we'll just edit the `src/app.jsx` file. The first thing is to clear the content
of the file and then add the following import statements for the React
framework and the `Urbit` class:

```javascript {% copy=true %}
import React, { useState, useEffect } from "react";
import Urbit from "@urbit/http-api";
```

We also need to import a few other things, mostly relating to UI components (but
these aren't important for our purposes here):

```javascript {% copy=true %}
import "bootstrap/dist/css/bootstrap.min.css";
import "react-day-picker/lib/style.css";
import {
  Modal, Card, Stack, Tab, Tabs, Toast, ToastContainer,
  Button, Spinner, CloseButton,
} from "react-bootstrap";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { startOfDay, endOfDay } from "date-fns";
import { BottomScrollListener } from "react-bottom-scroll-listener";
```

Now we'll begin defining our components. For the purposes of this tutorial,
we'll focus on the primary `App` component, which is defined as follows:

```javascript {% copy=true %}
export default function App() {
  /* remainder of the source goes here */
}
```

The first thing we'll define in our `App` component is its state. In modern
React, component state is defined using the
[`useState()`](https://beta.reactjs.org/reference/react/useState) hook, which
returns a pair of `[stateVariable, setStateVariableFunction]`. For now, we'll
just consider the `status` state variable:

```javascript {% copy=true %}
const [status, setStatus] = useState(null);
```

Next, we'll set up the `Urbit` API object in a
[`useEffect()`](https://beta.reactjs.org/reference/react/useEffect) call, which
allows the connection to be established *exactly once* after the initial
content of the page is rendered. Since the connection itself is independent of
the component state, we could do this outside of the `App` component; however,
in this case, we choose to put it in a component `useEffect()` so all the setup
code is together:

```javascript {% copy=true %}
useEffect(() => {
  window.urbit = new Urbit("");
  window.urbit.ship = window.ship;

  window.urbit.onOpen = () => setStatus("con");
  window.urbit.onRetry = () => setStatus("try");
  window.urbit.onError = () => setStatus("err");

  init();
}, []);
```

The first thing we do is create a new instance of the `Urbit` class we imported
from `@urbit/http-api`, and save it to `window.urbit`. The `Urbit` class
constructor takes three arguments: `url`, `desk` and `code`, of which only `url`
is mandatory.

- `url` is the URL of the ship we want to talk to. Since our React app will be
  served by the ship, we can just leave it as an empty `""` string and let
  `Urbit` use root-relative paths.
- `desk` is only necessary if we want to run threads through Eyre, and since
  we're not going to do that, we can exclude it.
- `code` is the web login code for authentication, but since the user will
  already have logged in, we can also exclude that.

Therefore, we call the class contructor with just the empty `url` string:

```javascript
window.urbit = new Urbit("");
```

Next, we need to set the ship name in our `Urbit` instance. Eyre requires the
ship name be specified in all requests; if we don't set it, Eyre will reject
all the messages we send. Fortunately, `create-landscape-app` handles this
detail by automatically initializing the active ship's name to the variable
`window.ship`, so we just set `window.urbit.ship` to this value:

```javascript
window.urbit.ship = window.ship;
```

Next, we set three callbacks: `onOpen`, `onRetry`, and `onError`. These
callbacks are fired when the state of our channel connection changes:

- `onOpen` is called when a connection is established.
- `onRetry` is called when a channel connection has been interrupted (such as by
  network issues) and the `Urbit` object is trying to reconnect. Reconnection
  will be attempted up to three times: immediately, after 750ms, and after
  3000ms.
- `onError` is called with an `Error` message once all retries have failed, or
  otherwise when a fatal error occurs.

We'll look at how we handle these cases in the next section. For now, we'll just
set the `status` entry in the state to either `"con"`, `"try"`, or `"err"` as
the case may be. Note that it's not mandatory to set these callbacks, but
leaving connection problems unhandled is usually a bad idea.

The last thing we do is call:

```javascript
init();
```

This function will fetch initial entries and subscribe for updates. We'll look
at it in the next section.

## Resources

- [HTTP API Guide](/guides/additional/http-api-guide) - Reference documentation for
  `@urbit/http-api`.

- [React app source
  code](https://github.com/urbit/docs-examples/tree/main/journal-app/ui) - The
  source code for the Journal app UI.

- [`@urbit/http-api` source
  code](https://github.com/urbit/urbit/tree/master/pkg/npm/http-api) - The
  source code for the `@urbit/http-api` NPM package.
