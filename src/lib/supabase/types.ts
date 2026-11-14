
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
                },"alerts": {
                  Row: {
                    "created_at": string,"dedup_key": string | null,"expires_at": string | null,"id": string,"is_read": boolean,"message": string,"metadata": NonNullable<Json>,"read_at": string | null,"severity": Database["public"]['Enums']["alert_severity"],"title": string,"type": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"dedup_key"?: string | null,"expires_at"?: string | null,"id"?: string,"is_read"?: boolean,"message": string,"metadata"?: NonNullable<Json>,"read_at"?: string | null,"severity"?: Database["public"]['Enums']["alert_severity"],"title": string,"type": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"dedup_key"?: string | null,"expires_at"?: string | null,"id"?: string,"is_read"?: boolean,"message"?: string,"metadata"?: NonNullable<Json>,"read_at"?: string | null,"severity"?: Database["public"]['Enums']["alert_severity"],"title"?: string,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "alerts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"budgets": {
                  Row: {
                    "category_id": string,"created_at": string,"currency_code": string,"deleted_at": string | null,"id": string,"limit_amount": number,"period_month": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"id"?: string,"limit_amount": number,"period_month": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"id"?: string,"limit_amount"?: number,"period_month"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "budgets_category_fk"
      columns: ["category_id","user_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "budgets_user_id_fkey"
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
                },"debt_payments": {
                  Row: {
                    "amount": number,"created_at": string,"debt_id": string,"deleted_at": string | null,"id": string,"interest_amount": number,"notes": string | null,"payment_date": string,"principal_amount": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"debt_id": string,"deleted_at"?: string | null,"id"?: string,"interest_amount"?: number,"notes"?: string | null,"payment_date"?: string,"principal_amount": number,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"debt_id"?: string,"deleted_at"?: string | null,"id"?: string,"interest_amount"?: number,"notes"?: string | null,"payment_date"?: string,"principal_amount"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "debt_payments_debt_fk"
      columns: ["debt_id","user_id"]
isOneToOne: false
      referencedRelation: "debts"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "debt_payments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"debts": {
                  Row: {
                    "created_at": string,"currency_code": string,"current_balance": number,"deleted_at": string | null,"id": string,"interest_rate_percent": number,"minimum_payment": number,"name": string,"original_amount": number,"payment_day": number | null,"status": Database["public"]['Enums']["debt_status"],"type": Database["public"]['Enums']["debt_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"current_balance": number,"deleted_at"?: string | null,"id"?: string,"interest_rate_percent"?: number,"minimum_payment"?: number,"name": string,"original_amount": number,"payment_day"?: number | null,"status"?: Database["public"]['Enums']["debt_status"],"type"?: Database["public"]['Enums']["debt_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"current_balance"?: number,"deleted_at"?: string | null,"id"?: string,"interest_rate_percent"?: number,"minimum_payment"?: number,"name"?: string,"original_amount"?: number,"payment_day"?: number | null,"status"?: Database["public"]['Enums']["debt_status"],"type"?: Database["public"]['Enums']["debt_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "debts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"goal_contributions": {
                  Row: {
                    "amount": number,"contribution_date": string,"created_at": string,"deleted_at": string | null,"goal_id": string,"id": string,"notes": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"contribution_date"?: string,"created_at"?: string,"deleted_at"?: string | null,"goal_id": string,"id"?: string,"notes"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"contribution_date"?: string,"created_at"?: string,"deleted_at"?: string | null,"goal_id"?: string,"id"?: string,"notes"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "goal_contributions_goal_fk"
      columns: ["goal_id","user_id"]
isOneToOne: false
      referencedRelation: "goals"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "goal_contributions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"goals": {
                  Row: {
                    "created_at": string,"currency_code": string,"deleted_at": string | null,"description": string | null,"id": string,"initial_amount": number,"monthly_commitment_amount": number,"name": string,"status": Database["public"]['Enums']["goal_status"],"target_amount": number,"target_date": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"initial_amount"?: number,"monthly_commitment_amount"?: number,"name": string,"status"?: Database["public"]['Enums']["goal_status"],"target_amount": number,"target_date"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"currency_code"?: string,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"initial_amount"?: number,"monthly_commitment_amount"?: number,"name"?: string,"status"?: Database["public"]['Enums']["goal_status"],"target_amount"?: number,"target_date"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "goals_user_id_fkey"
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
                },"recurring_transactions": {
                  Row: {
                    "account_id": string,"amount": number,"category_id": string,"created_at": string,"currency_code": string,"custom_interval_days": number | null,"deleted_at": string | null,"frequency": Database["public"]['Enums']["frequency"],"id": string,"is_automatic": boolean,"name": string,"next_execution_date": string,"start_date": string,"status": Database["public"]['Enums']["recurring_status"],"type": Database["public"]['Enums']["category_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_id": string,"amount": number,"category_id": string,"created_at"?: string,"currency_code"?: string,"custom_interval_days"?: number | null,"deleted_at"?: string | null,"frequency": Database["public"]['Enums']["frequency"],"id"?: string,"is_automatic"?: boolean,"name": string,"next_execution_date": string,"start_date": string,"status"?: Database["public"]['Enums']["recurring_status"],"type": Database["public"]['Enums']["category_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "account_id"?: string,"amount"?: number,"category_id"?: string,"created_at"?: string,"currency_code"?: string,"custom_interval_days"?: number | null,"deleted_at"?: string | null,"frequency"?: Database["public"]['Enums']["frequency"],"id"?: string,"is_automatic"?: boolean,"name"?: string,"next_execution_date"?: string,"start_date"?: string,"status"?: Database["public"]['Enums']["recurring_status"],"type"?: Database["public"]['Enums']["category_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "recurring_account_fk"
      columns: ["account_id","user_id"]
isOneToOne: false
      referencedRelation: "accounts"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "recurring_category_fk"
      columns: ["category_id","user_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "recurring_transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "amount": number,"category_id": string | null,"created_at": string,"currency_code": string,"custom_interval_days": number | null,"deleted_at": string | null,"frequency": Database["public"]['Enums']["frequency"],"id": string,"name": string,"next_payment_date": string,"recurring_transaction_id": string | null,"source": string,"status": Database["public"]['Enums']["recurring_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"custom_interval_days"?: number | null,"deleted_at"?: string | null,"frequency": Database["public"]['Enums']["frequency"],"id"?: string,"name": string,"next_payment_date": string,"recurring_transaction_id"?: string | null,"source"?: string,"status"?: Database["public"]['Enums']["recurring_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"custom_interval_days"?: number | null,"deleted_at"?: string | null,"frequency"?: Database["public"]['Enums']["frequency"],"id"?: string,"name"?: string,"next_payment_date"?: string,"recurring_transaction_id"?: string | null,"source"?: string,"status"?: Database["public"]['Enums']["recurring_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_category_fk"
      columns: ["category_id","user_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "subscriptions_recurring_fk"
      columns: ["recurring_transaction_id","user_id"]
isOneToOne: false
      referencedRelation: "recurring_transactions"
      referencedColumns: ["id","user_id"]
    },{
      foreignKeyName: "subscriptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
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
      foreignKeyName: "transactions_recurring_fk"
      columns: ["recurring_transaction_id","user_id"]
isOneToOne: false
      referencedRelation: "recurring_transactions"
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
            "record_debt_payment":
{ Args: { "p_amount": number,"p_debt_id": string,"p_interest"?: number,"p_notes"?: string,"p_payment_date"?: string }; Returns: string
                           },
"void_debt_payment":
{ Args: { "p_payment_id": string }; Returns: undefined
                           }
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
