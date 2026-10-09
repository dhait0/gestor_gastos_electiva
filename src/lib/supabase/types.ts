export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "accounts": {
                  Row: {
                    "color": string | null,"created_at": string,"credit_limit": number | null,"currency_code": string,"deleted_at": string | null,"icon": string | null,"id": string,"is_archived": boolean,"name": string,"opening_balance": number,"payment_due_day": number | null,"statement_closing_day": number | null,"type": Database["public"]['Enums']["account_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string | null,"created_at"?: string,"credit_limit"?: number | null,"currency_code"?: string,"deleted_at"?: string | null,"icon"?: string | null,"id"?: string,"is_archived"?: boolean,"name": string,"opening_balance"?: number,"payment_due_day"?: number | null,"statement_closing_day"?: number | null,"type": Database["public"]['Enums']["account_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "color"?: string | null,"created_at"?: string,"credit_limit"?: number | null,"currency_code"?: string,"deleted_at"?: string | null,"icon"?: string | null,"id"?: string,"is_archived"?: boolean,"name"?: string,"opening_balance"?: number,"payment_due_day"?: number | null,"statement_closing_day"?: number | null,"type"?: Database["public"]['Enums']["account_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "accounts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "color": string | null,"created_at": string,"deleted_at": string | null,"icon": string | null,"id": string,"is_default": boolean,"name": string,"type": Database["public"]['Enums']["category_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"icon"?: string | null,"id"?: string,"is_default"?: boolean,"name": string,"type": Database["public"]['Enums']["category_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "color"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"icon"?: string | null,"id"?: string,"is_default"?: boolean,"name"?: string,"type"?: Database["public"]['Enums']["category_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"obligations": {
                  Row: {
                    "amount": number,"created_at": string,"currency_code": string,"deleted_at": string | null,"description": string | null,"due_date": string,"id": string,"name": string,"paid_at": string | null,"source": Database["public"]['Enums']["obligation_source"],"source_id": string | null,"status": Database["public"]['Enums']["obligation_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description"?: string | null,"due_date": string,"id"?: string,"name": string,"paid_at"?: string | null,"source"?: Database["public"]['Enums']["obligation_source"],"source_id"?: string | null,"status"?: Database["public"]['Enums']["obligation_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description"?: string | null,"due_date"?: string,"id"?: string,"name"?: string,"paid_at"?: string | null,"source"?: Database["public"]['Enums']["obligation_source"],"source_id"?: string | null,"status"?: Database["public"]['Enums']["obligation_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "obligations_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"currency_code": string,"display_name": string | null,"id": string,"locale": string,"safety_reserve": number,"timezone": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"display_name"?: string | null,"id": string,"locale"?: string,"safety_reserve"?: number,"timezone"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"display_name"?: string | null,"id"?: string,"locale"?: string,"safety_reserve"?: number,"timezone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"transactions": {
                  Row: {
                    "account_id": string,"amount": number,"category_id": string | null,"created_at": string,"currency_code": string,"deleted_at": string | null,"description": string,"direction": Database["public"]['Enums']["transaction_direction"],"id": string,"notes": string | null,"recurring_transaction_id": string | null,"transaction_date": string,"transfer_group_id": string | null,"type": Database["public"]['Enums']["transaction_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_id": string,"amount": number,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description": string,"direction": Database["public"]['Enums']["transaction_direction"],"id"?: string,"notes"?: string | null,"recurring_transaction_id"?: string | null,"transaction_date": string,"transfer_group_id"?: string | null,"type": Database["public"]['Enums']["transaction_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "account_id"?: string,"amount"?: number,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description"?: string,"direction"?: Database["public"]['Enums']["transaction_direction"],"id"?: string,"notes"?: string | null,"recurring_transaction_id"?: string | null,"transaction_date"?: string,"transfer_group_id"?: string | null,"type"?: Database["public"]['Enums']["transaction_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "transactions_account_fk"
      columns: ["account_id","user_id"]
isOneToOne: false
      referencedRelation: "accounts"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "transactions_category_fk"
      columns: ["category_id","user_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "account_type": "CASH"|"CHECKING"|"SAVINGS"|"CREDIT_CARD"|"DIGITAL_WALLET"|"OTHER","alert_severity": "INFO"|"WARNING"|"CRITICAL"|"SUCCESS","category_type": "INCOME"|"EXPENSE","debt_status": "ACTIVE"|"PAID"|"PAUSED"|"CANCELLED","debt_type": "CREDIT_CARD"|"PERSONAL_LOAN"|"STUDENT_LOAN"|"MORTGAGE"|"OTHER","frequency": "WEEKLY"|"MONTHLY"|"QUARTERLY"|"YEARLY"|"CUSTOM","goal_status": "ACTIVE"|"COMPLETED"|"PAUSED"|"CANCELLED","obligation_source": "MANUAL"|"SUBSCRIPTION"|"RECURRING"|"OTHER","obligation_status": "PENDING"|"PAID"|"CANCELLED","recurring_status": "ACTIVE"|"PAUSED"|"CANCELLED","transaction_direction": "INFLOW"|"OUTFLOW","transaction_type": "INCOME"|"EXPENSE"|"TRANSFER"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "account_type": ["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"],"alert_severity": ["INFO", "WARNING", "CRITICAL", "SUCCESS"],"category_type": ["INCOME", "EXPENSE"],"debt_status": ["ACTIVE", "PAID", "PAUSED", "CANCELLED"],"debt_type": ["CREDIT_CARD", "PERSONAL_LOAN", "STUDENT_LOAN", "MORTGAGE", "OTHER"],"frequency": ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"],"goal_status": ["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"],"obligation_source": ["MANUAL", "SUBSCRIPTION", "RECURRING", "OTHER"],"obligation_status": ["PENDING", "PAID", "CANCELLED"],"recurring_status": ["ACTIVE", "PAUSED", "CANCELLED"],"transaction_direction": ["INFLOW", "OUTFLOW"],"transaction_type": ["INCOME", "EXPENSE", "TRANSFER"]
          }
        }
} as const
