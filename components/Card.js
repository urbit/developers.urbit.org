import Link from "next/link";
import classNames from "classnames";

export default function Card({
  href = "/",
  icon = null,
  title,
  text,
  callout = "",
  className = "",
}) {
  return callout ? (
    <div
      id={callout === "" ? "card" : ""}
      className={classNames(
        "bg-wall-100 rounded-xl p-7 items-stretch relative flex",
        { "space-x-4": icon },
        className
      )}
    >
      {icon}
      <div className="flex flex-col justify-between pr-4">
        <h3 className="font-bold">{title}</h3>
        <p>{text}</p>
        <Link href={href} passHref>
          <a className="button-sm bg-green-400 text-white w-fit mt-4">
            {callout}
          </a>
        </Link>
      </div>
    </div>
  ) : (
    <Link href={href}>
      <div
        id={callout === "" ? "card" : ""}
        className={
          "bg-wall-100 rounded-xl flex space-x-4 p-7 items-center relative cursor-pointer " +
          className
        }
      >
        {icon}
        <div className="flex flex-col pr-4">
          <p className="font-bold">{title}</p>
          <p>{text}</p>
        </div>
      </div>
    </Link>
  );
}
