import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge Butler — Virtual Forge agent",
  description:
    "Chat agent MVP: tool loop over the launch board plus Virtuals-oriented builder guidance.",
};

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
