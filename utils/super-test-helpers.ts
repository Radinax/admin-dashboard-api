// tests/helpers.ts
import { Hono } from "hono";
import { ServerResponse, IncomingMessage } from "http";

export function createSupertestApp(app: Hono) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    // Convert the Supertest request into a Fetch API Request object
    const url = new URL(`http://localhost${req.url}`);
    const headers = new Headers();

    // Copy headers from the Supertest request to the Fetch API Request
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, value as string);
      }
    }

    // Read the raw body of the request
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => {
          resolve(data);
        });
        req.on("error", (err) => {
          reject(err);
        });
      });
    }

    // Create a Fetch API Request object
    const honoReq = new Request(url.toString(), {
      method: req.method,
      headers,
      body: body || undefined, // Pass the body as a string or undefined
    });

    try {
      // Pass the Fetch API Request to Hono's fetch method
      const honoRes = await app.fetch(honoReq);

      // Copy headers from the Hono response to the Supertest response
      honoRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Set the status code
      res.statusCode = honoRes.status;

      // Send the body
      const responseBody = await honoRes.text();
      res.end(responseBody);
    } catch (error) {
      console.error("Error in Hono app:", error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  };
}
