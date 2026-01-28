create table if not exists ltrfl_concepts (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references ltrfl_templates(id),
  prompt_used text not null,
  category text not null,
  subcategory text,
  images jsonb default '[]'::jsonb,
  selected_image_index integer,
  status text default 'draft' check (status in ('draft', 'reviewing', 'approved', 'cad_pending', 'cad_complete', 'rejected')),
  version integer default 1,
  parent_version_id uuid references ltrfl_concepts(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ltrfl_concepts_status_idx on ltrfl_concepts (status);
create index if not exists ltrfl_concepts_category_idx on ltrfl_concepts (category);

alter table ltrfl_concepts enable row level security;

create policy "ltrfl_concepts_authenticated_all"
  on ltrfl_concepts
  for all
  to authenticated
  using (true)
  with check (true);
