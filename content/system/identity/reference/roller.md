+++
title = "L2: Rollers"
weight = 9
+++

Here we outline how the naive rollup rollers work. This page is only a quick
summary - the full documentation of the API is coming soon.

## Overview

The following diagram illustrates the most important parts of the plumbing
present in the roller.

[![Roller internals](https://media.urbit.org/docs/layer2/roller-internal.png)](https://media.urbit.org/docs/layer2/roller-internal.png)

We elaborate on the components of this diagram below.

## `%roller-rpc`

The roller communicates with the outside world via a JSON-RPC API, which is
implemented with a Gall agent `%roller-rpc`. This is how Bridge communicates
with a roller. See the [RPC
documentation](https://documenter.getpostman.com/view/16338962/Tzm3nx7x#5a698656-8e7e-433f-9eff-1c6047b9eace)
for detailed information on the API.

## `%roller`

`%roller` is the Gall agent which collects layer 2 Azimuth **transactions**, which
are a concatenation of an
[action](/reference/azimuth/l2/bytestring#actions) and a
[signature](/reference/azimuth/l2/bytestring#signatures) and forms them into
[batches](/reference/azimuth/l2/bytestring#batch) to be submitted periodically to the
Ethereum blockchain.

### Transaction format

See [Bytestring Format](/reference/azimuth/l2/bytestring) for a technical description of
how layer 2 transactions are formatted.

### Pending transactions

`%roller` maintains in its state a list of transactions that have been submitted
to it since the most recent roll it submitted to Ethereum. These are referred to as
**pending transactions**.

### Signing the batch

Each pending transaction already includes a signature from its sender, but the roller
itself must also sign the entire batch of transactions with its private key to
submit it as a single Ethereum transaction. This signed batch is known as a **roll**.

### Predicted state

Once a roll has been submitted to an Ethereum node, there is a waiting period
before a miner includes it in a block.

During this waiting period, the roller applies the submitted batch to the
locally held Azimuth state to get a predicted state. This predicted state is
presented to the user in Bridge, such as to show which points a given address owns.

### Timer

Each roller may choose to submit rolls on a regular basis, periodically
and/or whenever a certain number of pending transactions is reached.

