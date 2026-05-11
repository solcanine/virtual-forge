import { cookies } from "next/headers";

const COOKIE = "vf_voter";

export async function getVoterId(): Promise<string> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) {
    throw new Error("Missing voter cookie; middleware should assign vf_voter.");
  }
  return id;
}
