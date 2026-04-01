import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  pgEnum,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────
// CUSTOM TYPES
// ─────────────────────────────────────────────
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['BUYER', 'SELLER', 'PROVIDER', 'ADMIN']);
export const listingTypeEnum = pgEnum('listing_type', ['CAR', 'PART', 'SERVICE']);
export const listingStatusEnum = pgEnum('listing_status', ['ACTIVE', 'INACTIVE', 'SOLD', 'PENDING_REVIEW']);
export const carConditionEnum = pgEnum('car_condition', ['NUEVO', 'USADO']);
export const fuelTypeEnum = pgEnum('fuel_type', ['GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNV', 'GLP']);
export const transmissionEnum = pgEnum('transmission', ['MANUAL', 'AUTOMATICO', 'CVT']);
export const partConditionEnum = pgEnum('part_condition', ['NUEVO', 'USADO', 'REMANUFACTURADO']);
export const serviceTypeEnum = pgEnum('service_type', [
  'MECANICO', 'PINTURA', 'GRUA', 'CHOFER', 'LAVADO',
  'INSPECCION', 'TRAMITE', 'ELECTRICO', 'DESABOLLADO', 'OTRO',
]);
export const bookingStatusEnum = pgEnum('booking_status', [
  'PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED',
]);
export const verificationStatusEnum = pgEnum('verification_status', ['PENDING', 'VERIFIED', 'SUSPENDED']);
export const towingServiceTypeEnum = pgEnum('towing_service_type', ['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']);

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('BUYER'),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  foto: text('foto'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// better-auth tables
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────
export const listings = pgTable('listings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sellerId: text('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tipo: listingTypeEnum('tipo').notNull(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion').notNull(),
  precio: decimal('precio', { precision: 12, scale: 2 }).notNull(),
  estado: listingStatusEnum('estado').notNull().default('PENDING_REVIEW'),
  fotos: jsonb('fotos').$type<string[]>().default([]),
  ubicacion: text('ubicacion'),
  distrito: text('distrito'),
  departamento: text('departamento').default('Lima'),
  latitud: decimal('latitud', { precision: 10, scale: 7 }),
  longitud: decimal('longitud', { precision: 10, scale: 7 }),
  searchVector: tsvector('search_vector'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sellerIdx: index('listings_seller_idx').on(table.sellerId),
  tipoIdx: index('listings_tipo_idx').on(table.tipo),
  estadoIdx: index('listings_estado_idx').on(table.estado),
  distritoIdx: index('listings_distrito_idx').on(table.distrito),
  precioIdx: index('listings_precio_idx').on(table.precio),
  searchVectorIdx: index('listings_search_vector_idx').using('gin', table.searchVector),
}));

export const carDetails = pgTable('car_details', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  listingId: text('listing_id').notNull().unique().references(() => listings.id, { onDelete: 'cascade' }),
  marca: text('marca').notNull(),
  modelo: text('modelo').notNull(),
  anio: integer('anio').notNull(),
  kilometraje: integer('kilometraje').notNull().default(0),
  combustible: fuelTypeEnum('combustible').notNull(),
  transmision: transmissionEnum('transmision').notNull(),
  color: text('color'),
  condicion: carConditionEnum('condicion').notNull().default('USADO'),
  numeroPuertas: integer('numero_puertas').default(4),
  motor: text('motor'),
  vin: text('vin'),
}, (table) => ({
  marcaIdx: index('car_marca_idx').on(table.marca),
  modeloIdx: index('car_modelo_idx').on(table.modelo),
  anioIdx: index('car_anio_idx').on(table.anio),
}));

export const partDetails = pgTable('part_details', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  listingId: text('listing_id').notNull().unique().references(() => listings.id, { onDelete: 'cascade' }),
  marcaCompatible: text('marca_compatible'),
  modeloCompatible: text('modelo_compatible'),
  anioDesde: integer('anio_desde'),
  anioHasta: integer('anio_hasta'),
  condicion: partConditionEnum('condicion').notNull().default('NUEVO'),
  stock: integer('stock').notNull().default(1),
  numeroParte: text('numero_parte'),
  peso: decimal('peso', { precision: 8, scale: 3 }),
}, (table) => ({
  marcaCompatIdx: index('part_marca_compat_idx').on(table.marcaCompatible),
  condicionIdx: index('part_condicion_idx').on(table.condicion),
}));

export const serviceDetails = pgTable('service_details', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  listingId: text('listing_id').notNull().unique().references(() => listings.id, { onDelete: 'cascade' }),
  tipoServicio: serviceTypeEnum('tipo_servicio').notNull(),
  tiempoEstimado: text('tiempo_estimado'),
  zonas: jsonb('zonas').$type<string[]>().default([]),
  disponibilidad: jsonb('disponibilidad').$type<Record<string, string[]>>().default({}),
  precioBase: decimal('precio_base', { precision: 10, scale: 2 }),
  incluyeDesplazamiento: boolean('incluye_desplazamiento').default(false),
}, (table) => ({
  tipoServicioIdx: index('service_tipo_idx').on(table.tipoServicio),
}));

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text('client_id').notNull().references(() => users.id),
  listingId: text('listing_id').notNull().references(() => listings.id),
  providerId: text('provider_id').notNull().references(() => users.id),
  monto: decimal('monto', { precision: 12, scale: 2 }).notNull(),
  comision: decimal('comision', { precision: 12, scale: 2 }).notNull(),
  montoProveedor: decimal('monto_proveedor', { precision: 12, scale: 2 }).notNull(),
  estado: bookingStatusEnum('estado').notNull().default('PENDING_PAYMENT'),
  escrowId: text('escrow_id'),
  culqiChargeId: text('culqi_charge_id'),
  notas: text('notas'),
  fechaServicio: timestamp('fecha_servicio'),
  autoReleaseAt: timestamp('auto_release_at'),
  disputaRazon: text('disputa_razon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('bookings_client_idx').on(table.clientId),
  listingIdx: index('bookings_listing_idx').on(table.listingId),
  estadoIdx: index('bookings_estado_idx').on(table.estado),
  autoReleaseIdx: index('bookings_auto_release_idx').on(table.autoReleaseAt),
}));

