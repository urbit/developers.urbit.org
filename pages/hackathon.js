import Head from "next/head";
import Link from "next/link";
import React from "react";
import {
  Container,
  Section,
  SingleColumn,
  TwoUp,
  getPostBySlug,
} from "@urbit/foundation-design-system";
import Meta from "../components/Meta";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Probably should make a core component, just pulling from operators.urbit.org for this one
function GuideCard({ title, description, href, className }) {
  return (
    <div
      className={"bg-wall-100 rounded-xl cursor-pointer h-full " + className}
    >
      <div className="p-8 measure flex justify-between flex-col">
        <div className="flex flex-col space-y-2">
          <h4 className="mb-2">{title}</h4>
          {description}
        </div>
        <Link href={href}>
          <a
            passHref
            className="bg-green-400 text-white rounded-lg flex justify-center p-3 w-20 mt-4 min-w-fit"
          >
            Get Started
          </a>
        </Link>
      </div>
    </div>
  );
}

export default function Hackathon({ search, featuredGroups }) {
  const post = {
    title: "Urbit Assembly Hackathon",
    description:
      "Unleash your creativity and join the quest to build something great.",
    image:
      "https://storage.googleapis.com/media.urbit.org/developers/hackathon/hackathon_logo.svg",
  };
  const pairedGroups = pair(featuredGroups);
  return (
    <Container>
      <Head>
        <title>Urbit Assembly Hackathon 2023</title>
        {Meta(post)}
      </Head>
      <SingleColumn>
        <Header search={search} />
        <Section className="pb-24">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="uppercase tracking-widest">Urbit Foundation presents</h3>
            <h1 className="text-center">Assembly Hackathon 2023</h1>
            <Link href="https://zorp.io">
              <a className="text-wall-400 pb-12">Sponsored by Zorp</a>
              </Link>
          </div>
          <img
              className="flex space-x-8"
              src="https://storage.googleapis.com/media.urbit.org/developers/hackathon/hackathon_logo.svg"
            />

          <div className="pt-8 md:p-16">
            <p className="type-ui text-center">
            Unleash your creativity and join the quest to build your great Urbit project. This year’s Assembly Hackathon has the most substantial prize pool in Urbit history. We invite you to rise to the challenge, showcase your skills, and claim victory.
              </p>
            <p className="type-ui pt-8 text-center">
            In the first week you’ll enter as an individual and form a team, or register an existing team. Each team will get a mentor who guides you through the Hackathon, helps you solve issues, and keeps you on track. As you progress, they will provide regular meetings to ensure your product reaches its full potential. You'll have access to a network of UF team members, valuable resources, and experts from within the Urbit ecosystem. With a dedicated mentor by your side, workshops from our best developers, and a powerhouse team, all that's left for you to provide is the talent and determination.
            </p>
            <p className="type-ui pt-8 text-center">
            
            <p></p>The Hackathon will start on August 28th and culminate on Demo Day at {" "}
                <Link href="https://assembly.urbit.org">
                  <a>Urbit Week Lisboa</a>
                </Link>.
            </p>
          </div>
        </Section>
        
        {/* Features */}
        <h2>Prizes</h2>
        <a className="text-wall-400 pb-12">This year's Hackathon has the most substantial prize pool in Urbit history.</a>
        <Section className="flex flex-col space-y-8">
          {/* Overall */}
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Best overall – 3 Stars + unreleased Native Planet devices</h3>
              <p>
              On Demo Day the committee of judges will decide which product has the highest score overall. The criteria they will take into account are: innovation, usefulness, usage of Urbit, UI design, and completeness.
              </p>
            </div>
          </div>
          {/* Core */}
          <div className="flex flex-col-reverse md:flex-row items-center md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Core – 2 Stars + unreleased Native Planet devices </h3>
              <p>
              Hardcore hacker? This is for you. This prize will be awarded to the best project that improves Urbit's developer experience or technical capabilities. Possible topics include developer tooling, system utilities, networking, security, performance, and more.
              </p>
            </div>
          </div>
          {/* UI */}
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Best UI – 2 Stars + unreleased Native Planet devices</h3>
              <p>
              This prize will be awarded to the userspace application with the best user interface design, judged based on visual appeal, user experience, clarity, responsiveness, and interactivity.
              </p>
            </div>
          </div>
          {/* Composability */}
          <div className="flex flex-col-reverse md:flex-row items-center md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Best Composability – 2 Stars + unreleased Native Planet devices</h3>
              <p>
              A huge advantage of an Urbit personal server is app composability. Apps can be built to seamlessly interact with each other while keeping data local and private. This prize will be awarded to the product that makes best use of this by showing an innovative and useful integration with other Urbit services.
              </p>
            </div>
          </div>
          {/* Hooner */}
          <div className="flex flex-col-reverse md:flex-row items-center md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Rising Stars – Unreleased Native Planet devices </h3>
              <p>
              This prize will be given to the best product built by a team composed of at least 50% graduates of Hoon School since Assembly 2022.
              </p>
            </div>
          </div>
            {/* Audience */}
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="flex flex-col space-y-4 max-w-prose">
              <h3>Audience Vote – 1 Star</h3>
              <p>
              The Demo Day audience will vote on their favorite.   
              </p>
            </div>
          </div>
          <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdsyFqt66YZAlVmgHAIZeaSnbDuH-q7vLl1aiU8xzwY79cawA/viewform?usp=sf_link">
            <a className="button-lg bg-green-400 text-white w-fit">
              Sign up for the Assembly Hackathon
            </a>
          </Link>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

const pair = (arr) => {
  if (!arr || arr.length === 0) {
    return [];
  }

  return arr.reduce(function (rows, key, index) {
    return (
      (index % 2 === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
      rows
    );
  }, []);
};