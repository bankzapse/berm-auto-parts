import { makeItemHandlers } from '@/lib/crud';
import { galleryConfig } from '@/lib/crudConfig';

export const { PUT, DELETE } = makeItemHandlers(galleryConfig);
