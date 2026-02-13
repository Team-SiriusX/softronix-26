import { Hono } from "hono";
import { getProducts, getProductById, getCategories, type ProductFilterOptions } from "@/lib/product-loader";

const app = new Hono()
  .get("/", (c) => {
    const category = c.req.query("category");
    const minPrice = c.req.query("minPrice");
    const maxPrice = c.req.query("maxPrice");
    const search = c.req.query("search");
    const sortBy = c.req.query("sortBy") as ProductFilterOptions["sortBy"];
    const tags = c.req.query("tags");
    const page = parseInt(c.req.query("page") ?? "1");
    const limit = parseInt(c.req.query("limit") ?? "10");

    // Build filter options
    const filterOptions: ProductFilterOptions = {
      category: category ?? undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search: search ?? undefined,
      sortBy: sortBy ?? undefined,
      tags: tags ? tags.split(",") : undefined,
    };

    const allProducts = getProducts(filterOptions);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    return c.json({
      data: paginatedProducts,
      total: allProducts.length,
      page,
      limit,
      hasMore: endIndex < allProducts.length,
      nextPage: endIndex < allProducts.length ? page + 1 : null,
      categories: getCategories(),
    });
  })
  .get("/:id", (c) => {
    const { id } = c.req.param();
    const product = getProductById(id);

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ data: product });
  });

export default app;

