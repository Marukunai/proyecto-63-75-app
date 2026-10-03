-- Run once in Supabase Dashboard > SQL Editor.
-- The browser app uses the anon/publishable key plus a signed-in Auth user.
-- Row Level Security ensures each account can access only its own sync records.

create table if not exists public.user_sync_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  table_name text not null check (table_name in (
    'profile', 'habits', 'dailyLogs', 'weightLogs', 'exercises', 'workoutLogs',
    'personalRecords', 'nutritionLogs', 'sleepLogs', 'bodyMeasurements',
    'projectTasks', 'journalEntries', 'weeklyReviews', 'japanLogs', 'appSettings'
  )),
  record_id uuid not null,
  data jsonb,
  updated_at bigint not null,
  is_deleted boolean not null default false,
  primary key (user_id, table_name, record_id)
);

-- Habilitar RLS
alter table public.user_sync_records enable row level security;

-- Revocar todos los privilegios por defecto
revoke all on public.user_sync_records from public, anon, authenticated;

-- SOLUCIÓN: Especificar la tabla y el rol correctamente
grant select, insert, update on public.user_sync_records to authenticated;

-- Configurar Políticas de Seguridad (RLS)
drop policy if exists "Users manage their own sync records" on public.user_sync_records;
create policy "Users manage their own sync records"
  on public.user_sync_records
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
