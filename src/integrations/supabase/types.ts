export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bible_progress: {
        Row: {
          book: string
          chapter: number
          id: string
          updated_at: string
          user_id: string
          verse: number | null
        }
        Insert: {
          book: string
          chapter: number
          id?: string
          updated_at?: string
          user_id: string
          verse?: number | null
        }
        Update: {
          book?: string
          chapter?: number
          id?: string
          updated_at?: string
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      bible_studies: {
        Row: {
          id: string
          title: string
          description: string
          cover_image: string | null
          total_chapters: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          cover_image?: string | null
          total_chapters?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cover_image?: string | null
          total_chapters?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bible_study_chapters: {
        Row: {
          id: string
          study_id: string
          chapter_number: number
          title: string
          main_verse: string
          main_verse_reference: string
          reflective_reading: string
          reflection_question: string
          chapter_prayer: string
          practical_application: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id: string
          chapter_number: number
          title: string
          main_verse: string
          main_verse_reference: string
          reflective_reading: string
          reflection_question: string
          chapter_prayer: string
          practical_application: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          study_id?: string
          chapter_number?: number
          title?: string
          main_verse?: string
          main_verse_reference?: string
          reflective_reading?: string
          reflection_question?: string
          chapter_prayer?: string
          practical_application?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_study_chapters_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "bible_studies"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_from_ai: boolean
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_ai?: boolean
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_ai?: boolean
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_devotionals: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          title: string
          verse_reference: string | null
          verse_text: string | null
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          id?: string
          title: string
          verse_reference?: string | null
          verse_text?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          title?: string
          verse_reference?: string | null
          verse_text?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          book: string | null
          chapter: number | null
          content: string
          created_at: string
          id: string
          reference: string | null
          title: string
          type: string
          user_id: string
          verse: number | null
        }
        Insert: {
          book?: string | null
          chapter?: number | null
          content: string
          created_at?: string
          id?: string
          reference?: string | null
          title: string
          type: string
          user_id: string
          verse?: number | null
        }
        Update: {
          book?: string | null
          chapter?: number | null
          content?: string
          created_at?: string
          id?: string
          reference?: string | null
          title?: string
          type?: string
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: number
          display_name: string | null
          email: string | null
          gender: string | null
          id: string
          subscription_expires_at: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_study_favorites: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_favorites_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "bible_study_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_study_progress: {
        Row: {
          id: string
          user_id: string
          study_id: string
          chapter_id: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          study_id: string
          chapter_id: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          study_id?: string
          chapter_id?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "bible_study_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_progress_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "bible_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      versiculos: {
        Row: {
          book: string
          chapter: number
          content: string
          id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          content: string
          id?: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          content?: string
          id?: string
          verse?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
