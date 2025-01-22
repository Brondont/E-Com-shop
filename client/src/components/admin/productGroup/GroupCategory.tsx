import React, { useCallback, useEffect, useState } from "react";
import { Image } from "../../types/types";
import { useFeedback } from "../../../FeedbackAlertContext";

import ProductGroup from "./ProductGroup";

export interface Category {
  ID: number;
  name: string;
  description: string;
  image: Image;
  CreatedAt: string;
  UpdatedAt: string;
}

const GroupCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const { showFeedback } = useFeedback();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSetCateogries = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/categories`);

      const resData = await res.json();

      if (resData.error) {
        throw resData.error;
      }

      setCategories(resData.categories);
    } catch (err) {
      if (err.msg) showFeedback(err.msg, false);
      else
        showFeedback(
          "something went wrong with fetching categories, reload the page",
          false
        );
    } finally {
      setLoadingCategories(false);
    }
  }, [apiUrl, showFeedback]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <ProductGroup
      name="Category"
      items={categories}
      handleUpdateItems={handleSetCateogries}
      loading={loadingCategories}
    />
  );
};

export default GroupCategory;
