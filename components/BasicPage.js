import { useRouter } from "next/router";
import Head from "next/head";
import Meta from "./Meta";
import ErrorPage from "../pages/404";
import {
  Container,
  SingleColumn,
  Section,
  Markdown,
  TableOfContents,
} from "foundation-design-system";
import Header from "./Header";
import Footer from "./Footer";
import classNames from "classnames";

export default function BasicPage({
  post,
  markdown,
  wide = false,
  search,
  index = false,
}) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage />;
  }
  return (
    <Container>
      <Head>
        <title>{post.title} • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section narrow={!wide}>
          <h1>{post.title}</h1>
        </Section>
        <Section narrow={!wide}>
          <div className={classNames("flex", { sidebar: index })}>
            <div className={classNames("markdown", { "max-w-prose": index })}>
              <Markdown.render content={JSON.parse(markdown)} />
            </div>
            {index && <TableOfContents />}
          </div>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
