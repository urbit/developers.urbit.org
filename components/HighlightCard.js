import Link from "next/link";
export default function HighlightCard({ slug, highlight }) {
  return (
    <div className="bg-wall-100 w-full p-4 md:p-8 rounded-3xl flex flex-wrap items-center">

      {highlight.image ? (
        <div className="basis-full sm:basis-1/3 pb-4 sm:pb-0">
        <Link href={highlight.url} passHref>
          <img className="cursor-pointer rounded-xl w-72" src={highlight.image}  />
        </Link>
        </div>
        ) : (
          <div className="rounded-xl w-full"/>
      )}

      <div className="sm:basis-2/3 sm:pl-6 align-middle">
        <h2 className="text-2xl pb-2">{highlight?.title}</h2 >
        <p className="max-w-prose pb-4">
          {highlight?.description}
        </p>
        <Link href={highlight.url} passHref>
          <a className="button-sm border-2 border-wall-600 text-wall-600 type-sm max-w-fit">
            Learn More
          </a>
        </Link>
      </div>
    </div>

  );
}
