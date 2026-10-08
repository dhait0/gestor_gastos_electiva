-- Base helpers and types for FinWise
-- Created: 2026-10-08

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create private schema for internal functions
create schema if not exists private;

-- updated_at trigger function
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Domain enums
create type account_type as enum (
  'CASH',
  'CHECKING',
  'SAVINGS',
  'CREDIT_CARD',
  'DIGITAL_WALLET',
  'OTHER'
);

create type category_type as enum (
  'INCOME',
  'EXPENSE'
);

create type transaction_type as enum (
  'INCOME',
  'EXPENSE',
  'TRANSFER'
);

create type transaction_direction as enum (
  'INFLOW',
  'OUTFLOW'
);

create type obligation_status as enum (
  'PENDING',
  'PAID',
  'CANCELLED'
);

create type obligation_source as enum (
  'MANUAL',
  'SUBSCRIPTION',
  'RECURRING',
  'OTHER'
);

create type goal_status as enum (
  'ACTIVE',
  'COMPLETED',
  'PAUSED',
  'CANCELLED'
);

create type recurring_status as enum (
  'ACTIVE',
  'PAUSED',
  'CANCELLED'
);

create type frequency as enum (
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
  'CUSTOM'
);

create type debt_type as enum (
  'CREDIT_CARD',
  'PERSONAL_LOAN',
  'STUDENT_LOAN',
  'MORTGAGE',
  'OTHER'
);

create type debt_status as enum (
  'ACTIVE',
  'PAID',
  'PAUSED',
  'CANCELLED'
);

create type alert_severity as enum (
  'INFO',
  'WARNING',
  'CRITICAL',
  'SUCCESS'
);