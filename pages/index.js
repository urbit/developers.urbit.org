import Head from "next/head";

export default function Home() {
  return (
    <div className="">
      <Head>
        <title>Urbit Developers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1>
          Urbit is a general-purpose platform for building decentralized,
          peer-to-peer applications.
        </h1>
        <button>
          <span className="type-ui">Learn More</span>
        </button>
        <h2>Learn</h2>
        <span>Become an Urbit developer</span>

        <p>
          Urbit is an entirely new computer and novel programming environment.
          Start with our series of self-guided courses.{" "}
        </p>

        <p>
          You can get a high level overview with the primer, or jump into
          learning with a series of self-led courses designed to teach you the
          basics called Urbit 101. If you’re already familiar with the basics,
          consult the series of standalone guides called Urbit 201.
        </p>

        <p>Stack overview | Urbit 101 | Urbit 201 </p>

        <h2>Community</h2>
        <span>Join the community </span>

        <p>
          The developer community is friendly, helpful, and organized from
          within Urbit itself—but you don’t have to take our word for it! Join
          our public groups on the network, or tune into a Developer Call to
          join the community.{" "}
        </p>

        <p>Get involved | Developer Calls | Join the mailing list </p>

        <p>
          The mailing list is meant to be a separate, developer-only list for
          those that want to stay up-to-date on developer-specific
          announcements. These would be things like new documentation, upcoming
          developer calls, infrastructure updates/breaking changes, etc.{" "}
        </p>

        <h2>Opportunities </h2>
        <span>Apply your skills</span>

        <p>
          The Urbit ecosystem is growing rapidly, which presents many
          opportunities to enterprising developers. Address space grants through
          the Urbit Foundation are a great way to take your skills to the next
          level. Companies like Tlon are regularly hiring developers, and The
          Combine is funding startups that build on Urbit.{" "}
        </p>

        <p>Grants | Jobs | The Combine</p>
      </main>
    </div>
  );
}
