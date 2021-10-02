import Meta from "./Meta";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Meta />
      <Header />
      <div className="">{children}</div>
    </>
  );
}
