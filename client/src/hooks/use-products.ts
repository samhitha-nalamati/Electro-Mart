import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildUrl } from '@shared/routes';
import { Product, InsertProduct } from '@shared/schema';
import { apiFetch } from '@/lib/api';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiFetch(api.products.list.path),
  });
}

export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => apiFetch(buildUrl(api.products.get.path, { id })),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertProduct) => apiFetch(api.products.create.path, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<InsertProduct> }) => 
      apiFetch(buildUrl(api.products.update.path, { id }), {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(buildUrl(api.products.delete.path, { id }), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
