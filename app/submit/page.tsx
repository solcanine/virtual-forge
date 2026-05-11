import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Submit a launch
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          Add your project to the public board. Honest URLs and clear taglines
          help other builders evaluate what to try next.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
