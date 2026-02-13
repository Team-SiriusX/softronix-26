import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { sample } from "./controllers/(base)";
import { clerk } from "./controllers/(clerk)";
import { products, cart, orders, address } from "./controllers/(store)";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
  console.log(err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ message: "Internal Error" }, 500);
});

const routes = app
  .route("/sample", sample)
  .route("/clerk", clerk)
  .route("/products", products)
  .route("/cart", cart)
  .route("/orders", orders)
  .route("/address", address);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

