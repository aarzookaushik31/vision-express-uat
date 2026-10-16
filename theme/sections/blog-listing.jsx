import React, { useEffect, useState } from "react";
import "@gofynd/theme-template/pages/blog/blog.css";
import { useFPI } from "fdk-core/utils";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import BlogCard from "../components/blog/blog-card";
import styles from "../styles/sections/blog-listing.less";

export function Component({ props }) {
  const fpi = useFPI();
  const { blogs, isLoading, isBlogPageLoading } = useBlog({ fpi, props });
  const [blogItems, setBlogItems] = useState(blogs?.items || []);
  const [pageInfo, setPageInfo] = useState(
    blogs?.page || { current: 1, has_next: false, size: 8 },
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleBatches, setVisibleBatches] = useState(1);

  useEffect(() => {
    if (blogs?.items) {
      setBlogItems(blogs.items);
      setPageInfo(blogs.page);
      setVisibleBatches(1);
    }
  }, [blogs]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    const batchSize = window.matchMedia("(max-width: 768px)").matches ? 3 : 8;
    if (blogItems.length > visibleBatches * batchSize) {
      setVisibleBatches((previous) => previous + 1);
      return;
    }
    if (!pageInfo?.has_next) return;
    setIsLoadingMore(true);

    try {
      const response = await fpi.executeGQL(
        FETCH_BLOGS_LIST,
        { pageSize: pageInfo.size || 8, pageNo: pageInfo.current + 1 },
        { skipStoreUpdate: true },
      );
      const newBlogs = response?.data?.applicationContent?.blogs;
      setBlogItems((previous) => [...previous, ...(newBlogs?.items || [])]);
      setPageInfo(newBlogs?.page || pageInfo);
      setVisibleBatches((previous) => previous + 1);
    } catch (error) {
      console.error("Failed to load more blogs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className={styles.blogListing}>
      {props?.title?.value && (
        <h1 className={styles.blogTitle}>{props.title.value}</h1>
      )}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home /</a>
          </li>
          <li aria-current="page">Blogs</li>
        </ol>
      </nav>
      {isLoading || isBlogPageLoading ? (
        <p>Loading blogs...</p>
      ) : blogItems.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <>
          <div className={styles.blogGrid}>
            {blogItems.map((blog, index) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                fallbackImage={props?.fallback_image?.value}
                className={[
                  index >= visibleBatches * 8 ? styles.desktopHidden : "",
                  index >= visibleBatches * 3 ? styles.mobileHidden : "",
                ].join(" ")}
              />
            ))}
          </div>
          {(pageInfo?.has_next || blogItems.length > visibleBatches * 3) && (
            <div
              className={`${styles.loadMoreWrapper} ${
                !pageInfo?.has_next && blogItems.length <= visibleBatches * 8
                  ? styles.desktopHidden
                  : ""
              }`}
            >
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "Custom Blog Listing",
  props: [
    {
      id: "title",
      type: "text",
      value: "Blogs",
      default: "t:resource.default_values.the_unparalleled_shopping_experience",
      label: "t:resource.common.heading",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "t:resource.sections.blog.fallback_image",
      default: "",
    },
  ],
};

Component.serverFetch = async ({ fpi }) => {
  try {
    return await fpi.executeGQL(
      FETCH_BLOGS_LIST,
      { pageSize: 8, pageNo: 1 },
      { skipStoreUpdate: true },
    );
  } catch (error) {
    console.log("UAT serverFetch error:", error);
  }
};

export default Component;
