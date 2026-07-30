import { makeItemHandlers } from '@/lib/crud';
import { customerConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(customerConfig);
