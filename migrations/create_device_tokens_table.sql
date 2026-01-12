-- Create device_tokens table
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id SERIAL PRIMARY KEY,
    "accountId" UUID NOT NULL,
    "fcmToken" TEXT NOT NULL,
    device VARCHAR(10) NOT NULL DEFAULT 'mobile' CHECK (device IN ('mobile', 'web')),
    "deviceModel" VARCHAR(255),
    ip VARCHAR(45),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_tokens_accountid_fkey FOREIGN KEY ("accountId") 
        REFERENCES public.users("accountId") ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_accountid ON public.device_tokens("accountId");
CREATE INDEX IF NOT EXISTS idx_device_tokens_fcmtoken ON public.device_tokens("fcmToken");
CREATE INDEX IF NOT EXISTS idx_device_tokens_accountid_device ON public.device_tokens("accountId", device);
CREATE INDEX IF NOT EXISTS idx_device_tokens_isactive ON public.device_tokens("isActive");

-- Add comments
COMMENT ON TABLE public.device_tokens IS 'Stores FCM (Firebase Cloud Messaging) tokens for push notifications';
COMMENT ON COLUMN public.device_tokens."accountId" IS 'UUID of the user (references users.accountId)';
COMMENT ON COLUMN public.device_tokens."fcmToken" IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN public.device_tokens.device IS 'Device type: mobile or web';
COMMENT ON COLUMN public.device_tokens."deviceModel" IS 'Device model information (e.g., "Samsung Galaxy S21", "iPhone 13", "Chrome Browser")';
COMMENT ON COLUMN public.device_tokens.ip IS 'IP address of the device';
COMMENT ON COLUMN public.device_tokens."isActive" IS 'Whether the token is currently active';

