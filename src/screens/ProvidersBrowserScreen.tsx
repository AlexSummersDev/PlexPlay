import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import IndexerCard from "../components/IndexerCard";
import IndexerDetailsModal from "../components/IndexerDetailsModal";
import radarrService from "../api/radarr";
import sonarrService from "../api/sonarr";
import useSettingsStore from "../state/settingsStore";
import { ActionButton, ErrorState, LoadingSpinner } from "../components";

export default function ProvidersBrowserScreen() {
  const { downloads } = useSettingsStore();
  const [mode, setMode] = useState<"movie" | "tv">("movie");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const configured = useMemo(() => ({
    radarr: !!(downloads.radarr.serverUrl && downloads.radarr.apiKey),
    sonarr: !!(downloads.sonarr.serverUrl && downloads.sonarr.apiKey),
  }), [downloads]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      (async () => {
        const q = query.trim();
        if (q.length < 2) {
          setResults([]);
          setError(null);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          if (mode === "movie") {
            if (!configured.radarr) {
              setError("Radarr not configured. Open Download Settings.")
              setResults([]);
              return;
            }
            radarrService.setCredentials(downloads.radarr.serverUrl, downloads.radarr.apiKey);
            const list = await radarrService.searchMovie(q);
            let mapped = list.map((m: any) => (radarrService as any).mapLookupToCard(m));
            mapped = mapped.sort((a: any, b: any) => {
              const ya = a.year || 0, yb = b.year || 0;
              if (yb !== ya) return yb - ya;
              const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
              const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
              if (db !== da) return db - da;
              return String(a.title || "").localeCompare(String(b.title || ""));
            });
            setResults(mapped);
          } else {
            if (!configured.sonarr) {
              setError("Sonarr not configured. Open Download Settings.");
              setResults([]);
              return;
            }
            sonarrService.setCredentials(downloads.sonarr.serverUrl, downloads.sonarr.apiKey);
            const list = await sonarrService.searchSeries(q);
            let mapped = list.map((s: any) => (sonarrService as any).mapLookupToCard(s));
            mapped = mapped.sort((a: any, b: any) => {
              const ya = a.year || 0, yb = b.year || 0;
              if (yb !== ya) return yb - ya;
              const da = a.firstAired ? new Date(a.firstAired).getTime() : 0;
              const db = b.firstAired ? new Date(b.firstAired).getTime() : 0;
              if (db !== da) return db - da;
              return String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""));
            });
            setResults(mapped);
          }
        } catch (e) {
          setError("Indexer search failed. Please verify settings and try again.");
          setResults([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [query, mode, configured]);

  const handleOpen = (item: any) => {
    setSelected(item);
    setDetailsOpen(true);
  };

  const canAdd = useMemo(() => {
    if (mode === "movie") {
      return configured.radarr && !!downloads.radarr.qualityProfileId && !!(downloads.radarr.rootFolderPath || downloads.radarr.rootFolder);
    }
    return configured.sonarr && !!downloads.sonarr.qualityProfileId && !!(downloads.sonarr.rootFolderPath || downloads.sonarr.rootFolder);
  }, [mode, configured, downloads]);

  const handleAdd = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      if (mode === "movie") {
        const qid = downloads.radarr.qualityProfileId;
        const root = downloads.radarr.rootFolderPath || downloads.radarr.rootFolder;
        radarrService.setCredentials(downloads.radarr.serverUrl, downloads.radarr.apiKey);
        await radarrService.addMovieFromTMDB(selected.tmdbId, selected.title, selected.year || new Date().getFullYear(), qid, root, true, true);
      } else {
        const qid = downloads.sonarr.qualityProfileId;
        const root = downloads.sonarr.rootFolderPath || downloads.sonarr.rootFolder;
        sonarrService.setCredentials(downloads.sonarr.serverUrl, downloads.sonarr.apiKey);
        await sonarrService.addSeriesFromTVDB(selected.tvdbId, selected.name || selected.title, qid, root, true, true);
      }
      setDetailsOpen(false);
    } catch (e) {
      setError("Add request failed. Check defaults in Download Settings.");
    } finally {
      setLoading(false);
    }
  };

  if ((mode === "movie" && !configured.radarr) || (mode === "tv" && !configured.sonarr)) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="px-4 pt-2">
          <Text className="text-white text-2xl font-bold mb-3">Browse Indexers</Text>
        </View>
        <ErrorState fullScreen={false} message={mode === "movie" ? "Radarr not configured." : "Sonarr not configured."} onRetry={() => {}} />
        <View className="px-4 mt-2">
          <ActionButton title="Open Download Settings" icon="settings" onPress={() => {}} variant="primary" fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="pt-2">
        <Text className="text-white text-2xl font-bold mb-3 px-4">Browse Indexers</Text>
        <View className="flex-row px-4 mb-3">
          <Pressable onPress={() => setMode("movie")} className={`px-4 py-2 rounded-full mr-2 ${mode === "movie" ? "bg-blue-600" : "bg-gray-700"}`} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text className={`text-sm font-medium ${mode === "movie" ? "text-white" : "text-gray-300"}`}>Movies</Text>
          </Pressable>
          <Pressable onPress={() => setMode("tv")} className={`px-4 py-2 rounded-full ${mode === "tv" ? "bg-blue-600" : "bg-gray-700"}`} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text className={`text-sm font-medium ${mode === "tv" ? "text-white" : "text-gray-300"}`}>TV</Text>
          </Pressable>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${mode === "movie" ? "movies" : "TV shows"}...`} />
      </View>

      {loading && <LoadingSpinner fullScreen message="Searching..." />}

      {!loading && results.length === 0 && !error && (
        <View className="px-4 mt-6">
          <Text className="text-gray-400">Type at least 2 characters to search your indexers.</Text>
        </View>
      )}

      {!!error && !loading && (
        <View className="px-4 mt-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
        renderItem={({ item }) => (
          <IndexerCard
            title={item.title || item.name}
            subtitle={item.year ? String(item.year) : undefined}
            imageUrl={item.imageUrl}
            onPress={() => handleOpen(item)}
            size="medium"
            className="mb-4"
          />
        )}
      />

      <IndexerDetailsModal
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        kind={mode}
        data={selected || {}}
        onPrimary={canAdd ? handleAdd : undefined}
        primaryDisabled={!canAdd}
        primaryTitle={!canAdd ? "Configure defaults in Download Settings" : undefined}
      />
    </SafeAreaView>
  );
}