// ─────────────────────────────────────────────
// DRIVER PROFILES
// ─────────────────────────────────────────────
export const driverProfiles = pgTable('driver_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  licenciaNumero: text('licencia_numero'),
  licenciaCategoria: text('licencia_categoria').default('A-IIb'),
  zonas: jsonb('zonas').$type<string[]>().default([]),
  precioHora: decimal('precio_hora', { precision: 8, scale: 2 }).notNull(),
  disponibilidad: jsonb('disponibilidad').$type<Record<string, string[]>>().default({}),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('driver_user_idx').on(table.userId),
  activoIdx: index('driver_activo_idx').on(table.activo),
}));

// ─────────────────────────────────────────────
// TOWING PROFILES
// ─────────────────────────────────────────────
export const towingProfiles = pgTable('towing_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  nombreEmpresa: text('nombre_empresa'),
  zonas: jsonb('zonas').$type<string[]>().default([]),
  servicios: jsonb('servicios').$type<{
    tipo: string;
    precioBase: number;
    precioPorKm?: number;
  }[]>().default([]),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('booking_id').notNull().unique().references(() => bookings.id, { onDelete: 'cascade' }),
  reviewerId: text('reviewer_id').notNull().references(() => users.id),
  reviewedId: text('reviewed_id').notNull().references(() => users.id),
  listingId: text('listing_id').references(() => listings.id),
  rating: integer('rating').notNull(),
  comentario: text('comentario'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  reviewedIdx: index('reviews_reviewed_idx').on(table.reviewedId),
  listingIdx: index('reviews_listing_idx').on(table.listingId),
}));

// ─────────────────────────────────────────────
// PROVIDER VERIFICATIONS
// ─────────────────────────────────────────────
export const providerVerifications = pgTable('provider_verifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tipoDocumento: text('tipo_documento').notNull().default('DNI'),
  numeroDocumento: text('numero_documento').notNull(),
  fotoDocumento: text('foto_documento'),
  fotoSelfie: text('foto_selfie'),
  estado: verificationStatusEnum('estado').notNull().default('PENDING'),
  adminNotes: text('admin_notes'),
  revisadoPor: text('revisado_por').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('verif_user_idx').on(table.userId),
  estadoIdx: index('verif_estado_idx').on(table.estado),
}));

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje').notNull(),
  tipo: text('tipo').notNull(),
  leida: boolean('leida').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notif_user_idx').on(table.userId),
  leidaIdx: index('notif_leida_idx').on(table.leida),
}));

// ─────────────────────────────────────────────
// RELATIONS (required for Drizzle relational queries)
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sessions: many(sessions),
  accounts: many(accounts),
  driverProfile: many(driverProfiles),
  towingProfile: many(towingProfiles),
  notifications: many(notifications),
  bookingsAsClient: many(bookings, { relationName: 'client' }),
  bookingsAsProvider: many(bookings, { relationName: 'provider' }),
  reviewsGiven: many(reviews, { relationName: 'reviewer' }),
  reviewsReceived: many(reviews, { relationName: 'reviewed' }),
  providerVerifications: many(providerVerifications),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, { fields: [listings.sellerId], references: [users.id] }),
  carDetail: one(carDetails),
  partDetail: one(partDetails),
  serviceDetail: one(serviceDetails),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const carDetailsRelations = relations(carDetails, ({ one }) => ({
  listing: one(listings, { fields: [carDetails.listingId], references: [listings.id] }),
}));

export const partDetailsRelations = relations(partDetails, ({ one }) => ({
  listing: one(listings, { fields: [partDetails.listingId], references: [listings.id] }),
}));

export const serviceDetailsRelations = relations(serviceDetails, ({ one }) => ({
  listing: one(listings, { fields: [serviceDetails.listingId], references: [listings.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(users, { fields: [bookings.clientId], references: [users.id], relationName: 'client' }),
  provider: one(users, { fields: [bookings.providerId], references: [users.id], relationName: 'provider' }),
  listing: one(listings, { fields: [bookings.listingId], references: [listings.id] }),
}));

export const driverProfilesRelations = relations(driverProfiles, ({ one }) => ({
  user: one(users, { fields: [driverProfiles.userId], references: [users.id] }),
}));

export const towingProfilesRelations = relations(towingProfiles, ({ one }) => ({
  user: one(users, { fields: [towingProfiles.userId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: 'reviewer' }),
  reviewed: one(users, { fields: [reviews.reviewedId], references: [users.id], relationName: 'reviewed' }),
  listing: one(listings, { fields: [reviews.listingId], references: [listings.id] }),
}));

export const providerVerificationsRelations = relations(providerVerifications, ({ one }) => ({
  user: one(users, { fields: [providerVerifications.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
