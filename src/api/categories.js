import { api } from './client';

export async function fetchCategories() {
  try {
    const { data } = await api.get('/categories/');
    return data;
  } catch {
    return [];
  }
}
