import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';
import { OrderWithItems } from '@shared/schema';
import { apiFetch } from '@/lib/api';

export function useMyOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ['orders', 'me'],
    queryFn: () => apiFetch(api.orders.list.path),
  });
}

export function useAllOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ['orders', 'all'],
    queryFn: () => apiFetch(api.orders.listAll.path),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(api.orders.create.path, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'productHealth'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiFetch(buildUrl(api.orders.updateStatus.path, { id }), {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}
