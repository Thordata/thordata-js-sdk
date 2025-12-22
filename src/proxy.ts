// src/proxy.ts
import type { AxiosProxyConfig } from "axios";

export type ProxyProduct = "residential" | "datacenter" | "mobile" | "isp";

export interface ProxyCredentials {
  username: string;
  password: string;
}

export interface StaticProxyConfig {
  host: string;
  username: string;
  password: string;
}

export interface ProxyOptions {
  country?: string;
  region?: string;
  city?: string;
  asn?: string;
  session?: string;
  stickyMinutes?: number;
}

const PROXY_PORTS: Record<ProxyProduct, number> = {
  residential: 9999,
  datacenter: 7777,
  mobile: 5555,
  isp: 6666,
};

const PROXY_HOSTS: Record<ProxyProduct, string> = {
  residential: "t.pr.thordata.net",
  datacenter: "dc.pr.thordata.net",
  mobile: "m.pr.thordata.net",
  isp: "isp.pr.thordata.net",
};

export class Proxy {
  private product: ProxyProduct;
  private credentials: ProxyCredentials;
  private opts: ProxyOptions;
  private staticConfig?: StaticProxyConfig;

  private constructor(
    product: ProxyProduct,
    credentials: ProxyCredentials,
    opts: ProxyOptions = {},
    staticConfig?: StaticProxyConfig,
  ) {
    this.product = product;
    this.credentials = credentials;
    this.opts = opts;
    this.staticConfig = staticConfig;
  }

  // Factory methods for dynamic proxies

  static residential(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("residential", creds, opts);
  }

  static datacenter(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("datacenter", creds, opts);
  }

  static mobile(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("mobile", creds, opts);
  }

  // Factory method for static ISP proxy (direct IP connection, port always 6666)
  static isp(config: StaticProxyConfig): Proxy {
    return new Proxy("isp", { username: config.username, password: config.password }, {}, config);
  }

  // FromEnv helpers

  static residentialFromEnv(opts?: ProxyOptions): Proxy {
    const username = process.env.THORDATA_RESIDENTIAL_USERNAME;
    const password = process.env.THORDATA_RESIDENTIAL_PASSWORD;
    if (!username || !password) {
      throw new Error(
        "THORDATA_RESIDENTIAL_USERNAME and THORDATA_RESIDENTIAL_PASSWORD are required",
      );
    }
    return new Proxy("residential", { username, password }, opts);
  }

  static datacenterFromEnv(opts?: ProxyOptions): Proxy {
    const username = process.env.THORDATA_DATACENTER_USERNAME;
    const password = process.env.THORDATA_DATACENTER_PASSWORD;
    if (!username || !password) {
      throw new Error("THORDATA_DATACENTER_USERNAME and THORDATA_DATACENTER_PASSWORD are required");
    }
    return new Proxy("datacenter", { username, password }, opts);
  }

  static mobileFromEnv(opts?: ProxyOptions): Proxy {
    const username = process.env.THORDATA_MOBILE_USERNAME;
    const password = process.env.THORDATA_MOBILE_PASSWORD;
    if (!username || !password) {
      throw new Error("THORDATA_MOBILE_USERNAME and THORDATA_MOBILE_PASSWORD are required");
    }
    return new Proxy("mobile", { username, password }, opts);
  }

  static ispFromEnv(): Proxy {
    const host = process.env.THORDATA_ISP_HOST;
    const username = process.env.THORDATA_ISP_USERNAME;
    const password = process.env.THORDATA_ISP_PASSWORD;

    if (!host || !username || !password) {
      throw new Error(
        "THORDATA_ISP_HOST, THORDATA_ISP_USERNAME, and THORDATA_ISP_PASSWORD are required",
      );
    }

    return Proxy.isp({ host, username, password });
  }

  // Chainable options (only for dynamic proxies)

  country(code: string): Proxy {
    if (this.staticConfig) {
      throw new Error("country() is not supported for static ISP proxies");
    }
    this.opts.country = code.toLowerCase();
    return this;
  }

  city(name: string): Proxy {
    if (this.staticConfig) {
      throw new Error("city() is not supported for static ISP proxies");
    }
    this.opts.city = name.toLowerCase().replace(/\s+/g, "_");
    return this;
  }

  session(id: string): Proxy {
    if (this.staticConfig) {
      throw new Error("session() is not supported for static ISP proxies");
    }
    this.opts.session = id;
    return this;
  }

  sticky(minutes: number): Proxy {
    if (this.staticConfig) {
      throw new Error("sticky() is not supported for static ISP proxies");
    }
    if (minutes < 1 || minutes > 90) {
      throw new Error("sticky minutes must be between 1 and 90");
    }
    if (!this.opts.session) {
      throw new Error("session() must be called before sticky()");
    }
    this.opts.stickyMinutes = minutes;
    return this;
  }

  // Build the full username with geo/session parameters
  private buildUsername(): string {
    if (this.staticConfig) {
      return this.credentials.username;
    }

    const parts: string[] = [`td-customer-${this.credentials.username}`];

    if (this.opts.country) {
      parts.push(`country-${this.opts.country}`);
    }
    if (this.opts.city) {
      parts.push(`city-${this.opts.city}`);
    }
    if (this.opts.session) {
      parts.push(`sessid-${this.opts.session}`);
    }
    if (this.opts.stickyMinutes) {
      parts.push(`sesstime-${this.opts.stickyMinutes}`);
    }

    return parts.join("-");
  }

  // Generate axios proxy config
  toAxiosConfig(): AxiosProxyConfig {
    if (this.staticConfig) {
      return {
        host: this.staticConfig.host,
        port: PROXY_PORTS.isp, // Always 6666
        auth: {
          username: this.credentials.username,
          password: this.credentials.password,
        },
      };
    }

    return {
      host: PROXY_HOSTS[this.product],
      port: PROXY_PORTS[this.product],
      auth: {
        username: this.buildUsername(),
        password: this.credentials.password,
      },
    };
  }

  toString(): string {
    if (this.staticConfig) {
      return `[Proxy isp static ${this.staticConfig.host}:${PROXY_PORTS.isp}]`;
    }
    return `[Proxy ${this.product} ${this.opts.country || "random"}]`;
  }
}
