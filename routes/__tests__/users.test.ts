import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import request from "supertest";
import { app } from "../../index";
import { createSupertestApp } from "../../utils/super-test-helpers";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

// Wrap the Hono app for Supertest compatibility
const supertestApp = createSupertestApp(app);

// Mock a valid session ID
const mockSessionId = "valid-session-id";

// Valid payload for signup and signin
const validUserPayload = {
  username: "testuser",
  password: "Password123!",
  email: "test@example.com",
};

describe("Auth Routes", () => {
  beforeEach(async () => {
    // Clean up the database before each test
    await db.delete(users).where(eq(users.email, validUserPayload.email));
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.delete(users).where(eq(users.email, validUserPayload.email));
  });

  describe("GET /me", () => {
    it("should retrieve current user data if authenticated", async () => {
      // Seed the database with a test user
      await db.insert(users).values({
        id: mockSessionId,
        username: "testuser",
        email: "test@example.com",
        password: await Bun.password.hash("password123", "argon2id"),
      });

      const res = await request(supertestApp)
        .get("/me")
        .set("Cookie", [`session=${mockSessionId}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username");
      expect(res.body).toHaveProperty("sessionId");
      expect(res.body).toHaveProperty("email");
    });

    it("should return 404 if user is not authenticated", async () => {
      const res = await request(supertestApp).get("/me");

      expect(res.status).toBe(404);
      expect(res.text).toBe("User not found");
    });
  });

  describe("POST /signup", () => {
    it("should create a user with valid input", async () => {
      const res = await request(supertestApp)
        .post("/signup")
        .send(validUserPayload);

      expect(res.status).toBe(201);
      expect(res.text).toBe("User created successfully");
    });

    it("should return 404 if email is already in use", async () => {
      // First, create the user
      await request(supertestApp).post("/signup").send(validUserPayload);

      // Then, try creating the same user again
      const res = await request(supertestApp)
        .post("/signup")
        .send(validUserPayload);

      expect(res.status).toBe(404);
      expect(res.text).toBe("Email is already on use");
    });
  });

  describe("POST /signin", () => {
    beforeEach(async () => {
      // Seed the database with a test user for signin
      await db.insert(users).values({
        username: validUserPayload.username,
        email: validUserPayload.email,
        password: await Bun.password.hash(
          validUserPayload.password,
          "argon2id"
        ),
      });
    });

    it("should log in a user with valid credentials", async () => {
      const res = await request(supertestApp).post("/signin").send({
        email: validUserPayload.email,
        password: validUserPayload.password,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("username");
      expect(res.body).toHaveProperty("email");
      expect(res.body).toHaveProperty("id");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 404 if user does not exist", async () => {
      const res = await request(supertestApp).post("/signin").send({
        email: "nonexistent@example.com",
        password: "Wrongpassword123!",
      });

      expect(res.status).toBe(404);
      expect(res.text).toBe("User input is not valid");
    });

    it("should return 404 if password is incorrect", async () => {
      const res = await request(supertestApp).post("/signin").send({
        email: validUserPayload.email,
        password: "Wrongpassword123!",
      });

      expect(res.status).toBe(404);
      expect(res.text).toBe("User input is not valid");
    });
  });

  describe("POST /signout", () => {
    it("should log out a user and delete the session cookie", async () => {
      const res = await request(supertestApp)
        .post("/signout")
        .set("Cookie", [`session=${mockSessionId}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
      expect(res.headers["set-cookie"][0]).toContain("session=;");
    });

    it("should return 404 if no session is found", async () => {
      const res = await request(supertestApp).post("/signout");

      expect(res.status).toBe(404);
      expect(res.text).toBe("No session found");
    });
  });
});
