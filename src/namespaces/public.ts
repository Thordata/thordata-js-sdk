import type { ThordataClient } from "../client.js";
import type { ProxyServer, ProxyTypeParam, ProxyUserList, UsageStatistics } from "../models.js";

export class PublicNamespace {
  constructor(private client: ThordataClient) {}

  // =========================================================================
  // Account & Usage Methods
  // =========================================================================

  /**
   * Get account usage statistics for a date range.
   */
  usageStatistics(fromDate: string, toDate: string): Promise<UsageStatistics> {
    return this.client.getUsageStatistics(fromDate, toDate);
  }

  /**
   * Get current traffic balance.
   */
  trafficBalance(): Promise<number> {
    return this.client.getTrafficBalance();
  }

  /**
   * Get current wallet balance.
   */
  walletBalance(): Promise<number> {
    return this.client.getWalletBalance();
  }

  // =========================================================================
  // Whitelist IP Management
  // =========================================================================

  whitelist = {
    /**
     * Add an IP to the whitelist.
     */
    addIp: (ip: string, status = true, proxyType: ProxyTypeParam = "residential"): Promise<any> =>
      this.client.addWhitelistIp(ip, status, proxyType),

    /**
     * Delete an IP from the whitelist.
     */
    deleteIp: (ip: string, proxyType: ProxyTypeParam = "residential"): Promise<any> =>
      this.client.deleteWhitelistIp(ip, proxyType),

    /**
     * List all whitelisted IPs.
     */
    list: (proxyType: ProxyTypeParam = "residential"): Promise<string[]> =>
      this.client.listWhitelistIps(proxyType),
  };

  // =========================================================================
  // Proxy Users Management
  // =========================================================================

  proxyUsers = {
    /**
     * List all proxy users.
     */
    list: (proxyType: ProxyTypeParam = "residential"): Promise<ProxyUserList> =>
      this.client.listProxyUsers(proxyType),

    /**
     * Create a new proxy user.
     */
    create: (
      username: string,
      password: string,
      trafficLimit = 0,
      status = true,
      proxyType: ProxyTypeParam = "residential",
    ): Promise<any> =>
      this.client.createProxyUser(username, password, trafficLimit, status, proxyType),

    /**
     * Update an existing proxy user.
     */
    update: (
      username: string,
      password: string,
      trafficLimit?: number,
      status?: boolean,
      proxyType: ProxyTypeParam = "residential",
      newUsername?: string,
    ): Promise<any> =>
      this.client.updateProxyUser(username, password, trafficLimit, status, proxyType, newUsername),

    /**
     * Delete a proxy user.
     */
    delete: (username: string, proxyType: ProxyTypeParam = "residential"): Promise<any> =>
      this.client.deleteProxyUser(username, proxyType),

    /**
     * Get usage statistics for a specific user.
     */
    usage: (
      username: string,
      startDate: string,
      endDate: string,
      proxyType: ProxyTypeParam = "residential",
    ): Promise<Array<Record<string, unknown>>> =>
      this.client.getProxyUserUsage(username, startDate, endDate, proxyType),

    /**
     * Get hourly usage statistics for a specific user.
     */
    usageHour: (
      username: string,
      fromDate: string,
      toDate: string,
      proxyType: ProxyTypeParam = "residential",
    ): Promise<Array<Record<string, unknown>>> =>
      this.client.getProxyUserUsageHour(username, fromDate, toDate, proxyType),
  };

  // =========================================================================
  // Proxy Servers Management (ISP & Datacenter)
  // =========================================================================

  proxy = {
    /**
     * List available proxy servers.
     */
    listServers: (proxyType: 1 | 2): Promise<ProxyServer[]> =>
      this.client.listProxyServers(proxyType),

    /**
     * Get expiration time for proxy IPs.
     */
    expiration: (ips: string | string[], proxyType: 1 | 2): Promise<Record<string, unknown>> =>
      this.client.getProxyExpiration(ips, proxyType),
  };
}
