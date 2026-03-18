import React from "react";
import styles from "./similar-products.less";
import useRecommendation from "./useRecommendations";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import SliderCard from "./product-card.jsx";
import { useWishlist, useAccounts, useThemeConfig } from "../../../../helper/hooks";



const RecommendedProducts = ({
  fpi,
  slug,
  sectionTitle,
  slideToShow,
  customValue,
  wrapper,
  customSettings, 
  customClass = "" 
}) => {

    const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });


const handleWishlistToggle = (data) => {
  if (!isLoggedIn) {
    localStorage.setItem("pendingWishlistProduct", JSON.stringify(data));
    openLogin({ redirectUrl: "/wishlist"});
    return;
  }

  toggleWishlist(data);
};


  const { product_lists, apiLoading } = useRecommendation(
    fpi,
    slug,
    wrapper,
    customValue
  );

  if (!product_lists?.items?.length && !apiLoading) {
    return null;
  }

  const settings = customSettings || {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1050,
        settings: {
          slidesToShow: 4,
          dots: false,
          arrows: false,
          infinite: false,
        },
      },
      {
        breakpoint: 768, 
        settings: {
          slidesToShow: 1,
          rows: 1,
          slidesPerRow: 1,
          dots: false,
          arrows: false,
          infinite: false,
        },
      },
    ],
  };

  return (
    <div className={`${styles.recommendedWrapper} ${styles[customClass]}`}>
      <h2 className={styles.sectionTitle}>{sectionTitle}</h2>

      <div className={styles.productsWrap}>
        <div id="RecommendSlider" className={styles.sliderContainer}>
          <Slider {...settings} style={{ width: "100%" }}>
            {product_lists?.items?.length > 0 ? (
              product_lists.items.map((product, index) => (
                <FDKLink key={index} action={product?.action || ""}>
                  <SliderCard product={product} onWishlistClick={handleWishlistToggle} followedIdList={followedIdList} />
                </FDKLink>
              ))
            ) : (
              <div className={styles.noRecommendations}>
                <p>
                  {apiLoading
                    ? "Loading recommendations..."
                    : "No recommendations available."}
                </p>
              </div>
            )}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;