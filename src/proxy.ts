// src/proxy.ts
import type { AxiosProxyConfig } from "axios";

export type ProxyProduct = "residential" | "datacenter" | "mobile" | "isp";

export interface ProxyCredentials {
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

  private constructor(
    product: ProxyProduct,
    credentials: ProxyCredentials,
    opts: ProxyOptions = {},
  ) {
    this.product = product;
    this.credentials = credentials;
    this.opts = opts;
  }

  // Factory methods - each requires its own credentials

  static residential(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("residential", creds, opts);
  }

  static datacenter(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("datacenter", creds, opts);
  }

  static mobile(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("mobile", creds, opts);
  }

  static isp(creds: ProxyCredentials, opts?: ProxyOptions): Proxy {
    return new Proxy("isp", creds, opts);
  }

  // Helper: create from environment variables
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

  static ispFromEnv(opts?: ProxyOptions): Proxy {
    const username = process.env.THORDATA_ISP_USERNAME;
    const password = process.env.THORDATA_ISP_PASSWORD;
    if (!username || !password) {
      throw new Error("THORDATA_ISP_USERNAME and THORDATA_ISP_PASSWORD are required");
    }
    return new Proxy("isp", { username, password }, opts);
  }

  // Chainable options
  country(code: string): Proxy {
    this.opts.country = code.toLowerCase();
    return this;
  }

  city(name: string): Proxy {
    this.opts.city = name.toLowerCase().replace(/\s+/g, "_");
    return this;
  }

  session(id: string): Proxy {
    this.opts.session = id;
    return this;
  }

  sticky(minutes: number): Proxy {
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
    return {
      host: PROXY_HOSTS[this.product],
      port: PROXY_PORTS[this.product],
      auth: {
        username: this.buildUsername(),
        password: this.credentials.password,
      },
    };
  }

  // For debugging
  toString(): string {
    return `[Proxy ${this.product} ${this.opts.country || "random"}]`;
  }
}
