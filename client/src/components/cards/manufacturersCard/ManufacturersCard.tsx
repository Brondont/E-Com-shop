// ManufacturerCard.tsx
import React from "react";
import BaseCard from "../baseCard/BaseCard";
import { Manufacturer } from "../../admin/products/BaseProductCreation";

interface ManufacturerCardProps {
  manufacturer?: Manufacturer;
  onClick?: (manufacturer: Manufacturer) => void;
}

export const ManufacturerCard: React.FC<ManufacturerCardProps> = ({
  manufacturer,
  onClick,
}) => (
  <BaseCard
    loading={!manufacturer}
    data={manufacturer}
    onClick={() => manufacturer && onClick?.(manufacturer)}
  />
);

export default ManufacturerCard;
