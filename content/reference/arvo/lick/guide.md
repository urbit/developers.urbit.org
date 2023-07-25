+++
title = "Guide"
weight = 5
+++

In this guide we'll write a pair of simple apps to demonstrate how Lick
works. One will be a Gall agent called [`licker.hoon`](#lickerhoon), and
the other a Python script called `licker.py`.

The Gall agent will create a socket through Lick and the Python script
will connect to it. When the Gall agent is poked with a message of
`%ping`, it'll send it through the socket to the Python script. The
Python script will print `ping!`, then send a `%pong` message back
through the socket to the Gall agent, which will print `pong!` to the
Dojo.

First, we'll look at these two files.

## `licker.hoon`

```hoon {% copy=true mode="collapse" %}
/+  default-agent
|%
+$  card  card:agent:gall
--
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %|) bowl)
::
++  on-init
  ^-  (quip card _this)
  :_  this
  [%pass /lick %arvo %l %spin /'licker.sock']~
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  ?=([%noun %ping] [mark !<(@tas vase)])
  :_  this
  [%pass /spit %arvo %l %spit /'licker.sock' %noun %ping]~
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%lick %soak *] sign)  (on-arvo:def +<)
  ?+    [mark noun]:sign        (on-arvo:def +<)
    [%connect ~]     ((slog 'socket connected' ~) `this)
    [%disconnect ~]  ((slog 'socket disconnected' ~) `this)
    [%error *]       ((slog leaf+"socket {(trip ;;(@t noun.sign))}" ~) `this)
    [%noun %pong]    ((slog 'pong!' ~) `this)
  ==
::
++  on-save   on-save:def
++  on-load   on-load:def
++  on-watch  on-watch:def
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-agent  on-agent:def
++  on-fail   on-fail:def
--
```

Our Gall agent is extremely simple and has no state. It only uses three
agent arms: `++on-init`, `++on-poke` and `++on-arvo`.

### `++on-init`

```hoon
++  on-init
  ^-  (quip card _this)
  :_  this
  [%pass /lick %arvo %l %spin /'licker.sock']~
```

All `++on-init` does is pass Lick a
[`%spin`](/reference/arvo/lick/tasks#spin) task to create a new
`licker.sock` socket.

### `++on-poke`

```hoon
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?>  ?=([%noun %ping] [mark !<(@tas vase)])
  :_  this
  [%pass /spit %arvo %l %spit /'licker.sock' %noun %ping]~
```

When `++on-poke` receives a poke with a `mark` of `%noun` and data of
`%ping`, it passes Lick a [`%spit`](/reference/arvo/lick/tasks#spit)
task with the same data. Lick will send it on through to our
`licker.sock` socket for our Python script. This lets us poke our agent
from the Dojo like:

```
> :licker %ping
```

### `++on-arvo`

```hoon
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card _this)
  ?.  ?=([%lick %soak *] sign)  (on-arvo:def +<)
  ?+    [mark noun]:sign        (on-arvo:def +<)
    [%connect ~]     ((slog 'socket connected' ~) `this)
    [%disconnect ~]  ((slog 'socket disconnected' ~) `this)
    [%error *]       ((slog leaf+"socket {(trip ;;(@t noun.sign))}" ~) `this)
    [%noun %pong]    ((slog 'pong!' ~) `this)
  ==
```

`++on-arvo` expects a [`%soak`](/reference/arvo/lick/tasks#soak-1) gift
from Lick. A `%soak` is primarily a message coming in from the socket,
though connection status is also communicated in `%soak`s. The four
cases we handle are:

- `%connect`: An external process has connected to the socket.
- `%disconnect`: An external process has disconnected from the socket.
- `%error`: An error has occurred. The error message is a `cord` in the
  `noun`. The only time you'll get this is if you tried to `%spit` a
  message to the socket but there was nothing connected to it. In that
  case, the error message will be `'not connected'`.
- `[%noun %pong]`: This is the successful response we expect from the
  Python script.

In all cases we just `++slog` a message to the terminal.

---

## `licker.py`

```python {% copy=true mode="collapse" %}
from noun import *
import socket

def cue_data(data):
    x = cue(int.from_bytes(data[5:], 'little'))
    mark = intbytes(x.head).decode()
    noun = x.tail
    return (mark,noun)

def jam_result(mark, msg):
    mark = int.from_bytes(mark.encode(), 'little')
    noun = int.from_bytes(msg.encode(), 'little')
    return intbytes(jam(Cell(mark, noun)))

def make_output(jammed):
    length = len(jammed).to_bytes(4, 'little')
    version = (0).to_bytes(1, 'little')
    return version+length+jammed

sock_path = '/home/user/zod/.urb/dev/licker/licker.sock'
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.connect(sock_path)

while True:
    try:
        data = sock.recv(1024)
        mark, noun = cue_data(data)
    except TimeoutError:
        pass

    if (mark != 'noun'):
      pass

    msg = intbytes(noun).decode()
    if (msg != 'ping'):
      pass
  
    print('ping!')

    jammed = jam_result('noun', 'pong')
    output = make_output(jammed)

    sock.send(output)
```

Our Python script is also quite simple. We'll walk through it piece by
piece.

```python
from noun import *
import socket
```

First, we import the `socket` library and
[`noun.py`](https://github.com/urbit/tools).

```python
def cue_data(data):
    x = cue(int.from_bytes(data[5:], 'little'))
    mark = intbytes(x.head).decode()
    noun = x.tail
    return (mark,noun)
```

This function takes some data from the socket, decodes it, and returns a
pair of the `mark` and `noun`. The data initially has the following
format:

```
[1B: version][4B: size of jam in bytes][nB: jammed data]
```

The version is always `0` (though this may change in the future). The
`cue_data` function just strips off the the version and size headers,
but you may wish to verify these.

After that, `cue_data` converts the jam to an integer and passes it to
the `cue` function in `noun.py` to decode. It converts the `mark` to a
string, then returns it along with the raw noun.


```python
def jam_result(mark, msg):
    mark = int.from_bytes(mark.encode(), 'little')
    noun = int.from_bytes(msg.encode(), 'little')
    return intbytes(jam(Cell(mark, noun)))
```

This function takes a `mark` string and `msg` string, converts them to
integers, forms a cell and jams them with the `jam` function in
`noun.py`. It's used to produce the jam when sending something back to
the socket.

```python
def make_output(jammed):
    length = len(jammed).to_bytes(4, 'little')
    version = (0).to_bytes(1, 'little')
    return version+length+jammed
```

Once `jam_result` has been run, `make_output` calculates the length of
the jam, sets the version number, and puts it all together so it can be
sent off to the socket.

```python
sock_path = '/home/user/piers/zod/.urb/dev/licker/licker.sock'
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.connect(sock_path)
```

Here we specify the path to the socket and open the connection. Lick
sockets live in:

```
<pier>/.urb/dev/<agent>/<socket name>
```

You'll need to change `sock_path` to your pier location.

```python
while True:
    try:
        data = sock.recv(1024)
        mark, noun = cue_data(data)
    except TimeoutError:
        pass

    if (mark != 'noun'):
      pass

    msg = intbytes(noun).decode()
    if (msg != 'ping'):
      pass
  
    print('ping!')

    jammed = jam_result('noun', 'pong')
    output = make_output(jammed)

    sock.send(output)
```

This is the main loop of our script. It listens for a message from the
socket, calls `cue_data` to decode it, checks it's an expected `ping`,
prints it, produces a `pong` in response and sends it back to the
socket.

---

## Setup

Create the folders for the project:

``` {% copy=true %}
mkdir -p licker/{desk,client}
mkdir licker/desk/{app,lib,mar}
```

In the Dojo of a fakezod, mount the `%base` desk:

``` {% copy=true %}
|mount %base
```

Copy across some dependencies (change the pier path if necessary):

``` {% copy=true %}
cp -r zod/base/mar/{bill*,hoon*,kelvin*,mime*,noun*,txt*} licker/desk/mar/
cp -r zod/base/lib/{default-agent*,skeleton*} licker/desk/lib/
```

Add a `desk.bill` `sys.kelvin` files:

``` {% copy=true %}
echo "[%zuse 412]" > licker/desk/sys.kelvin
echo "~[%licker]" > licker/desk/desk.bill
```

Open a `licker.hoon` app in an editor, paste in the `licker.hoon` code
above, and save it:

``` {% copy=true %}
nano licker/desk/app/licker.hoon
```

Open a `licker.py` file in an editor, paste in the `licker.py` code
above, and save it:

``` {% copy=true %}
nano licker/client/licker.py
```

Download the `noun.py` dependency from the
[urbit/tools](https://github.com/urbit/tools/tree/master) repo:

``` {% copy=true %}
wget -P licker/client https://raw.githubusercontent.com/urbit/tools/master/pkg/pynoun/noun.py
```

Install additional python dependencies `bitstream`, `mmh3` and `numpy`:

{% callout %}

**NOTE:** At the time of writing, `bitstream` doesn't build against
`python>3.10`. If you have `3.11` or newer, you may need to install a
separate `python3.10` (how your distro packages it may vary).

{% /callout %}

``` {% copy=true %}
python -m ensurepip
pip install bitstream mmh3 numpy
```

Create and mount the `%licker` desk in the Dojo:

``` {% copy=true %}
|new-desk %licker
|mount %licker
```

Delete the existing files and copy in the new ones:

```
rm -r zod/licker/*
cp -r licker/desk/* zod/licker/
```

In the Dojo, commit the files and install the desk:

```
|commit %licker
|install our %licker
```

---

## Try it out

First, run the Python script:

``` {% copy=true %}
python licker/client/licker.py
```

You should see the following in the Dojo:

```
socket connected
```

Now, try poking the `%licker` agent with `%ping`:

``` {% copy=true %}
:licker %ping
```

In the terminal running the Python script, you should see:

```
ping!
```

And in the Dojo, you should see the response:

```
pong!
```

Now try closing the Python script. You should see the following in the
Dojo:

```
socket disconnected
```

If you try `:licker %ping` again, you'll see this error message:

```
socket not connected
```

---
