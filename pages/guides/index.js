import Head from "next/head";
import Meta from "../../components/Meta";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import TallCard from "../../components/TallCard";
import {
  Container,
  Section,
  SingleColumn,
  TwoUp,
} from "foundation-design-system";
import { Comms, MintFiller } from "../../components/icons";

export default function GuidePage() {
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
      <Header />
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
            />
            <Card
              icon={<MintFiller />}
              title="Lorem Ipsum Dolorem"
              text="Roll your own encrypted chat application in minutes"
              className="basis-1/2"
            />
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
              href="/guides/environment-setup"
              image="/images/environment.svg"
              className="h-full"
            />
            <TallCard
              title="Hoon School"
              description="Learn the fundamentals of the Hoon programming language"
              callout="View Guide"
              href="/guides/hoon-school"
              image="/images/hoon.svg"
              className="h-full"
            />
          </TwoUp>
          <TwoUp className="!mt-0">
            <TallCard
              title="App School"
              description="Learn how to build Urbit userspace applications by writing your own Gall agents"
              callout="View Guide"
              href="/guides/app-school"
              image="/images/app.svg"
              className="h-full"
            />
            <TallCard
              title="Full Stack Integration"
              description="Learn how to create Gall agents and integrate them into a React front-end"
              callout="View Guide"
              href="/guides/full-stack"
              image="/images/fullstack.svg"
              className="h-full"
            />
          </TwoUp>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
