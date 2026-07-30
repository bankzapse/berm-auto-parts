import { makeCollectionHandlers } from '@/lib/crud';
import { productConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(productConfig);
