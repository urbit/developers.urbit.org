import Link from "next/link";

export default function TallCard({
  image,
  title,
  description,
  callout,
  href,
  className = "",
}) {
  return (
    <div
      className={`cursor-pointer lg:aspect-w-8 lg:aspect-h-10 xl:aspect-w-8 xl:aspect-h-8 ${className}`}
    >
      <div key={title} className={`bg-wall-100 rounded-xl min-h-0 `}>
        <Link href={href}>
          <div className="flex flex-col space-y-4 p-6 justify-center items-center h-full relative">
            <div className="rounded-lg self-center overflow-hidden border-transparent border w-full shrink-0">
              {image({ className: "w-full h-full" })}
            </div>
            <div className={`grow-1 flex flex-col h-full w-full`}>
              <h3 className="mb-2">{title}</h3>
              <p>{description}</p>
            </div>
            <div className="self-start">
              <Link href={href} passHref>
                <a
                  className="button-sm bg-green-400 text-white w-fit"
                  onClick={(e) => e.stopPropagation()}
                >
                  {callout}
                </a>
              </Link>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
