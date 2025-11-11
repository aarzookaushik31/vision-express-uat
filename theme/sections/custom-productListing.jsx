import React , {useState, useEffect} from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/product-listing.less";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ProductCard from "../components/product-card/product-card";
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
import TwoGridIcon from "../assets/images/desktop-2col.svg";
import FourGridIcon from "../assets/images/grid-four.svg";
import TwoGridMobIcon from "../assets/images/twogrid.svg";
import OneGridMobIcon from "../assets/images/mob-1col.svg";
import { useGlobalTranslation, useFPI} from "fdk-core/utils";
import Question from "../assets/images/question.png";
import { GET_PRODUCT_DETAILS } from "../queries/pdpQuery";

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
  columnCount = { desktop: 4, tablet: 3, mobile: 1 },
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
    banner_button_link,
    banner_button_text,
}) => {
  const { t } = useGlobalTranslation("translation");
  const isTablet = useViewport(0, 768);
  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;


  const [isFindmyFitOpen, setIsFindmyFitOpen] = useState(false);

  const fpi = useFPI();



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

          
          const guide = product.sizes;

          if (guide) {
            setSizeGuide(guide);
          } else {
            console.log(" No size guide found in product details");
          }
        })
        .catch((err) => console.error("Error fetching product details:", err));
    }
  }, [fpi, productList, isProductLoading]);




