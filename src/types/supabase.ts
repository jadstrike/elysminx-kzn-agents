export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      gmail_tokens: {
        Row: {
          access_token: string;
          access_token_iv: string;
          created_at: string;
          expires_at: string;
          id: string;
          refresh_token: string;
          refresh_token_iv: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          access_token: string;
          access_token_iv: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          refresh_token: string;
          refresh_token_iv: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          access_token?: string;
          access_token_iv?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          refresh_token?: string;
          refresh_token_iv?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      oauth_states: {
        Row: {
          created_at: string;
          id: string;
          provider: string;
          state: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          provider: string;
          state: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          provider?: string;
          state?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string;
          gemini_api_key: string;
          gemini_model: string;
          id: string;
          updated_at: string;
          use_company_key: boolean;
          username: string;
        };
        Insert: {
          avatar_url?: string;
          gemini_api_key?: string;
          gemini_model?: string;
          id: string;
          updated_at?: string;
          use_company_key?: boolean;
          username?: string;
        };
        Update: {
          avatar_url?: string;
          gemini_api_key?: string;
          gemini_model?: string;
          id?: string;
          updated_at?: string;
          use_company_key?: boolean;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
