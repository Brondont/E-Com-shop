import React from "react";
import { Card, CardContent, Typography, Skeleton } from "@mui/material";

interface CategoriesCardProps {
  title: string;
  imageUrl: string;
}

const CategoriesCard: React.FC<CategoriesCardProps> = ({ title, imageUrl }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "18%",
        minWidth: "180px",
        height: "300px",
        border: "1px solid #000",
        borderRadius: "16px",
        boxShadow: "0px 4px 4px 0px #00000040",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {title && imageUrl ? (
          <>
            <img src={imageUrl} alt="" />
            <Typography
              sx={{
                fontSize: "30px",
                lineHeight: "36.31px",
                weight: 500,
                mb: 2,
              }}
            >
              {title}
            </Typography>
          </>
        ) : (
          <>
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{
                borderRadius: "12px",
                border: "1px solid #000",
                width: "100%",
                height: "80%",
                backgroundColor: "secondary.dark",
                opacity: "0px",
              }}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{
                mt: 4,
                width: "100%",
                height: "20%",
                backgroundColor: "secondary.light",
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesCard;
