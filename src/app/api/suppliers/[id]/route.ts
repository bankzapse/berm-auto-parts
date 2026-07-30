import { makeItemHandlers } from '@/lib/crud';
import { supplierConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(supplierConfig);
