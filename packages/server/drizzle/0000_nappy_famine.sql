CREATE TYPE "public"."draw_type" AS ENUM('path', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'icon');--> statement-breakpoint
CREATE TYPE "public"."slot_side" AS ENUM('defender', 'attacker');--> statement-breakpoint
CREATE TYPE "public"."gadget_category" AS ENUM('unique', 'secondary', 'general');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "battleplan_floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_id" uuid NOT NULL,
	"map_floor_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battleplan_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_id" uuid NOT NULL,
	"index" integer DEFAULT 0 NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battleplans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"team_id" uuid,
	"game_id" uuid NOT NULL,
	"map_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"notes" text,
	"tags" text[] DEFAULT '{}',
	"is_public" boolean DEFAULT false NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"strat_side" varchar(20) DEFAULT 'Unknown' NOT NULL,
	"strat_mode" varchar(20) DEFAULT 'Unknown' NOT NULL,
	"strat_site" varchar(20) DEFAULT 'Unknown' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_floor_id" uuid NOT NULL,
	"user_id" uuid,
	"type" "draw_type" NOT NULL,
	"origin_x" integer NOT NULL,
	"origin_y" integer NOT NULL,
	"destination_x" integer,
	"destination_y" integer,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"phase_id" uuid,
	"operator_slot_id" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_id" uuid NOT NULL,
	"operator_name" varchar(100) NOT NULL,
	"side" "slot_side" NOT NULL,
	"slot_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_id" uuid NOT NULL,
	"slot_number" integer NOT NULL,
	"operator_id" uuid,
	"operator_name" varchar(100),
	"side" "slot_side" DEFAULT 'defender' NOT NULL,
	"color" varchar(7) DEFAULT '#FF0000' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"primary_weapon" varchar(100),
	"secondary_weapon" varchar(100),
	"primary_equipment" varchar(100),
	"secondary_equipment" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gadgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(500),
	"category" "gadget_category" DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"icon" varchar(500),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "map_floors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"floor_number" integer NOT NULL,
	"image_path" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"thumbnail" varchar(500),
	"is_competitive" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_gadgets" (
	"operator_id" uuid NOT NULL,
	"gadget_id" uuid NOT NULL,
	CONSTRAINT "operator_gadgets_operator_id_gadget_id_pk" PRIMARY KEY("operator_id","gadget_id")
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(500),
	"color" varchar(7) DEFAULT '#FFFFFF' NOT NULL,
	"is_attacker" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"team_id" uuid NOT NULL,
	"battleplan_id" uuid,
	"connection_string" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_connection_string_unique" UNIQUE("connection_string")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"discord_user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"discord_role_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_discord_role_id_unique" UNIQUE("discord_role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"discord_id" varchar(255) NOT NULL,
	"discord_username" varchar(255) NOT NULL,
	"discord_avatar" varchar(512),
	"discord_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"refresh_token" varchar(512),
	"refresh_token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battleplan_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "votes_user_battleplan_unique" UNIQUE("user_id","battleplan_id")
);
--> statement-breakpoint
ALTER TABLE "battleplan_floors" ADD CONSTRAINT "battleplan_floors_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplan_floors" ADD CONSTRAINT "battleplan_floors_map_floor_id_map_floors_id_fk" FOREIGN KEY ("map_floor_id") REFERENCES "public"."map_floors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplan_phases" ADD CONSTRAINT "battleplan_phases_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplans" ADD CONSTRAINT "battleplans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplans" ADD CONSTRAINT "battleplans_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplans" ADD CONSTRAINT "battleplans_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battleplans" ADD CONSTRAINT "battleplans_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_battleplan_floor_id_battleplan_floors_id_fk" FOREIGN KEY ("battleplan_floor_id") REFERENCES "public"."battleplan_floors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_phase_id_battleplan_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."battleplan_phases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_operator_slot_id_operator_slots_id_fk" FOREIGN KEY ("operator_slot_id") REFERENCES "public"."operator_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_bans" ADD CONSTRAINT "operator_bans_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_slots" ADD CONSTRAINT "operator_slots_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_slots" ADD CONSTRAINT "operator_slots_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gadgets" ADD CONSTRAINT "gadgets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_floors" ADD CONSTRAINT "map_floors_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_gadgets" ADD CONSTRAINT "operator_gadgets_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operators" ADD CONSTRAINT "operators_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_battleplan_id_battleplans_id_fk" FOREIGN KEY ("battleplan_id") REFERENCES "public"."battleplans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;