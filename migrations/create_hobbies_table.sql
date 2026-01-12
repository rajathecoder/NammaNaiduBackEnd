-- Create hobbies table
CREATE TABLE IF NOT EXISTS public.hobbies (
    id SERIAL PRIMARY KEY,
    "accountId" UUID NOT NULL UNIQUE,
    hobbies JSONB DEFAULT '[]'::jsonb,
    "musicGenres" JSONB DEFAULT '[]'::jsonb,
    "bookTypes" JSONB DEFAULT '[]'::jsonb,
    "movieTypes" JSONB DEFAULT '[]'::jsonb,
    sports JSONB DEFAULT '[]'::jsonb,
    cuisines JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hobbies_accountid_fkey FOREIGN KEY ("accountId") 
        REFERENCES public.users("accountId") ON DELETE CASCADE
);

-- Create index on accountId for faster lookups
CREATE INDEX IF NOT EXISTS idx_hobbies_accountid ON public.hobbies("accountId");

-- Add comment to table
COMMENT ON TABLE public.hobbies IS 'Stores hobbies and interests for users';
