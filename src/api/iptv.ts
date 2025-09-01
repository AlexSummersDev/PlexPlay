// IPTV Service for Xtream Codes API integration

interface IPTVChannel {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_name: string;
  category_id: string;
  series_no: number | null;
  live: string;
  container_extension: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

interface IPTVCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface IPTVEPGInfo {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
}

interface XtreamUserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

class IPTVService {
  private serverUrl: string = "";
  private username: string = "";
  private password: string = "";

  setCredentials(serverUrl: string, username: string, password: string) {
    let input = serverUrl.trim();
    if (!/^https?:\/\//i.test(input)) {
      input = `http://${input}`;
    }
    try {
      const u = new URL(input);
      // Strip common Xtream suffixes from path, keep only origin
      const path = u.pathname.replace(/\/$/, "");
      const suffixes = [/\/c$/i, /\/player_api\.php$/i, /\/panel_api\.php$/i, /\/get\.php$/i];
      if (suffixes.some((re) => re.test(path))) {
        u.pathname = "/";
      }
      this.serverUrl = `${u.protocol}//${u.host}`;
    } catch {
      // Fallback: remove any path portion
      this.serverUrl = input.replace(/\/{1}.*$/, "").replace(/\/$/, "");
    }
    this.username = username.trim();
    this.password = password.trim();
  }

  private getBaseParams(): Record<string, string> {
    return {
      username: this.username,
      password: this.password,
    };
  }

  private async makeRequest<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.serverUrl || !this.username || !this.password) {
      throw new Error("IPTV credentials not configured");
    }

    const buildUrl = (base: string) => {
      const u = new URL(`${base}/player_api.php`);
      u.searchParams.append("action", action);
      const allParams = { ...this.getBaseParams(), ...params };
      Object.entries(allParams).forEach(([key, value]) => u.searchParams.append(key, value));
      return u.toString();
    };

    const primary = buildUrl(this.serverUrl);

