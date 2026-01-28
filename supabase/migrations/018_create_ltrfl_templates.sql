create table if not exists ltrfl_templates (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  subcategory text,
  name text not null,
  prompt text not null,
  variables jsonb default '{}'::jsonb,
  brand_colors jsonb default '{"primary": "#9CAF88", "secondary": "#F5F1EB"}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ltrfl_templates enable row level security;

create policy "ltrfl_templates_authenticated_all"
  on ltrfl_templates
  for all
  to authenticated
  using (true)
  with check (true);
