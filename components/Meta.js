import React from "react";
import Head from "next/head";

export default function Meta() {
  const author = "Urbit";
  const description =
    "Urbit is a general-purpose platform for building decentralized, peer-to-peer applications.";
  const image = "https://media.urbit.org/logo/urbit-logo-card.png";
  return (
    <Head>
      <link rel="icon" type="image/png" href="/images/favicon.ico" />
      <meta
        name="twitter:card"
        content="summary_large_image"
        key="twitter-card"
      />
      <meta name="twitter:site" content="@urbit" key="twitter-site" />
      <meta name="twitter:creator" content="@urbit" key="twitter-creator" />
      <meta name="og:title" content="Urbit Developers" key="title" />
      <meta name="og:description" content={description} key="description" />
      <meta name="description" content={description} />
      <meta name="author" content={author} key="author" />
      <meta name="twitter:image" content={image} key="image" />
    </Head>
  );
}
