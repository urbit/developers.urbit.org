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
and all the other packages used by our React application. When building from
scratch with `create-landscape-app`, this includes a number of useful
development libraries that enable automatic refresh on file edits (i.e. `vite`
and `@vitejs/plugin-react-refresh`) and simple page styling (i.e.
`tailwindcss`). The remainder of this tutorial will focus primarily on how the
Urbit interface package is used to communicate with a live ship from within a
React application.

## Basic app setup

With all the basics now in place, we can begin work on the app itself. For this
simple demonstration, we'll be working just with the `src/app.jsx` file, which
contains the rendering logic for our React application. Before we look at the
full front-end source for our journal app, let's first review the simpler
default code provided by `create-landscape-app` to cover some Urbit API and
React basics.

### Urbit API setup

First, let's open up `src/app.jsx` and look at the import statements at the top
of this file:

```javascript
import React, { useEffect, useState } from 'react';
import Urbit from '@urbit/http-api';
import { scryCharges } from '@urbit/api';
import { AppTile } from './components/AppTile';
```

The first two of these statements are very common in Urbit React applications;
the first imports the React library and a few of its important functions (to be
covered in a moment) and the second imports the `Urbit` class, which will be
used subsequently to enable browser-to-ship communication.

Next, the code sets up the `Urbit` API object as a global variable, which
allows the browser-to-ship connection to be established *exactly once* when the
page is first being loaded:

```javascript
const api = new Urbit('', '', window.desk);
api.ship = window.ship;
```

The first statement creates a new instance of the `Urbit` class we imported
from `@urbit/http-api`, and saves it to the `api` variable. The `Urbit` class
constructor takes three arguments: `url`, `code`, and `desk`, of which only `url`
is mandatory.

- `url` is the URL of the ship we want to talk to. Since our React app will be
  served by the ship, we can just leave it as an empty `''` string and let
  `Urbit` use root-relative paths.
- `code` is the web login code for authentication. Since the user will already
  have logged in, we can also leave it as an empty `''` string.
- `desk` is only necessary if we want to run threads through Eyre. This example
  doesn't submit any such requests, but the `desk` is set anyway for
  demonstration purposes.

The second statement sets the ship name in our `Urbit` instance. Eyre requires
the ship name be specified in all requests; if we don't set it, Eyre will
reject all the messages we send. Fortunately, `create-landscape-app` handles
this detail by automatically initializing the active ship's name to the
variable `window.ship`, so we just set `api.ship` to this value.

While not referenced in the `create-landscape-app` default code, the `Urbit`
class has three additional callbacks that can be set: `onOpen`, `onRetry`, and
`onError`. These callbacks are fired when the state of our channel connection
changes:

- `onOpen` is called when a connection is established.
- `onRetry` is called when a channel connection has been interrupted (such as by
  network issues) and the `Urbit` object is trying to reconnect. Reconnection
  will be attempted up to three times: immediately, after 750ms, and after
  3000ms.
- `onError` is called with an `Error` message once all retries have failed, or
  otherwise when a fatal error occurs.

We'll look at how we can use these callbacks in the next section.  Note that
it's not mandatory to set these callbacks, but leaving connection problems
unhandled is usually a bad idea.

### React app setup

Finally, let's take a quick look at the React rendering logic for our
application. React rendering occurs within components, which are defined either
as classes (e.g. `class A extends Component { /* ... */ }`) or functions (e.g.
`function A() { /* ... */ }`). While recent React versions support both styles,
the latter "modern" style is preferred and used by most Urbit React
applications.

Our code defines a few components, but we'll just focus on the primary
component for this tutorial; this component is defined as a functional
component named `App`:

```javascript
export function App() {
  /* ... */
}
```

As is common for React components, the first thing we'll define in our `App`
component is its state. In React, modifying a component's state causes it to be
re-rendered, so state variables should be carefully chosen to constitute all
"display-affecting" values. In modern React, component state is defined using
the [`useState()`] hook, which returns a pair of `[stateVariable,
setStateVariableFunction]`. Since our default `create-landscape-app` code just
displays the list of apps installed on a ship, it only needs to store this list
as its state:

```javascript
const [apps, setApps] = useState();
```

With the state established, we now define the code responsible for populating
this state. The canonical way to grab data from an external service/system in
React is to use the [`useEffect()`] hook. This function takes two arguments:
(1) the callback function for loading the external data and (2) a list of all
state variables dependencies, which will cause re-invocations of the first
argument when modified. Our app just needs to load the list of apps on our ship
(called `charges`) once, so its [`useEffect()`] invocation is simple:

```javascript
useEffect(() => {
  async function init() {
    const charges = (await api.scry(scryCharges)).initial;
    setApps(charges);
  }

  init();
}, []);
```

The last step is to return the HTML that will be used to render our component
in the browser. This HTML must adhere to the syntactic rules of
[JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)), which allow for greater
flexibility through extensions like embedded JavaScript (contained in curly
brace enclosures). Our component renders each app it found when scrying our
ship as a tile accompanied by its title and description:

```javascript {% mode="collapse" %}
return (
  <main className="flex items-center justify-center min-h-screen">
    <div className="max-w-md space-y-6 py-20">
      <h1 className="text-3xl font-bold">Welcome to hut</h1>
      <p>Here&apos;s your urbit&apos;s installed apps:</p>
      {apps && (
        <ul className="space-y-4">
          {Object.entries(apps).map(([desk, app]) => (
            <li key={desk} className="flex items-center space-x-3 text-sm leading-tight">
              <AppTile {...app} />
              <div className="flex-1 text-black">
                <p>
                  <strong>{app.title || desk}</strong>
                </p>
                {app.info && <p>{app.info}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </main>
);
```

With this brief primer complete, we'll take a closer look at our journal
application's front-end and how it utilizes the Urbit HTTP API in the next
section.

## Resources

- [React Tutorial](https://react.dev/learn/tutorial-tic-tac-toe) - A tutorial
  walking through the basics of writing a modern React application.

- [HTTP API Guide](/guides/additional/http-api-guide) - Reference documentation for
  `@urbit/http-api`.

- [React app source
  code](https://github.com/urbit/docs-examples/tree/main/journal-app/ui) - The
  source code for the Journal app UI.

- [`@urbit/http-api` source
  code](https://github.com/urbit/urbit/tree/master/pkg/npm/http-api) - The
  source code for the `@urbit/http-api` NPM package.


[`usestate()`]:  https://react.dev/reference/react/useState
[`useeffect()`]: https://react.dev/reference/react/useEffect
