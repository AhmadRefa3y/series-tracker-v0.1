// types/series.ts
export interface Series {
  adult: boolean;
  backdrop_path: string | null; // URL path to backdrop image, e.g., "/abc123.jpg"
  created_by: Creator[];
  episode_run_time: number[]; // Array of episode runtimes in minutes
  first_air_date: string; // e.g., "2011-04-17"
  genres: Genre[];
  homepage: string | null; // Official website URL
  id: number; // Unique TMDB ID
  in_production: boolean; // Whether the series is still ongoing
  languages: string[]; // e.g., ["en", "es"]
  last_air_date: string; // e.g., "2019-05-19"
  last_episode_to_air: Episode | null; // Details of the last aired episode
  name: string; // Series title, e.g., "Game of Thrones"
  next_episode_to_air: Episode | null; // Details of the next episode, if available
  networks: Network[]; // Networks airing the series
  number_of_episodes: number; // Total episodes across all seasons
  number_of_seasons: number; // Total seasons
  origin_country: string[]; // e.g., ["US"]
  original_language: string; // e.g., "en"
  original_name: string; // Original title, may differ from "name"
  overview: string; // Series description
  popularity: number; // TMDB popularity score
  poster_path: string | null; // URL path to poster image, e.g., "/xyz789.jpg"
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string; // e.g., "Ended", "Returning Series"
  tagline: string | null; // Short tagline, e.g., "Winter is Coming"
  type: string; // e.g., "Scripted"
  vote_average: number; // Average rating, e.g., 8.7
  vote_count: number; // Number of votes
}

// Nested Types
export interface Creator {
  id: number;
  credit_id: string;
  name: string;
  gender: number | null; // 0: Not specified, 1: Female, 2: Male
  profile_path: string | null; // URL path to profile image
}

export interface Genre {
  id: number;
  name: string; // e.g., "Drama", "Fantasy"
}

export interface Episode {
  id: number;
  name: string; // Episode title
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string; // e.g., "2019-05-19"
  episode_number: number;
  episode_type: string; // e.g., "standard", "finale"
  production_code: string;
  runtime: number | null; // Runtime in minutes
  season_number: number;
  show_id: number; // Matches the series ID
  still_path: string | null; // URL path to episode still image
}

export interface Network {
  id: number;
  logo_path: string | null; // URL path to network logo
  name: string; // e.g., "HBO"
  origin_country: string; // e.g., "US"
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null; // URL path to company logo
  name: string; // e.g., "HBO"
  origin_country: string; // e.g., "US"
}

export interface ProductionCountry {
  iso_3166_1: string; // e.g., "US"
  name: string; // e.g., "United States"
}

export interface Season {
  air_date: string | null; // e.g., "2011-04-17"
  episode_count: number;
  id: number;
  name: string; // e.g., "Season 1"
  overview: string;
  poster_path: string | null; // URL path to season poster
  season_number: number;
  vote_average: number; // Season-specific rating
  episodes: {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
    overview: string;
    vote_average: number;
    runtime: number;
  }[];
}

export interface SpokenLanguage {
  english_name: string; // e.g., "English"
  iso_639_1: string; // e.g., "en"
  name: string; // e.g., "English"
}
