import Link from "next/link";
import SingleColumn from "./SingleColumn";
import { useRouter } from "next/router";
// import { useState, useEffect } from "react";
import classnames from "classnames";
// import path from "path";
// import Section from "../components/Section";

function ActiveLink({ children, href, className, currentPath }) {
  const firstCrumb = currentPath.split("/")[1];

  const activeClassName = classnames({
    "text-wall-600": "/" + firstCrumb === href,
    "text-wall-500": "/" + firstCrumb !== href,
  });

  return (
    <Link href={href}>
      <a className={`${className} ${activeClassName}`}>{children}</a>
    </Link>
  );
}

export default function Header(props) {
  const currentPath = useRouter().asPath;

  const routeDepth = currentPath.split("/").length;

  const firstCrumb = currentPath.split("/")[1];
  return (
    <div className="flex flex-col w-full items-center">
      <SingleColumn>
        <header className=" layout px-4 md:px-8 flex justify-between items-center pt-8 md:pt-10 lg:pt-12 pb-10 md:pb-12 lg:pb-24">
          <Link href="/">
            <a className="type-ui">Urbit Developers</a>
          </Link>

          <nav className="items-center hidden md:flex">
            <ActiveLink
              currentPath={currentPath}
              className="mr-5 type-ui"
              href="/learn"
            >
              Learn
            </ActiveLink>
            <ActiveLink
              currentPath={currentPath}
              className="mr-5 type-ui"
              href="/community"
            >
              Community
            </ActiveLink>
            <ActiveLink
              currentPath={currentPath}
              className="mr-5 type-ui"
              href="/opportunities"
            >
              Opportunities
            </ActiveLink>
            <ActiveLink
              currentPath={currentPath}
              className="text-green-400 type-ui button-text"
              href="/why"
            >
              Why Urbit?
            </ActiveLink>
          </nav>
        </header>
      </SingleColumn>
    </div>
  );
}
