import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import classnames from "classnames";
import Meta from "../../components/Meta";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import CardText from "../../components/CardText";
import ContentArea from "../../components/ContentArea";
import Sidebar from "../../components/Sidebar";
import TallCard from "../../components/TallCard";
import Pagination from "../../components/Pagination";
import {
  Container,
  Section,
  SingleColumn,
  TwoUp,
  Markdown,
} from "foundation-design-system";
import { Comms, MintFiller, guideDefault } from "../../components/icons";
import guidesTree from "../../cache/guides.json";
import { join } from "path";
import { getPage, getPreviousPost, getNextPost } from "../../lib/lib";

export default function GuidePage({
  search,
  posts,
  data,
  markdown,
  params,
  previousPost,
  nextPost,
}) {
  if (!params.slug) {
    return <Landing search={search} />;
  }
  return (
    <>
      <Head>
        <title>{data.title} • Guides • developers.urbit.org</title>
        {Meta(data)}
      </Head>
      <div className="flex h-screen min-h-screen w-screen sidebar">
        <Sidebar search={search}>
          {childPages("/guides", posts.children)}
        </Sidebar>
        <ContentArea
          breadcrumbs={breadcrumbs(posts, params.slug?.slice(0, -1) || "")}
          title={data.title}
          search={search}
          section="Guides"
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
                section={join("guides", params.slug?.slice(0, -1).join("/"))}
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
                section={join("guides", params.slug?.slice(0, -1).join("/"))}
              />
            )}
          </div>
          <a
            className="font-semibold rounded-xl block p-2 text-wall-400 hover:text-green-400 mt-16"
            target="_blank"
            href={`https://github.com/urbit/developers.urbit.org/blob/master/content/docs/${
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
  const results = [<Link href="/guides">Guides</Link>];
  let thisLink = "/guides";
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
  <ul className="pl-0">
    {Object.entries(children).map(([childSlug, child]) => (
      <li>{pageTree(join(thisLink, childSlug), child, level)}</li>
    ))}
  </ul>
);

const pageTree = (thisLink, tree, level = 0) => {
  const router = useRouter();
  const firstCrumb = "/" + router.asPath.split("/").slice(1).join("/");

  const includesThisPage = firstCrumb.includes(thisLink);
  const isThisPage = router.asPath === thisLink;
  const [isOpen, toggleTree] = useState(includesThisPage);

  const activeClasses = classnames({
    hidden: !isOpen,
  });

  const headingItemClasses = classnames({
    "pl-0 text-base font-semibold hover:text-green-400 leading-relaxed":
      level === 0,
    "pl-4 text-base font-semibold hover:text-green-400": level === 1,
    "pl-8 text-base hover:text-green-400": level === 2,
    "dot text-green-400": isThisPage,
    "text-wall-600": !isThisPage,
  });

  const pageItemClasses = classnames({
    "pl-4 text-base hover:text-green-400": level === 0,
    "pl-8 text-base hover:text-green-400": level === 1,
    "pl-12 text-base hover:text-green-400": level === 2,
  });

  if (tree?.type === "tab") {
    return (
      <>
        <p className="text-xs uppercase font-semibold text-wall-400 mt-4">
          {tree.title}
        </p>
        {tree.pages.map(({ title, slug }) => {
          const href = join(thisLink, slug);
          const isSelected = router.asPath === href;
          const selectedClasses = classnames({
            dot: isSelected,
            "text-green-400": isSelected,
            "text-wall-600": !isSelected,
          });
          return (
            <li className="ml-0">
              <Link href={href} passHref>
                <a
                  className={`relative font-semibold inline-block ${selectedClasses} `}
                >
                  {title}
                </a>
              </Link>
            </li>
          );
        })}
        {childPages(thisLink, tree.children, level)}
      </>
    );
  }

  return (
    <>
      <Link href={thisLink} passHref>
        <a onClick={() => toggleTree(!isOpen)}>
          <p className={`${headingItemClasses} relative cursor-pointer`}>
            {tree.title}
          </p>
        </a>
      </Link>
      <div className={activeClasses}>
        <ul className={""}>
          {tree.pages.map(({ title, slug }) => {
            const href = join(thisLink, slug);
            const isSelected = router.asPath === href;
            const selectedClasses = classnames({
              dot: isSelected,
              "text-green-400": isSelected,
              "text-wall-600": !isSelected,
            });
            return (
              <li>
                <Link href={href} passHref>
                  <a
                    className={`relative inline-block ${selectedClasses} ${pageItemClasses} `}
                  >
                    {title}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        {childPages(thisLink, tree.children, level + 1)}
      </div>
    </>
  );
};

function Landing({ search }) {
  const post = {
    title: "Guides",
    description:
      "Everything you need to know to start building applications on Urbit.",
  };
  return (
    <Container>
      <Head>
        <title>Guides • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1>Guides</h1>
        </Section>
        <Section short>
          <h3 className="pt-12">Quickstart: Lightning Tutorials</h3>
          <p className="pt-4">
            Build an application on Urbit in 15 minutes with these instant
            application guides.
          </p>
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-12">
            <Card
              icon={<Comms />}
              title="Encrypted Chat Application"
              text="Build your own secure comms tool"
              className="basis-1/2"
              href="/guides/quickstart/chat-guide"
            />
            {/* <Card
              icon={<MintFiller />}
              title="Lorem Ipsum Dolorem"
              text="Roll your own encrypted chat application in minutes"
              className="basis-1/2"
            /> */}
          </div>
        </Section>
        <Section short className="space-y-6">
          <h3>Core Curriculum</h3>
          <p>
            The following guides will teach you everything you need to know to
            start building applications on Urbit.
          </p>
          <TwoUp>
            <TallCard
              title="Environment Setup"
              description="Learn how to get your urbit development environment configured"
              callout="View Guide"
              href="/guides/core/environment"
              image="/images/environment.svg"
              className="h-full"
            />
            <TallCard
              title="Hoon School"
              description="Learn the fundamentals of the Hoon programming language"
              callout="View Guide"
              href="/guides/core/hoon-school"
              image="/images/hoon.svg"
              className="h-full"
            />
          </TwoUp>
          <TwoUp className="!mt-0">
            <TallCard
              title="App School"
              description="Learn how to build Urbit userspace applications by writing your own Gall agents"
              callout="View Guide"
              href="/guides/core/app-school"
              image="/images/app.svg"
              className="h-full"
            />
            <TallCard
              title="Full Stack Integration"
              description="Learn how to create Gall agents and integrate them into a React front-end"
              callout="View Guide"
              href="/guides/core/app-school-full-stack"
              image="/images/fullstack.svg"
              className="h-full"
            />
          </TwoUp>
        </Section>

        <Section short>
          <h3 className="pt-12">Additional Guides</h3>
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-12">
            <CardText
              title="Writing Aqua Tests"
              text="Learn to write tests with Aqua"
              className="basis-1/2"
              href="/guides/additional/aqua"
            />
            <CardText
              title="CLI Apps"
              text="Learn to build command line applications"
              className="basis-1/2"
              href="/guides/additional/cli-tutorial"
            />
          </div>
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-6">
            <CardText
              title="Using the HTTP API"
              text="Learn how to interact with ships through Eyre’s web API"
              className="basis-1/2"
              href="/guides/additional/http-api-guide"
            />
            <CardText
              title="Working with JSON"
              text="Learn how to handle this common data standard in Urbit"
              className="basis-1/2"
              href="/guides/additional/json-guide"
            />
          </div>

          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-6">
            <CardText
              title="Parsing"
              text="Learn to parse text with Hoon"
              className="basis-1/2"
              href="/guides/additional/parsing"
            />
            <CardText
              title="Sail: HTML in Hoon"
              text="Learn the basics of Sail"
              className="basis-1/2"
              href="/guides/additional/sail"
            />
          </div>

          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-6">
            <CardText
              title="Distributing Software"
              text="Learn to publish a desk that others can install"
              className="basis-1/2"
              href="/guides/additional/software-distribution"
            />
            <CardText
              title="Working with Strings"
              text="Learn about Hoon’s two main string types"
              className="basis-1/2"
              href="/guides/additional/strings"
            />
          </div>

          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 pt-6">
            <CardText
              title="Writing Unit Tests"
              text="Learn to write unit tests in Hoon"
              className="basis-1/2"
              href="/guides/additional/unit-tests"
            />
            {/* <CardText
              icon={<MintFiller />}
              title="Lorem Ipsum Dolorem"
              text="Roll your own encrypted chat application in minutes"
              className="basis-1/2"
            /> */}
          </div>


        </Section>


      </SingleColumn>
      <Footer />
    </Container>
  );
}

export async function getStaticProps({ params }) {
  let posts = guidesTree;

  const { data, content } = getPage(
    join(process.cwd(), "content/guides", params.slug?.join("/") || "/")
  );

  const previousPost =
    getPreviousPost(
      params.slug?.slice(-1).join("") || "guides",
      ["title", "slug", "weight"],
      join("guides", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const nextPost =
    getNextPost(
      params.slug?.slice(-1).join("") || "guides",
      ["title", "slug", "weight"],
      join("guides", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const markdown = JSON.stringify(Markdown.parse({ post: { content } }));

  return { props: { posts, data, markdown, params, previousPost, nextPost } };
}

export async function getStaticPaths() {
  const posts = guidesTree;
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

  allHrefs("/guides", posts);
  return {
    paths: slugs,
    fallback: false,
  };
}
