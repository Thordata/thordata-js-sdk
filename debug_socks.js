import { SocksProxyAgent } from "socks-proxy-agent";
import https from "https";

// 填入你的真实代理
const proxy = "socks5h://user:pass@vpn...:9999";
const agent = new SocksProxyAgent(proxy, { timeout: 10000 });

https
  .get("https://ipinfo.thordata.com", { agent }, (res) => {
    console.log("Status:", res.statusCode);
    res.pipe(process.stdout);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });
