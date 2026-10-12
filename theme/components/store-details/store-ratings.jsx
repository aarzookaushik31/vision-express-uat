import React from "react";
import styles from "./store-details.less";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GoogleRating = ({ preFetchedData, fetchReviews = false }) => {
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
    dots: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // --- Compact Layout ---
  if (!fetchReviews) {
    return (
      <div className={styles.ratingContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {renderStars(ratingData.rating)}
        </div>
        <span>
          {ratingData.rating.toFixed(1)}/5{" "}
          <span style={{ color: "rgba(56, 56, 56, 0.2)" }}>|</span>{" "}
          {ratingData.total} reviews
        </span>
      </div>
    );
  }

  // --- Full Reviews Layout ---
  return (
    <div className={styles.reviewsSection}>
      <h3>Store Reviews</h3>

      <div className={styles.reviewSummary}>
        <div className={styles.avgRating}>
          <h2>
            {ratingData.rating.toFixed(1)}
            <span>/5</span>
          </h2>
          <span className={styles.totalReviews}>
            {ratingData.total} reviews
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
                <div className={styles.userRow}>
                  <div className={styles.userAvatar}>
                    {rev.author_name?.[0] || "U"}
                  </div>
                  <div>
                    <h4>{rev.author_name}</h4>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      {renderStars(rev.rating)}
                    </div>
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
    </div>
  );
};

export default GoogleRating;
