/**
 * Migration script: adds multi-tenant studioId to all existing rows.
 * Run with: DATABASE_URL=<prod-url> npx tsx prisma/migrate-to-multitenant.ts
 */
import { Pool } from "pg"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    console.log("1. Creating enums (if not exist)...")
    await client.query(`DO $$ BEGIN
      CREATE TYPE "PlatformRole" AS ENUM ('USER', 'PLATFORM_ADMIN');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`)

    await client.query(`DO $$ BEGIN
      CREATE TYPE "StudioRole" AS ENUM ('OWNER', 'STAFF');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`)

    await client.query(`DO $$ BEGIN
      CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`)

    await client.query(`DO $$ BEGIN
      CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`)

    console.log("2. Creating Studio table (if not exists)...")
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Studio" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "logo" TEXT,
        "customDomain" TEXT,
        "plan" "Plan" NOT NULL DEFAULT 'FREE',
        "paddleCustomerId" TEXT,
        "paddleSubscriptionId" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
      )
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Studio_slug_key" ON "Studio"("slug")`)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Studio_customDomain_key" ON "Studio"("customDomain")`)

    console.log("3. Creating StudioMembership table (if not exists)...")
    await client.query(`
      CREATE TABLE IF NOT EXISTS "StudioMembership" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "studioId" TEXT NOT NULL,
        "role" "StudioRole" NOT NULL,
        CONSTRAINT "StudioMembership_pkey" PRIMARY KEY ("id")
      )
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "StudioMembership_userId_studioId_key" ON "StudioMembership"("userId", "studioId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS "StudioMembership_studioId_idx" ON "StudioMembership"("studioId")`)

    console.log("4. Creating demo studio...")
    const studioId = "demo-studio-migrated"
    const studioCheck = await client.query(`SELECT id FROM "Studio" WHERE slug = 'demo'`)
    let finalStudioId = studioId

    if (studioCheck.rows.length > 0) {
      finalStudioId = studioCheck.rows[0].id
      console.log("   Demo studio already exists:", finalStudioId)
    } else {
      await client.query(
        `INSERT INTO "Studio" (id, name, slug, "updatedAt") VALUES ($1, 'Demo Tattoo Studio', 'demo', CURRENT_TIMESTAMP)`,
        [studioId]
      )
      finalStudioId = studioId
      console.log("   Created demo studio:", finalStudioId)
    }

    console.log("5. Adding studioId column to existing tables...")
    const tables = [
      "Booking",
      "Client",
      "ClientGalleryItem",
      "Contact",
      "FaqItem",
      "GalleryItem",
      "GalleryItemStyle",
      "Page",
      "Review",
      "ReviewGalleryItem",
      "Service",
      "TattooStyle",
    ]

    for (const table of tables) {
      // Check if column exists
      const colCheck = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'studioId'`,
        [table]
      )

      if (colCheck.rows.length === 0) {
        console.log(`   Adding studioId to ${table}...`)
        await client.query(`ALTER TABLE "${table}" ADD COLUMN "studioId" TEXT`)
        const result = await client.query(`UPDATE "${table}" SET "studioId" = $1 WHERE "studioId" IS NULL`, [finalStudioId])
        console.log(`   Updated ${result.rowCount} rows in ${table}`)
        await client.query(`ALTER TABLE "${table}" ALTER COLUMN "studioId" SET NOT NULL`)
      } else {
        console.log(`   ${table} already has studioId`)
        // Still fill in any nulls
        const result = await client.query(`UPDATE "${table}" SET "studioId" = $1 WHERE "studioId" IS NULL`, [finalStudioId])
        if (result.rowCount && result.rowCount > 0) {
          console.log(`   Updated ${result.rowCount} null rows in ${table}`)
        }
      }
    }

    console.log("6. Adding platformRole to User table (if not exists)...")
    const userColCheck = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'platformRole'`
    )
    if (userColCheck.rows.length === 0) {
      await client.query(`ALTER TABLE "User" ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER'`)
      console.log("   Added platformRole to User")
    } else {
      console.log("   User already has platformRole")
    }

    console.log("7. Creating PasswordResetToken table (if not exists)...")
    await client.query(`
      CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
      )
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token")`)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token")`)

    console.log("8. Linking admin user to demo studio...")
    const adminUser = await client.query(`SELECT id FROM "User" WHERE email = 'admin@tattooista.com'`)
    if (adminUser.rows.length > 0) {
      const membershipCheck = await client.query(
        `SELECT id FROM "StudioMembership" WHERE "userId" = $1 AND "studioId" = $2`,
        [adminUser.rows[0].id, finalStudioId]
      )
      if (membershipCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO "StudioMembership" (id, "userId", "studioId", role) VALUES ($1, $2, $3, 'OWNER')`,
          [`membership-${Date.now()}`, adminUser.rows[0].id, finalStudioId]
        )
        console.log("   Linked admin as studio owner")
      } else {
        console.log("   Admin already linked")
      }
    } else {
      console.log("   No admin user found, skipping")
    }

    await client.query("COMMIT")
    console.log("\nMigration complete! Now run: prisma db push")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Migration failed, rolled back:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

run()
