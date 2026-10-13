// Keep browser callback URLs identical locally and in an isolated Compose stack.
// The real proxy and OIDC stand-in live in sibling containers, without host ports.
import { connect, createServer } from "node:net";
import { oidcPort, proxyPort } from "../support/config.ts";

for (const [port, host, target] of [
  [oidcPort, "oidc", 8080],
  [proxyPort, "mock-oauth2-proxy", 4180],
] as const) {
  createServer((incoming) => {
    const upstream = connect(target, host);
    incoming.on("error", () => upstream.destroy());
    upstream.on("error", () => incoming.destroy());
    incoming.on("close", () => upstream.destroy());
    upstream.on("close", () => incoming.destroy());
    incoming.pipe(upstream).pipe(incoming);
  }).listen(port, "0.0.0.0");
}
