import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import classnames from "classnames";
import { IntraNav, capitalize, MenuTray } from "@urbit/foundation-design-system";

function ActiveLink({ children, href, className, currentPath }) {
  const firstCrumb = currentPath.split("/")[1];

  const activeClassName = classnames({
    "text-wall-600": "/" + firstCrumb === href,
    "text-wall-500": "/" + firstCrumb !== href,
  });

  return (
    <Link href={href} passHref>
      <a className={`${className} ${activeClassName}`}>{children}</a>
    </Link>
  );
}

export default function Header({ search }) {
  const [isOpen, setTray] = useState(false);

  const currentPath = useRouter().asPath;

  const routeDepth = currentPath.split("/").length;

  const firstCrumb = currentPath.split("/")[1];

  return (
    <>
      {" "}
      <IntraNav ourSite="https://developers.urbit.org" search={search} />
      <header className="layout max-w-screen-lg px-4 md:px-8 flex justify-between items-end  pt-8 md:pt-10 lg:pt-12 pb-10 md:pb-12 lg:pb-24">
        <div>
          <Link href="/overview" passHref>
            <a className="text-lg font-semibold leading-3 mr-5">
              Urbit Docs
            </a>
          </Link>
          {routeDepth > 2 ? (
            <Link href={`/${firstCrumb}`} passHref>
              <a className="inline md:hidden type-ui text-wall-500 ml-2">
                {capitalize(firstCrumb)}
              </a>
            </Link>
          ) : null}
        </div>
        {
          // Large screen header
        }
        <nav className="items-center hidden md:flex">
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 type-ui"
            href="/language/overview"
          >
            Language
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 type-ui"
            href="/userspace/overview"
          >
            Userspace
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 type-ui button-text"
            href="/system/overview"
          >
            System
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 type-ui"
            href="/ecosystem/overview"
          >
           Ecosystem
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="type-ui"
            href="/manual/overview"
          >
            Manual
          </ActiveLink>
        </nav>

        {
          // Small screen header
        }
        <MenuTray isOpen={isOpen} setTray={setTray} search={search}>
          <Link href="/" passHref>
            <a className="font-semibold mb-4">Urbit Developers</a>
          </Link>
          <Link href="https://urbit.org" passHref>
            <a className="mt-2">Urbit.org</a>
          </Link>
          <Link href="https://operators.urbit.org" passHref>
            <a className="mt-2">Operators</a>
          </Link>
          <Link href="/" passHref>
            <a className="font-semibold mt-2">Developers</a>
          </Link>
          <Link href="https://roadmap.urbit.org" passHref>
            <a className="mt-2 mb-4">Roadmap</a>
          </Link>
          <hr className="border-wall-200" />
          <ActiveLink
            currentPath={currentPath}
            className="mt-4 mr-5 mb-3 type-ui"
            href="/overview"
          >
            
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 mb-3 type-ui"
            href="/guides"
          >
            Guides
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 mb-3 type-ui"
            href="/reference"
          >
            Reference
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 mb-3 type-ui button-text"
            href="/courses"
          >
            Courses
          </ActiveLink>
          <ActiveLink
            currentPath={currentPath}
            className="mr-5 type-ui"
            href="/blog"
          >
            Blog
          </ActiveLink>
        </MenuTray>
      </header>
    </>
  );
}
