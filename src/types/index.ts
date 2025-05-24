export interface TrendingSeriesT {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  number_of_seasons: number;
  vote_average: number;
  backdrop_path: string;
  number_of_episodes: number;
}

export interface RawEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  runtime: number | null; // TMDb provides runtime in minutes, nullable
  still_path: string | null; // TMDb image path for episode thumbnail
  air_date: string | null;
}

export interface RawSeason {
  id: number;
  season_number: number;
  name: string; // e.g., "Season 1"
  air_date: string | null; // e.g., "2016-07-15"
  episodes: RawEpisode[];
}

export interface RawSeries {
  id: number;
  name: string;
  overview: string;
  first_air_date: string; // e.g., "2016-07-15"
  last_air_date: string | null; // e.g., "2022-07-01"
  vote_average: number; // e.g., 8.7
  genres: { id: number; name: string }[];
  created_by: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string }[];
  };
  poster_path: string | null; // TMDb image path for series poster
  seasons: { season_number: number }[]; // Basic season info
  number_of_episodes: number;
  still_path: string;
  backdrop_path: string;
}

export interface Episode {
  id: number;
  number: number;
  season: number;
  title: string;
  duration: string; // e.g., "47m"
  imageUrl: string; // URL or path to episode thumbnail
  air_date: string | null;
}

export interface DetailedSeason {
  id: number;
  number: number;
  title: string; // e.g., "Season 1"
  year: number;
  episodes: Episode[];
}
export interface SeriesWithAllData {
  id: number;
  title: string;
  description: string;
  year: string; // e.g., "2016-Present"
  rating: number; // e.g., 8.7
  genres: string[]; // e.g., ["Drama", "Fantasy", "Horror"]
  creator: string;
  starring: string; // Comma-separated string of actors
  imageUrl: string; // URL or path to series poster
  number_of_episodes: number;
  seasons: DetailedSeason[];
  still_path: string;
  backdrop_path: string;
}

export interface WatchListSeries {
  seriesID: number;
  currentEpisodeNumber: number;
  episodeSeason: number;
  seriesPoster: string;
  seriesTitle: string;
  watchedEpisodes: {
    episodeNumber: number;
    seasonNumber: number;
  }[];
  title: string;
  posterPath: string;
  lastWatchedEpisode: Date;
}
