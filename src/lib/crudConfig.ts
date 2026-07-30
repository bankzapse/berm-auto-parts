import type { CrudConfig } from './crud';

export const productConfig: CrudConfig = {
  model: 'product',
  fields: {
    name: 'string',
    description: 'string',
    price: 'floatOrNull',
    cost: 'floatOrNull',
    priceLabel: 'string',
    brand: 'string',
    sku: 'string',
    unit: 'string',
    lowStock: 'number',
    image: 'string',
    inStock: 'boolean',
    featured: 'boolean',
    order: 'number',
    categoryId: 'stringOrNull',
  },
  orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  include: { category: true },
};

export const categoryConfig: CrudConfig = {
  model: 'category',
  fields: {
    slug: 'string',
    name: 'string',
    description: 'string',
    icon: 'string',
    image: 'string',
    order: 'number',
  },
  orderBy: { order: 'asc' },
};

export const galleryConfig: CrudConfig = {
  model: 'galleryImage',
  fields: {
    url: 'string',
    caption: 'string',
    order: 'number',
  },
  orderBy: { order: 'asc' },
};

export const teamConfig: CrudConfig = {
  model: 'teamMember',
  fields: {
    name: 'string',
    role: 'string',
    bio: 'string',
    image: 'string',
    phone: 'string',
    order: 'number',
  },
  orderBy: { order: 'asc' },
};

export const featureConfig: CrudConfig = {
  model: 'feature',
  fields: {
    title: 'string',
    description: 'string',
    icon: 'string',
    order: 'number',
  },
  orderBy: { order: 'asc' },
};
