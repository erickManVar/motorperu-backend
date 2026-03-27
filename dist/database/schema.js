"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = exports.providerVerifications = exports.reviews = exports.towingProfiles = exports.driverProfiles = exports.bookings = exports.serviceDetails = exports.partDetails = exports.carDetails = exports.listings = exports.verifications = exports.accounts = exports.sessions = exports.users = exports.towingServiceTypeEnum = exports.verificationStatusEnum = exports.bookingStatusEnum = exports.serviceTypeEnum = exports.partConditionEnum = exports.transmissionEnum = exports.fuelTypeEnum = exports.carConditionEnum = exports.listingStatusEnum = exports.listingTypeEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const tsvector = (0, pg_core_1.customType)({
    dataType() {
        return 'tsvector';
    },
});
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['BUYER', 'SELLER', 'PROVIDER', 'ADMIN']);
exports.listingTypeEnum = (0, pg_core_1.pgEnum)('listing_type', ['CAR', 'PART', 'SERVICE']);
exports.listingStatusEnum = (0, pg_core_1.pgEnum)('listing_status', ['ACTIVE', 'INACTIVE', 'SOLD', 'PENDING_REVIEW']);
exports.carConditionEnum = (0, pg_core_1.pgEnum)('car_condition', ['NUEVO', 'USADO']);
exports.fuelTypeEnum = (0, pg_core_1.pgEnum)('fuel_type', ['GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNV', 'GLP']);
exports.transmissionEnum = (0, pg_core_1.pgEnum)('transmission', ['MANUAL', 'AUTOMATICO', 'CVT']);
exports.partConditionEnum = (0, pg_core_1.pgEnum)('part_condition', ['NUEVO', 'USADO', 'REMANUFACTURADO']);
exports.serviceTypeEnum = (0, pg_core_1.pgEnum)('service_type', [
    'MECANICO', 'PINTURA', 'GRUA', 'CHOFER', 'LAVADO',
    'INSPECCION', 'TRAMITE', 'ELECTRICO', 'DESABOLLADO', 'OTRO',
]);
exports.bookingStatusEnum = (0, pg_core_1.pgEnum)('booking_status', [
    'PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED',
]);
exports.verificationStatusEnum = (0, pg_core_1.pgEnum)('verification_status', ['PENDING', 'VERIFIED', 'SUSPENDED']);
exports.towingServiceTypeEnum = (0, pg_core_1.pgEnum)('towing_service_type', ['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash'),
    role: (0, exports.userRoleEnum)('role').notNull().default('BUYER'),
    nombre: (0, pg_core_1.text)('nombre').notNull(),
    telefono: (0, pg_core_1.text)('telefono'),
    foto: (0, pg_core_1.text)('foto'),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.text)('token').notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.accounts = (0, pg_core_1.pgTable)('accounts', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    accountId: (0, pg_core_1.text)('account_id').notNull(),
    providerId: (0, pg_core_1.text)('provider_id').notNull(),
    accessToken: (0, pg_core_1.text)('access_token'),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    idToken: (0, pg_core_1.text)('id_token'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    password: (0, pg_core_1.text)('password'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.verifications = (0, pg_core_1.pgTable)('verifications', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    identifier: (0, pg_core_1.text)('identifier').notNull(),
    value: (0, pg_core_1.text)('value').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.listings = (0, pg_core_1.pgTable)('listings', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    sellerId: (0, pg_core_1.text)('seller_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    tipo: (0, exports.listingTypeEnum)('tipo').notNull(),
    titulo: (0, pg_core_1.text)('titulo').notNull(),
    descripcion: (0, pg_core_1.text)('descripcion').notNull(),
    precio: (0, pg_core_1.decimal)('precio', { precision: 12, scale: 2 }).notNull(),
    estado: (0, exports.listingStatusEnum)('estado').notNull().default('PENDING_REVIEW'),
    fotos: (0, pg_core_1.jsonb)('fotos').$type().default([]),
    ubicacion: (0, pg_core_1.text)('ubicacion'),
    distrito: (0, pg_core_1.text)('distrito'),
    departamento: (0, pg_core_1.text)('departamento').default('Lima'),
    latitud: (0, pg_core_1.decimal)('latitud', { precision: 10, scale: 7 }),
    longitud: (0, pg_core_1.decimal)('longitud', { precision: 10, scale: 7 }),
    searchVector: tsvector('search_vector'),
    viewCount: (0, pg_core_1.integer)('view_count').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    sellerIdx: (0, pg_core_1.index)('listings_seller_idx').on(table.sellerId),
    tipoIdx: (0, pg_core_1.index)('listings_tipo_idx').on(table.tipo),
    estadoIdx: (0, pg_core_1.index)('listings_estado_idx').on(table.estado),
    distritoIdx: (0, pg_core_1.index)('listings_distrito_idx').on(table.distrito),
    precioIdx: (0, pg_core_1.index)('listings_precio_idx').on(table.precio),
    searchVectorIdx: (0, pg_core_1.index)('listings_search_vector_idx').using('gin', table.searchVector),
}));
exports.carDetails = (0, pg_core_1.pgTable)('car_details', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    listingId: (0, pg_core_1.text)('listing_id').notNull().unique().references(() => exports.listings.id, { onDelete: 'cascade' }),
    marca: (0, pg_core_1.text)('marca').notNull(),
    modelo: (0, pg_core_1.text)('modelo').notNull(),
    anio: (0, pg_core_1.integer)('anio').notNull(),
    kilometraje: (0, pg_core_1.integer)('kilometraje').notNull().default(0),
    combustible: (0, exports.fuelTypeEnum)('combustible').notNull(),
    transmision: (0, exports.transmissionEnum)('transmision').notNull(),
    color: (0, pg_core_1.text)('color'),
    condicion: (0, exports.carConditionEnum)('condicion').notNull().default('USADO'),
    numeroPuertas: (0, pg_core_1.integer)('numero_puertas').default(4),
    motor: (0, pg_core_1.text)('motor'),
    vin: (0, pg_core_1.text)('vin'),
}, (table) => ({
    marcaIdx: (0, pg_core_1.index)('car_marca_idx').on(table.marca),
    modeloIdx: (0, pg_core_1.index)('car_modelo_idx').on(table.modelo),
    anioIdx: (0, pg_core_1.index)('car_anio_idx').on(table.anio),
}));
exports.partDetails = (0, pg_core_1.pgTable)('part_details', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    listingId: (0, pg_core_1.text)('listing_id').notNull().unique().references(() => exports.listings.id, { onDelete: 'cascade' }),
    marcaCompatible: (0, pg_core_1.text)('marca_compatible'),
    modeloCompatible: (0, pg_core_1.text)('modelo_compatible'),
    anioDesde: (0, pg_core_1.integer)('anio_desde'),
    anioHasta: (0, pg_core_1.integer)('anio_hasta'),
    condicion: (0, exports.partConditionEnum)('condicion').notNull().default('NUEVO'),
    stock: (0, pg_core_1.integer)('stock').notNull().default(1),
    numeroParte: (0, pg_core_1.text)('numero_parte'),
    peso: (0, pg_core_1.decimal)('peso', { precision: 8, scale: 3 }),
}, (table) => ({
    marcaCompatIdx: (0, pg_core_1.index)('part_marca_compat_idx').on(table.marcaCompatible),
    condicionIdx: (0, pg_core_1.index)('part_condicion_idx').on(table.condicion),
}));
exports.serviceDetails = (0, pg_core_1.pgTable)('service_details', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    listingId: (0, pg_core_1.text)('listing_id').notNull().unique().references(() => exports.listings.id, { onDelete: 'cascade' }),
    tipoServicio: (0, exports.serviceTypeEnum)('tipo_servicio').notNull(),
    tiempoEstimado: (0, pg_core_1.text)('tiempo_estimado'),
    zonas: (0, pg_core_1.jsonb)('zonas').$type().default([]),
    disponibilidad: (0, pg_core_1.jsonb)('disponibilidad').$type().default({}),
    precioBase: (0, pg_core_1.decimal)('precio_base', { precision: 10, scale: 2 }),
    incluyeDesplazamiento: (0, pg_core_1.boolean)('incluye_desplazamiento').default(false),
}, (table) => ({
    tipoServicioIdx: (0, pg_core_1.index)('service_tipo_idx').on(table.tipoServicio),
}));
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    clientId: (0, pg_core_1.text)('client_id').notNull().references(() => exports.users.id),
    listingId: (0, pg_core_1.text)('listing_id').notNull().references(() => exports.listings.id),
    providerId: (0, pg_core_1.text)('provider_id').notNull().references(() => exports.users.id),
    monto: (0, pg_core_1.decimal)('monto', { precision: 12, scale: 2 }).notNull(),
    comision: (0, pg_core_1.decimal)('comision', { precision: 12, scale: 2 }).notNull(),
    montoProveedor: (0, pg_core_1.decimal)('monto_proveedor', { precision: 12, scale: 2 }).notNull(),
    estado: (0, exports.bookingStatusEnum)('estado').notNull().default('PENDING_PAYMENT'),
    escrowId: (0, pg_core_1.text)('escrow_id'),
    culqiChargeId: (0, pg_core_1.text)('culqi_charge_id'),
    notas: (0, pg_core_1.text)('notas'),
    fechaServicio: (0, pg_core_1.timestamp)('fecha_servicio'),
    autoReleaseAt: (0, pg_core_1.timestamp)('auto_release_at'),
    disputaRazon: (0, pg_core_1.text)('disputa_razon'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    clientIdx: (0, pg_core_1.index)('bookings_client_idx').on(table.clientId),
    listingIdx: (0, pg_core_1.index)('bookings_listing_idx').on(table.listingId),
    estadoIdx: (0, pg_core_1.index)('bookings_estado_idx').on(table.estado),
    autoReleaseIdx: (0, pg_core_1.index)('bookings_auto_release_idx').on(table.autoReleaseAt),
}));
exports.driverProfiles = (0, pg_core_1.pgTable)('driver_profiles', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)('user_id').notNull().unique().references(() => exports.users.id, { onDelete: 'cascade' }),
    licenciaNumero: (0, pg_core_1.text)('licencia_numero'),
    licenciaCategoria: (0, pg_core_1.text)('licencia_categoria').default('A-IIb'),
    zonas: (0, pg_core_1.jsonb)('zonas').$type().default([]),
    precioHora: (0, pg_core_1.decimal)('precio_hora', { precision: 8, scale: 2 }).notNull(),
    disponibilidad: (0, pg_core_1.jsonb)('disponibilidad').$type().default({}),
    rating: (0, pg_core_1.decimal)('rating', { precision: 3, scale: 2 }).default('0'),
    totalReviews: (0, pg_core_1.integer)('total_reviews').default(0),
    activo: (0, pg_core_1.boolean)('activo').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('driver_user_idx').on(table.userId),
    activoIdx: (0, pg_core_1.index)('driver_activo_idx').on(table.activo),
}));
exports.towingProfiles = (0, pg_core_1.pgTable)('towing_profiles', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)('user_id').notNull().unique().references(() => exports.users.id, { onDelete: 'cascade' }),
    nombreEmpresa: (0, pg_core_1.text)('nombre_empresa'),
    zonas: (0, pg_core_1.jsonb)('zonas').$type().default([]),
    servicios: (0, pg_core_1.jsonb)('servicios').$type().default([]),
    rating: (0, pg_core_1.decimal)('rating', { precision: 3, scale: 2 }).default('0'),
    totalReviews: (0, pg_core_1.integer)('total_reviews').default(0),
    activo: (0, pg_core_1.boolean)('activo').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.reviews = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    bookingId: (0, pg_core_1.text)('booking_id').notNull().unique().references(() => exports.bookings.id, { onDelete: 'cascade' }),
    reviewerId: (0, pg_core_1.text)('reviewer_id').notNull().references(() => exports.users.id),
    reviewedId: (0, pg_core_1.text)('reviewed_id').notNull().references(() => exports.users.id),
    listingId: (0, pg_core_1.text)('listing_id').references(() => exports.listings.id),
    rating: (0, pg_core_1.integer)('rating').notNull(),
    comentario: (0, pg_core_1.text)('comentario'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    reviewedIdx: (0, pg_core_1.index)('reviews_reviewed_idx').on(table.reviewedId),
    listingIdx: (0, pg_core_1.index)('reviews_listing_idx').on(table.listingId),
}));
exports.providerVerifications = (0, pg_core_1.pgTable)('provider_verifications', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    tipoDocumento: (0, pg_core_1.text)('tipo_documento').notNull().default('DNI'),
    numeroDocumento: (0, pg_core_1.text)('numero_documento').notNull(),
    fotoDocumento: (0, pg_core_1.text)('foto_documento'),
    fotoSelfie: (0, pg_core_1.text)('foto_selfie'),
    estado: (0, exports.verificationStatusEnum)('estado').notNull().default('PENDING'),
    adminNotes: (0, pg_core_1.text)('admin_notes'),
    revisadoPor: (0, pg_core_1.text)('revisado_por').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('verif_user_idx').on(table.userId),
    estadoIdx: (0, pg_core_1.index)('verif_estado_idx').on(table.estado),
}));
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    titulo: (0, pg_core_1.text)('titulo').notNull(),
    mensaje: (0, pg_core_1.text)('mensaje').notNull(),
    tipo: (0, pg_core_1.text)('tipo').notNull(),
    leida: (0, pg_core_1.boolean)('leida').default(false),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('notif_user_idx').on(table.userId),
    leidaIdx: (0, pg_core_1.index)('notif_leida_idx').on(table.leida),
}));
//# sourceMappingURL=schema.js.map