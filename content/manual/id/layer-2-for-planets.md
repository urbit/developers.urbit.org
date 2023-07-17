+++
title = "Layer 2 for planets"
weight = 50
description = "Getting started with a permanent Urbit identity."
+++

What does Layer 2 mean for planets? Cheap transaction fees which make it inexpensive to get on the network and stay on the network.

Performing transactions directly on the Ethereum blockchain, ‘Layer 1’, has become prohibitively expensive over the past year due to ETH’s value and network congestion. As a result, spawning a planet or performing simple operations in Bridge can be very costly. Urbit’s [Layer 2](https://urbit.org/docs/azimuth/l2/layer2) solution, called [naive rollups](https://urbit.org/blog/rollups), makes performing these transactions cheap or free. Planets can take advantage of this in the form of cheaper planet prices, as well as cheap or free Azimuth transactions.

### What to know

- Migration is currently **one-way**.<br /><br />You cannot move a Layer 2 ID back to Layer 1. This includes planets that are spawned on Layer 2.
- You cannot interact with Layer 2 IDs using Layer 1 tools like OpenSea or Metamask.<br /><br />You will not be able to use your ID with smart contracts, or ‘see’ it using wallets other than Bridge. **Bridge is currently the only software that can see or interact with Layer 2 IDs.**
- Layer 2 does not have anything to do with networking between ships.<br /><br />Operating your ship on the network will not be influenced by which layer it is on. You will be fully capable of communicating with ships on either layer.
- You can perform Layer 2 transactions for free with Tlon’s roller.<br /><br />A public roller operated by Tlon is connected to Bridge by default, but anyone can operate a roller. Tlon’s roller offers free subsidized transactions up to a weekly limit of 25 operations.
- You will need to pay for the migration to L2.<br /><br />Migrating is a one-time process that takes place on Layer 1. You will need to fund it in the same way as a traditional Layer 1 Azimuth transaction.
- Your star sponsor can be on either layer.<br /><br />The layer that a star is on has no bearing on who it can sponsor.

If you already had a planet before the launch of L2, you don’t have to do anything. Your ship will continue to function normally and you will still be able to communicate with the entire network without any additional intervention. However, you have the option of migrating your planet to Layer 2 in order to take advantage of the reduced costs and subsidized transactions available through Tlon’s roller.

### Should I move?

If you have a planet on Layer 1, migrating is entirely optional. The **benefits** of migrating a planet to Layer 2 are free or cheap Azimuth transactions. Ships on Layer 2 can use Tlon’s roller to perform operations in Bridge for free up to a weekly limit. These operations might be resetting networking keys, or changing sponsors.

The **trade-offs** for migrating a planet to Layer 2 include:

- The migration process is currently irreversible. If you migrate to Layer 2, you cannot go back to Layer 1.
- Ships on Layer 2 are not visible to Layer 1 tools like wallets or chain explorers; Bridge is currently the only software that can ‘see’ Layer 2 IDs.

### Which Layer am I on?

You can tell at a glance which layer your asset occupies in Bridge:

1. Log into Bridge.
2. Click the ownership address modal at the top left of the main menu.
3. A square icon with ‘L1’ or ‘L2’ will show up next to each asset that belongs to your address.

A single ownership address can own ships on both Layer 1 and Layer 2.

### Migrating

To migrate:

1. Log into Bridge.
2. Click the ownership address modal menu at the top left corner.
3. Select ‘Migrate’, and ‘Proceed’ after reading the information presented.
4. You will need to pay a one-time fee to fund the transaction; make sure your L1 address has funds available.

Migrating to Layer 2 does not change the address that owns a point. **You will still use the same wallet or key to log into Bridge after migration**. A single ownership address might have ships on both Layer 1 and Layer 2.

The migration itself does not need to be submitted to a roller – it should complete within a few minutes. Once it has, you can submit planets and transactions to the roller’s queue immediately.

### Activating a Layer 2 planet

**Planet codes** are one-time passphrases used to claim a master ticket through Bridge. These can be standalone text phrases, or embedded in a URL that begins with `bridge.urbit.org`. **Master tickets** are passphrases used to log into Bridge to manage an ID that has already been claimed.

If you’ve been given a planet code invitation URL to claim a planet:

1. Open the link.
2. Click ‘Claim’.
3. Reveal the master ticket code. Write this down somewhere safe.
4. Confirm you’ve written the code down by typing it back into the prompt.
5. Click to download your passport, which contains the keyfile you will use for your ship’s first boot.

If you’ve been given a four-word text activation code, go to [Bridge](https://bridge.urbit.org/) and click ‘Activate a planet’ at the bottom. Enter your planet code, and follow the instructions above.

In the future, you can log into Bridge using the master ticket you wrote down in order to manage your ship’s keys. Knowing the master ticket is equivalent to owning the ID, so keep it somewhere secure.

An important consideration for new users with regard to Layer 2 planets: your ownership key is technically exposed to the star that issued your planet for up to 24 hours, until the next batch is processed by your roller. During this window, it's technically possible for the issuer to take back the planet or decrypt packets meant for it. This is the reason that the keyfile you use to boot your ship actually has two halves – one for your initial boot, and a second one that belongs solely to you.

The first time you boot, the key from the first half of the keyfile is used; but when the next roll batch is processed, the ID will be modified with a second key. This key is kept secret from the star that spawned you, and once this transaction clears, your planet is definitively and cryptographically yours. All of this is **taken care of in the background and requires no intervention**. You don’t even need to restart your planet after the ownership transfer has been finalized.

### Running your planet

Once you’ve activated your planet and downloaded your keyfile, you can use it to [boot your ship immediately](https://urbit.org/getting-started/cli).

Treat your planet like the precious object it is. Do not share your landscape login code or master key with anybody. Never run it in two places at the same time. This will knock it out of sequence with the network, and cause it to become ‘brain damaged’, unable to communicate with the outside world. Don’t delete the directory that contains your asset’s data. If you are shutting down your ship for a while, keep the data folder somewhere safe, and you can pick up where you left off in the future.

You may also opt to [host your planet](https://urbit.org/getting-started#hosting-providers) with a provider. Ships hosted by providers are always-on and come with support. After you’ve activated your planet code, but before you’ve booted with your keyfile, you can create an account with a hosting provider like [UrbitHost](https://urbithost.com/) and use your keyfile to boot your ship with their service – known as ‘bring your own planet’.

In addition to importing a fresh planet, UrbitHost allows you to migrate an existing pier to your hosted account. If you’ve booted a planet on your PC but want to make the switch to hosting, you can upload it and hit the ground running without having to reset your networking keys.

### Transaction history

A new feature in Bridge is the ability to see the transaction history of your asset. This is particularly important because with Layer 2, much of the Azimuth state is no longer visible on the Ethereum blockchain, but is maintained by the Urbit network. This means you might not be able to directly observe “who owns what” by looking at the Azimuth contracts with something like a [blockchain explorer](https://etherscan.io/address/azimuth.eth). Activities like setting networking keys, issuing planets, or moving your proxy keys will show up in this log. Note that the transaction history menu in Bridge is currently the only way to examine Azimuth operations that take place on Layer 2.

If you submit an operation to your roller, you’ll see a timer counting down to the next batch and a history of completed operations. Bridge does not currently allow you to cancel a transaction once it has been submitted.

Incoming transfers of new assets will also show up in your transaction history. If your ownership address owns more than one asset, you can use the modal to select from among them.
