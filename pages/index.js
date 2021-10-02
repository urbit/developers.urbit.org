import Head from "next/head";
import Link from "next/link";
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
            <h1 className="pb-12">
              Urbit is a general-purpose platform for building decentralized,
              peer-to-peer applications.
            </h1>
            <Link href="/why">
              <button className="button-lg bg-green-400 text-white text-ui">
                <span className="type-ui">Learn More</span>
              </button>
            </Link>
          </Section>
          <Section short>
            <div className="p-12 bg-green-100 rounded-3xl prose lg:prose-lg">
              <Link href="/learn">
                <h2 className="cursor-pointer hover:opacity-80">
                  Learn{" "}
                  <span className="block mt-2 text-base text-green-400">
                    Become an Urbit developer
                  </span>
                </h2>
              </Link>

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

              <ul>
                <li>
                  <Link href="/primer">Stack Overview</Link>
                </li>
                <li>
                  <Link href="/learn#urbit-101">Urbit 101</Link>
                </li>
                <li>
                  <Link href="/learn#urbit-201">Urbit 201</Link>
                </li>
              </ul>
            </div>
          </Section>
          <Section short>
            <div className="p-12 bg-blue-100 rounded-3xl prose lg:prose-lg">
              <Link href="/community">
                <h2 className="cursor-pointer hover:opacity-80">
                  Community{" "}
                  <span className="block mt-2 text-base text-green-400">
                    Join the community{" "}
                  </span>
                </h2>
              </Link>

              <p>
                The developer community is friendly, helpful, and organized from
                within Urbit itself—but you don’t have to take our word for it!
                Join our public groups on the network, or tune into a Developer
                Call to join the community.{" "}
              </p>
              <ul>
                <li>
                  <Link href="/community">Get Involved</Link>
                </li>
                <li>
                  <Link href="/community">Developer Calls</Link>
                </li>
                <li>
                  <Link href="/community">Join the Mailing List</Link>
                </li>
              </ul>
              <p className="text-wall-400">
                The mailing list is meant to be a separate, developer-only list
                for those that want to stay up-to-date on developer-specific
                announcements. These would be things like new documentation,
                upcoming developer calls, infrastructure updates/breaking
                changes, etc.{" "}
              </p>
            </div>
          </Section>
          <Section short>
            <div className="p-12 bg-yellow-100 rounded-3xl prose lg:prose-lg">
              <Link href="/opportunities">
                <h2 className="cursor-pointer hover:opacity-80">
                  Opportunities{" "}
                  <span className="block mt-2 text-base text-green-400">
                    Apply your skills
                  </span>
                </h2>
              </Link>

              <p>
                The Urbit ecosystem is growing rapidly, which presents many
                opportunities to enterprising developers. Address space grants
                through the Urbit Foundation are a great way to take your skills
                to the next level. Companies like Tlon are regularly hiring
                developers, and The Combine is funding startups that build on
                Urbit.{" "}
              </p>
              <ul>
                <li>
                  <Link href="/opportunities">Grants</Link>
                </li>
                <li>
                  <Link href="/opportunities">Jobs</Link>
                </li>
                <li>
                  <Link href="https://the-combine.org/">The Combine</Link>
                </li>
              </ul>
            </div>
          </Section>
        </SingleColumn>
      </Container>
    </Layout>
  );
}
