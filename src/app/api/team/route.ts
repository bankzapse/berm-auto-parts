import { makeCollectionHandlers } from '@/lib/crud';
import { teamConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(teamConfig);
