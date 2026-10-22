CREATE TABLE "registros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"carga_para" text NOT NULL,
	"tipo" text NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"dni" text,
	"fecha_nacimiento" date,
	"deporte" text,
	"division" text,
	"colegio" text,
	"localidad" text,
	"domicilio" text,
	"telefono" text,
	"email" text,
	"familia_en_club" text,
	"contento" integer,
	"conoce_quien_dejo" boolean,
	"quien_dejo_detalle" text,
	"vinculo" text,
	"vinculo_detalle" text,
	"comentarios" text,
	"app_version" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"google_sub" text,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub")
);
--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;