CREATE TYPE "public"."feedback-label" AS ENUM('Issue', 'Idea', 'Question', 'Complaint', 'Feature Request', 'Other');--> statement-breakpoint
CREATE TYPE "public"."feedback-status" AS ENUM('Open', 'In Progress', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."org-member-role" AS ENUM('Viewer', 'Developer', 'Billing', 'Admin');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('User', 'Admin', 'Super Admin');--> statement-breakpoint
CREATE TABLE "minden_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "minden_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "minden_feedback" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(255),
	"message" text NOT NULL,
	"label" "feedback-label" NOT NULL,
	"status" "feedback-status" DEFAULT 'Open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minden_membersToOrganizations" (
	"id" varchar(255) DEFAULT gen_random_uuid(),
	"memberId" varchar(255) NOT NULL,
	"memberEmail" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"role" "org-member-role" DEFAULT 'Viewer' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "minden_membersToOrganizations_id_memberId_organizationId_pk" PRIMARY KEY("id","memberId","organizationId")
);
--> statement-breakpoint
CREATE TABLE "minden_orgRequest" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minden_organization" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"ownerId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minden_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minden_subscription" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lemonSqueezyId" text NOT NULL,
	"orderId" integer NOT NULL,
	"orgId" text NOT NULL,
	"variantId" integer NOT NULL,
	CONSTRAINT "minden_subscription_lemonSqueezyId_unique" UNIQUE("lemonSqueezyId")
);
--> statement-breakpoint
CREATE TABLE "minden_team_dataset" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"orgId" text NOT NULL,
	"importedBy" text NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"rawData" jsonb NOT NULL,
	"processedData" jsonb,
	"graphData" jsonb,
	"analysisResults" jsonb,
	"errorLog" text,
	"importedAt" timestamp DEFAULT now() NOT NULL,
	"lastAnalyzedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "minden_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"role" "role" DEFAULT 'User' NOT NULL,
	"isNewUser" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minden_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "minden_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "minden_waitlistUser" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "minden_waitlistUser_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "minden_webhookEvent" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"eventName" text NOT NULL,
	"processed" boolean DEFAULT false,
	"body" jsonb NOT NULL,
	"processingError" text
);
--> statement-breakpoint
ALTER TABLE "minden_account" ADD CONSTRAINT "minden_account_userId_minden_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."minden_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_feedback" ADD CONSTRAINT "minden_feedback_userId_minden_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."minden_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_membersToOrganizations" ADD CONSTRAINT "minden_membersToOrganizations_memberId_minden_user_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."minden_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_membersToOrganizations" ADD CONSTRAINT "minden_membersToOrganizations_organizationId_minden_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."minden_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_orgRequest" ADD CONSTRAINT "minden_orgRequest_userId_minden_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."minden_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_orgRequest" ADD CONSTRAINT "minden_orgRequest_organizationId_minden_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."minden_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_organization" ADD CONSTRAINT "minden_organization_ownerId_minden_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."minden_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_session" ADD CONSTRAINT "minden_session_userId_minden_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."minden_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_subscription" ADD CONSTRAINT "minden_subscription_orgId_minden_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."minden_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_team_dataset" ADD CONSTRAINT "minden_team_dataset_orgId_minden_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."minden_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minden_team_dataset" ADD CONSTRAINT "minden_team_dataset_importedBy_minden_user_id_fk" FOREIGN KEY ("importedBy") REFERENCES "public"."minden_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "minden_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orgRequest_organizationId_idx" ON "minden_orgRequest" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "minden_session" USING btree ("userId");