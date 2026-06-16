import { createServerFn } from "@tanstack/react-start";
import process from "node:process";

export const getSupabaseConfigStatus = createServerFn({ method: "GET" }).handler(async () => {
  const getSafePrefix = (val: string | undefined, length = 15) => {
    if (!val) return "";
    return val.substring(0, length);
  };

  return {
    SUPABASE_URL: {
      defined: !!process.env.SUPABASE_URL,
      length: process.env.SUPABASE_URL?.length ?? 0,
      prefix: getSafePrefix(process.env.SUPABASE_URL, 15),
    },
    SUPABASE_PUBLISHABLE_KEY: {
      defined: !!process.env.SUPABASE_PUBLISHABLE_KEY,
      length: process.env.SUPABASE_PUBLISHABLE_KEY?.length ?? 0,
      prefix: getSafePrefix(process.env.SUPABASE_PUBLISHABLE_KEY, 15),
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      defined: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      prefix: getSafePrefix(process.env.SUPABASE_SERVICE_ROLE_KEY, 10), // e.g. "sb_secret_"
    },
    VITE_SUPABASE_URL: {
      defined: !!import.meta.env.VITE_SUPABASE_URL,
      length: import.meta.env.VITE_SUPABASE_URL?.length ?? 0,
      prefix: getSafePrefix(import.meta.env.VITE_SUPABASE_URL, 15),
    },
    VITE_SUPABASE_PUBLISHABLE_KEY: {
      defined: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      length: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.length ?? 0,
      prefix: getSafePrefix(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 15),
    },
  };
});
