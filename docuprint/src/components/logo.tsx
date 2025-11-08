export function Logo({ variant = "primary" }: { variant?: "primary" | "inverted" }) {
  const fill =
    variant === "primary" ? "fill-slate-900" : "fill-white";
  return (
    <div className="flex items-center gap-2">
      <svg
        className={`h-8 w-8 ${fill}`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M4 6c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v4H4V6Zm0 8h24v2.5c0 .8-.5 1.6-1.2 1.9l-10.8 4.8a2 2 0 0 1-1.6 0L5.2 18.4c-.7-.3-1.2-1.1-1.2-1.9V14Zm0 6.5 11.2 4.9c.5.2 1.1.2 1.6 0L28 20.5V26c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-5.5Z" />
      </svg>
      <span
        className={`text-xl font-semibold tracking-tight ${
          variant === "primary" ? "text-slate-900" : "text-white"
        }`}
      >
        DocuPrint
      </span>
    </div>
  );
}

