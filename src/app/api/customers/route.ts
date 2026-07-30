import { makeCollectionHandlers } from '@/lib/crud';
import { customerConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(customerConfig);
