/**
 * ProductCard Component
 * (keep your existing doc comment here)
 *
 * Overlay variant: when the product has 2+ images, the image area becomes a
 * slider (arrows, dots, swipe). Autoplay runs only while the card is hovered.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { currencyFormat, formatLocale } from "../../helper/utils.js";
import { useMobile } from "../../helper/hooks/index.jsx";
import FyImage from "../core/fy-image/fy-image.jsx";
import SvgWrapper from "../core/svgWrapper/SvgWrapper.jsx";
import styles from "./product-card.less";
import FyButton from "../core/fy-button/fy-button.jsx";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import WishlistIcon from "../../assets/images/wishlist.jsx";
import imagePlaceholder from "../../assets/images/placeholder/no-product-image.png";
import GlamARTrigger from "../GlamARTryOn/index.jsx";

const MAX_SLIDES = 4;
const AUTOPLAY_SPEED = 700;

const OverlayImageCarousel = ({
  images,
  productName,
  imgSrcSet,
  imageBackgroundColor,
  isHovered,
  autoplaySpeed = AUTOPLAY_SPEED,
}) => {
  const [active, setActive] = useState(0);
  const pointerStart = useRef(null);
  const suppressClick = useRef(false);
  const count = images.length;

  // Autoplay only while hovered; return to the first image when hover ends
  useEffect(() => {
    if (!isHovered || count < 2) {
      setActive(0);
      return undefined;
    }
    const timer = setInterval(
      () => setActive((current) => (current + 1) % count),
      autoplaySpeed
    );
    return () => clearInterval(timer);
  }, [isHovered, count, autoplaySpeed]);

  // The card sits inside a link, so stop navigation when using the controls
  const go = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setActive((index + count) % count);
  };

  return (
    <div
      className={styles.cardImageCarousel}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${productName} images`}
    >
      <div
        className={styles.cardImageTrack}
        style={{ transform: `translateX(-${active * 100}%)` }}
        onPointerDown={(e) => {
          pointerStart.current = { x: e.clientX, y: e.clientY };
          suppressClick.current = false;
        }}
        onPointerUp={(e) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            suppressClick.current = true; // a swipe shouldn't open the product
            go(e, active + (dx < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {images.map((image, index) => (
          <div
             className={`${styles.cardImageSlide} ${
      index === 0 ? styles.slideCover : styles.slideContain
    }`}
            key={image.url}
            aria-hidden={index !== active}
          >
            <FyImage
              src={image.url}
              alt={image.alt || productName}
              backgroundColor={imageBackgroundColor}
              isFixedAspectRatio={false}
              customClass={styles.productImage}
              sources={imgSrcSet}
              defer={index !== 0}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.cardImageArrow} ${styles.cardImagePrevious}`}
        aria-label={`Previous image of ${productName}`}
        onClick={(e) => go(e, active - 1)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.cardImageArrow} ${styles.cardImageNext}`}
        aria-label={`Next image of ${productName}`}
        onClick={(e) => go(e, active + 1)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* <div className={styles.cardImageDots}>
        {images.map((image, index) => (
          <button
            type="button"
            key={image.url}
            className={index === active ? styles.cardImageDotActive : ""}
            aria-label={`View image ${index + 1} of ${productName}`}
            aria-pressed={index === active}
            onClick={(e) => go(e, index)}
          />
        ))}
      </div> */}
    </div>
  );
};

