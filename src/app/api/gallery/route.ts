import { makeCollectionHandlers } from '@/lib/crud';
import { galleryConfig } from '@/lib/crudConfig';

export const { GET, POST } = makeCollectionHandlers(galleryConfig);
