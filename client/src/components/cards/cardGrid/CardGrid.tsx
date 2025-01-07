// CardGrid.tsx
import React from "react";
import { Box } from "@mui/material";
import BaseCard from "../baseCard/BaseCard";

interface CardGridProps<T> {
  items?: T[];
  renderCard: (item: T) => React.ReactNode;
}

export const CardGrid = <T extends unknown>({
  items,
  renderCard,
}: CardGridProps<T>) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      padding: 2,
    }}
  >
    {items && items.length !== 0
      ? items.map((item, index) => (
          <Box key={index} sx={{ height: "100%" }}>
            {renderCard(item)}
          </Box>
        ))
      : [...Array(8)].map((_, index) => (
          <Box key={index}>
            <BaseCard loading />
          </Box>
        ))}
  </Box>
);

export default CardGrid;
