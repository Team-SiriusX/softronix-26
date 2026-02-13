import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import db from "@/lib/db";
import { authMiddleware } from "../../middleware/auth-middleware";

const app = new Hono()
  .use("/*", authMiddleware)

  // GET / — list user addresses
  .get("/", async (c) => {
    const user = c.get("user");

    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ data: addresses });
  })

  // POST / — create a new address
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        phone: z.string().min(1, "Phone is required"),
        line1: z.string().min(1, "Address line 1 is required"),
        line2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().optional(),
        country: z.string().default("PK"),
        postalCode: z.string().min(1, "Postal code is required"),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const data = c.req.valid("json");

      const address = await db.address.create({
        data: {
          userId: user.id,
          ...data,
        },
      });

      return c.json({ data: address, message: "Address created" }, 201);
    }
  )

  // DELETE /:id — delete an address
  .delete("/:id", async (c) => {
    const user = c.get("user");
    const { id } = c.req.param();

    const address = await db.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      return c.json({ error: "Address not found" }, 404);
    }

    await db.address.delete({ where: { id } });

    return c.json({ message: "Address deleted" });
  });

export default app;
