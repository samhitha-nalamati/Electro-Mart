import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { apiFetch } from '@/lib/api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch(api.admin.stats.path),
  });
}
export function useProductHealth() {
  return useQuery({
    queryKey: ["admin", "productHealth"],
    queryFn: () => apiFetch(api.admin.productHealth.path),
  });
}
export function useAdminNews() {
  return useQuery<{title: string, description: string, url: string}[]>({
    queryKey: ['admin', 'news'],
    queryFn: () => apiFetch(api.admin.news.path),
  });
}
