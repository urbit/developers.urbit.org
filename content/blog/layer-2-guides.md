+++
title = "Layer 2 Guides"
date = "2022-02-14"
description = "Urbit’s Layer 2 system is live and operational."
[extra]
author = "Reid Scoggin"
ship = "~sitful-hatred"
image = "https://media.urbit.org/site/posts/essays/l2-blogpost.png"
+++

Urbit’s [Layer 2](/reference/azimuth/l2/layer2) system, naive rollups, allows planets to be spawned at substantially lower cost. This system operates in parallel to Layer 1 Azimuth, but introduces some new concepts and differences that are important to understand. Read on for a high-level survey, and check the star and planet guides linked at the bottom for details and instructions.

After a year of development and testing, **Urbit’s Layer 2 system is live and operational**. Star and planet operators can now take advantage of subsidized Azimuth operations. If you operate a star, you can distribute planets cheaply or for free; if you’ve been waiting to buy an ID due to transaction fees, you will find planets are available much more cheaply.

Layer 2 (“L2”) introduces some changes that are important to understand, whether you’re new to the network or not. Stars and planet operators that are considering migrating to L2 have different **trade-offs to weigh** before they make a decision.

### Background

Urbit can be broadly divided into two parts: an operating system, Arvo, and the identity layer, Azimuth. These two systems are interlocked. Arvo uses Azimuth to verify that you own an address, which maps to your name on the network. [Azimuth](/reference/glossary/azimuth) is a public key infrastructure, implemented as contracts on the Ethereum blockchain. Modifications to the ownership or properties of an identity’s keys are recorded on Ethereum. Azimuth faithfully serves its purpose as an authoritative, trustless registry of ownership, but it inherits both the strengths and disadvantages of the ETH ecosystem.
Due to ETH’s value and popularity, performing transactions directly on the Ethereum blockchain (‘Layer 1’) has become prohibitively expensive for many simple operations. The Ethereum smart contracts that control the logic of Azimuth were developed in a time when ETH was not worth as much. The soaring value of ETH means that the gas fee to spawn or modify a planet routinely costs more than the planet itself. Azimuth is not unique in this regard. All projects built on Ethereum have had to deal with this issue in one form or another. Fortunately, Urbit engineers have come up with a solution for those seeking to get onto the network, albeit with several important trade-offs.

### Naive rollups

‘Layer 2’ refers to technologies built on top of blockchains to enable scaling. [Rollups](https://vitalik.ca/general/2021/01/05/rollup.html) are an Ethereum ecosystem Layer 2 innovation that reduces costs by moving computation off-chain. _Naive rollups_ are a bespoke technology developed for Urbit that augment the original Azimuth contracts. For technical details, you can review the [excellent summary](https://urbit.org/blog/rollups) by `~datnut-pollen`, or the [original proposal](https://groups.google.com/a/urbit.org/g/dev/c/p6rP_WsxLS0) by `~wicdev-wisryt`. In brief: rather than using the Ethereum network to perform the computation associated with PKI modifications (Layer 1), the computation is performed on the Urbit network itself, with the results published to the blockchain by nodes called rollers. Signed data resulting from the combined transactions is posted on a regular basis to the main blockchain by the rollers. Due to this batched, off-chain computation, fees are roughly **65-100x cheaper** than Layer 1 operations.

### What everyone should know

Whether you’re new to the network or a longtime participant, you should gain familiarity with the new changes. There are a few things that everyone should know:

- All ships spawned before now have been on Layer 1 – those ships have the option of migrating to Layer 2, or remaining on Layer 1.
- **You don’t have to do anything**. Migrating is opt-in, and a Layer 1 ship will continue to have full functionality on the network.
- Layer 2 lets you perform **Azimuth transactions cheaply or for free**. If you operate a star, you can spawn planets for free with Tlon’s roller. Planets can make use of Tlon’s roller for actions like factory resets and transferring ownership and proxy addresses for free.
- **Migrating is one-way**. If you migrate to Layer 2, there is not currently an option to reverse your decision.
- **Migrating does not change which address owns a point**. After migrating, you will still log into Bridge with the same keys.

### Layer 2 guides

There’s lots more to learn about the new solution. These updates apply to the software on your ship, the Azimuth PKI, and new features and major updates to Bridge. You can learn more in the following guides, with in-depth background and illustrated walkthroughs for common tasks:

[Layer 2 for stars](https://operators.urbit.org/guides/layer-2-for-stars) – It’s particularly important for star operators to understand the pros and cons of migrating. This guide will explain the technical background, trade-offs, and how to use Layer 2 on Bridge.

- Stars can migrate their spawn proxy to Layer 2 to spawn up to six planets per week for free using Tlon’s roller.
- Stars can migrate their ownership key to Layer 2 to perform all Azimuth operations on Layer 2, including planet spawning, factory resets, and point adoption.
- Migrating is currently a one-way process and cannot be reversed.
- Layer 2 stars cannot be wrapped as $WSTR tokens, or interact with any other Layer 1 tools or contracts (e.g. MetaMask, OpenSea).

[Layer 2 for planets](https://urbit.org/getting-started/layer-2-for-planets) – Just bought a planet and want to know what all of this means for you? Wondering whether you should migrate your Layer 1 planet? Look here for guidance.

- Planets spawned by a Layer 2 star will spawn on Layer 2.
- Migration is one-way; if your planet is on Layer 2, there is no way to migrate it to Layer 1.
- Planets on Layer 2 can take advantage of subsidized, free Azimuth transactions using Tlon’s roller.
- Planets on Layer 2 cannot currently interact with Layer 1 tools or contracts like MetaMask or OpenSea.