    const fetchWithTimeout = async (resource: string, timeout = 10000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const resp = await fetch(resource, { signal: controller.signal });
        return resp;
      } finally {
        clearTimeout(id);
      }
    };

    const toFriendly = (e: any) => {
      const msg = String(e?.message || e);
      if (msg.includes("Network request failed") || msg.includes("abort") || msg.includes("Failed to fetch")) {
        return new Error("Unable to reach IPTV server. Check URL, port, and network connectivity.");
      }
      return new Error(msg);
    };

    try {
      // Build origin candidates (protocol swap + common ports if missing)
      let origins: string[] = [];
      try {
        const base = new URL(this.serverUrl + "/");
        const protos = base.protocol === "https:" ? ["https:", "http:"] : ["http:", "https:"];
        const hasPort = base.port && base.port.length > 0;
        const hostNoPort = base.hostname;
        const ports = hasPort ? [base.port] : ["8080", "80"];
        for (const p of protos) {
          if (hasPort) {
            origins.push(`${p}//${hostNoPort}:${base.port}`);
          } else {
            origins.push(`${p}//${hostNoPort}`);
            for (const port of ports) origins.push(`${p}//${hostNoPort}:${port}`);
          }
        }
      } catch {
        origins = [this.serverUrl];
      }
      origins = Array.from(new Set(origins));

      let lastErr: any = null;

      for (const origin of origins) {
        // Try player_api with action
        try {
          const u1 = new URL(`${origin}/player_api.php`);
          u1.searchParams.append("action", action);
          const allParams = { ...this.getBaseParams(), ...params };
          Object.entries(allParams).forEach(([k, v]) => u1.searchParams.append(k, v));
          const r1 = await fetchWithTimeout(u1.toString());
          if (r1.ok) {
            return (await r1.json()) as T;
          }
          lastErr = new Error(`IPTV API Error: ${r1.status} ${r1.statusText}`);
        } catch (e) {
          lastErr = e;
        }

        // Try player_api without action
        try {
          const u2 = new URL(`${origin}/player_api.php`);
          const allParams2 = { ...this.getBaseParams(), ...params };
          Object.entries(allParams2).forEach(([k, v]) => u2.searchParams.append(k, v));
          const r2 = await fetchWithTimeout(u2.toString());
          if (r2.ok) {
            const j2 = await r2.json();
            if (action === "get_user_info" && j2 && j2.user_info) {
              return j2.user_info as T;
            }
          }
        } catch (e2) {
          lastErr = e2;
        }

        // Try panel_api for user info
        if (action === "get_user_info") {
          try {
            const u3 = new URL(`${origin}/panel_api.php`);
            const allParams3 = { ...this.getBaseParams() };
            Object.entries(allParams3).forEach(([k, v]) => u3.searchParams.append(k, v));
            const r3 = await fetchWithTimeout(u3.toString());
            if (r3.ok) {
              const j3 = await r3.json();
              if (j3 && j3.user_info) {
                return j3.user_info as T;
              }
            }
          } catch (e3) {
            lastErr = e3;
          }
        }
      }

      throw lastErr || new Error("Unable to contact IPTV server");
    } catch (finalErr) {
      throw toFriendly(finalErr);
    }
  }

  // Test connection and get user info
  async testConnection(): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo();
      return userInfo.auth === 1;
    } catch (error) {
      return false;
    }
  }

  // Get user account information
  async getUserInfo(): Promise<XtreamUserInfo> {
    return this.makeRequest<XtreamUserInfo>("get_user_info");
  }

  // Get live TV categories
  async getLiveTVCategories(): Promise<IPTVCategory[]> {
    return this.makeRequest<IPTVCategory[]>("get_live_categories");
  }

  // Get live TV channels
  async getLiveTVChannels(categoryId?: string): Promise<IPTVChannel[]> {
    const params: Record<string, string> = {};
    if (categoryId) {
      params.category_id = categoryId;
    }
    return this.makeRequest<IPTVChannel[]>("get_live_streams", params);
  }

  // Get VOD categories
  async getVODCategories(): Promise<IPTVCategory[]> {
    return this.makeRequest<IPTVCategory[]>("get_vod_categories");
  }

  // Get VOD streams (movies)
  async getVODStreams(categoryId?: string): Promise<IPTVChannel[]> {
    const params: Record<string, string> = {};
    if (categoryId) {
      params.category_id = categoryId;
    }
    return this.makeRequest<IPTVChannel[]>("get_vod_streams", params);
  }

  // Simple match by title and optional year
  async findVodMatchByTitle(title: string, year?: number): Promise<IPTVChannel | null> {
    try {
      const vod = await this.getVODStreams();
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
      const target = norm(title + (year ? year.toString() : ""));
      const found = vod.find(v => norm(v.name).includes(norm(title)) || norm(v.name).includes(target));
      return found || null;
    } catch {
      return null;
    }
  }
 
  // Get series categories
  async getSeriesCategories(): Promise<IPTVCategory[]> {
    return this.makeRequest<IPTVCategory[]>("get_series_categories");
  }

  // Get series
  async getSeries(categoryId?: string): Promise<IPTVChannel[]> {
    const params: Record<string, string> = {};
    if (categoryId) {
      params.category_id = categoryId;
    }
    return this.makeRequest<IPTVChannel[]>("get_series", params);
  }

  // Get EPG for a specific channel
  async getEPG(streamId: number): Promise<IPTVEPGInfo[]> {
    return this.makeRequest<IPTVEPGInfo[]>("get_simple_data_table", {
      stream_id: streamId.toString(),
    });
  }

  // Get stream URL for live TV
  getLiveStreamUrl(streamId: number, extension: string = "m3u8"): string {
    if (!this.serverUrl || !this.username || !this.password) {
      throw new Error("IPTV credentials not configured");
    }
    return `${this.serverUrl}/live/${this.username}/${this.password}/${streamId}.${extension}`;
  }

  // Get stream URL for VOD
  getVODStreamUrl(streamId: number, extension: string = "mp4"): string {
    if (!this.serverUrl || !this.username || !this.password) {
      throw new Error("IPTV credentials not configured");
    }
    return `${this.serverUrl}/movie/${this.username}/${this.password}/${streamId}.${extension}`;
  }

  // Get stream URL for series episode
  getSeriesStreamUrl(streamId: number, extension: string = "mp4"): string {
    if (!this.serverUrl || !this.username || !this.password) {
      throw new Error("IPTV credentials not configured");
    }
    return `${this.serverUrl}/series/${this.username}/${this.password}/${streamId}.${extension}`;
  }

  // Mock data for development
  getMockChannels(): IPTVChannel[] {
    return [
      {
        num: 1,
        name: "BBC One HD",
        stream_type: "live",
        stream_id: 1001,
        stream_icon: "https://example.com/bbc-one.png",
        epg_channel_id: "bbc-one-hd",
        added: "2023-01-01 00:00:00",
        category_name: "UK Channels",
        category_id: "1",
        series_no: null,
        live: "1",
        container_extension: "m3u8",
        custom_sid: "",
        tv_archive: 1,
        direct_source: "",
        tv_archive_duration: 7,
      },
      {
        num: 2,
        name: "CNN International",
        stream_type: "live",
        stream_id: 1002,
        stream_icon: "https://example.com/cnn.png",
        epg_channel_id: "cnn-international",
        added: "2023-01-01 00:00:00",
        category_name: "News",
        category_id: "2",
        series_no: null,
        live: "1",
        container_extension: "m3u8",
        custom_sid: "",
        tv_archive: 0,
        direct_source: "",
        tv_archive_duration: 0,
      },
    ];
  }

  getMockCategories(): IPTVCategory[] {
    return [
      {
        category_id: "1",
        category_name: "UK Channels",
        parent_id: 0,
      },
      {
        category_id: "2",
        category_name: "News",
        parent_id: 0,
      },
      {
        category_id: "3",
        category_name: "Sports",
        parent_id: 0,
      },
    ];
  }
}

// Create and export a singleton instance
const iptvService = new IPTVService();
export default iptvService;