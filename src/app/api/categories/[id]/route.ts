import { makeItemHandlers } from '@/lib/crud';
import { categoryConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(categoryConfig);
