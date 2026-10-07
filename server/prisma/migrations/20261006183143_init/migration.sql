-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('WOMAN', 'MAN', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "Objective" AS ENUM ('DATING', 'FRIENDSHIP', 'TRAINING');

-- CreateEnum
CREATE TYPE "MatchAction" AS ENUM ('LIKE', 'PASS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "age" INTEGER,
    "gender" "Gender",
    "city" TEXT,
    "region" TEXT,
    "bio" TEXT,
    "objective" "Objective",
    "pace" TEXT,
    "distance_km" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "distance_km" DOUBLE PRECISION,
    "organizer" TEXT,
    "ticket_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_actions" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "action" "MatchAction" NOT NULL,
    "event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_user_id_event_id_key" ON "event_attendances"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_actions_from_id_to_id_key" ON "match_actions"("from_id", "to_id");

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_actions" ADD CONSTRAINT "match_actions_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_actions" ADD CONSTRAINT "match_actions_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
