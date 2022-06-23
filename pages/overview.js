import Head from "next/head";
import Meta from "../components/Meta";
import {
  Container,
  Markdown,
  Section,
  SingleColumn,
  TwoUp,
} from "foundation-design-system";
import { getPostBySlug } from "../lib/lib";
import Header from "../components/Header";
import Card from "../components/Card";
import {
  Arvo,
  Hoon,
  Nock,
  Vere,
  Azimuth,
  Cryptography,
} from "../components/icons";
import Footer from "../components/Footer";

export default function Overview({ markdown, search }) {
  const post = {
    title: "Overview",
    description: "Urbit's stack in a nutshell.",
  };
  return (
    <Container>
      <Head>
        <title>Overview • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1>Overview</h1>
        </Section>
        <Section className="space-y-4">
          <h3>How to use this site</h3>
          <p>Very carefully.</p>
        </Section>
        <Section short>
          <h3>Primer</h3>
          <div className="md:columns-2 space-y-4 mt-4">
            <p>
              Urbit development involves a fairly typical client/server/database
              stack. Urbit is both a server, database, and an entire operating
              system—this means exposes a filesystem, HTTP server, timer, and
              much more to the programmer. These different parts of the
              operating system are called <b>vanes</b>.
            </p>
            <p>
              Clients that interact with Urbit can be web browsers, mobile or
              desktop applications, command lines, or anything else that
              presents a user interface. At time of writing, most clients
              communicate with Urbit over HTTP by sending JSON back and forth,
              primarily via pub/sub APIs.
            </p>
            <p>
              Where Urbit differs from other client/server stacks is that all
              users run their own servers (<b>urbits</b>), and those servers
              talk directly to one another. Because those servers are also
              databases, all users store their own data, which they exchange
              with one another based on application-level logic.
            </p>
            <p>
              Urbit allows programmers to create what are called agents, which
              can be thought of as individual microservices—each one contains
              its own logic, defines its own API, can be started and stopped,
              can interact with the rest of the operating system and other
              agents, and is responsible for storing its own data. The lifecycle
              of agents is managed by the part of the operating system called{" "}
              <b>Gall</b>.
            </p>
            <p className="break-inside-avoid">
              Since Urbit is actually an operating system, not just a server,
              when we talk about an Urbit “application” we could mean any of
              several things:
            </p>
            <ul className="list-disc list-inside flex space-y-2 flex-col">
              <li>
                A web or mobile interface that interacts with one or more agents
                to define something that looks a lot like an “app”
              </li>
              <li>A single agent that runs in the background</li>
              <li>
                A script called a generator that’s executed from Urbit’s own
                command-line shell (called the dojo)
              </li>
            </ul>
            <p>
              Generators, agents and supporting code are packaged up into{" "}
              <b>desks</b>. These provide a mechanism for packaging up related
              code, and can be shared directly with other users over the
              network—this is how software distribution works on Urbit.
            </p>
            <p>
              All Urbit-side code is written in a purely functional and
              statically typed language called <b>Hoon</b>. Hoon looks kind of
              strange compared to most other programming languages, primarily
              because it’s based on <b>runes</b> rather than keywords. This
              strangeness is due to unfamiliarity rather than any form of
              essential complexity, in much the same way as Chinese appears more
              complex to an English-speaker than, say, Spanish.
            </p>
            <p>
              It’s possible to develop for Urbit without learning Hoon by
              learning its client-side HTTP interface; however, investing the
              time to learn Hoon will make you a far more capable Urbit
              developer, so we definitely recommend it.
            </p>
          </div>
        </Section>
        <Section short>
          <h3 className="pb-8">Core Components</h3>
          <TwoUp>
            <Card
              icon={<Arvo />}
              title="Arvo"
              text="Urbit's purely functional OS, written in Hoon, that serves as the event manager of your urbit"
              className="h-full"
              href="/reference/arvo"
            />
            <Card
              icon={<Hoon />}
              title="Hoon"
              text="A strictly typed functional programming language that compiles itself to Nock"
              className="h-full"
              href="/reference/hoon"
            />
          </TwoUp>
          <TwoUp>
            <Card
              icon={<Nock />}
              title="Nock"
              text="A low-level homoiconic combinator language"
              className="h-full"
              href="/reference/Nock"
            />
            <Card
              icon={<Vere />}
              title="Vere"
              text="The Nock runtime environment and Urbit Virtual Machine"
              className="h-full"
              href="/reference/vere"
            />
          </TwoUp>
          <TwoUp>
            <Card
              icon={<Azimuth />}
              title="Azimuth"
              text="A general-purpose public-key infrastructure (PKI) on the Ethereum blockchain"
              className="h-full"
              href="/reference/azimuth"
            />
            <Card
              icon={<Cryptography />}
              title="Cryptography"
              text="There are two categories of keys and five components of the system involved with cryptography on Urbit"
              className="h-full"
              href="/reference/cryptography"
            />
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(
    "overview",
    ["title", "slug", "content", "extra"],
    "/"
  );

  let { index } = post?.extra || { index: null };

  if (index === undefined) {
    index = null;
  }
  const markdown = JSON.stringify(Markdown.parse({ post }));
  return {
    props: { post, markdown, index },
  };
}
