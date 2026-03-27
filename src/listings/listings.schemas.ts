import { z } from 'zod';

export const CreateCarListingSchema = z.object({
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(20).max(5000),
  precio: z.number().positive(),
  fotos: z.array(z.string().url()).max(20).default([]),
  ubicacion: z.string().optional(),
  distrito: z.string().optional(),
  departamento: z.string().default('Lima'),
  latitud: z.number().min(-90).max(90).optional(),
  longitud: z.number().min(-180).max(180).optional(),
  // Car specific
  marca: z.string().min(1).max(50),
  modelo: z.string().min(1).max(100),
  anio: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  kilometraje: z.number().int().min(0).default(0),
  combustible: z.enum(['GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNV', 'GLP']),
  transmision: z.enum(['MANUAL', 'AUTOMATICO', 'CVT']),
  color: z.string().optional(),
  condicion: z.enum(['NUEVO', 'USADO']).default('USADO'),
  numeroPuertas: z.number().int().min(2).max(5).default(4),
  motor: z.string().optional(),
  vin: z.string().optional(),
});

export const CreatePartListingSchema = z.object({
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(10).max(5000),
  precio: z.number().positive(),
  fotos: z.array(z.string().url()).max(10).default([]),
  ubicacion: z.string().optional(),
  distrito: z.string().optional(),
  departamento: z.string().default('Lima'),
  // Part specific
  marcaCompatible: z.string().optional(),
  modeloCompatible: z.string().optional(),
  anioDesde: z.number().int().optional(),
  anioHasta: z.number().int().optional(),
  condicion: z.enum(['NUEVO', 'USADO', 'REMANUFACTURADO']).default('NUEVO'),
  stock: z.number().int().min(1).default(1),
  numeroParte: z.string().optional(),
  peso: z.number().positive().optional(),
});

export const CreateServiceListingSchema = z.object({
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(20).max(5000),
  precio: z.number().positive(),
  fotos: z.array(z.string().url()).max(10).default([]),
  ubicacion: z.string().optional(),
  distrito: z.string().optional(),
  departamento: z.string().default('Lima'),
  // Service specific
  tipoServicio: z.enum([
    'MECANICO', 'PINTURA', 'GRUA', 'CHOFER', 'LAVADO',
    'INSPECCION', 'TRAMITE', 'ELECTRICO', 'DESABOLLADO', 'OTRO',
  ]),
  tiempoEstimado: z.string().optional(),
  zonas: z.array(z.string()).default([]),
  disponibilidad: z.record(z.array(z.string())).default({}),
  precioBase: z.number().positive().optional(),
  incluyeDesplazamiento: z.boolean().default(false),
});

export const UpdateListingSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(10).max(5000).optional(),
  precio: z.number().positive().optional(),
  fotos: z.array(z.string().url()).max(20).optional(),
  estado: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  ubicacion: z.string().optional(),
  distrito: z.string().optional(),
});

export const ListingsQuerySchema = z.object({
  tipo: z.enum(['CAR', 'PART', 'SERVICE']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  distrito: z.string().optional(),
  departamento: z.string().optional(),
  precioMin: z.coerce.number().optional(),
  precioMax: z.coerce.number().optional(),
  // Car filters
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anioMin: z.coerce.number().int().optional(),
  anioMax: z.coerce.number().int().optional(),
  combustible: z.string().optional(),
  transmision: z.string().optional(),
  condicion: z.string().optional(),
  // Service filters
  tipoServicio: z.string().optional(),
  ratingMin: z.coerce.number().min(0).max(5).optional(),
  // Part filters
  marcaCompatible: z.string().optional(),
  q: z.string().max(200).optional(),
});

export type CreateCarListingDto = z.infer<typeof CreateCarListingSchema>;
export type CreatePartListingDto = z.infer<typeof CreatePartListingSchema>;
export type CreateServiceListingDto = z.infer<typeof CreateServiceListingSchema>;
export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;
export type ListingsQueryDto = z.infer<typeof ListingsQuerySchema>;
