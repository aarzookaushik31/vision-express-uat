import React from "react";
import Calendar from "../../assets/images/blog/calendar.svg";
import Clock from "../../assets/images/blog/clock.svg";
import placeholderImage from "../../assets/images/blog-placeholder.png";
import styles from "../../styles/sections/blog-listing.less";

function getEstimatedReadingTime(blog) {
  if (blog.reading_time) return blog.reading_time;

  const text = (blog?.content?.[0]?.value || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogCard({ blog, fallbackImage, className = "" }) {
  return (
    <a
      href={`/blog/${blog.slug}`}
      className={`${styles.blogCard} ${className}`}
    >
      <h3 className={styles.blogCardTitle}>{blog.title}</h3>
      <div className={styles.blogImage}>
        <img
          src={
            blog?.feature_image?.secure_url || fallbackImage || placeholderImage
          }
          alt={blog.title}
          loading="lazy"
        />
        {blog?.tags?.length > 0 && (
          <div className={styles.blogTags}>
            {blog.tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className={styles.blogTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.blogMeta}>
        <span>
          <Calendar aria-hidden="true" focusable="false" />
          {new Date(blog.publish_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>
          <Clock aria-hidden="true" focusable="false" />
          {getEstimatedReadingTime(blog)} min read
        </span>
      </div>
    </a>
  );
}
