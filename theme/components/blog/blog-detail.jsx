import React from "react";
import { useFPI } from "fdk-core/utils";
import styles from "./styles/blog-detail.less";
import Calendar from "../../assets/images/blog/detail-calendar.svg";
import Clock from "../../assets/images/blog/detail-clock.svg";
import MobileCalendar from "../../assets/images/blog/calendar.svg";
import MobileClock from "../../assets/images/blog/clock.svg";
import BlogCard from "./blog-card";
import { FETCH_BLOGS_LIST } from "../../queries/blogQuery";
import useBlog from "../../page-layouts/blog/useBlog";

const BLOG_DETAILS_CONFIG = {};

function calculateReadingTime(content) {
  const text = (Array.isArray(content) ? content : [])
    .filter((block) => block.type === "html")
    .map((block) => (block.value || "").replace(/<[^>]+>/g, " "))
    .join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function BlogDetail({ blogDetails, isBlogDetailsLoading }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({
    fpi,
    props: BLOG_DETAILS_CONFIG,
  });

  if (isBlogDetailsLoading) {
    return <div className={styles.blogDetailLoading}>Loading...</div>;
  }

  if (!blogDetails) {
    return <div className={styles.blogDetailEmpty}>No blog found.</div>;
  }

  const {
    title,
    summary,
    content,
    publish_date,
    feature_image,
    reading_time,
    tags,
  } = blogDetails;
  const effectiveReadingTime = reading_time
    ? /[a-z]/i.test(String(reading_time))
      ? reading_time
      : reading_time + " min read"
    : calculateReadingTime(content) + " min read";
  const blogItems = (blogs?.items || [])
    .filter(
      (blog) =>
        (!blogDetails.id || blog.id !== blogDetails.id) &&
        (!blogDetails.slug || blog.slug !== blogDetails.slug),
    )
    .slice(0, 4);

  return (
    <div className={styles.blogDetail}>
      <article className={styles.blogArticle}>
        <nav className={styles.blogBreadcrumb} aria-label="Breadcrumb">
          <a href="/" className={styles.breadcrumbLink}>
            Home
          </a>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </span>
          <a href="/blog" className={styles.breadcrumbLink}>
            Blogs
          </a>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </span>
          <span className={styles.breadcrumbCurrent} aria-current="page">
            {title}
          </span>
        </nav>

        <div className={styles.blogDetailHero}>
          {feature_image?.secure_url && (
            <div className={styles.blogDetailBanner}>
              <img
                src={feature_image.secure_url}
                alt={title}
                className={styles.blogDetailBannerImg}
              />
            </div>
          )}
          {Array.isArray(tags) && tags.length > 0 && (
            <div
              className={
                feature_image?.secure_url
                  ? styles.blogDetailTags
                  : styles.blogDetailTagsStandalone
              }
            >
              {tags.map((tag, index) => (
                <span key={tag + "-" + index} className={styles.blogDetailTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.blogDetailMeta}>
          {publish_date && (
            <span className={styles.blogDetailDate}>
              <Calendar
                className={styles.desktopIcon}
                aria-hidden="true"
                focusable="false"
              />
              <MobileCalendar
                className={styles.mobileIcon}
                aria-hidden="true"
                focusable="false"
              />
              <time dateTime={publish_date}>
                {new Date(publish_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </span>
          )}
          <span className={styles.blogDetailReadingTime}>
            <Clock
              className={styles.desktopIcon}
              aria-hidden="true"
              focusable="false"
            />
            <MobileClock
              className={styles.mobileIcon}
              aria-hidden="true"
              focusable="false"
            />
            {effectiveReadingTime}
          </span>
        </div>

        <div className={styles.blogDetailContent}>
          <h1 className={styles.blogDetailTitle}>{title}</h1>
          {summary && <p className={styles.blogDetailSummary}>{summary}</p>}
          <div className={styles.blogDetailBody}>
            {Array.isArray(content) &&
              content.map((block, index) =>
                block.type === "html" ? (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{ __html: block.value }}
                  />
                ) : null,
              )}
          </div>
        </div>
      </article>

      <section
        className={styles.blogListingcards}
        aria-labelledby="recent-blogs-title"
      >
        <h2 id="recent-blogs-title" className={styles.blogTitle}>
          Recent Blogs
        </h2>
        {isLoading || isBlogPageLoading ? (
          <p>Loading blogs...</p>
        ) : blogItems.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <div className={styles.blogGrid}>
            {blogItems.map((blog) => (
              <BlogCard
                key={blog.id || blog.slug}
                blog={blog}
                className={styles.recentCard}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

BlogDetail.serverFetch = async ({ fpi }) => {
  try {
    return await fpi.executeGQL(
      FETCH_BLOGS_LIST,
      { pageSize: 5, pageNo: 1 },
      { skipStoreUpdate: true },
    );
  } catch (error) {
    console.log(error);
  }
};

export default BlogDetail;
