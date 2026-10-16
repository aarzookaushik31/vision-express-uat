import React, { useState } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { useFPI } from "fdk-core/utils";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import BlogCard from "../components/blog/blog-card";
import styles from "../styles/sections/blog-listing.less";

export function BlogPreview({ props }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi, props });
  const [showAll, setShowAll] = useState(false);
  const blogItems = blogs?.items?.slice(0, 4) || [];

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
        <>
          <div
            className={`${styles.blogGrid} ${showAll ? "" : styles.relatedCollapsed}`}
          >
            {blogItems.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                fallbackImage={props?.fallback_image?.value}
              />
            ))}
          </div>
          {!showAll && blogItems.length > 2 && (
            <div className={styles.relatedLoadMore}>
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={() => setShowAll(true)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Blog List (4 Cards)",
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
    return await fpi.executeGQL(
      FETCH_BLOGS_LIST,
      { pageSize: 4, pageNo: 1 },
      { skipStoreUpdate: true },
    );
  } catch (error) {
    console.log(error);
  }
};

export default BlogPreview;
