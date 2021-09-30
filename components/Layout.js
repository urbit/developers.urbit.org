import Meta from "./Meta";

export default function Layout({ children }) {
  return (
    <>
      <Meta />
      <div className="max-w-full min-h-screen flex justify-center">
        {children}
      </div>
    </>
  );
}
