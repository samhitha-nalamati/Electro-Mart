import { db } from "./db";
import { 
  users, products, cartItems, orders, orderItems, reviews,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Review, type InsertReview
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  getCart(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  getOrders(userId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  getReviews(productId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  getAdminStats(): Promise<{ totalUsers: number; totalOrders: number; totalRevenue: number; topSellingProduct: any }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCart(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    const productsData = await db.select().from(products);
    return items.map(item => ({
      ...item,
      product: productsData.find(p => p.id === item.productId)!
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrders(userId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    return this._fetchOrderItems(userOrders);
  }

  async getAllOrders(): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const allOrders = await db.select().from(orders);
    return this._fetchOrderItems(allOrders);
  }

  private async _fetchOrderItems(orderList: Order[]) {
    const productsData = await db.select().from(products);
    const result = [];
    for (const order of orderList) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({
        ...order,
        items: items.map(item => ({
          ...item,
          product: productsData.find(p => p.id === item.productId)!
        }))
      });
    }
    return result;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      for (const item of items) {
        await tx.insert(orderItems).values({ ...item, orderId: newOrder.id });
        
        // deduct stock
        const [prod] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (prod) {
           await tx.update(products).set({ stock: Math.max(0, prod.stock - item.quantity) }).where(eq(products.id, prod.id));
        }
      }
      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update product sentiment & average rating
    const allReviews = await this.getReviews(review.productId);
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    let pos = 0, neu = 0, neg = 0;
    allReviews.forEach(r => {
       if (r.sentiment === 'positive') pos++;
       else if (r.sentiment === 'negative') neg++;
       else neu++;
    });

    await db.update(products).set({ 
      averageRating: avg.toString(),
      sentimentStats: { positive: pos, neutral: neu, negative: neg }
    }).where(eq(products.id, review.productId));

    return newReview;
  }

  async getAdminStats() {
    const allUsers = await db.select().from(users);
    const allOrders = await db.select().from(orders);
    
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice.toString()), 0);
    
    const items = await db.select().from(orderItems);
    const salesMap: Record<number, number> = {};
    items.forEach(i => {
      salesMap[i.productId] = (salesMap[i.productId] || 0) + i.quantity;
    });
    
    let topProductId = null;
    let max = 0;
    for (const [pId, qty] of Object.entries(salesMap)) {
      if (qty > max) {
        max = qty;
        topProductId = parseInt(pId);
      }
    }
    
    let topProduct = null;
    if (topProductId) {
       topProduct = await this.getProduct(topProductId);
    }

    return {
      totalUsers: allUsers.length,
      totalOrders: allOrders.length,
      totalRevenue,
      topSellingProduct: topProduct
    };
  }
}

export const storage = new DatabaseStorage();
