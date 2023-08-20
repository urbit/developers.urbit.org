import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Container,
  Section,
  SingleColumn,
  TwoUp,
} from "@urbit/foundation-design-system";
import Meta from "../../components/Meta";
import Card from "../../components/Card";

export default function Community({ search }) {
  const post = {
    title: "Community",
    description:
      "The developer community is a combination of top-down stewardship from the Urbit Foundation and Tlon, as well as organic, bottom-up coordination from unaffiliated enthusiasts.",
  };
  return (
    <Container>
      <Head>
        <title>Blog • developers.urbit.org</title>
        {Meta(post)}
      </Head>
      <Header search={search} />
      <SingleColumn>
        <Section>
          <h1>Community</h1>
          <p className="text-xl mt-10">
            The developer community is a combination of top-down stewardship
            from the Urbit Foundation and Tlon, as well as organic, bottom-up
            coordination from unaffiliated enthusiasts.
          </p>

          <div className="md:columns-2 mt-10 gap-x-8 pb-16">
            <p className="">
              The Urbit Foundation makes direct investments of address space
              into the community as a means of improving the network. The
              Foundation also maintains developer documentation, runs Developer
              Calls, and acts as the hub of the Urbit ecosystem. You can find us
              hanging around in the{" "}
              <Link
                href="https://urbit.org/groups/~wolref-podlex/foundation"
                passHref
              >
                <a>Foundation</a>
              </Link>{" "}
              group.
            </p>
            <p className="">
              <a href="https://tlon.io">Tlon</a> is the original vehicle for Urbits development and remains the primary product developer in the 
              ecosystem. They’ve been developing Urbit since 2013 and are
              naturally a great source of information. They maintain the most
              popular Landscape groups,{" "}
              <Link
                href="https://urbit.org/groups/~bitbet-bolbel/urbit-community"
                passHref
              >
                <a>Urbit Community</a>
              </Link>{" "}
              and{" "}
              <Link
                href="https://urbit.org/groups/~bollug-worlus/urbit-index"
                passHref
              >
                <a>Urbit Index</a>
              </Link>
              .
            </p>
          </div>

          <TwoUp>
            <Card
              title="Directory"
              text="Our community is comprised of friendly individuals, both independent and part of a variety of organizations"
              href="/community/directory"
              callout="View Directory"
              className="h-full"
            />
            <Card
              title="Opportunities"
              text="Urbit is growing and there are many opportunities to find a job, grant, or funding for your great idea"
              href="/community/opportunities"
              callout="Explore Opportunities"
              className="h-full"
            />
          </TwoUp>
          <TwoUp>
            <Card
              title="Support"
              text="There are a variety of Urbit groups as well as a mailing list where you can ask questions and get timely answers"
              href="/community/support"
              callout="Get Support"
              className="h-full"
            />
            <Card title="" text="" href="" callout="" className="hidden" />
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
