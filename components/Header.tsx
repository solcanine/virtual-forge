import Link from "next/link";

export function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="group inline-flex items-baseline gap-2">
        <span className="text-xl font-semibold tracking-tight text-white group-hover:text-forge-500">
          Virtual Forge
        </span>
        <span className="hidden text-sm text-zinc-500 sm:inline">
          builder discovery for Virtuals-era shipping
        </span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="rounded-full px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          Today
        </Link>
        <Link
          href="/agent"
          className="rounded-full px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          Agent
        </Link>
        <Link
          href="/submit"
          className="rounded-full bg-forge-600 px-4 py-1.5 font-medium text-white shadow-sm shadow-forge-900/40 hover:bg-forge-500"
        >
          Submit launch
        </Link>
      </nav>
    </header>
  );
}
