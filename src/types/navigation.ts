export type RootTabParamList = {
  Movies: undefined;
  TVShows: undefined;
  Search: undefined;
  Settings: undefined;
};

export type MoviesStackParamList = {
  Home: undefined;
  Search: { query?: string; type?: "movie" | "tv" };
  Details: { id: number; type: "movie" | "tv" };
  PlexIntegration: undefined;
  Providers: undefined;
  PlexPlayer: { ratingKey: string; title: string; type: "movie" | "tv" };
};

export type TVShowsStackParamList = {
  Home: undefined;
  Search: { query?: string; type?: "movie" | "tv" };
  Details: { id: number; type: "movie" | "tv" };
  PlexPlayer: { ratingKey: string; title: string; type: "movie" | "tv" };
};

export type LiveTVStackParamList = {
  Channels: undefined;
  Player: { channelId: string };
};

export type SettingsStackParamList = {
  Main: undefined;
  PlexSettings: undefined;
  IPTVSettings: undefined;
  DownloadSettings: undefined;
};