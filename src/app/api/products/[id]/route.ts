import { makeItemHandlers } from '@/lib/crud';
import { productConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(productConfig);
