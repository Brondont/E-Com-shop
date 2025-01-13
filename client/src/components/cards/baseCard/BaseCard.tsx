// BaseCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Stack,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";

export interface BaseCardProps {
  image?: { imagePath: string };
  name: string;
  description: string;
}

interface BaseCardComponentProps {
  loading?: boolean;
  data?: BaseCardProps;
  onClick?: () => void;
}

export const BaseCard: React.FC<BaseCardComponentProps> = ({
  loading,
  data,
  onClick,
}) => {
  const theme = useTheme();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  const cardContent = loading ? (
    <CardContent>
      <Stack spacing={2}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ borderRadius: theme.shape.borderRadius }}
        />
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="100%" height={60} />
      </Stack>
    </CardContent>
  ) : (
    <>
      <CardMedia
        component="img"
        height={200}
        image={
          data?.image
            ? `${apiUrl.split("/api/")[0]}${data.image.imagePath}`
            : "https://via.placeholder.com/200"
        }
        alt={data?.name || "Loading"}
        sx={{
          objectFit: "contain",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data?.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            minHeight: "4.5em",
          }}
        >
          {data?.description}
        </Typography>
      </CardContent>
    </>
  );

  return (
    <Card
      elevation={2}
      sx={{
        width: { xs: "100%", sm: 300 },
        height: "100%",
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: theme.shadows[8],
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {cardContent}
      </CardActionArea>
    </Card>
  );
};

export default BaseCard;
