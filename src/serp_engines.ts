// src/serp_engines.ts
import { ThordataClient } from "./client.js";
import { SerpOptions } from "./models.js";

/**
 * Base class for namespaced engines
 */
class EngineBase {
  protected client: ThordataClient;

  constructor(client: ThordataClient) {
    this.client = client;
  }
}

/**
 * Google Namespace: client.serp.google.*
 */
export class GoogleEngine extends EngineBase {
  /**
   * Standard Google Search
   */
  async search(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "google", ...options });
  }

  /**
   * Google News
   */
  async news(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "google_news", ...options });
  }

  /**
   * Google Jobs
   */
  async jobs(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "google_jobs", ...options });
  }

  /**
   * Google Shopping
   * @param productId Optional product ID for product-specific search
   */
  async shopping(
    query: string,
    productId?: string,
    options: Omit<SerpOptions, "query" | "engine"> = {},
  ) {
    const extra: Record<string, unknown> = {};
    if (productId) {
      extra.product_id = productId;
      return this.client.serpSearch({ query, engine: "google_product", ...extra, ...options });
    }
    return this.client.serpSearch({ query, engine: "google_shopping", ...extra, ...options });
  }

  /**
   * Google Maps
   * @param coordinates Latitude,Longitude,Zoom (e.g. "@40.745,-74.008,14z")
   */
  async maps(
    query: string,
    coordinates?: string,
    options: Omit<SerpOptions, "query" | "engine"> = {},
  ) {
    const extra: Record<string, unknown> = {};
    if (coordinates) {
      extra.ll = coordinates;
    }
    return this.client.serpSearch({ query, engine: "google_maps", ...extra, ...options });
  }

  /**
   * Google Flights
   */
  async flights(
    params: {
      query?: string;
      departureId?: string;
      arrivalId?: string;
      outboundDate?: string;
      returnDate?: string;
    },
    options: Omit<SerpOptions, "query" | "engine"> = {},
  ) {
    const extra: Record<string, unknown> = {};
    if (params.departureId) extra.departure_id = params.departureId;
    if (params.arrivalId) extra.arrival_id = params.arrivalId;
    if (params.outboundDate) extra.outbound_date = params.outboundDate;
    if (params.returnDate) extra.return_date = params.returnDate;

    // Flights query is sometimes optional if parameters are strong
    return this.client.serpSearch({
      query: params.query || "flights",
      engine: "google_flights",
      ...extra,
      ...options,
    });
  }

  /**
   * Google Patents
   */
  async patents(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "google_patents", ...options });
  }

  /**
   * Google Trends
   */
  async trends(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "google_trends", ...options });
  }
}

/**
 * Bing Namespace: client.serp.bing.*
 */
export class BingEngine extends EngineBase {
  async search(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "bing", ...options });
  }

  async news(query: string, options: Omit<SerpOptions, "query" | "engine"> = {}) {
    return this.client.serpSearch({ query, engine: "bing_news", ...options });
  }
}

/**
 * Main SERP Namespace attached to client
 */
export class SerpNamespace {
  public google: GoogleEngine;
  public bing: BingEngine;

  constructor(client: ThordataClient) {
    this.google = new GoogleEngine(client);
    this.bing = new BingEngine(client);
  }
}
