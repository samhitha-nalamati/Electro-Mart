import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';
import { Review } from '@shared/schema';
import { apiFetch } from '@/lib/api';

export function useProductReviews(productId: number) {
  return useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: () => apiFetch(buildUrl(api.reviews.list.path, { productId })),
    enabled: !!productId,
  });
}

export function useAllReviews() {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'all'],
    queryFn: () => apiFetch(api.reviews.listAll.path),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...data }: { productId: number, rating: number, comment: string }) => 
      apiFetch(buildUrl(api.reviews.create.path, { productId }), {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'productHealth'] });
    },
  });
}
