// NZBGet API Service for download management

interface NZBGetStatus {
  RemainingSizeLo: number;
  RemainingSizeHi: number;
  RemainingSizeMB: number;
  ForcedSizeLo: number;
  ForcedSizeHi: number;
  ForcedSizeMB: number;
  DownloadedSizeLo: number;
  DownloadedSizeHi: number;
  DownloadedSizeMB: number;
  MonthSizeLo: number;
  MonthSizeHi: number;
  MonthSizeMB: number;
  DaySizeLo: number;
  DaySizeHi: number;
  DaySizeMB: number;
  ArticleCacheLo: number;
  ArticleCacheHi: number;
  ArticleCacheMB: number;
  DownloadRate: number;
  AverageDownloadRate: number;
  DownloadLimit: number;
  ThreadCount: number;
  ParJobCount: number;
  PostJobCount: number;
  UrlCount: number;
  UpTimeSec: number;
  DownloadTimeSec: number;
  ServerPaused: boolean;
  DownloadPaused: boolean;
  Download2Paused: boolean;
  ServerStandBy: boolean;
  PostPaused: boolean;
  ScanPaused: boolean;
  QuotaReached: boolean;
  FreeDiskSpaceLo: number;
  FreeDiskSpaceHi: number;
  FreeDiskSpaceMB: number;
  ServerTime: number;
  ResumeTime: number;
  FeedActive: boolean;
  QueueScriptCount: number;
  NewsServers: NZBGetNewsServer[];
}

interface NZBGetNewsServer {
  ID: number;
  Active: boolean;
}

interface NZBGetQueueItem {
  NZBID: number;
  NZBName: string;
  NZBNicename: string;
  Kind: string;
  URL: string;
  NZBFilename: string;
  DestDir: string;
  FinalDir: string;
  Category: string;
  ParStatus: string;
  ExParStatus: string;
  UnpackStatus: string;
  MoveStatus: string;
  ScriptStatus: string;
  DeleteStatus: string;
  MarkStatus: string;
  UrlStatus: string;
  FileSizeLo: number;
  FileSizeHi: number;
  FileSizeMB: number;
  FileCount: number;
  MinPostTime: number;
  MaxPostTime: number;
  StageProgress: number;
  StageTimeSec: number;
  TotalTimeSec: number;
  Status: string;
  Priority: number;
  ActiveDownloads: number;
  Paused: boolean;
  PostTotalTimeSec: number;
  PostStageProgress: number;
  PostStageTimeSec: number;
}

interface NZBGetHistoryItem {
  NZBID: number;
  Name: string;
  RemainingFileCount: number;
  RetryData: boolean;
  HistoryTime: number;
  Status: string;
  Log: any[];
  NZBName: string;
  NZBNicename: string;
  Kind: string;
  URL: string;
  NZBFilename: string;
  DestDir: string;
  FinalDir: string;
  Category: string;
  ParStatus: string;
  ExParStatus: string;
  UnpackStatus: string;
  MoveStatus: string;
  ScriptStatus: string;
  DeleteStatus: string;
  MarkStatus: string;
  UrlStatus: string;
  FileSizeLo: number;
  FileSizeHi: number;
  FileSizeMB: number;
  FileCount: number;
  MinPostTime: number;
  MaxPostTime: number;
  MaxPriority: number;
  GroupCount: number;
  GroupFirst: number;
  GroupLast: number;
  DeletedArticleCount: number;
  DownloadedSizeLo: number;
  DownloadedSizeHi: number;
  DownloadedSizeMB: number;
  DownloadTimeSec: number;
  PostTotalTimeSec: number;
  ParTimeSec: number;
  RepairTimeSec: number;
  UnpackTimeSec: number;
  MessageCount: number;
  ExtraParBlocks: number;
  Parameters: any[];
  ScriptStatuses: any[];
  ServerStats: any[];
  PostInfoText: string;
  PostStageProgress: number;
  PostStageTimeSec: number;
}

// Interface for future use
// interface NZBGetVersion {
//   version: string;
// }

class NZBGetService {
  private baseUrl: string = "";
  private username: string = "";
  private password: string = "";

  setCredentials(serverUrl: string, username: string = "", password: string = "") {
    this.baseUrl = serverUrl.replace(/\/$/, ""); // Remove trailing slash
    this.username = username;
    this.password = password;
  }

