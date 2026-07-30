import { makeCollectionHandlers } from '@/lib/crud';
import { featureConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(featureConfig);
