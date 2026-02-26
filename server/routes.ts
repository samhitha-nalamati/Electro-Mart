import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback_secret";

// Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  next();
}

// Sentiment analysis helper
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const textLower = text.toLowerCase();
  const positiveWords = ['good', 'great', 'best', 'excellent', 'amazing', 'worth', 'perfect'];
  const negativeWords = ['bad', 'poor', 'worst', 'waste', 'broken', 'slow', 'damaged'];
  
  let posCount = 0;
  let negCount = 0;
  
  positiveWords.forEach(w => { if(textLower.includes(w)) posCount++; });
  negativeWords.forEach(w => { if(textLower.includes(w)) negCount++; });
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) return res.status(400).json({ message: "Username already exists" });

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user });
    } catch (e) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ message: "Error logging in" });
    }
  });

  app.post(api.auth.adminLogin.path, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.role !== 'admin' || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user });
    } catch (e) {
      res.status(400).json({ message: "Error logging in" });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req: any, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    res.json(await storage.getProducts());
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  });

  app.post(api.products.create.path, authenticateToken, requireAdmin, async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.put(api.products.update.path, authenticateToken, requireAdmin, async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  app.delete(api.products.delete.path, authenticateToken, requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // Cart
  app.get(api.cart.get.path, authenticateToken, async (req: any, res) => {
    res.json(await storage.getCart(req.user.id));
  });

  app.post(api.cart.add.path, authenticateToken, async (req: any, res) => {
    const item = await storage.addToCart({ userId: req.user.id, ...req.body });
    res.status(201).json(item);
  });

  app.put(api.cart.update.path, authenticateToken, async (req: any, res) => {
    const item = await storage.updateCartItem(Number(req.params.id), req.body.quantity);
    res.json(item);
  });

  app.delete(api.cart.remove.path, authenticateToken, async (req: any, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).send();
  });

  app.delete(api.cart.clear.path, authenticateToken, async (req: any, res) => {
    await storage.clearCart(req.user.id);
    res.status(204).send();
  });

  // Orders
  app.get(api.orders.list.path, authenticateToken, async (req: any, res) => {
    res.json(await storage.getOrders(req.user.id));
  });

  app.get(api.orders.listAll.path, authenticateToken, requireAdmin, async (req, res) => {
    res.json(await storage.getAllOrders());
  });

  app.post(api.orders.create.path, authenticateToken, async (req: any, res) => {
    const cart = await storage.getCart(req.user.id);
    if (!cart.length) return res.status(400).json({ message: "Cart is empty" });
    
    let total = 0;
    const items = cart.map(c => {
      total += parseFloat(c.product.price.toString()) * c.quantity;
      return { productId: c.productId, quantity: c.quantity, priceAtTime: c.product.price.toString() };
    });

    const order = await storage.createOrder(
      { userId: req.user.id, totalPrice: total.toString(), status: "Pending" },
      items
    );
    await storage.clearCart(req.user.id);
    res.status(201).json(order);
  });

  app.patch(api.orders.updateStatus.path, authenticateToken, requireAdmin, async (req, res) => {
    const order = await storage.updateOrderStatus(Number(req.params.id), req.body.status);
    res.json(order);
  });

  // Reviews
  app.get(api.reviews.list.path, async (req, res) => {
    res.json(await storage.getReviews(Number(req.params.productId)));
  });

  app.get(api.reviews.listAll.path, authenticateToken, requireAdmin, async (req, res) => {
    res.json(await storage.getAllReviews());
  });

  app.post(api.reviews.create.path, authenticateToken, async (req: any, res) => {
    const sentiment = analyzeSentiment(req.body.comment);
    const review = await storage.createReview({
      ...req.body,
      userId: req.user.id,
      productId: Number(req.params.productId),
      sentiment
    });
    res.status(201).json(review);
  });

  // Admin
  app.get(api.admin.stats.path, authenticateToken, requireAdmin, async (req, res) => {
    res.json(await storage.getAdminStats());
  });

  app.get(api.admin.news.path, authenticateToken, requireAdmin, async (req, res) => {
    // Top 5 tech news headlines
    try {
      const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
      const ids = await response.json() as number[];
      const top5 = await Promise.all(ids.slice(0, 5).map(async id => {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return await itemRes.json();
      }));
      res.json(top5.map((item: any) => ({
        title: item.title,
        description: `Posted by ${item.by} with ${item.score} points`,
        url: item.url
      })));
    } catch (e) {
      res.json([]);
    }
  });
  // Product Health Recommendation
  app.get(api.admin.productHealth.path, authenticateToken, requireAdmin, async (req, res) => {
    const products = await storage.getProducts();
    const reviews = await storage.getAllReviews();
    const orders = await storage.getAllOrders();

    // Revenue per product
    const revenueMap: Record<number, number> = {};
    products.forEach(p => revenueMap[p.id] = 0);

    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        revenueMap[item.productId] += parseFloat(item.priceAtTime) * item.quantity;
      });
    });

    const avgRevenue = products.length > 0 ?
      Object.values(revenueMap).reduce((a, b) => a + b, 0) / products.length : 0;

    const productHealth = products.map(product => {
      const productReviews = reviews.filter(r => r.productId === product.id);
      const negativeCount = productReviews.filter(r => r.sentiment === "negative").length;
      const negativePercent =
        productReviews.length > 0 ? negativeCount / productReviews.length : 0;

      const revenue = revenueMap[product.id] || 0;
      const highStock = product.stock > 20;
      const lowRevenue = revenue < avgRevenue;

      let status: 'Healthy' | 'Monitor' | 'Replace' = "Healthy";

      if (negativePercent > 0.4 && highStock && lowRevenue) {
        status = "Replace";
      } else if (negativePercent > 0.25 || revenue < avgRevenue * 0.5) {
        status = "Monitor";
      }

      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        revenue,
        negativePercent: (negativePercent * 100).toFixed(1),
        status
      };
    });

    res.json(productHealth);
  });
  // Call Seed at startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createUser({ username: "admin", password: hashedPassword, role: "admin" });
  }

  const products = await storage.getProducts();
  if (products.length === 0) {
    await storage.createProduct({
      name: "Wireless Earbuds",
      description: "High quality noise-canceling wireless earbuds.",
      price: "129.99",
      category: "Audio",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
      stock: 50,
    });
    await storage.createProduct({
      name: "4K Monitor",
      description: "Ultra HD computer monitor with accurate colors.",
      price: "299.00",
      category: "Displays",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop",
      stock: 15,
    });
    await storage.createProduct({
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard with tactile switches.",
      price: "89.50",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop",
      stock: 0,
    });
  }
}
