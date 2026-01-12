-- Create familydetails table
CREATE TABLE IF NOT EXISTS public.familydetails (
    id SERIAL PRIMARY KEY,
    "accountId" UUID NOT NULL UNIQUE,
    "fatherName" VARCHAR(255),
    "fatherOccupation" VARCHAR(255),
    "fatherStatus" VARCHAR(50) DEFAULT 'alive',
    "motherName" VARCHAR(255),
    "motherOccupation" VARCHAR(255),
    "motherStatus" VARCHAR(50) DEFAULT 'alive',
    siblings JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT familydetails_accountid_fkey FOREIGN KEY ("accountId") 
        REFERENCES public.users("accountId") ON DELETE CASCADE
);

-- Create index on accountId for faster lookups
CREATE INDEX IF NOT EXISTS idx_familydetails_accountid ON public.familydetails("accountId");

-- Add comment to table
COMMENT ON TABLE public.familydetails IS 'Stores family details for users';
