import { Image } from "../../types/types";

export interface Category {
  ID: number;
  name: string;
  description: string;
  image: Image;
}

export interface Brand {
  ID: number;
  name: string;
  description: string;
  image: Image;
}
