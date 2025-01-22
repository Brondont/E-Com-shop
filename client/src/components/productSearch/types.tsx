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
  selectedBrands: number[];
}
