import React, { useCallback, useEffect, useState } from "react";
import { Image } from "../../types/types";
import { useFeedback } from "../../../FeedbackAlertContext";

import ProductGroup from "./ProductGroup";

export interface Brand {
  ID: number;
  name: string;
  description: string;
  image: Image;
  CreatedAt: string;
  UpdatedAt: string;
}

const GroupBrand: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);
  const { showFeedback } = useFeedback();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSetBrands = (newBrands: Brand[]) => {
    setBrands(newBrands);
  };

  const fetchbrands = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/brands`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setBrands(resData.brands);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "something went wrong with fetching brands, reload the page",
          false
        );
    } finally {
      setLoadingBrands(false);
    }
  }, [apiUrl, showFeedback]);

  useEffect(() => {
    fetchbrands();
  }, [fetchbrands]);

  return (
    <ProductGroup
      name="Brand"
      items={brands}
      handleUpdateItems={handleSetBrands}
      loading={loadingBrands}
    />
  );
};

export default GroupBrand;
