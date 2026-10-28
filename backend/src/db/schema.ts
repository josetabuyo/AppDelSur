import { pgTable, uuid, text, timestamp, boolean, integer, date, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  google_sub: text("google_sub").unique(),
  role: text("role", { enum: ["member", "admin"] }).notNull().default("member"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const registros = pgTable("registros", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  carga_para: text("carga_para", { enum: ["yo", "hijo", "companero"] }).notNull(),
  /** Socio del padrón al que corresponde este registro (si vino de ahí). */
  socio_nro: text("socio_nro"),
  tipo: text("tipo", { enum: ["jugador", "comunidad"] }).notNull(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  dni: text("dni"),
  fecha_nacimiento: date("fecha_nacimiento"),
  deporte: text("deporte", { enum: ["rugby", "hockey", "rugby_inclusivo"] }),
  division: text("division"),
  colegio: text("colegio"),
  localidad: text("localidad"),
  domicilio: text("domicilio"),
  telefono: text("telefono"),
  email: text("email"),
  familia_en_club: text("familia_en_club"),
  contento: integer("contento"),
  conoce_quien_dejo: boolean("conoce_quien_dejo"),
  quien_dejo_detalle: text("quien_dejo_detalle"),
  vinculo: text("vinculo", { enum: ["familiar", "socio", "ex_jugador", "amigo", "otro"] }),
  vinculo_detalle: text("vinculo_detalle"),
  comentarios: text("comentarios"),
  app_version: text("app_version"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Padrón de socios que exporta la app del tercero (lo pasa la secretaría). Es la "lista blanca":
 * si el mail de Google está acá, la app va directo al formulario con los datos precargados.
 * Solo los campos que hacen falta para eso; nada de pagos ni datos médicos.
 */
export const padron = pgTable("padron", {
  socio_nro: text("socio_nro").primaryKey(),
  email: text("email"), // en minúsculas; varios socios pueden compartir mail (familia)
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  categoria: text("categoria"), // "Jugadores", "Activos", "Familia R.I", ...
  dni: text("dni"),
  fecha_nacimiento: date("fecha_nacimiento"),
  actividades: text("actividades"), // "Gym, Hockey, Rugby"
  divisiones: text("divisiones"), // "Rugby > M-16"
  titular_grupo: text("titular_grupo"),
  importado_at: timestamp("importado_at").notNull().defaultNow(),
}, (t) => [index("padron_email_idx").on(t.email)]);

export type User = typeof users.$inferSelect;
export type RegistroRow = typeof registros.$inferSelect;
export type PadronRow = typeof padron.$inferSelect;
