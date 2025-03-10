# Admin Dashboard API

A modern, high-performance backend API built with Bun and Hono for managing products and users in an admin dashboard system. This project showcases a robust architecture using cutting-edge technologies for building scalable SAAS applications.

## 🚀 Features

- **Authentication System**
  - User registration with email validation
  - Secure login with session management
  - Password hashing using Argon2id
  - Role-based access control (Admin/User)

- **Product Management**
  - CRUD operations for products
  - Category-based organization
  - Stock tracking and alerts
  - Advanced product statistics
  - Multi-type product support (Electronics, Clothing, Furniture, Food)

- **Data Validation & Security**
  - Request validation using Zod
  - Type-safe database operations with DrizzleORM
  - SQLite with WAL mode for better concurrency
  - CORS protection

## 🛠️ Tech Stack

- **[Bun](https://bun.sh)** - Ultra-fast JavaScript runtime and package manager
- **[Hono](https://hono.dev)** - Lightweight, ultrafast web framework
- **[DrizzleORM](https://orm.drizzle.team)** - TypeScript ORM with great developer experience
- **[SQLite](https://www.sqlite.org)** - Reliable, embedded database
- **[Zod](https://zod.dev)** - TypeScript-first schema validation

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/admin-dashboard-api.git
   cd admin-dashboard-api
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Generate and apply database migrations:
   ```bash
   bun drizzle-kit generate
   bun drizzle-kit migrate
   ```

## 🚀 Running the Application

Start the development server:
```bash
bun run server
```

The API will be available at `http://localhost:5000`.

## 📝 API Documentation

### Authentication Endpoints

- **POST** `/signup`
  ```typescript
  {
    "email": "admin@admin.com",
    "password": "Admin345678.",
    "username": "admin"
  }
  ```

- **POST** `/signin`
  ```typescript
  {
    "email": "admin@admin.com",
    "password": "Admin345678."
  }
  ```

- **POST** `/signout`
- **GET** `/me`

### Product Endpoints

- **POST** `/products/create`
  ```typescript
  {
    "name": "Product Name",
    "type": "electronics" | "clothing" | "furniture" | "food",
    "price": 999.99,
    "description": "Product description",
    "category": "smartphones" | "laptops" | "accessories" | ...,
    "stock": 100
  }
  ```

- **GET** `/products` - List all products
- **GET** `/products/summary` - Get product statistics
- **GET** `/products/:id` - Get product details
- **PUT** `/products/:id` - Update product
- **DELETE** `/products/:id` - Delete product

## 🏗️ Project Structure

```
admin-dashboard-api/
├── db/
│   ├── migrations/    # Database migrations
│   ├── schema.ts     # Database schema definitions
│   └── index.ts      # Database configuration
├── routes/
│   ├── products.ts   # Product routes
│   └── users.ts      # User routes
├── schema/
│   ├── product-schema.ts  # Product validation
│   └── user-schema.ts     # User validation
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── index.ts         # Application entry point
└── drizzle.config.ts # DrizzleORM configuration
```

## 🔧 Development Tools

- View database contents:
  ```bash
  bun drizzle-studio
  ```

- Generate new migrations:
  ```bash
  bun drizzle-kit generate
  ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Related Resources

- [Frontend Repository](https://github.com/Radinax/admin-dashboard-web)
- [Blog Post: Creating a Backend with Bun and Hono](https://adrian-beria-blog.netlify.app/blog/69_creating-a-backend-with-bun-and-hono/)

---

**Built with ❤️ by [Adrian Beria](https://github.com/Radinax)**
