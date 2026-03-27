import 'reflect-metadata';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL not set in .env');
}

async function main() {
  const client = postgres(DATABASE_URL!);
  const db = drizzle(client, { schema });

  console.log('🌱 Seeding database...');

  // Create admin user
  const adminId = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: adminId,
    email: 'admin@motorperu.com',
    passwordHash: '$2b$10$placeholder_hash_admin',
    role: 'ADMIN',
    nombre: 'Admin MotorPeru',
    emailVerified: true,
  }).onConflictDoNothing();

  // Create seller users
  const seller1Id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: seller1Id,
    email: 'vendedor@motorperu.com',
    passwordHash: '$2b$10$placeholder_hash_seller',
    role: 'SELLER',
    nombre: 'Carlos Ramirez',
    telefono: '+51987654321',
    emailVerified: true,
  }).onConflictDoNothing();

  // Create provider user
  const provider1Id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: provider1Id,
    email: 'mecanico@motorperu.com',
    passwordHash: '$2b$10$placeholder_hash_provider',
    role: 'PROVIDER',
    nombre: 'Pedro Mecanico',
    telefono: '+51976543210',
    emailVerified: true,
  }).onConflictDoNothing();

  // Create buyer user
  const buyer1Id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: buyer1Id,
    email: 'comprador@motorperu.com',
    passwordHash: '$2b$10$placeholder_hash_buyer',
    role: 'BUYER',
    nombre: 'Luis Comprador',
    telefono: '+51965432109',
    emailVerified: true,
  }).onConflictDoNothing();

  console.log('✅ Users created');

  // Create car listing
  const carListingId = crypto.randomUUID();
  await db.insert(schema.listings).values({
    id: carListingId,
    sellerId: seller1Id,
    tipo: 'CAR',
    titulo: 'Toyota Corolla 2020 - Excelente estado',
    descripcion: 'Vendo Toyota Corolla 2020, único dueño, mantenimiento al día, papeles en orden. Precio negociable.',
    precio: '28500',
    estado: 'ACTIVE',
    fotos: ['https://placeholder.com/car1.jpg', 'https://placeholder.com/car2.jpg'],
    ubicacion: 'Miraflores, Lima',
    distrito: 'Miraflores',
    departamento: 'Lima',
  }).onConflictDoNothing();

  await db.insert(schema.carDetails).values({
    listingId: carListingId,
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2020,
    kilometraje: 45000,
    combustible: 'GASOLINA',
    transmision: 'AUTOMATICO',
    color: 'Blanco Perla',
    condicion: 'USADO',
    numeroPuertas: 4,
  }).onConflictDoNothing();

  // Create part listing
  const partListingId = crypto.randomUUID();
  await db.insert(schema.listings).values({
    id: partListingId,
    sellerId: seller1Id,
    tipo: 'PART',
    titulo: 'Alternador Toyota Corolla 2018-2022',
    descripcion: 'Alternador original Toyota para Corolla, remanufacturado con garantía de 6 meses.',
    precio: '450',
    estado: 'ACTIVE',
    fotos: ['https://placeholder.com/part1.jpg'],
    ubicacion: 'La Victoria, Lima',
    distrito: 'La Victoria',
    departamento: 'Lima',
  }).onConflictDoNothing();

  await db.insert(schema.partDetails).values({
    listingId: partListingId,
    marcaCompatible: 'Toyota',
    modeloCompatible: 'Corolla',
    anioDesde: 2018,
    anioHasta: 2022,
    condicion: 'REMANUFACTURADO',
    stock: 3,
    numeroParte: 'ALT-TYC-27060',
  }).onConflictDoNothing();

  // Create service listing
  const serviceListingId = crypto.randomUUID();
  await db.insert(schema.listings).values({
    id: serviceListingId,
    sellerId: provider1Id,
    tipo: 'SERVICE',
    titulo: 'Servicio de Mecánica General - Lima',
    descripcion: 'Ofrezco servicios de mecánica general: cambio de aceite, frenos, suspensión, diagnóstico computarizado.',
    precio: '80',
    estado: 'ACTIVE',
    fotos: ['https://placeholder.com/service1.jpg'],
    ubicacion: 'San Isidro, Lima',
    distrito: 'San Isidro',
    departamento: 'Lima',
  }).onConflictDoNothing();

  await db.insert(schema.serviceDetails).values({
    listingId: serviceListingId,
    tipoServicio: 'MECANICO',
    tiempoEstimado: '2-4 horas',
    zonas: ['San Isidro', 'Miraflores', 'Surco', 'San Borja'],
    disponibilidad: {
      lunes: ['08:00', '18:00'],
      martes: ['08:00', '18:00'],
      miercoles: ['08:00', '18:00'],
      jueves: ['08:00', '18:00'],
      viernes: ['08:00', '18:00'],
      sabado: ['08:00', '13:00'],
    },
    precioBase: '80',
    incluyeDesplazamiento: false,
  }).onConflictDoNothing();

  // Create driver profile
  await db.insert(schema.driverProfiles).values({
    userId: provider1Id,
    licenciaNumero: 'Q12345678',
    licenciaCategoria: 'A-IIb',
    zonas: ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja'],
    precioHora: '35',
    disponibilidad: {
      lunes: ['18:00', '02:00'],
      martes: ['18:00', '02:00'],
      miercoles: ['18:00', '02:00'],
      jueves: ['18:00', '02:00'],
      viernes: ['18:00', '04:00'],
      sabado: ['18:00', '04:00'],
    },
    activo: true,
  }).onConflictDoNothing();

  // Create provider verification
  await db.insert(schema.providerVerifications).values({
    userId: provider1Id,
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    fotoDocumento: 'https://placeholder.com/dni-front.jpg',
    estado: 'VERIFIED',
    revisadoPor: adminId,
  }).onConflictDoNothing();

  console.log('✅ Listings created');
  console.log('✅ Driver profile created');
  console.log('✅ Provider verification created');
  console.log('\n🎉 Seed completed!');

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
