import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const { login, register, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login({ username, password }, isAdminLogin);
    } else {
      register({ username, password });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden items-center justify-center">
        {/* technology neon circuit board dark abstract */}
        <img 
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=1600&fit=crop" 
          alt="Tech Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-primary/10" />
        
        <div className="relative z-10 text-center p-12 max-w-2xl">
          <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-display font-bold text-white mb-6">Welcome to the Future of Tech.</h1>
          <p className="text-xl text-gray-300">Join ElectroMart to experience premium electronics and cutting-edge innovations.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative">
        <Link href="/">
          <Button variant="ghost" className="absolute top-8 left-8 text-muted-foreground">
            ← Back to Store
          </Button>
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isAdminLogin ? 'Admin Portal' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isAdminLogin ? 'Enter your credentials to access the dashboard' : isLogin ? 'Enter your details to sign in' : 'Sign up to start shopping'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="bg-card border-border/50 py-6"
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-card border-border/50 py-6"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full py-6 text-lg shadow-lg shadow-primary/20 mt-4" disabled={isLoading}>
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="pt-6 border-t border-border/50 text-center space-y-4">
            {!isAdminLogin && (
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
            
            {isLogin && (
              <button 
                onClick={() => setIsAdminLogin(!isAdminLogin)} 
                className="flex items-center justify-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                {isAdminLogin ? 'Switch to Customer Login' : 'Admin Login'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
