+++
title = "Azimuth.eth"
weight = 5
template = "doc.html"
+++

[Azimuth.eth](https://etherscan.io/address/azimuth.eth) is used for storing all
data related to Azimuth points and their ownership, and should be considered to
be the ledger for Azimuth. This contract is just a data store - it only contains
the bare minimum of business logic. See [Ecliptic.eth](/docs/azimuth/ecliptic)
for the contract containing the business logic for this ledger. `Azimuth.eth`
cannot be modified directly by [galaxy vote](/reference/glossary/upgrade) - they are
only eligible to modify the Ecliptic.

## Global state {% #global %}

The global state of `Azimuth.eth` is given by the following.

```solidity
  //  points: per point, general network-relevant point state
  //
  mapping(uint32 => Point) public points;

  //  rights: per point, on-chain ownership and permissions
  //
  mapping(uint32 => Deed) public rights;

  //  operators: per owner, per address, has the right to transfer ownership
  //             of all the owner's points (ERC721)
  //
  mapping(address => mapping(address => bool)) public operators;

  //  dnsDomains: base domains for contacting galaxies
  //
  //    dnsDomains[0] is primary, the others are used as fallbacks
  //
  string[3] public dnsDomains;
```

Urbit ID's are formalized as [ERC-721 non-fungible
tokens](https://eips.ethereum.org/EIPS/eip-721) and are indexed by a number
between `0` and `2^32-1`, e.g. a `uint32`. There are two data structures
associated to a given `uint32`: a `Point` and a `Deed`.

## `Point`s {% #points %}

A `Point` contains data about networking keys and sponsorship status, arranged
in the following `struct`:

```solidity
  struct Point
  {
    //  encryptionKey: (curve25519) encryption public key, or 0 for none
    //
    bytes32 encryptionKey;
  //
    //  authenticationKey: (ed25519) authentication public key, or 0 for none
    //
    bytes32 authenticationKey;
  //
    //  spawned: for stars and galaxies, all :active children
    //
    uint32[] spawned;
  //
    //  hasSponsor: true if the sponsor still supports the point
    //
    bool hasSponsor;

    //  active: whether point can be linked
    //
    //    false: point belongs to prefix, cannot be configured or linked
    //    true: point no longer belongs to prefix, can be configured and linked
    //
    bool active;

    //  escapeRequested: true if the point has requested to change sponsors
    //
    bool escapeRequested;

    //  sponsor: the point that supports this one on the network, or,
    //           if :hasSponsor is false, the last point that supported it.
    //           (by default, the point's half-width prefix)
    //
    uint32 sponsor;

    //  escapeRequestedTo: if :escapeRequested is true, new sponsor requested
    //
    uint32 escapeRequestedTo;

    //  cryptoSuiteVersion: version of the crypto suite used for the pubkeys
    //
    uint32 cryptoSuiteVersion;

    //  keyRevisionNumber: incremented every time the public keys change
    //
    uint32 keyRevisionNumber;

    //  continuityNumber: incremented to indicate network-side state loss
    //
    uint32 continuityNumber;
  }
```

## `Deed`s {% #deeds %}

A `Deed` says which Ethereum address owns a given `Point` as well as several
[proxies](/docs/using/id/proxies) for that `Point`.

```solidity
struct Deed
  {
    //  owner: address that owns this point
    //
    address owner;

    //  managementProxy: 0, or another address with the right to perform
    //                   low-impact, managerial operations on this point
    //
    address managementProxy;

    //  spawnProxy: 0, or another address with the right to spawn children
    //              of this point
    //
    address spawnProxy;

    //  votingProxy: 0, or another address with the right to vote as this point
    //
    address votingProxy;

    //  transferProxy: 0, or another address with the right to transfer
    //                 ownership of this point
    //
    address transferProxy;
  }
```

## Other state {% #other %}

Finally, each Ethereum address may set for itself a number of `operators`, as
defined and required by the [ERC-721
standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/).
These are for third party brokers/wallets/auctioneers/etc such as
[OpenSea](http://opensea.io), which facilitate exchange of ERC-721 tokens.

`Azimuth.eth` also contains some other state—`dnsDomains`—which are domain names by
which the IP address of a galaxy may be looked up, e.g. `zod.urbit.org` resolves
to `35.247.119.159`. This is used for bootstrapping the network from DNS. Three
domains may be listed here, but as of today they are all `urbit.org`. This may
only be updated by the owner of Ecliptic, but arguably each galaxy ought to be
able to set its own domain name and so we do not expect this to remain the case
forever.

All data in this ledger is stored and processed locally on your ship by the
[`%azimuth` Gall agent](/docs/azimuth/flow#azimuth), including [layer
2](/docs/azimuth/l2/layer2) data. Because state transitions resulting from layer 2
transactions are not included in this ledger, in general the local store will
differ from what is kept in `Azimuth.eth`.
