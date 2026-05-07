import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Community,
  applyCommunityTheme,
  fetchCommunityById,
  fetchCommunityBySlug,
  getCommunitySlugFromHost,
} from "@/lib/community";

type Profile = {
  id: string;
  handle: string;
  email: string;
  accepted_amendments: boolean;
  avatar_url: string | null;
  handle_suffix: string;
  community_id: string;
  welcome_email_sent_at: string | null;
};

type AuthCtx = {
  user: U
