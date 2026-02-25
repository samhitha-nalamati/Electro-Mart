import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';
import { CartItemWithProduct } from '@shared/schema';
import { apiFetch } from '@/lib/api';

export function useCart() {
  return useQuery<CartItemWithProduct[]>({
    queryKey: ['cart'],
    queryFn: () => apiFetch(api.cart.get.path),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: number, quantity: number }) => 
      apiFetch(api.cart.add.path, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number, quantity: number }) => 
      apiFetch(buildUrl(api.cart.update.path, { id }), {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      apiFetch(buildUrl(api.cart.remove.path, { id }), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(api.cart.clear.path, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}
