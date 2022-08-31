import Link from "next/link";
export default function IndexCard({
  slug,
  title,
  image,
  author,
  ship,
  content,
}) {
  return (
    <Link href={slug}>
      <div className="cursor-pointer bg-wall-100 rounded-xl basis-1/2 h-full">
        <div className="flex flex-col p-6 justify-between items-between h-full relative">
          {image ? (
            <img
              className="rounded-xl w-full flex-1 object-cover"
              src={image}
              style={{ aspectRatio: "4 / 3" }}
            />
          ) : (
            <div
              className="bg-wall-200 rounded-xl w-full flex-1"
              style={{ aspectRatio: "4 / 3" }}
            />
          )}
          <div className="grow-1 shrink-0 flex flex-col h-full min-h-0 pt-4">
            <h3 className="mb-2">{title}</h3>
            <p className="text-sm">
              {author ? (
                <span className="type-sub-bold mr-2">{author}</span>
              ) : null}
              {ship ? (
                <Link href={`https://urbit.org/ids/${ship}`} passHref>
                  <a className="type-sub-bold text-wall-500 font-mono">
                    {ship}
                  </a>
                </Link>
              ) : null}
            </p>
            {content}
          </div>
        </div>
      </div>
    </Link>
  );
}
