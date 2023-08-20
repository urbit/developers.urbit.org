import Link from "next/link";

export default function TallCard({
  image,
  title,
  description,
  callout,
  href,
  cohort,
  className = ""
}) {
  return <div className={"h-full flex flex-col min-h-0 " + className}>
    <Link href={href}>
      <div key={title} className="cursor-pointer bg-wall-100 rounded-xl h-full">
          <div className="flex flex-col space-y-4 p-6 justify-between items-start lg:items-center relative">
            <div className="rounded-lg w-full">
              <img src={image} className="w-full h-full"></img>
            </div>
            <div className="flex flex-col space-y-2">
              <h3>{title}</h3>
              {cohort &&
                <p className="text-sm"><span className="font-semibold">Next Session:</span> {cohort}</p>
              }

              <p className="text-sm">{description}</p>

            </div>
          </div>
      </div>
    </Link>
  </div>
}
