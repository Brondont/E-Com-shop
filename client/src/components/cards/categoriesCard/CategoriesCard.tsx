// CategoryCard.tsx
import React from "react";
import BaseCard from "../baseCard/BaseCard";
import { Category } from "../../admin/productGroup/GroupCategory";

interface CategoryCardProps {
  category?: Category;
  onClick?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
}) => (
  <BaseCard
    loading={!category}
    data={category}
    onClick={() => category && onClick?.(category)}
  />
);

export default CategoryCard;
