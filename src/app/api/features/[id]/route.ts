import { makeItemHandlers } from '@/lib/crud';
import { featureConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(featureConfig);
