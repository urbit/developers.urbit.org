import Head from "next/head";
import Container from "../components/Container";
import Layout from "../components/Layout";
import Section from "../components/Section";
import SingleColumn from "../components/SingleColumn";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Urbit Developers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <SingleColumn>
          <Section>
            <h1>
              Urbit is a general-purpose platform for building decentralized,
              peer-to-peer applications.
            </h1>
            <button>
              <span className="type-ui">Learn More</span>
            </button>
          </Section>
          <Section>
            <div className="p-6 bg-green-100 rounded-xl prose lg:prose-lg">
              <h2>Learn</h2>
              <span>Become an Urbit developer</span>

              <p>
                Urbit is an entirely new computer and novel programming
                environment. Start with our series of self-guided courses.{" "}
              </p>

              <p>
                You can get a high level overview with the primer, or jump into
                learning with a series of self-led courses designed to teach you
                the basics called Urbit 101. If you’re already familiar with the
                basics, consult the series of standalone guides called Urbit
                201.
              </p>

              <p>Stack overview | Urbit 101 | Urbit 201 </p>
            </div>
          </Section>
          <Section>
            <div className="p-6 bg-blue-100 rounded-xl prose lg:prose-lg">
              <h2>Community</h2>
              <span>Join the community </span>

              <p>
                The developer community is friendly, helpful, and organized from
                within Urbit itself—but you don’t have to take our word for it!
                Join our public groups on the network, or tune into a Developer
                Call to join the community.{" "}
              </p>

              <p>Get involved | Developer Calls | Join the mailing list </p>

              <p>
                The mailing list is meant to be a separate, developer-only list
                for those that want to stay up-to-date on developer-specific
                announcements. These would be things like new documentation,
                upcoming developer calls, infrastructure updates/breaking
                changes, etc.{" "}
              </p>
            </div>
          </Section>
          <Section>
            <div className="p-6 bg-yellow-100 rounded-xl prose lg:prose-lg">
              <h2>Opportunities </h2>
              <span>Apply your skills</span>

              <p>
                The Urbit ecosystem is growing rapidly, which presents many
                opportunities to enterprising developers. Address space grants
                through the Urbit Foundation are a great way to take your skills
                to the next level. Companies like Tlon are regularly hiring
                developers, and The Combine is funding startups that build on
                Urbit.{" "}
              </p>

              <p>Grants | Jobs | The Combine</p>
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}
