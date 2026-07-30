import { makeItemHandlers } from '@/lib/crud';
import { teamConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(teamConfig);
