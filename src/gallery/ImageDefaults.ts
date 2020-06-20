import { ImageSource } from "@/config";

export const PLACES: ImageSource[] = [
  {
    name: "Seattle",
    source: "/images/seattle2.jpg",
  },
];

export const PEOPLE: ImageSource[] = [
  {
    name: "Boris",
    source: "/images/boris2.jpg",
  },
];

export const DEFAULT_PREDEFINED_IMAGES = [...PEOPLE, ...PLACES];