  private async makeRequest<T>(method: string, params: any[] = []): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("NZBGet server URL not configured");
    }

    const url = `${this.baseUrl}/jsonrpc`;
    
    const requestBody = {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add basic auth if credentials are provided
      if (this.username && this.password) {
        const credentials = btoa(`${this.username}:${this.password}`);
        headers.Authorization = `Basic ${credentials}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`NZBGet API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`NZBGet RPC Error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error("NZBGet API request failed:", error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getVersion();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get version
  async getVersion(): Promise<string> {
    const result = await this.makeRequest<string>("version");
    return result;
  }

  // Get status
  async getStatus(): Promise<NZBGetStatus> {
    return this.makeRequest<NZBGetStatus>("status");
  }

  // Get queue
  async getQueue(): Promise<NZBGetQueueItem[]> {
    return this.makeRequest<NZBGetQueueItem[]>("listgroups");
  }

  // Get history
  async getHistory(): Promise<NZBGetHistoryItem[]> {
    return this.makeRequest<NZBGetHistoryItem[]>("history");
  }

  // Add NZB from URL
  async addNZBFromUrl(url: string, nzbName: string, category: string = "", priority: number = 0): Promise<number> {
    return this.makeRequest<number>("append", [nzbName, url, category, priority, false, false, "", 0, "SCORE"]);
  }

  // Add NZB from file content
  async addNZBFromContent(nzbContent: string, nzbName: string, category: string = "", priority: number = 0): Promise<number> {
    const base64Content = btoa(nzbContent);
    return this.makeRequest<number>("append", [nzbName, base64Content, category, priority, false, false, "", 0, "SCORE"]);
  }

  // Pause download
  async pauseDownload(): Promise<boolean> {
    return this.makeRequest<boolean>("pausedownload");
  }

  // Resume download
  async resumeDownload(): Promise<boolean> {
    return this.makeRequest<boolean>("resumedownload");
  }

  // Pause specific item
  async pauseItem(nzbId: number): Promise<boolean> {
    return this.makeRequest<boolean>("editqueue", ["GroupPause", "", [nzbId]]);
  }

  // Resume specific item
  async resumeItem(nzbId: number): Promise<boolean> {
    return this.makeRequest<boolean>("editqueue", ["GroupResume", "", [nzbId]]);
  }

  // Delete item from queue
  async deleteItem(nzbId: number): Promise<boolean> {
    return this.makeRequest<boolean>("editqueue", ["GroupDelete", "", [nzbId]]);
  }

  // Set item priority
  async setItemPriority(nzbId: number, priority: number): Promise<boolean> {
    return this.makeRequest<boolean>("editqueue", ["GroupSetPriority", priority.toString(), [nzbId]]);
  }

  // Get download rate in bytes per second
  formatDownloadRate(bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return "0 B/s";
    
    const units = ["B/s", "KB/s", "MB/s", "GB/s"];
    let size = bytesPerSecond;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Format file size
  formatFileSize(sizeInMB: number): string {
    if (sizeInMB === 0) return "0 MB";
    
    const units = ["MB", "GB", "TB"];
    let size = sizeInMB;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Mock data for development
  getMockStatus(): NZBGetStatus {
    return {
      RemainingSizeLo: 0,
      RemainingSizeHi: 0,
      RemainingSizeMB: 1024,
      ForcedSizeLo: 0,
      ForcedSizeHi: 0,
      ForcedSizeMB: 0,
      DownloadedSizeLo: 0,
      DownloadedSizeHi: 0,
      DownloadedSizeMB: 512,
      MonthSizeLo: 0,
      MonthSizeHi: 0,
      MonthSizeMB: 10240,
      DaySizeLo: 0,
      DaySizeHi: 0,
      DaySizeMB: 1024,
      ArticleCacheLo: 0,
      ArticleCacheHi: 0,
      ArticleCacheMB: 64,
      DownloadRate: 5242880, // 5 MB/s
      AverageDownloadRate: 4194304, // 4 MB/s
      DownloadLimit: 0,
      ThreadCount: 4,
      ParJobCount: 0,
      PostJobCount: 1,
      UrlCount: 0,
      UpTimeSec: 86400,
      DownloadTimeSec: 3600,
      ServerPaused: false,
      DownloadPaused: false,
      Download2Paused: false,
      ServerStandBy: false,
      PostPaused: false,
      ScanPaused: false,
      QuotaReached: false,
      FreeDiskSpaceLo: 0,
      FreeDiskSpaceHi: 0,
      FreeDiskSpaceMB: 500000,
      ServerTime: Date.now() / 1000,
      ResumeTime: 0,
      FeedActive: false,
      QueueScriptCount: 0,
      NewsServers: [
        { ID: 1, Active: true },
        { ID: 2, Active: true },
      ],
    };
  }

  getMockQueue(): NZBGetQueueItem[] {
    return [
      {
        NZBID: 1,
        NZBName: "The.Dark.Knight.2008.1080p.BluRay.x264",
        NZBNicename: "The Dark Knight (2008)",
        Kind: "NZB",
        URL: "",
        NZBFilename: "the-dark-knight.nzb",
        DestDir: "/downloads/movies",
        FinalDir: "/downloads/movies/The Dark Knight (2008)",
        Category: "movies",
        ParStatus: "NONE",
        ExParStatus: "NONE",
        UnpackStatus: "NONE",
        MoveStatus: "NONE",
        ScriptStatus: "NONE",
        DeleteStatus: "NONE",
        MarkStatus: "NONE",
        UrlStatus: "NONE",
        FileSizeLo: 0,
        FileSizeHi: 0,
        FileSizeMB: 8192,
        FileCount: 85,
        MinPostTime: 1234567890,
        MaxPostTime: 1234567890,
        StageProgress: 2500,
        StageTimeSec: 1800,
        TotalTimeSec: 1800,
        Status: "DOWNLOADING",
        Priority: 0,
        ActiveDownloads: 4,
        Paused: false,
        PostTotalTimeSec: 0,
        PostStageProgress: 0,
        PostStageTimeSec: 0,
      },
    ];
  }
}

// Create and export a singleton instance
const nzbgetService = new NZBGetService();
export default nzbgetService;