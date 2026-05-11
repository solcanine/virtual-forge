"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitLaunchAction, type SubmitState } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-forge-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-forge-900/30 hover:bg-forge-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Publishing…" : "Publish launch"}
    </button>
  );
}

const categories = [
  { value: "agent", label: "Agent" },
  { value: "sdk", label: "SDK / library" },
  { value: "infra", label: "Infra / hosting" },
  { value: "template", label: "Starter template" },
  { value: "tooling", label: "Tooling / DX" },
] as const;

export function SubmitForm() {
  const [state, action] = useActionState(submitLaunchAction, null as SubmitState);

  return (
    <form action={action} className="mx-auto max-w-xl space-y-5">
      {state?.error ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="title">
          Name
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/40 placeholder:text-zinc-600 focus:border-forge-600 focus:ring-2"
          placeholder="ACP Local Sandbox"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          required
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/40 placeholder:text-zinc-600 focus:border-forge-600 focus:ring-2"
          placeholder="One crisp line — what problem does it remove?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="url">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/40 placeholder:text-zinc-600 focus:border-forge-600 focus:ring-2"
          placeholder="https://"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-forge-600 focus:ring-2 focus:ring-forge-500/40"
          defaultValue="tooling"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="builder">
          Builder / team
        </label>
        <input
          id="builder"
          name="builder"
          required
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/40 placeholder:text-zinc-600 focus:border-forge-600 focus:ring-2"
          placeholder="How should the community credit you?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-forge-500/40 placeholder:text-zinc-600 focus:border-forge-600 focus:ring-2"
          placeholder="What ships today, who it is for, and how it plugs into agents or commerce flows."
        />
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
