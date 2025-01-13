import { Manufacturer, Category } from "../admin/products/BaseProductCreation";

// src/components/ProductSearch/types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface Filters {
  searchQuery: string;
  selectedCategories: number[];
  selectedManufacturers: number[];
}
