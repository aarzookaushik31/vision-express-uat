import React from "react";
import styles from "./store-details.less";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReviewQuote from "../../assets/images/store-details/review-quote.svg";
import ReviewStar from "../../assets/images/store-details/review-star.svg";
import ReviewLogo from "../../assets/images/store-details/review-logo.webp";

const GoogleRating = ({ preFetchedData, fetchReviews = false }) => {
  React.useEffect(() => {
    console.info("[StoreReviews] rating component", { mode: fetchReviews ? "reviews" : "badge", dataAvailable: Boolean(preFetchedData), reviewCount: preFetchedData?.reviews?.length || 0 });
  }, [preFetchedData, fetchReviews]);
  if (!preFetchedData) {
    return <p className={styles.loadingtext}>Loading rating...</p>;
  }

  const { ratingData, reviews } = preFetchedData;

  const renderStars = (ratingValue) => {
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar =
      ratingValue - fullStars >= 0.25 && ratingValue - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const full = "rgba(238, 171, 67, 1)";
    const empty = "#E0E0E0";

    const star = (fill, key) => (
      <svg
        key={key}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={fill}
        width="18"
        height="18"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.175a1 1 0 00.95.69h4.392c.969 0 1.371 1.24.588 1.81l-3.56 2.584a1 1 0 00-.364 1.118l1.357 4.175c.3.921-.755 1.688-1.54 1.118l-3.56-2.584a1 1 0 00-1.176 0l-3.56 2.584c-.784.57-1.838-.197-1.539-1.118l1.357-4.175a1 1 0 00-.364-1.118L2.662 9.602c-.783-.57-.38-1.81.588-1.81h4.392a1 1 0 00.95-.69l1.357-4.175z" />
      </svg>
    );

    return [
      ...Array(fullStars)
        .fill()
        .map((_, i) => star(full, `full-${i}`)),
      ...(hasHalfStar
        ? [
            <svg key="half" width="18" height="18" viewBox="0 0 20 20">
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor={full} />
                  <stop offset="50%" stopColor={empty} />
                </linearGradient>
              </defs>
              <path
                fill="url(#half)"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.175a1 1 0 00.95.69h4.392c.969 0 1.371 1.24.588 1.81l-3.56 2.584a1 1 0 00-.364 1.118l1.357 4.175c.3.921-.755 1.688-1.54 1.118l-3.56-2.584a1 1 0 00-1.176 0l-3.56 2.584c-.784.57-1.838-.197-1.539-1.118l1.357-4.175a1 1 0 00-.364-1.118L2.662 9.602c-.783-.57-.38-1.81.588-1.81h4.392a1 1 0 00.95-.69l1.357-4.175z"
              />
            </svg>,
          ]
        : []),
      ...Array(emptyStars)
        .fill()
        .map((_, i) => star(empty, `empty-${i}`)),
    ];
  };

  const settings = {
    // Original review controls: dots: true, arrows: true,
    // Original dot visibility: dots: reviews?.length > 1,
    dots: reviews?.length > 0,
    arrows: false,
    infinite: reviews?.length > 1,
    swipe: true,
    draggable: true,
    touchMove: true,
    customPaging: (index) => <button type="button" aria-label={`Show review ${index + 1}`}>{index + 1}</button>,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  const renderDesignStars = (ratingValue) => {
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue - fullStars >= 0.25 && ratingValue - fullStars < 0.75;
    return Array.from({ length: 5 }, (_, index) => {
      const fraction = index < fullStars ? 1 : index === fullStars && hasHalfStar ? 0.5 : 0;
      return (
        <span key={index} className={styles.reviewStar} aria-hidden="true">
          <ReviewStar viewBox="0 0 13 13" />
          {fraction > 0 && <span className={styles.reviewStarFilled} style={{ width: `${fraction * 100}%` }}><ReviewStar viewBox="0 0 13 13" /></span>}
        </span>
      );
    });
  };

  // --- Compact Layout ---
  if (!fetchReviews) {
    return (
      <div className={styles.ratingContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {renderStars(ratingData.rating)}
        </div>
        <span>
          {preFetchedData.isPreview && <span className={styles.previewLabel}>Design preview · </span>}
          {ratingData.rating.toFixed(1)}/5{" "}
          <span style={{ color: "rgba(56, 56, 56, 0.2)" }}>|</span>{" "}
          {/* Original count: {ratingData.total} reviews */}
          {ratingData.total} {ratingData.total === 1 ? "review" : "reviews"}
        </span>
      </div>
    );
  }

  // --- Full Reviews Layout ---
  return (
    <div className={styles.reviewsSection}>
      {/* Original heading: <h3>Store Reviews</h3> */}
      <h3>
        <span>Store Review {preFetchedData.isPreview && <small className={styles.previewLabel}>Design preview</small>}</span>
        {preFetchedData.url && !preFetchedData.isPreview ? <a href={preFetchedData.url} target="_blank" rel="noreferrer">View All</a> : preFetchedData.isPreview && <span className={styles.viewAll}>View All</span>}
      </h3>

      <div className={styles.reviewBody}>
      <div className={styles.reviewSummary}>
        <div className={styles.avgRating}>
          <img className={styles.summaryLogo} src={ReviewLogo} alt="" aria-hidden="true" />
          <div className={styles.summaryStars}>{renderDesignStars(ratingData.rating)}</div>
          <h2>
            {ratingData.rating.toFixed(1)}
            {/* Original suffix: <span>/5</span> */}
            <span>/5 Ratings</span>
          </h2>
          <span className={styles.totalReviews}>
            {/* Original count text: {ratingData.total} reviews */}
            <span className={styles.userRow}>{reviews?.slice(0, 3).map((review, index) => <span key={index} className={styles.userAvatar}>{review.profile_photo_url ? <img src={review.profile_photo_url} alt="" /> : review.author_name?.[0] || "U"}</span>)}</span>
            <span><strong>{ratingData.total}</strong><br />{ratingData.total === 1 ? "Review" : "Reviews"}</span>
          </span>
        </div>

        <div className={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((r) => {
            const totalCount = reviews?.length || 0;
            const countForRating = reviews?.filter(
              (rev) => Math.round(rev.rating) === r
            ).length;
            const percentage = totalCount
              ? (countForRating / totalCount) * 100
              : 0;

            return (
              <div key={r} className={styles.ratingBarRow}>
                <span className={styles.ratingLabel}>
                  {r} <span className={styles.star}>⭐</span>
                </span>

                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.reviewList}>
        {reviews?.length ? (
          <Slider {...settings}>
            {reviews.map((rev, i) => (
              <div key={i} className={styles.reviewCard}>
                <ReviewQuote viewBox="0 0 20 14" className={styles.reviewQuote} aria-hidden="true" />
                <div className={styles.userRow}>
                  <div className={styles.userAvatar}>
                    {/* Original avatar: rev.author_name?.[0] || "U" */}
                    {rev.profile_photo_url ? <img src={rev.profile_photo_url} alt="" /> : rev.author_name?.[0] || "U"}
                  </div>
                  <div>
                    <h4>{rev.author_name}</h4>
                    <div
                      className={styles.authorStars}
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      {renderStars(rev.rating)}
                    </div>
                    <span className={styles.timeLabel}>{Number(rev.rating || 0).toFixed(1)}/5</span>
                    {/* <span className={styles.timeLabel}>{rev.relative_time_description}</span> */}
                  </div>
                </div>
                <p className={styles.reviewText}>{rev.text}</p>
              </div>
            ))}
          </Slider>
        ) : (
          <p className={styles.noReviews}>No reviews available.</p>
        )}
      </div>
      {reviews?.length === 1 && <span className={styles.singleReviewPagination} aria-hidden="true" />}
      </div>
    </div>
  );
};

export default GoogleRating;
