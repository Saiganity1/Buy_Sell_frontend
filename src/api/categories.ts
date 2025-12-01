import { api } from './client';

export interface Category { id: number; name: string }

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories/');
  return data;
}
