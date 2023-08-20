import Link from "next/link";
import classNames from "classnames";

export default function Card({
  href = "/",
  icon = null,
  title,
  text,
  callout = "",
  className = "",
  disableArrow = false,
}) {
  return callout ? (
    <div
      id={callout === "" && !disableArrow ? "card" : ""}
      className={classNames(
        "bg-wall-100 rounded-xl p-7 items-stretch relative flex",
        { "space-x-4": icon },
        className
      )}
    >
      {icon}
      <div className="flex flex-col space-y-4 justify-between pr-4">
        <h3 className="font-bold">{title}</h3>
        <p>{text}</p>
        <Link href={href} passHref>
          <a className="button-sm bg-green-400 font-medium text-white text-sm w-fit">{callout}</a>
        </Link>
      </div>
    </div>
  ) : (
    <Link href={href}>
      <div
        id={callout === "" && !disableArrow ? "card" : ""}
        className={
          "bg-wall-100 rounded-xl flex space-x-4 p-7 items-center relative cursor-pointer " +
          className
        }
      >
        {icon}
        <div className="flex flex-col pr-4 basis-2/3">
          <p className="font-bold">{title}</p>
          <p className="text-sm">{text}</p>
        </div>
      </div>
    </Link>
  );
}
