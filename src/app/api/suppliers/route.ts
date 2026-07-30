import { makeCollectionHandlers } from '@/lib/crud';
import { supplierConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(supplierConfig);
