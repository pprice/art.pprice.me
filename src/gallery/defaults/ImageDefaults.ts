import { ImageSource } from "@/config";

export const PLACES: ImageSource[] = [
  {
    name: "Seattle",
    source: "/images/seattle2.jpg",
  },
  {
    name: "Mt Rainier 1",
    source: "/images/mr1.jpg",
  },
  {
    name: "Mt Rainier 2",
    source: "/images/mr2.jpg",
  },
];

export const PAINTINGS: ImageSource[] = [
  {
    name: "Van Gogh 1",
    source: "/images/van-gogh1.jpg",
  },
];

export const PEOPLE: ImageSource[] = [
  {
    name: "Boris",
    source: "/images/boris2.jpg",
  },
];

export const DEFAULT_PREDEFINED_IMAGES = [...PLACES, ...PAINTINGS, ...PEOPLE];
