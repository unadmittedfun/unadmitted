export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_requests: {
        Row: {
          community_id: string
          conversation_id: string | null
          created_at: string
          details: Json
          id: string
          package_label: string
          price_eur: number
          status: Database["public"]["Enums"]["ad_status"]
          user_id: string
        }
        Insert: {
          community_id: string
          conversation_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          package_label: string
          price_eur: number
          status?: Database["public"]["Enums"]["ad_status"]
          user_id: string
        }
        Update: {
          community_id?: string
          conversation_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          package_label?: string
          price_eur?: number
          status?: Database["public"]["Enums"]["ad_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          community_id: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          community_id: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          community_id?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          accent_hsl: string
          created_at: string
          email_domain: string
          hashtag: string
          id: string
          is_active: boolean
          name: string
          primary_hsl: string
          short_name: string
          slug: string
          tagline: string | null
        }
        Insert: {
          accent_hsl?: string
          created_at?: string
          email_domain: string
          hashtag?: string
          id?: string
          is_active?: boolean
          name: string
          primary_hsl?: string
          short_name: string
          slug: string
          tagline?: string | null
        }
        Update: {
          accent_hsl?: string
          created_at?: string
          email_domain?: string
          hashtag?: string
          id?: string
          is_active?: boolean
          name?: string
          primary_hsl?: string
          short_name?: string
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          community_id: string
          created_at: string
          id: string
          is_marketing_bot: boolean
          user_a: string
          user_b: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          is_marketing_bot?: boolean
          user_a: string
          user_b: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          is_marketing_bot?: boolean
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          community_id: string
          conversation_id: string
          created_at: string
          id: string
          is_bot: boolean
          sender_id: string | null
        }
        Insert: {
          body: string
          community_id: string
          conversation_id: string
          created_at?: string
          id?: string
          is_bot?: boolean
          sender_id?: string | null
        }
        Update: {
          body?: string
          community_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_bot?: boolean
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          community_id: string
          created_at: string
          id: string
          is_promoted: boolean
          media_type: string | null
          media_url: string | null
          promoted_until: string | null
        }
        Insert: {
          author_id: string
          body: string
          community_id: string
          created_at?: string
          id?: string
          is_promoted?: boolean
          media_type?: string | null
          media_url?: string | null
          promoted_until?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          community_id?: string
          created_at?: string
          id?: string
          is_promoted?: boolean
          media_type?: string | null
          media_url?: string | null
          promoted_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_amendments: boolean
          avatar_url: string | null
          community_id: string
          created_at: string
          email: string
          handle: string
          handle_suffix: string
          id: string
        }
        Insert: {
          accepted_amendments?: boolean
          avatar_url?: string | null
          community_id: string
          created_at?: string
          email: string
          handle: string
          handle_suffix: string
          id: string
        }
        Update: {
          accepted_amendments?: boolean
          avatar_url?: string | null
          community_id?: string
          created_at?: string
          email?: string
          handle?: string
          handle_suffix?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      reposts: {
        Row: {
          community_id: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          community_id: string
          created_at: string
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_type"]
          user_id: string
          value: Database["public"]["Enums"]["vote_value"]
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_type"]
          user_id: string
          value: Database["public"]["Enums"]["vote_value"]
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["target_type"]
          user_id?: string
          value?: Database["public"]["Enums"]["vote_value"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          community_id: string | null
          created_at: string | null
          handle: string | null
          handle_suffix: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          community_id?: string | null
          created_at?: string | null
          handle?: string | null
          handle_suffix?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          community_id?: string | null
          created_at?: string | null
          handle?: string | null
          handle_suffix?: string | null
          id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_community_id: { Args: never; Returns: string }
      update_my_handle_suffix: { Args: { _suffix: string }; Returns: string }
    }
    Enums: {
      ad_status: "pending" | "approved" | "rejected" | "live" | "completed"
      app_role: "admin" | "moderator" | "user"
      target_type: "post" | "comment"
      vote_value: "up" | "down"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_status: ["pending", "approved", "rejected", "live", "completed"],
      app_role: ["admin", "moderator", "user"],
      target_type: ["post", "comment"],
      vote_value: ["up", "down"],
    },
  },
} as const
