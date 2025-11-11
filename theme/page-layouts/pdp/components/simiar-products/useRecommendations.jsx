import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";

const useRecommendation = (fpi, slug, wrapper, customValue) => {
  const [apiLoading, setApiLoading] = useState(false);
  const PAGE_SIZE = 10;
  let product_lists;
  const custom_value = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  product_lists = custom_value.hasOwnProperty(customValue)
    ? custom_value[customValue]
    : {};

  const getProducts = async () => {
    setApiLoading(true);
     const url = slug
        ? `/ext/recalpha/api/application/v1.0/recommend/${wrapper}?item_slug=${slug}`
        : `/ext/recalpha/api/application/v1.0/recommend/${wrapper}`;

    const data = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok.");
        return res.json();
        
      })
      .then((data) => {
        setApiLoading(false);
        fpi.custom.setValue(customValue, data);
          console.log(data)
      })
      .catch((error) => {
        setApiLoading(false);
        console.error(
          "There was a problem with the products carousel fetch operation:",
          error
        );
      });
  };

  useEffect(() => {
    getProducts();
  }, [slug]);

  return {
    product_lists,
    apiLoading,
  };
};

export default useRecommendation;