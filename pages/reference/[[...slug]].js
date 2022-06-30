import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import classnames from "classnames";
import Meta from "../../components/Meta";
import ContentArea from "../../components/ContentArea";
import Sidebar from "../../components/Sidebar";
import Pagination from "../../components/Pagination";
import BasicPage from "../../components/BasicPage";
import { Markdown } from "foundation-design-system";
import referenceTree from "../../cache/reference.json";
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
    return (
      <BasicPage
        wide
        post={{ title: data.title, slug: "/reference" }}
        markdown={markdown}
        search={search}
      />
    );
  }
  return (
    <>
      <Head>
        <title>{data.title} • Reference • developers.urbit.org</title>
        {Meta(data)}
      </Head>
      <div className="flex h-screen min-h-screen w-screen sidebar">
        <Sidebar search={search}>
          {childPages("/reference", posts.children)}
        </Sidebar>
        <ContentArea
          breadcrumbs={breadcrumbs(posts, params.slug?.slice(0, -1) || "")}
          title={data.title}
          search={search}
          section="Reference"
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
                section={join("reference", params.slug?.slice(0, -1).join("/"))}
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
                section={join("reference", params.slug?.slice(0, -1).join("/"))}
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
  const results = [<Link href="/reference">Reference</Link>];
  let thisLink = "/reference";
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
        {childPages(thisLink, tree.children, level)}
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

export async function getStaticProps({ params }) {
  let posts = referenceTree;

  const { data, content } = getPage(
    join(process.cwd(), "content/reference", params.slug?.join("/") || "/")
  );

  const previousPost =
    getPreviousPost(
      params.slug?.slice(-1).join("") || "reference",
      ["title", "slug", "weight"],
      join("reference", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const nextPost =
    getNextPost(
      params.slug?.slice(-1).join("") || "reference",
      ["title", "slug", "weight"],
      join("reference", params.slug?.slice(0, -1).join("/") || "/"),
      "weight"
    ) || null;

  const markdown = JSON.stringify(Markdown.parse({ post: { content } }));

  return { props: { posts, data, markdown, params, previousPost, nextPost } };
}

export async function getStaticPaths() {
  const posts = referenceTree;
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

  allHrefs("/reference", posts);
  return {
    paths: slugs,
    fallback: false,
  };
}
