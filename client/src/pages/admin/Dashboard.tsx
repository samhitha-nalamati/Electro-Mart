import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminStats, useAdminNews } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, DollarSign, Package, Newspaper, BrainCircuit } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: news, isLoading: newsLoading } = useAdminNews();

  // Mock data for charts since backend only returns basic stats
  const revenueData = [
    { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', total: stats?.totalRevenue || 5000 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 65, color: '#22c55e' },
    { name: 'Neutral', value: 25, color: '#eab308' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store's performance and AI insights.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Product</CardTitle>
              <Package className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{stats?.topSellingProduct?.name || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-display">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#121212', border: '1px solid #262626', borderRadius: '8px'}} />
                  <Bar dataKey="total" fill="#00d1ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Sentiment Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent" /> AI Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[300px]">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#121212', border: 'none', borderRadius: '8px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-sm mt-4">
                {sentimentData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech News */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" /> Latest Tech News
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl"></div>)}
              </div>
            ) : (
              <div className="space-y-4">
                {news?.slice(0,5).map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noreferrer" className="block group">
                    <div className="p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <h4 className="font-bold group-hover:text-primary transition-colors">{article.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{article.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
