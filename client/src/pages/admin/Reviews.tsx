import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAllReviews } from "@/hooks/use-reviews";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminReviews() {
  const { data: reviews, isLoading } = useAllReviews();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Review Sentiment</h1>
          <p className="text-muted-foreground">Monitor customer feedback and AI sentiment analysis.</p>
        </div>

        <div className="grid gap-4">
          {reviews?.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((review) => (
            <div key={review.id} className="bg-card border border-border/50 p-5 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">• Product {review.productId} • User {review.userId}</span>
                </div>
                <p className="text-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt!), 'MMM d, yyyy h:mm a')}</p>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">AI Sentiment</span>
                <Badge className={`
                  ${review.sentiment === 'positive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    review.sentiment === 'negative' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                `}>
                  {review.sentiment.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
