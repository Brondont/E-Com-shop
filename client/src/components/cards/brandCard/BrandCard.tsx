// brandCard.tsx
import React from "react";
import BaseCard from "../baseCard/BaseCard";
import { Brand } from "../../admin/products/BaseProductCreation";

interface BrandCardProps {
  brand?: Brand;
  onClick?: (brand: Brand) => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => (
  <BaseCard
    loading={!brand}
    data={brand}
    onClick={() => brand && onClick?.(brand)}
  />
);

export default BrandCard;
