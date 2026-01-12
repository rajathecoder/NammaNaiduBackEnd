-- Create horoscopedetails table
CREATE TABLE IF NOT EXISTS public.horoscopedetails (
    id SERIAL PRIMARY KEY,
    "accountId" UUID NOT NULL UNIQUE,
    rasi VARCHAR(255),
    natchathiram VARCHAR(255),
    "birthPlace" VARCHAR(255),
    "birthTime" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horoscopedetails_accountid_fkey FOREIGN KEY ("accountId") 
        REFERENCES public.users("accountId") ON DELETE CASCADE
);

-- Create index on accountId for faster lookups
CREATE INDEX IF NOT EXISTS idx_horoscopedetails_accountid ON public.horoscopedetails("accountId");

-- Add comment to table
COMMENT ON TABLE public.horoscopedetails IS 'Stores horoscope details for users';
