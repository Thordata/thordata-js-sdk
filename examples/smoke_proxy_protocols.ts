import "dotenv/config";
import { Thordata } from "../src/thordata.js";

function printProxyEndpoint(proxyUrl: string) {
  const u = new URL(proxyUrl);
  console.log("proxy_endpoint:", `${u.protocol}//${u.hostname}:${u.port}`);
  console.log("proxy_user_prefix:", decodeURIComponent(u.username).slice(0, 50));
}

async function runOne(protocol: string) {
  // IMPORTANT: set BOTH global and product-specific protocol to avoid .env overriding
  process.env.THORDATA_PROXY_PROTOCOL = protocol;
  process.env.THORDATA_RESIDENTIAL_PROXY_PROTOCOL = protocol;

  const client = new Thordata();
  const proxy = Thordata.Proxy.residentialFromEnv().country("us");

  const proxyUrl = proxy.toProxyUrl();
  console.log("====", protocol, "====");
  printProxyEndpoint(proxyUrl);

  const out = await client.request("https://ipinfo.thordata.com", { proxy });
  console.log(out);
}

async function main() {
  for (const p of ["https", "socks5h"]) {
    await runOne(p);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
