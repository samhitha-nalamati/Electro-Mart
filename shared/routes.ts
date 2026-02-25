import { z } from 'zod';
import { 
  insertUserSchema, insertProductSchema, insertCartItemSchema, 
  insertOrderSchema, insertReviewSchema,
  users, products, cartItems, orders, reviews, orderItems
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      }
    },
    adminLogin: {
      method: 'POST' as const,
      path: '/api/auth/admin-login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: { 200: z.array(z.custom<typeof products.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: { 200: z.custom<typeof products.$inferSelect>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: { 200: z.custom<typeof products.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: { 204: z.void() }
    }
  },
  cart: {
    get: {
      method: 'GET' as const,
      path: '/api/cart' as const,
      responses: { 200: z.array(z.custom<any>()) } // Array of CartItemWithProduct
    },
    add: {
      method: 'POST' as const,
      path: '/api/cart' as const,
      input: z.object({ productId: z.coerce.number(), quantity: z.coerce.number() }),
      responses: { 201: z.custom<typeof cartItems.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cart/:id' as const,
      input: z.object({ quantity: z.coerce.number() }),
      responses: { 200: z.custom<typeof cartItems.$inferSelect>() }
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/cart/:id' as const,
      responses: { 204: z.void() }
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/cart' as const,
      responses: { 204: z.void() }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: { 200: z.array(z.custom<any>()) } // Array of OrderWithItems
    },
    listAll: { // Admin view all orders
      method: 'GET' as const,
      path: '/api/admin/orders' as const,
      responses: { 200: z.array(z.custom<any>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      responses: { 201: z.custom<typeof orders.$inferSelect>(), 400: errorSchemas.validation }
    },
    updateStatus: { // Admin update status
      method: 'PATCH' as const,
      path: '/api/admin/orders/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof orders.$inferSelect>() }
    }
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/products/:productId/reviews' as const,
      responses: { 200: z.array(z.custom<typeof reviews.$inferSelect>()) }
    },
    listAll: { // Admin view all reviews
      method: 'GET' as const,
      path: '/api/admin/reviews' as const,
      responses: { 200: z.array(z.custom<typeof reviews.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products/:productId/reviews' as const,
      input: insertReviewSchema.omit({ productId: true, userId: true }),
      responses: { 201: z.custom<typeof reviews.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalOrders: z.number(),
          totalRevenue: z.number(),
          topSellingProduct: z.any()
        })
      }
    },
    news: {
      method: 'GET' as const,
      path: '/api/admin/news' as const,
      responses: {
        200: z.array(z.object({
          title: z.string(),
          description: z.string(),
          url: z.string()
        }))
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
