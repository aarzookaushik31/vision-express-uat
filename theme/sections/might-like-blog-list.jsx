import React from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";
import styles from "../styles/sections/blog-listing.less";
import Clock from "../assets/images/clockblack.png";
import Calender from "../assets/images/Calendarblack.png";

export function BlogPreview({ props }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi, props });

  const getEstimatedReadingTime = (blog) => {
    try {
      if (blog.reading_time) return blog.reading_time;
      const htmlContent = blog?.content?.[0]?.value || "";
      const text = htmlContent.replace(/<[^>]+>/g, " ");
      const words = text.trim().split(/\s+/).length;
      return Math.max(1, Math.ceil(words / 200));
    } catch {
      return 1;
    }
  };

  const blogItems = blogs?.items?.slice(0, 3) || [];

  return (
    <div className={styles.blogListingcards}>
      {props?.title?.value && (
        <h2 className={styles.blogTitle}>{props.title.value}</h2>
      )}

      {isLoading || isBlogPageLoading ? (
        <p>Loading blogs...</p>
      ) : blogItems.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <div className={styles.blogGrid}>
          {blogItems.map((blog) => (
            <a
              href={`/blog/${blog.slug}`}
              key={blog.id}
              className={styles.blogCard}
            >
              <h2 className={styles.blogCardTitle}>{blog.title}</h2>

              <div className={styles.blogImage}>
                <img
                  src={
                    blog?.feature_image?.secure_url || props?.fallback_image
                  }
                  alt={blog.title}
                />
              </div>

              <div className={styles.blogInfoContainer}>
                <div className={styles.blogMeta}>
                  <span>
                    <img src={Calender} alt="calender" />
                    {new Date(blog.publish_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>
                    <img src={Clock} alt="clock" />{" "}
                    {getEstimatedReadingTime(blog)} min read
                  </span>
                </div>

                {blog?.tags?.length > 0 && (
                  <div className={styles.blogTags}>
                    {blog.tags.map((tag, idx) => (
                      <span key={idx} className={styles.blogTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export const settings = {
  label: "Blog List (3 Cards)",
  props: [
    {
      id: "title",
      type: "text",
      value: "Latest Blogs",
      label: "Section Heading",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "Fallback Image",
      default: "",
    },
  ],
};

BlogPreview.serverFetch = async ({ fpi }) => {
  try {
    const payload = {
      pageSize: 3,
      pageNo: 1,
    };

    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export default BlogPreview;