const handleOpenFindmyFit = () => setIsFindmyFitOpen(true);
const handleCloseFindmyFit = () => setIsFindmyFitOpen(false);


  return (
    <div className={styles.plpWrapper}>
      {isRunningOnClient() && isPageLoading ? (
        <div className={styles.loader}></div>
      ) : productList?.length === 0 && !(isPageLoading || isPageLoading) ? (
        <div>{EmptyStateComponent ? EmptyStateComponent : <EmptyState title={t('resource.common.sorry_we_couldnt_find_any_results')} />}</div>
      ) : (
        <>

              <div className={styles.stickyMobileFilter}>


                {title?.toLowerCase() !== "accessories" && (
                 <button onClick={handleOpenFindmyFit}>
                <span>Find My Fit</span>
              </button>
                )}
 
                 {filterList.length > 0 && (
                <button
                  className={styles.filterBtn}
                  onClick={onFilterModalBtnClick}
                >
                  <span>Filters</span>
                </button>
              )}
             
              </div>



          <div className={styles.mobileHeader}>
            <div className={styles.headerLeft}>

                <Breadcrumb breadcrumb={breadcrumb} />
       
            </div>
            <div className={styles.headerRight}>
              <button
                className={`${styles.colIconBtn} ${styles.mobile} ${
                  columnCount?.mobile === 1 ? styles.active : ""
                }`}
                onClick={() =>
                  onColumnCountUpdate({ screen: "mobile", count: 1 })
                }
                title={t("resource.product.mobile_grid_one")}
              >
                <OneGridMobIcon />
              </button>
              <button
                className={`${styles.colIconBtn} ${styles.mobile} ${
                  columnCount?.mobile === 2 ? styles.active : ""
                }`}
                onClick={() =>
                  onColumnCountUpdate({ screen: "mobile", count: 2 })
                }
                title={t("resource.product.mobile_grid_two")}
              >
                <TwoGridMobIcon />
              </button>
              <button
                className={`${styles.colIconBtn} ${styles.tablet} ${
                  columnCount?.tablet === 2 ? styles.active : ""
                }`}
                onClick={() =>
                  onColumnCountUpdate({ screen: "tablet", count: 2 })
                }
                title={t("resource.product.tablet_grid_two")}
              >
                <TwoGridIcon />
              </button>
              <button
                className={`${styles.colIconBtn} ${styles.tablet} ${
                  columnCount?.tablet === 3 ? styles.active : ""
                }`}
                onClick={() =>
                  onColumnCountUpdate({ screen: "tablet", count: 3 })
                }
                title={t("resource.product.tablet_grid_four")}
              >
                <FourGridIcon />
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
                    <h4 className={styles.title}>{t("resource.product.filters_caps")}</h4>
                    {!isResetFilterDisable && (
                      <button
                        className={styles.resetBtn}
                        onClick={onResetFiltersClick}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <FilterTags
                    selectedFilters={selectedFilters}
                    onFilterUpdate={onFilterUpdate}
                  />
                </div>
                {filterList?.map((filter, idx) => (
                  <FilterItem
                    isMobileView={false}
                    key={idx + "-desktop" + filter.key.display}
                    filter={filter}
                    onFilterUpdate={onFilterUpdate}
                  />
                ))}
                </div>

                   {title?.toLowerCase() !== "accessories" && (
                <div className={styles.customFindmyFitContainer}>
                       <h2>find my fit</h2>
                       <p>Love the fit of your old glasses? Give us the numbers from your old glasses we'll do the rest.</p>
                      <button  onClick={handleOpenFindmyFit} >Need Help with Frame Size?</button>
                </div>
                   )}


              </StickyColumn>
            )}
            <div className={styles.right}>
              <div className={styles.rightHeader}>
                <div className={styles.headerLeft}>
                  {/* {title && <h1 className={styles.title}>{title}</h1>} */}
                  {isProductCountDisplayed && (
                    <span className={styles.productCount}>
                    Showing  {`${productCount} ${productCount > 1 ? "products" : "product"}`}
                    </span>
                  )}
                </div>
                <div className={styles.headerRight}>
                  <Sort sortList={sortList} onSortUpdate={onSortUpdate} />

                      
                       {title?.toLowerCase() !== "accessories" && (
                  <button 
                    onClick={handleOpenFindmyFit} 
                  className={styles.findMyFitButton}>find my fit <img src={Question} /> 
                  </button>
                       )}
                   

                  
                  <button
                    className={`${styles.colIconBtn} ${
                      columnCount?.desktop === 2 ? styles.active : ""
                    }`}
                    onClick={() =>
                      onColumnCountUpdate({ screen: "desktop", count: 2 })
                    }
                    title={t("resource.product.desktop_grid_two")}
                  >
                    <TwoGridIcon />
                  </button>
                  <button
                    className={`${styles.colIconBtn} ${
                      columnCount?.desktop === 3 ? styles.active : ""
                    }`}
                    onClick={() =>
                      onColumnCountUpdate({ screen: "desktop", count: 3 })
                    }
                    title={t("resource.product.desktop_grid_four")}
                  >
                    <FourGridIcon />
                  </button>
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
                    <ProductGrid
                      {...{
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
                        actionButtonText: actionButtonText ?? t('resource.common.add_to_cart'),
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
    banner_button_link,
    banner_button_text,
                      }}
                    />
                  </InfiniteLoader>
                ) : (
                  <ProductGrid
                    {...{
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
                      actionButtonText: actionButtonText ?? t('resource.common.add_to_cart'),
                      onWishlistClick,
                      isImageFill,
                      showImageOnHover,
                      imageBackgroundColor,
                      isProductLoading,
                      imagePlaceholder,
                      handleAddToCart,
                      imgSrcSet,
                       bannerRef,
    bgImage,
    banner_title,
    banner_subtitle,
    banner_button_link,
    banner_button_text,
                    }}
                  />
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
           { isAddToCartOpen &&
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
            }
              <SizeGuide
               isOpen={isSizeGuideOpen}
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
  columnCount = { desktop: 4, tablet: 3, mobile: 1 },
  productList = [],
  followedIdList = [],
  listingPrice = "range",
  isImageFill = false,
  showImageOnHover = false,
  showAddToCart = false,
  actionButtonText,
  imageBackgroundColor = "",
  imagePlaceholder = "",
  onWishlistClick = () => {},
  handleAddToCart = () => {},
   bannerRef,
    bgImage,
    banner_title,
    banner_subtitle,
    banner_button_link,
    banner_button_text,
}) {
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
        productList.map((product, index) => (
           <React.Fragment key={product?.uid || index}>
          <FDKLink
            className={styles["product-wrapper"]}
            action={product?.action}
            key={product?.uid}
            target={isProductOpenInNewTab ? "_blank" : "_self"}
            style={{
              // "--delay": `${(index % 12) * 150}ms`,
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
              actionButtonText={actionButtonText ?? t('resource.common.add_to_cart')}
              onWishlistClick={onWishlistClick}
              isImageFill={isImageFill}
              showImageOnHover={showImageOnHover}
              imageBackgroundColor={imageBackgroundColor}
              imagePlaceholder={imagePlaceholder}
              handleAddToCart={handleAddToCart}
            />

            
          </FDKLink>

          {index === 11 &&
  (bgImage ||
    banner_title?.value ||
    banner_subtitle?.value ||
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
          {banner_subtitle?.value && <p>{banner_subtitle.value}</p>}
          {banner_button_text?.value && banner_button_link?.value && (
            <a href={banner_button_link.value} className="banner-btn">
              {banner_button_text.value}
            </a>
          )}
        </div>
      </div>
    </div>
  )}


            </React.Fragment>
        ))}
    </div>
  );
}