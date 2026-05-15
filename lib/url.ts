/**
 * Reject javascript:, data:, and other non-http(s) URLs for open redirects / XSS vectors.
 */
export function assertHttpUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  const protocol = u.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  return u.toString();
}
