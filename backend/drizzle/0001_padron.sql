CREATE TABLE "padron" (
	"socio_nro" text PRIMARY KEY NOT NULL,
	"email" text,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"categoria" text,
	"dni" text,
	"fecha_nacimiento" date,
	"actividades" text,
	"divisiones" text,
	"titular_grupo" text,
	"importado_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registros" ADD COLUMN "socio_nro" text;--> statement-breakpoint
CREATE INDEX "padron_email_idx" ON "padron" USING btree ("email");