const ProductCard = ({
  product,
  customClass = [],
  listingPrice = "range",
  imgSrcSet = [
    { breakpoint: { min: 1024 }, width: 600 },
    { breakpoint: { min: 768 }, width: 300 },
    { breakpoint: { min: 481 }, width: 300 },
    { breakpoint: { max: 390 }, width: 300 },
    { breakpoint: { max: 480 }, width: 300 },
  ],
  aspectRatio = 0.8,
  isBrand = true,
  isPrice = true,
  isSaleBadge = true,
  isWishlistIcon = true,
  isImageFill = false,
  showImageOnHover = false,
  imageBackgroundColor = "",
  columnCount = { desktop: 4, tablet: 3, mobile: 1 },
  WishlistIconComponent = () => <SvgWrapper svgSrc="wishlist-plp" />,
  isRemoveIcon = false,
  RemoveIconComponent = () => (
    <SvgWrapper svgSrc="item-close" className={styles.removeIcon} />
  ),
  actionButtonText,
  followedIdList = [],
  onWishlistClick = () => {},
  handleAddToCart = () => {},
  onRemoveClick = () => {},
  centerAlign = true,
  showAddToCart = false,
  showBadge = true,
  isSlider = false,
  hasGlamAR,
  cardVariant = "classic",
}) => {
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const locale = i18nDetails?.language?.locale || "en";
  const countryCode = i18nDetails?.countryCode || "IN";
  const isMobile = useMobile();
  const isOverlay = cardVariant === "overlay";
  const [isHovered, setIsHovered] = useState(false);

  const getListingPrice = (key) => {
    if (!product.price) return "";

    let price = "";
    const priceDetails = product.price[key];

    switch (listingPrice) {
      case "min":
        price = currencyFormat(
          priceDetails.min,
          priceDetails.currency_symbol,
          formatLocale(locale, countryCode, true)
        );
        break;
      case "max":
        price = currencyFormat(
          priceDetails.max,
          priceDetails.currency_symbol,
          formatLocale(locale, countryCode, true)
        );
        break;
      case "range":
        price =
          priceDetails.min !== priceDetails.max
            ? `${currencyFormat(
                priceDetails.min,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              )} - ${currencyFormat(
                priceDetails.max,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              )}`
            : currencyFormat(
                priceDetails.min,
                priceDetails.currency_symbol,
                formatLocale(locale, countryCode, true)
              );
        break;
      default:
        break;
    }
    return price;
  };

  const getProductImages = () => {
    return product?.media?.filter((media) => media.type === "image");
  };

  const productImages = getProductImages();
  // Prefer the 6th image (index 5) per design; fall back to the first
  const preferredIndex = productImages?.[5]?.url ? 5 : 0;
  const imageUrl = productImages?.[preferredIndex]?.url || "";
  const imageAlt =
    productImages?.[preferredIndex]?.alt ||
    `${product?.brand?.name} | ${product?.name}`;
  const hoverImageUrl = productImages?.[1]?.url || "";
  const hoverImageAlt =
    productImages?.[1]?.alt || `${product?.brand?.name} | ${product?.name}`;

  // Slider images: preferred image first, then the rest (max MAX_SLIDES)
  const carouselImages = [
    productImages?.[preferredIndex],
    ...(productImages || []).filter((_, i) => i !== preferredIndex),
  ]
    .filter(
      (img, i, list) =>
        img?.url && list.findIndex((item) => item?.url === img.url) === i
    )
    .slice(0, MAX_SLIDES);

  const shadeVariants = product.variants?.find(
    (variant) => variant.display_type === "color"
  );
  const shadeVariantsCount = shadeVariants?.items?.length - 1 || 0;
  const currentShade = shadeVariants?.items?.find(
    (variant) => product?.slug === variant?.slug
  );
  const variants = shadeVariants?.items
    ?.filter((variant) => variant.slug !== currentShade?.slug)
    .slice(0, 3);

  const hasDiscount =
    getListingPrice("effective") !== getListingPrice("marked");

  const isFollowed = useMemo(() => {
    return !!followedIdList?.includes(product?.uid);
  }, [followedIdList, product]);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onWishlistClick({ product, isFollowed });
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRemoveClick({ product, isFollowed });
  };

  const gridClass = useMemo(
    () =>
      `${columnCount?.mobile === 2 ? styles["mob-grid-2-card"] : styles["mob-grid-1-card"]} ${columnCount?.tablet === 2 ? styles["tablet-grid-2-card"] : styles["tablet-grid-3-card"]} ${columnCount?.desktop === 2 ? styles["desktop-grid-2-card"] : styles["desktop-grid-4-card"]}`,
    [columnCount?.desktop, columnCount?.tablet, columnCount?.mobile]
  );

  const handleAddToCartClick = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    handleAddToCart(product?.slug);
  };

  const getShadeImage = (medias) => {
    if (!Array.isArray(medias)) return "";

    const image99 = medias.find((media) =>
      media?.url?.toLowerCase().includes("-99")
    );

    if (image99) return image99.url;

    const imageList = medias.filter((m) => m.type === "image");
    const lastImage = imageList[imageList.length - 1];

    return lastImage?.url || "";
  };

  const displayTag =
    product?.attributes?.displaytag &&
    Array.isArray(product.attributes.displaytag) &&
    product.attributes.displaytag.length > 0
      ? product.attributes.displaytag[0]
      : null;

  const badgeText = product?.teaser_tag || (isOverlay ? "" : null);

  const renderSwatches = () =>
    shadeVariantsCount !== 0 && (
      <div className={styles.productVariants}>
        {/* CURRENT SHADE */}
        <div className={`${styles.shade} ${styles.currentShade}`}>
          {getShadeImage(currentShade?.medias) ? (
            <img
              src={getShadeImage(currentShade?.medias)}
              alt={currentShade?.name}
              className={styles.shadeImage}
            />
          ) : (
            <div
              className={styles.shadeColor}
              style={{
                backgroundColor: currentShade?.color
                  ? `#${currentShade.color}`
                  : currentShade?.color_name,
              }}
            />
          )}
        </div>

        {variants?.map((variantItem) => (
          <div
            key={variantItem.uid}
            className={`${styles.shade} ${styles.allShades}`}
          >
            {getShadeImage(variantItem?.medias) ? (
              <img
                src={getShadeImage(variantItem?.medias)}
                alt={variantItem?.name}
                className={styles.shadeImage}
              />
            ) : (
              <div
                className={styles.shadeColor}
                style={{
                  backgroundColor: variantItem?.color
                    ? `#${variantItem.color}`
                    : variantItem?.color_name,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );

  const renderWishlistButton = () =>
    isWishlistIcon && (
      <button
        className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
        onClick={handleWishlistClick}
        title={t("resource.product.wishlist_icon")}
      >
        <WishlistIcon isActive={isFollowed} />
      </button>
    );

  const renderRemoveButton = () =>
    isRemoveIcon && (
      <button
        className={`${styles.wishlistBtn} ${isFollowed ? styles.active : ""}`}
        onClick={handleRemoveClick}
        title={t("resource.product.wishlist_icon")}
      >
        <RemoveIconComponent />
      </button>
    );

  const renderPrice = (textCenterOverride) => (
    <div
      className={`${styles.productPrice} ${centerAlign || textCenterOverride ? styles.center : ""}`}
    >
      <div>
        {hasDiscount && (
          <span
            className={`${styles["productPrice--regular"]} ${styles.captionNormal}`}
          >
            {getListingPrice("marked")}
          </span>
        )}

        {product?.price?.effective && (
          <span className={`${styles["productPrice--sale"]} ${styles.h4}`}>
            {getListingPrice("effective")}
          </span>
        )}
      </div>
      {product.discount && (
        <span
          className={`${styles["productPrice--discount"]} ${styles.captionNormal} ${centerAlign || textCenterOverride ? styles["productPrice--textCenter"] : ""}`}
        >
          {product.discount}
        </span>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <div
        className={`productcard ${styles.productCard} ${styles.overlayCard} ${
          !product.sellable ? styles.disableCursor : ""
        } ${styles[customClass[0]]} ${styles[customClass[1]]} ${
          styles[customClass[2]]
        } ${styles.animate} ${gridClass} ${isSlider ? styles.sliderCard : ""}`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasGlamAR && (
          <GlamARTrigger
            accessToken="c466f1ed-059d-42e5-abcb-4a041d3f1e71"
            sku={product?.item_code}
          />
        )}

        <div className={styles.imageContainer}>
          {carouselImages.length > 1 ? (
            <OverlayImageCarousel
              images={carouselImages}
              productName={product.name}
              imgSrcSet={imgSrcSet}
              imageBackgroundColor={imageBackgroundColor}
              isHovered={isHovered}
            />
          ) : (
            <FyImage
              src={imageUrl || imagePlaceholder}
              alt={imageAlt}
              backgroundColor={imageBackgroundColor}
              isFixedAspectRatio={false}
              customClass={`${styles.productImage} ${styles.mainImage}`}
              sources={imgSrcSet}
              defer={false}
            />
          )}

          {renderSwatches()}
          {renderWishlistButton()}
          {renderRemoveButton()}

          <div className={styles.cardOverlay}>
            {showBadge && badgeText && (
              <div className={styles.overlayBadge}>
                <span>{badgeText}</span>
              </div>
            )}

            <div className={styles.overlayContent}>
              {displayTag && (
                <div className={styles.displayTagContainer}>
                  <span>{displayTag}</span>
                </div>
              )}

              {isBrand && product.brand && (
                <h3 className={styles.productBrand}>{product.brand.name}</h3>
              )}
              <h5
                className={`${styles.productName} ${styles.b2} ${styles.centerAlign}`}
                title={product.name}
              >
                {product.name}
              </h5>
              {isPrice && renderPrice(true)}
            </div>
          </div>
        </div>

        {showAddToCart && (
          <div className={styles.overlayAddToCartWrap}>
            <FyButton
              variant="outlined"
              className={styles.addToCart}
              onClick={handleAddToCartClick}
            >
              {actionButtonText ?? t("resource.common.add_to_cart")}
            </FyButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`productcard ${styles.productCard} ${
        !product.sellable ? styles.disableCursor : ""
      } ${styles[customClass[0]]} ${styles[customClass[1]]} ${
        styles[customClass[2]]
      } ${styles.animate} ${gridClass} ${isSlider ? styles.sliderCard : ""}`}
    >
      {hasGlamAR && (
        <GlamARTrigger
          accessToken="c466f1ed-059d-42e5-abcb-4a041d3f1e71"
          sku={product?.item_code}
        />
      )}

      {displayTag && (
        <div className={styles.displayTagContainer}>
          <span>{displayTag}</span>
        </div>
      )}

      <div className={styles.imageContainer}>
        {!isMobile && showImageOnHover && hoverImageUrl && (
          <FyImage
            src={hoverImageUrl}
            alt={hoverImageAlt}
            backgroundColor={imageBackgroundColor}
            isFixedAspectRatio={false}
            customClass={` ${styles.productImage} ${styles.hoverImage}`}
            sources={imgSrcSet}
            defer={true}
          />
        )}
        <FyImage
          src={imageUrl || imagePlaceholder}
          alt={imageAlt}
          backgroundColor={imageBackgroundColor}
          isFixedAspectRatio={false}
          customClass={`${styles.productImage} ${styles.mainImage}`}
          sources={imgSrcSet}
          defer={false}
        />
        {renderWishlistButton()}
        {renderRemoveButton()}
      </div>
      <div className={styles.productDescContainer}>
        <div className={styles.productDesc}>
          {renderSwatches()}

          {isBrand && product.brand && (
            <h3 className={styles.productBrand}>{product.brand.name}</h3>
          )}
          <h5
            className={`${styles.productName} ${styles.b2} ${centerAlign ? styles.centerAlign : ""}`}
            title={product.name}
          >
            {product.name}
          </h5>
          {isPrice && renderPrice(false)}
        </div>

        {showAddToCart && (
          <FyButton
            variant="outlined"
            className={styles.addToCart}
            onClick={handleAddToCartClick}
          >
            {actionButtonText ?? t("resource.common.add_to_cart")}
          </FyButton>
        )}
      </div>
    </div>
  );
};

export default ProductCard;