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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attachment_overseas: {
        Row: {
          country: string
          created_at: string
          destination_institution: string
          funding_type: string
          id: string
          institution: string
          matter_id: string
          program_end_date: string
          program_start_date: string
          programmes: string[]
          student_count: number
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          destination_institution: string
          funding_type: string
          id?: string
          institution: string
          matter_id: string
          program_end_date: string
          program_start_date: string
          programmes?: string[]
          student_count?: number
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          destination_institution?: string
          funding_type?: string
          id?: string
          institution?: string
          matter_id?: string
          program_end_date?: string
          program_start_date?: string
          programmes?: string[]
          student_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachment_overseas_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      gtci_strategic_analysis: {
        Row: {
          created_at: string
          data_gap_indicators: Json
          document_title: string
          executive_summary: Json
          expected_outcomes: Json
          funding_model: Json
          id: string
          implementation_roadmap: Json
          indicator_analysis: Json
          metadata: Json
          ministry_governance: Json
          pillar_performance: Json
          updated_at: string
          user_id: string
          wef_participation_steps: Json
        }
        Insert: {
          created_at?: string
          data_gap_indicators?: Json
          document_title?: string
          executive_summary?: Json
          expected_outcomes?: Json
          funding_model?: Json
          id?: string
          implementation_roadmap?: Json
          indicator_analysis?: Json
          metadata?: Json
          ministry_governance?: Json
          pillar_performance?: Json
          updated_at?: string
          user_id: string
          wef_participation_steps?: Json
        }
        Update: {
          created_at?: string
          data_gap_indicators?: Json
          document_title?: string
          executive_summary?: Json
          expected_outcomes?: Json
          funding_model?: Json
          id?: string
          implementation_roadmap?: Json
          indicator_analysis?: Json
          metadata?: Json
          ministry_governance?: Json
          pillar_performance?: Json
          updated_at?: string
          user_id?: string
          wef_participation_steps?: Json
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          annual_entitlement: number
          created_at: string
          id: string
          other_entitlement: number
          sick_entitlement: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          annual_entitlement?: number
          created_at?: string
          id?: string
          other_entitlement?: number
          sick_entitlement?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          annual_entitlement?: number
          created_at?: string
          id?: string
          other_entitlement?: number
          sick_entitlement?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      leaves: {
        Row: {
          created_at: string
          days_used: number
          end_date: string
          id: string
          leave_type: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_used: number
          end_date: string
          id?: string
          leave_type?: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_used?: number
          end_date?: string
          id?: string
          leave_type?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matters: {
        Row: {
          assigned_to: string | null
          case_id: string
          case_title: string
          case_type: string
          created_at: string
          deadline: string | null
          dsm_submitted_date: string
          external_link: string | null
          id: string
          overall_sla_days: number
          overall_status: string
          priority: string
          query_issued_date: string | null
          query_response_date: string | null
          query_status: string
          remarks: string | null
          second_query_issued_date: string | null
          second_query_response_date: string | null
          second_query_status: string | null
          signed_date: string | null
          sla_status: string
          suthe_received_date: string
          suthe_submitted_to_hu_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          case_title: string
          case_type: string
          created_at?: string
          deadline?: string | null
          dsm_submitted_date: string
          external_link?: string | null
          id?: string
          overall_sla_days?: number
          overall_status?: string
          priority?: string
          query_issued_date?: string | null
          query_response_date?: string | null
          query_status?: string
          remarks?: string | null
          second_query_issued_date?: string | null
          second_query_response_date?: string | null
          second_query_status?: string | null
          signed_date?: string | null
          sla_status?: string
          suthe_received_date: string
          suthe_submitted_to_hu_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          case_title?: string
          case_type?: string
          created_at?: string
          deadline?: string | null
          dsm_submitted_date?: string
          external_link?: string | null
          id?: string
          overall_sla_days?: number
          overall_status?: string
          priority?: string
          query_issued_date?: string | null
          query_response_date?: string | null
          query_status?: string
          remarks?: string | null
          second_query_issued_date?: string | null
          second_query_response_date?: string | null
          second_query_status?: string | null
          signed_date?: string | null
          sla_status?: string
          suthe_received_date?: string
          suthe_submitted_to_hu_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string | null
          meeting_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          meeting_type?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          meeting_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playground_scorecards: {
        Row: {
          created_at: string
          dashboard_title: string
          id: string
          indicators: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_title?: string
          id?: string
          indicators?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_title?: string
          id?: string
          indicators?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          blockers: string[]
          created_at: string
          description: string | null
          id: string
          notes: Json
          source_matter_id: string | null
          status: string
          tasks: Json
          title: string
          updated_at: string
          user_id: string
          weekly_score: number | null
          workflow_tasks: Json
          workflow_template_name: string | null
        }
        Insert: {
          blockers?: string[]
          created_at?: string
          description?: string | null
          id?: string
          notes?: Json
          source_matter_id?: string | null
          status?: string
          tasks?: Json
          title: string
          updated_at?: string
          user_id: string
          weekly_score?: number | null
          workflow_tasks?: Json
          workflow_template_name?: string | null
        }
        Update: {
          blockers?: string[]
          created_at?: string
          description?: string | null
          id?: string
          notes?: Json
          source_matter_id?: string | null
          status?: string
          tasks?: Json
          title?: string
          updated_at?: string
          user_id?: string
          weekly_score?: number | null
          workflow_tasks?: Json
          workflow_template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_source_matter_id_fkey"
            columns: ["source_matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      running_logs: {
        Row: {
          created_at: string
          date: string
          distance: number
          duration_minutes: number
          environment: string
          id: string
          is_planned: boolean
          linked_training_date: string | null
          notes: string | null
          pace_per_km: number | null
          run_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          distance: number
          duration_minutes: number
          environment?: string
          id?: string
          is_planned?: boolean
          linked_training_date?: string | null
          notes?: string | null
          pace_per_km?: number | null
          run_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance?: number
          duration_minutes?: number
          environment?: string
          id?: string
          is_planned?: boolean
          linked_training_date?: string | null
          notes?: string | null
          pace_per_km?: number | null
          run_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sla_configurations: {
        Row: {
          at_risk_days: number
          case_type: string
          created_at: string
          critical_days: number
          id: string
          sla_days: number
          updated_at: string
        }
        Insert: {
          at_risk_days?: number
          case_type: string
          created_at?: string
          critical_days?: number
          id?: string
          sla_days?: number
          updated_at?: string
        }
        Update: {
          at_risk_days?: number
          case_type?: string
          created_at?: string
          critical_days?: number
          id?: string
          sla_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      sub_todos: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          is_timer_running: boolean
          step_order: number
          timer_elapsed_seconds: number
          title: string
          todo_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          is_timer_running?: boolean
          step_order?: number
          timer_elapsed_seconds?: number
          title: string
          todo_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          is_timer_running?: boolean
          step_order?: number
          timer_elapsed_seconds?: number
          title?: string
          todo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_todos_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          id: string
          is_main_timer_running: boolean
          main_timer_elapsed_seconds: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_main_timer_running?: boolean
          main_timer_elapsed_seconds?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_main_timer_running?: boolean
          main_timer_elapsed_seconds?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_shortcuts: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          created_at: string
          estimated_days: number | null
          id: string
          responsible_party: string | null
          step_description: string | null
          step_order: number
          step_title: string
          updated_at: string
          workflow_name: string
        }
        Insert: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          responsible_party?: string | null
          step_description?: string | null
          step_order: number
          step_title: string
          updated_at?: string
          workflow_name: string
        }
        Update: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          responsible_party?: string | null
          step_description?: string | null
          step_order?: number
          step_title?: string
          updated_at?: string
          workflow_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
