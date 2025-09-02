import { Genre } from "../genresData";
import FilterControlsClient from "./FilterControlsClient";

interface FilterControlsProps {
  genres: Genre[];
}

export default function FilterControls({
  genres,
}: FilterControlsProps) {
  return <FilterControlsClient genres={genres} />;
}