import React from "react";
import Link from "next/link";
import SingleColumn from "./SingleColumn";
import Section from "./Section";

export default function Footer() {
  return (
    <footer className="bg-wall-100 mt-20 w-full flex justify-center">
      <SingleColumn>
        <Section short className="flex flex-row flex-wrap">
          <div className="w-1/2 md:w-1/3 flex flex-col flex-shrink">
            <h4 className="mt-16 mb-8">Use Urbit</h4>
            <Link href="https://urbit.org/getting-started">
              <div>
                <a className="type-bold text-wall-500">Getting Started</a>
              </div>
            </Link>
            <Link href="https://urbit.org/using">
              <div>
                <a className="type-bold text-wall-500">User&apos;s Manual</a>
              </div>
            </Link>
            <Link href="https://github.com/urbit/port/releases">
              <div>
                <a className="type-bold text-wall-500">Urbit Client</a>
              </div>
            </Link>
            <Link href="https://github.com/urbit/urbit/releases">
              <div>
                <a className="mt-2 type-bold text-wall-500">Urbit Binaries</a>
              </div>
            </Link>
            <Link href="https://urbit.org/getting-started/planet/#hosting-providers">
              <div>
                <a className="mt-2 type-bold text-wall-500">
                  Hosting Providers
                </a>
              </div>
            </Link>
          </div>
          <div className="w-1/2 md:w-1/3 flex flex-col flex-shrink">
            <h4 className="mt-16 mb-8">About</h4>
            <Link href="https://urbit.org/understanding-urbit">
              <div>
                <a className="type-bold text-wall-500">What&apos;s Urbit?</a>
              </div>
            </Link>
            <Link href="https://urbit.org/understanding-urbit/urbit-id">
              <div>
                <a className="mt-2 type-bold text-wall-500">Urbit ID</a>
              </div>
            </Link>
            <Link href="https://urbit.org/understanding-urbit/urbit-os">
              <div>
                <a className="mt-2 type-bold text-wall-500">Urbit OS</a>
              </div>
            </Link>
            <Link href="https://urbit.org/faq">
              <div>
                <a className="mt-2 type-bold text-wall-500">FAQ</a>
              </div>
            </Link>
          </div>
          <div className="w-1/2 md:w-1/3 flex flex-col flex-shrink">
            <h4 className="mt-16 mb-8">News</h4>
            <Link href="https://urbit.org/blog">
              <div>
                <a className="type-bold text-wall-500">Blog</a>
              </div>
            </Link>
            <Link href="https://urbit.org/events">
              <div>
                <a className="mt-2 type-bold text-wall-500">Events</a>
              </div>
            </Link>
            <Link href="https://urbit.org/updates">
              <div>
                <a className="mt-2 type-bold text-wall-500">Updates</a>
              </div>
            </Link>
          </div>

          <div className="w-1/2 md:w-1/3 flex flex-col">
            <h4 className="mt-16 mb-8">Develop</h4>
            <Link href="https://urbit.org/docs">
              <div>
                <a className="type-bold text-wall-500">Documentation</a>
              </div>
            </Link>
            <Link href="https://github.com/urbit">
              <div>
                <a className="mt-2 type-bold text-wall-500">Github</a>
              </div>
            </Link>
            <Link href="https://github.com/urbit/awesome-urbit#http-apis-airlock">
              <div>
                <a className="mt-2 type-bold text-wall-500">Airlock APIs</a>
              </div>
            </Link>
          </div>
          <div className="w-1/2 md:w-1/3 flex flex-col">
            <h4 className="mt-16 mb-8">Contribute</h4>
            <Link href="https://github.com/urbit/urbit/issues">
              <div>
                <a className="type-bold text-wall-500">Issue Tracker</a>
              </div>
            </Link>
            <Link href="https://urbit.org/grants">
              <div>
                <a className="mt-2 type-bold text-wall-500">Urbit Grants</a>
              </div>
            </Link>
          </div>

          <div className="w-1/2 md:w-1/3 flex flex-col">
            <h4 className="mt-16 mb-8">Community</h4>
            <Link href="https://groups.google.com/a/urbit.org/g/dev?pli=1">
              <div>
                <a className="type-bold text-wall-500">Dev Mailing List</a>
              </div>
            </Link>
            <Link href="https://github.com/urbit/azimuth">
              <div>
                <a className="mt-2 type-bold text-wall-500">Governance</a>
              </div>
            </Link>
            <Link href="https://twitter.com/urbit">
              <div>
                <a className="mt-2 type-bold text-wall-500">Twitter</a>
              </div>
            </Link>
          </div>
        </Section>
        <Section className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <Link href="https://urbit.org/privacy">
              <div>
                <a className="type-bold text-wall-500">Privacy Policy</a>
              </div>
            </Link>
          </div>
          <div className="md:w-1/3">
            <Link href="https://urbit.org/terms-of-service">
              <div>
                <a className="type-bold text-wall-500">Terms of Service</a>
              </div>
            </Link>
          </div>
          <div className="md:w-1/3">
            <div>
              <a
                href={"mailto:support@urbit.org"}
                className="type-bold text-wall-500"
              >
                support@urbit.org
              </a>
            </div>
          </div>
        </Section>
      </SingleColumn>
    </footer>
  );
}
