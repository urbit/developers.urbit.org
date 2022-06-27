import Head from "next/head";
import Link from "next/link";
import Meta from "../../components/Meta";
import { useRouter } from "next/router";
import classnames from "classnames";
import {
  Container,
  Markdown,
  Section,
  SingleColumn,
  TwoUp,
} from "foundation-design-system";
import Header from "../../components/Header";
import Card from "../../components/Card";
import Sidebar from "../../components/Sidebar";
import ContentArea from "../../components/ContentArea";
import Pagination from "../../components/Pagination";
import {
  Arvo,
  Hoon,
  Nock,
  Vere,
  Azimuth,
  Cryptography,
} from "../../components/icons";
import Footer from "../../components/Footer";
import overviewTree from "../../cache/overview.json";
import { join } from "path";
import { getPage, getPreviousPost, getNextPost } from "../../lib/lib";

export default function Overview({
  posts,
  markdown,
  data,
  search,
  previousPost,
  nextPost,
  params,
}) {
  if (!params.slug) {
    return <Landing search={search} />;
  }
  return (
    <>
      <Head>
        <title>{data.title} • Overview • developers.urbit.org</title>
        {Meta(data)}
      </Head>
      <div className="flex h-screen min-h-screen w-screen sidebar">
        <Sidebar search={search}>
          {childPages("/overview", posts.pages)}
        </Sidebar>
        <ContentArea
          breadcrumbs={breadcrumbs(posts, params.slug?.slice(0, -1) || "")}
          title={data.title}
          search={search}
          section="Overview"
          params={params}
        >
          <div className="markdown technical">
            <Markdown.render content={JSON.parse(markdown)} />
          </div>
          <div className="flex justify-between mt-16">
            {previousPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                previous
                title="Previous Post"
                post={previousPost}
                className=""
                section={join("overview", params.slug?.slice(0, -1).join("/"))}
              />
            )}
            {nextPost === null ? (
              <div className={""} />
            ) : (
              <Pagination
                next
                title="Next Post"
                post={nextPost}
                className=""
                section={join("overview", params.slug?.slice(0, -1).join("/"))}
              />
            )}
          </div>
          <a
            className="font-semibold rounded-xl block p-2 text-wall-400 hover:text-green-400 mt-16"
            target="_blank"
            href={`https://github.com/urbit/developers.urbit.org/blob/master/content/overview/${
              params.slug?.join("/") || "_index"
            }.md`}
          >
            Edit this page on GitHub
          </a>
        </ContentArea>
      </div>
    </>
  );
}

const breadcrumbs = (posts, paths) => {
  const results = [<Link href="/overview">Overview</Link>];
  let thisLink = "/overview";
  for (const path of paths) {
    posts = posts.children[path];
    thisLink = join(thisLink, path);
    results.push(
      <span className="px-1">/</span>,
      <Link href={thisLink}>{posts.title}</Link>
    );
  }
  return results;
};

const childPages = (thisLink, children, level = 0) => (
  <ul>
    {children?.map((child) => (
      <li>{pageTree(join(thisLink, child.slug), child, level)}</li>
    ))}
  </ul>
);

const pageTree = (thisLink, tree, level = 0) => {
  const router = useRouter();

  const isThisPage = router.asPath === thisLink;

  const pageItemClasses = classnames({
    "pl-4 text-base hover:text-green-400": level === 0,
    "pl-8 text-base hover:text-green-400": level === 1,
    "pl-12 text-base hover:text-green-400": level === 2,
    "dot relative text-green-400": isThisPage,
    "text-wall-600": !isThisPage,
  });

  return (
    <>
      <Link href={thisLink} passHref>
        <a className={`${pageItemClasses} cursor-pointer`}>{tree.title}</a>
      </Link>
    </>
  );
};

function Landing({ search }) {
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
          <div className="md:columns-2 space-y-4 mt-4">
            <p>
              Hoon is a powerful and expressive language which builds on the
              Urbit platform to promote complete app interoperability and user
              control. We believe you'll find it to be a pleasantly innovative
              approach to thinking about how computation works and what a
              development experience should be.
            </p>
            <p>
              This site is intended for developers who want to learn how Urbit
              works from the inside out and how to build and deploy apps. If you
              are new to the platform, start with{" "}
              <Link href="/guides/core/hoon-school" passHref>
                <a>Hoon School</a>
              </Link>{" "}
              and{" "}
              <Link href="/guides/core/app-school" passHref>
                <a>App School I</a>
              </Link>{" "}
              and{" "}
              <Link href="/guides/core/app-school-full-stack" passHref>
                <a>II</a>
              </Link>
              . Complete documentation for the{" "}
              <Link href="/reference/hoon" passHref>
                <a>Hoon language</a>
              </Link>{" "}
              and the{" "}
              <Link href="/reference/hoon/stdlib" passHref>
                <a>standard library</a>
              </Link>{" "}
              are included.
            </p>
            <p>
              If you are a regular Urbit user (rather than a developer), you
              will find operational instructions on the{" "}
              <Link href="https://urbit.org" passHref>
                <a>main site</a>
              </Link>
              .
            </p>
            <p>
              Instructions for operators (hosting providers, power users, etc.)
              are hosted on the{" "}
              <Link href="https://operators.urbit.org" passHref>
                <a>operators site</a>
              </Link>
              .
            </p>
          </div>
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
              href="/overview/arvo"
            />
            <Card
              icon={<Hoon />}
              title="Hoon"
              text="A strictly typed functional programming language that compiles itself to Nock"
              className="h-full"
              href="/overview/hoon"
            />
          </TwoUp>
          <TwoUp>
            <Card
              icon={<Nock />}
              title="Nock"
              text="A low-level homoiconic combinator language"
              className="h-full"
              href="/overview/Nock"
            />
            <Card
              icon={<Vere />}
              title="Vere"
              text="The Nock runtime environment and Urbit Virtual Machine"
              className="h-full"
              href="/overview/vere"
            />
          </TwoUp>
          <TwoUp>
            <Card
              icon={<Azimuth />}
              title="Azimuth"
              text="A general-purpose public-key infrastructure (PKI) on the Ethereum blockchain"
              className="h-full"
              href="/overview/azimuth"
            />
            <Card
              icon={<Cryptography />}
              title="Cryptography"
              text="There are two categories of keys and five components of the system involved with cryptography on Urbit"
              className="h-full"
              href="/overview/cryptography"
            />
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps({ params }) {
  let posts = overviewTree;

  const { data, content } = getPage(
    join(process.cwd(), "content/overview", params.slug?.join("/") || "/")
  );

  const previousPost =
    getPreviousPost(
      params.slug?.slice(-1).join("") || "overview",
      ["title", "slug", "weight"],
      join("overview", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const nextPost =
    getNextPost(
      params.slug?.slice(-1).join("") || "overview",
      ["title", "slug", "weight"],
      join("overview", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const markdown = JSON.stringify(Markdown.parse({ post: { content } }));

  return { props: { posts, data, markdown, params, previousPost, nextPost } };
}

export async function getStaticPaths() {
  const posts = overviewTree;
  const slugs = [];

  const allHrefs = (thisLink, tree) => {
    slugs.push(thisLink, ...tree.pages.map((e) => join(thisLink, e.slug)));
    allHrefsChildren(thisLink, tree.children);
  };

  const allHrefsChildren = (thisLink, children) => {
    Object.entries(children).map(([childSlug, child]) => {
      allHrefs(join(thisLink, childSlug), child);
    });
  };

  allHrefs("/overview", posts);
  return {
    paths: slugs,
    fallback: false,
  };
}
