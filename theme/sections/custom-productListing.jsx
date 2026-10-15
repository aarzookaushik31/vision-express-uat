import React, { useState, useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/product-listing.less";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ProductCard from "../components/product-card-new/product-card";
import Sort from "../page-layouts/plp/Components/sort/sort";
import FilterItem from "../page-layouts/plp/Components/filter-item/filter-item";
import StickyColumn from "../page-layouts/plp/Components/sticky-column/sticky-column";
import Pagination from "../page-layouts/plp/Components/pagination/pagination";
import FilterTags from "../page-layouts/plp/Components/filter-tags/filter-tags";
// import ListingDescription from "../components/listing-description/listing-description";
import SortModal from "../components/sort-modal/sort-modal";
import FilterModal from "../components/filter-modal/filter-modal";
import ScrollTop from "../components/scroll-to-top/scroll-to-top";
import EmptyState from "../components/empty-state/empty-state";
import FyImage from "../components/core/fy-image/fy-image";
import { isRunningOnClient } from "../helper/utils";
import Modal from "../components/core/modal/modal";
import AddToCart from "../page-layouts/plp/Components/add-to-cart/add-to-cart";
import { useViewport } from "../helper/hooks";
import SizeGuide from "../page-layouts/plp/Components/size-guide/size-guide";
import ListingGridIcon from "../assets/images/plp/grid.svg";
import MobileGridIcon from "../assets/images/plp/mobile-grid.svg";
import MobileFitCircle from "../assets/images/plp/mobile-fit-circle.svg";
import MobileFitIcon from "../assets/images/plp/mobile-fit-icon.svg";
import MobileFilterIcon from "../assets/images/plp/mobile-filter.svg";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
import { GET_PRODUCT_DETAILS } from "../queries/pdpQuery";
import { GET_CUSTOM_FIELDS } from "../queries/plpQuery";

const ProductListing = ({
  breadcrumb = [],
  isProductCountDisplayed = true,
  productCount = 0,
  title = "",
  description = "",
  isScrollTop = true,
  filterList = [],
  selectedFilters = [],
  sortList = [],
  sortModalProps = {},
  filterModalProps = {},
  addToCartModalProps = {},
  loadingOption = "pagination",
  paginationProps = {},
  isProductLoading = false,
  isPageLoading = false,
  productList = [],
  columnCount = { desktop: 4, tablet: 3, mobile: 2 },
  isProductOpenInNewTab = false,
  isBrand = true,
  isSaleBadge = true,
  isPrice = true,
  globalConfig = {},
  imgSrcSet,
  isImageFill = false,
  showImageOnHover = false,
  isResetFilterDisable = false,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  aspectRatio,
  isWishlistIcon,
  WishlistIconComponent,
  followedIdList = [],
  listingPrice = "range",
  banner = {},
  showAddToCart = false,
  actionButtonText,
  cardVariant = "overlay", // NEW: "overlay" | "classic"
  showBadge = true, // NEW: show teaser_tag badge on the card
  stickyFilterTopOffset = 0,
  onColumnCountUpdate = () => {},
  onResetFiltersClick = () => {},
  onFilterUpdate = () => {},
  onSortUpdate = () => {},
  onFilterModalBtnClick = () => {},
  onSortModalBtnClick = () => {},
  onWishlistClick = () => {},
  onViewMoreClick = () => {},
  onLoadMoreProducts = () => {},
  EmptyStateComponent,
  bannerRef,
  bgImage,
  banner_title,
  banner_subtitle,
  banner_subtitle_eyeglass,
  banner_button_link,
  banner_button_text,
}) => {
  const { t } = useGlobalTranslation("translation");
  const isTablet = useViewport(0, 768);
  const isMobile = useViewport(0, 480);
  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;

  const [isFindmyFitOpen, setIsFindmyFitOpen] = useState(false);

  const fpi = useFPI();

  const [customFieldsData, setCustomFieldsData] = useState(null);
  const [sizeGuide, setSizeGuide] = useState(null);

  useEffect(() => {
    if (!isProductLoading && productList?.length > 0) {
      const slug = productList[0]?.slug;
      if (!slug) return;
      const values = { slug };

      fpi
        .executeGQL(GET_PRODUCT_DETAILS, values)
        .then((result) => {
          const product = result?.data?.product;
          if (!product) {
            console.warn("Product not found for slug:", slug);
            fpi.custom.setValue("isProductNotFound", true);
            return;
          }

          const sizeChart = product?.sizes?.size_chart;

          const isValidSizeGuide =
            sizeChart &&
            (Object.keys(sizeChart?.headers || {}).length > 0 ||
              sizeChart?.image);

          if (isValidSizeGuide) {
            setSizeGuide(product.sizes);
          } else {
            setSizeGuide(null);
          }
        })
        .catch((err) => console.error("Error fetching product details:", err));
    }
  }, [fpi, productList, isProductLoading]);

  useEffect(() => {
    if (!productList?.length) return;

    const productIds = productList.map((p) => String(p.uid));

    fpi
      .executeGQL(GET_CUSTOM_FIELDS, {
        resource: "product",
        resourceIds: productIds,
        keys: ["glamarmeta"],
      })
      .then((res) => {
        const data = res?.data?.customFieldsByResource;
        setCustomFieldsData(data);
      })
      .catch((err) => {
        console.error("Error fetching custom fields:", err);
      });
  }, [productList]);

  const isSizeGuideAvailable = useMemo(() => {
    const sizeChartHeader = sizeGuide?.size_chart?.headers || {};
    return (
      Object.keys(sizeChartHeader).length > 0 || sizeGuide?.size_chart?.image
    );
  }, [sizeGuide]);

  const handleOpenFindmyFit = () => setIsFindmyFitOpen(true);
  const handleCloseFindmyFit = () => setIsFindmyFitOpen(false);

  const isEyeglassCollection = title?.toLowerCase().includes("eyeglass");

  // Props shared by both ProductGrid usages (infinite + pagination/view_more)
  const gridProps = {
    isProductOpenInNewTab,
    productList,
    columnCount,
    isBrand,
    isSaleBadge,
    isPrice,
    aspectRatio,
    isWishlistIcon,
    WishlistIconComponent,
    followedIdList,
    listingPrice,
    showAddToCart,
    actionButtonText: actionButtonText ?? t("resource.common.add_to_cart"),
    onWishlistClick,
    isImageFill,
    showImageOnHover,
    imageBackgroundColor,
    imagePlaceholder,
    handleAddToCart,
    imgSrcSet,
    bannerRef,
    bgImage,
    banner_title,
    banner_subtitle,
    banner_subtitle_eyeglass,
    isEyeglassCollection,
    banner_button_link,
    banner_button_text,
    customFieldsData,
    cardVariant, // NEW
    showBadge, // NEW
  };

  return (
    <div className={`${styles.plpWrapper} plpwrappercustomgrid`}>
      {isRunningOnClient() && isPageLoading ? (
        <div className={styles.loader}></div>
      ) : productList?.length === 0 && !isPageLoading ? (
        <div>
          {EmptyStateComponent ? (
            EmptyStateComponent
          ) : (
            <EmptyState
              title={t("resource.common.sorry_we_couldnt_find_any_results")}
            />
          )}
        </div>
      ) : (
        <>
          <div className={styles.stickyMobileFilter}>
            {title?.toLowerCase() !== "accessories" &&
              !title?.toLowerCase().includes("contact lens") &&
              isSizeGuideAvailable && (
                <button
                  type="button"
                  className={styles.mobileFitButton}
                  onClick={handleOpenFindmyFit}
                  aria-label="Find My Fit"
                  title="Find My Fit"
                >
                  <MobileFitCircle className={styles.mobileFitCircle} aria-hidden="true" />
                  <MobileFitIcon className={styles.mobileFitIcon} aria-hidden="true" />
                </button>
              )}

            {filterList.length > 0 && (
              <button
                type="button"
                className={styles.filterBtn}
                onClick={onFilterModalBtnClick}
                aria-label="Filters"
                title="Filters"
              >
                <MobileFilterIcon className={styles.mobileFilterIcon} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className={styles.mobileHeader}>
            <div className={styles.headerLeft}>
              {title && <h1 className={styles.mobileTitle}>{title}</h1>}
              {isProductCountDisplayed && (
                <span className={styles.mobileProductCount}>
                  Showing {`${productCount} ${productCount > 1 ? "products" : "product"}`}
                </span>
              )}
            </div>
            <div className={styles.headerRight}>
              {sortList.length > 0 && (
                <button
                  type="button"
                  className={styles.sortBtnMobile}
                  onClick={onSortModalBtnClick}
                >
                  <span>Sort By</span>
                </button>
              )}

              <button
                type="button"
                className={styles.mobileGridButton}
                onClick={() => {
                  const screen = isMobile ? "mobile" : "tablet";
                  onColumnCountUpdate({
                    screen,
                    count: columnCount?.[screen] === 2 ? (isMobile ? 1 : 3) : 2,
                  });
                }}
                aria-label={t(
                  isMobile
                    ? columnCount?.mobile === 2
                      ? "resource.product.mobile_grid_one"
                      : "resource.product.mobile_grid_two"
                    : columnCount?.tablet === 2
                      ? "resource.product.tablet_grid_four"
                      : "resource.product.tablet_grid_two"
                )}
              >
                <MobileGridIcon aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={styles.contentWrapper}>
            {filterList?.length !== 0 && (
              <StickyColumn
                className={styles.left}
                topOffset={stickyFilterTopOffset}
              >
                <div className={styles.breadcrumbWrapper}>
                  <Breadcrumb breadcrumb={breadcrumb} />
                </div>

                <div className={styles.filterContainerCustom}>
                  <div className={styles.filterHeaderContainer}>
                    <div className={styles.filterHeader}>
                      <h4 className={styles.title}>
                        {t("resource.product.filters_caps").toLowerCase()}
                      </h4>
                      <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={onResetFiltersClick}
                        disabled={isResetFilterDisable}
                      >
                        Clear All
                      </button>
                    </div>
                    <FilterTags
                      compact
                      selectedFilters={selectedFilters}
                      onFilterUpdate={onFilterUpdate}
                      onResetFiltersClick={onResetFiltersClick}
                    />
                  </div>
                  {filterList
                    ?.filter((filter) => filter.values?.length > 0)
                    .map((filter, idx) => (
                      <FilterItem
                        isMobileView={false}
                        key={idx + "-desktop" + filter.key.display}
                        filter={filter}
                        onFilterUpdate={onFilterUpdate}
                      />
                    ))}
                </div>

                {/* {title?.toLowerCase() !== "accessories" &&
                  !title?.toLowerCase().includes("contact lens") &&
                  isSizeGuideAvailable && (
                    <div className={styles.customFindmyFitContainer}>
                      <h2>find my fit</h2>
                      <p>
                        Love the fit of your old glasses? Give us the numbers
                        from your old glasses we'll do the rest.
                      </p>
                      <button onClick={handleOpenFindmyFit}>
                        Need Help with Frame Size?
                      </button>
                    </div>
                  )} */}
              </StickyColumn>
            )}
            <div className={styles.right}>
              <div className={styles.rightHeader}>
                <div className={styles.headerLeft}>
                  {title && <h1 className={styles.title}>{title}</h1>}
                  {isProductCountDisplayed && (
                    <span className={styles.productCount}>
                      Showing{" "}
                      {`${productCount} ${productCount > 1 ? "products" : "product"}`}
                    </span>
                  )}
                </div>
                <div className={styles.headerRight}>
                  {title?.toLowerCase() !== "accessories" &&
                    !title?.toLowerCase().includes("contact lens") &&
                    isSizeGuideAvailable && (
                      <button
                        onClick={handleOpenFindmyFit}
                        className={styles.findMyFitButton}
                      >
                        Find My Fit
                      </button>
                    )}

                  <div className={styles.sortControls}>
                    {sortList.length > 0 && (
                      <Sort sortList={sortList} onSortUpdate={onSortUpdate} />
                    )}
                    <button
                      type="button"
                      className={styles.listingGridButton}
                      onClick={() =>
                        onColumnCountUpdate({
                          screen: "desktop",
                          count: columnCount?.desktop === 2 ? 3 : 2,
                        })
                      }
                      aria-label={t(
                        columnCount?.desktop === 2
                          ? "resource.product.desktop_grid_four"
                          : "resource.product.desktop_grid_two"
                      )}
                      title={t(
                        columnCount?.desktop === 2
                          ? "resource.product.desktop_grid_four"
                          : "resource.product.desktop_grid_two"
                      )}
                    >
                      <ListingGridIcon />
                    </button>
                  </div>
                </div>
              </div>
              {banner?.desktopBanner && (
                <div
                  className={`${styles.bannerContainer} ${styles.desktopBanner}`}
                >
                  <FDKLink
                    className={styles.redirectionLink}
                    to={banner?.redirectLink}
                  >
                    <FyImage
                      alt={t("resource.product.desktop_banner_alt")}
                      src={banner?.desktopBanner}
                      customClass={styles.banner}
                      isFixedAspectRatio={false}
                      aspectRatio="auto"
                      defer={false}
                    />
                  </FDKLink>
                </div>
              )}
              {banner?.mobileBanner && (
                <div
                  className={`${styles.bannerContainer} ${styles.mobileBanner}`}
                >
                  <FDKLink
                    className={styles.redirectionLink}
                    to={banner?.redirectLink}
                  >
                    <FyImage
                      alt={t("resource.product.mobile_banner")}
                      src={banner?.mobileBanner}
                      customClass={styles.banner}
                      isFixedAspectRatio={false}
                      aspectRatio="auto"
                      defer={false}
                    />
                  </FDKLink>
                </div>
              )}
              {selectedFilters?.length > 0 && (
                <div className={styles.filterTags}>
                  <FilterTags
                    selectedFilters={selectedFilters}
                    onFilterUpdate={onFilterUpdate}
                    onResetFiltersClick={onResetFiltersClick}
                  />
                </div>
              )}
              <div className={styles["plp-container"]}>
                {loadingOption === "infinite" ? (
                  <InfiniteLoader
                    hasNext={paginationProps.hasNext}
                    isLoading={isProductLoading}
                    loadMore={onLoadMoreProducts}
                  >
                    <ProductGrid {...gridProps} />
                  </InfiniteLoader>
                ) : (
                  <ProductGrid {...gridProps} isProductLoading={isProductLoading} />
                )}
                {loadingOption === "pagination" && (
                  <div className={styles.paginationWrapper}>
                    <Pagination {...paginationProps} />
                  </div>
                )}
                {loadingOption === "view_more" && paginationProps.hasNext && (
                  <div className={styles.viewMoreWrapper}>
                    <button
                      className={styles.viewMoreBtn}
                      onClick={onViewMoreClick}
                      tabIndex="0"
                      disabled={isProductLoading}
                    >
                      {t("resource.facets.view_more")}
                    </button>
                  </div>
                )}
              </div>
              {/* <ListingDescription
                key={description.length}
                description={description}
              /> */}
            </div>
          </div>

          <SizeGuide
            isOpen={isFindmyFitOpen}
            onCloseDialog={handleCloseFindmyFit}
            productMeta={sizeGuide}
          />

          <SortModal {...sortModalProps} />
          <FilterModal {...{ isResetFilterDisable, ...filterModalProps }} />
          {isScrollTop && <ScrollTop />}
          {showAddToCart && (
            <>
              {isAddToCartOpen && (
                <Modal
                  isOpen={isAddToCartOpen}
                  hideHeader={!isTablet}
                  containerClassName={styles.addToCartContainer}
                  bodyClassName={styles.addToCartBody}
                  titleClassName={styles.addToCartTitle}
                  title={
                    isTablet
                      ? restAddToModalProps?.productData?.product?.name
                      : ""
                  }
                  closeDialog={restAddToModalProps?.handleClose}
                >
                  <AddToCart
                    {...restAddToModalProps}
                    globalConfig={globalConfig}
                  />
                </Modal>
              )}
              <SizeGuide
                isOpen={showSizeGuide} // FIXED: was undefined `isSizeGuideOpen`
                onCloseDialog={handleCloseSizeGuide}
                productMeta={restAddToModalProps?.productData?.product?.sizes}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListing;

function ProductGrid({
  isBrand = true,
  isSaleBadge = true,
  isPrice = true,
  isWishlistIcon = true,
  imgSrcSet,
  aspectRatio,
  WishlistIconComponent,
  isProductOpenInNewTab = false,
  columnCount = { desktop: 4, tablet: 3, mobile: 2 },
  productList = [],
  followedIdList = [],
  listingPrice = "range",
  isImageFill = false,
  showImageOnHover = false,
  showAddToCart = false,
  actionButtonText, // already defaulted by the parent
  imageBackgroundColor = "",
  imagePlaceholder = "",
  onWishlistClick = () => {},
  handleAddToCart = () => {},
  bannerRef,
  bgImage,
  banner_title,
  banner_subtitle,
  banner_subtitle_eyeglass,
  isEyeglassCollection,
  banner_button_link,
  banner_button_text,
  customFieldsData,
  cardVariant = "overlay", // NEW
  showBadge = true, // NEW
}) {
  const subtitle = isEyeglassCollection
    ? banner_subtitle_eyeglass?.value
    : banner_subtitle?.value;

  return (
    <div
      className={`productGridContainer ${styles.productContainer}`}
      style={{
        "--desktop-col": columnCount.desktop,
        "--tablet-col": columnCount.tablet,
        "--mobile-col": columnCount.mobile,
      }}
    >
      {productList?.length > 0 &&
        productList.map((product, index) => {
          const hasGlamAR = customFieldsData?.groups?.some(
            (group) => group.resource_id === String(product.uid)
          );

          return (
            <React.Fragment key={product?.uid || index}>
              <FDKLink
                className={styles["product-wrapper"]}
                action={product?.action}
                key={product?.uid}
                target={isProductOpenInNewTab ? "_blank" : "_self"}
                onClick={() => {
                  sessionStorage.setItem("plp-scroll-position", window.scrollY);
                }}
                style={{
                  display: "block",
                }}
              >
                <ProductCard
                  product={product}
                  listingPrice={listingPrice}
                  columnCount={columnCount}
                  aspectRatio={aspectRatio}
                  isBrand={isBrand}
                  isPrice={isPrice}
                  isSaleBadge={isSaleBadge}
                  imgSrcSet={imgSrcSet}
                  isWishlistIcon={isWishlistIcon}
                  WishlistIconComponent={WishlistIconComponent}
                  followedIdList={followedIdList}
                  showAddToCart={showAddToCart}
                  actionButtonText={actionButtonText}
                  onWishlistClick={onWishlistClick}
                  isImageFill={isImageFill}
                  showImageOnHover={showImageOnHover}
                  imageBackgroundColor={imageBackgroundColor}
                  imagePlaceholder={imagePlaceholder}
                  handleAddToCart={handleAddToCart}
                  hasGlamAR={hasGlamAR}
                  cardVariant={cardVariant} // NEW
                  showBadge={showBadge} // NEW
                />
              </FDKLink>

              {index === 11 &&
                (bgImage ||
                  banner_title?.value ||
                  subtitle ||
                  banner_button_text?.value) && (
                  <div
                    ref={bannerRef}
                    className="custom-banner-card"
                    style={{
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="banner-overlay">
                      <div className="banner-content">
                        {banner_title?.value && <h2>{banner_title.value}</h2>}
                        {subtitle && <p>{subtitle}</p>}
                        {banner_button_text?.value &&
                          banner_button_link?.value && (
                            <a
                              href={banner_button_link.value}
                              className="banner-btn"
                            >
                              {banner_button_text.value}
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                )}
            </React.Fragment>
          );
        })}
    </div>
  );
}
