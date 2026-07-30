import { makeCollectionHandlers } from '@/lib/crud';
import { categoryConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(categoryConfig);
