import { describe, it, expect } from "bun:test";
import request from "supertest";
import { app } from "../../index";
import { createSupertestApp } from "../../utils/super-test-helpers"; // Import the helper function

// Wrap the Hono app for Supertest compatibility
const supertestApp = createSupertestApp(app);

// Mock a valid session ID
const mockSessionId = "valid-session-id";

const validPayload = {
  name: "Laptop",
  type: "electronics", // Must match allowedTypes
  price: 999.99,
  description: "A high-performance laptop.",
  category: "laptops", // Must match allowedCategories
  stock: 10,
};

describe("POST /products/create", () => {
  it("should create a product with valid input", async () => {
    const res = await request(supertestApp)
      .post("/products/create")
      .set("Cookie", [`session=${mockSessionId}`])
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should return 401 if user is not authenticated", async () => {
    const res = await request(supertestApp)
      .post("/products/create")
      .send(validPayload);

    expect(res.status).toBe(401);
    expect(res.text).toBe("User not authenticated");
  });
});
