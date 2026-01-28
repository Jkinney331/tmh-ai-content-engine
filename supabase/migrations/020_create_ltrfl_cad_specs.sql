create table if not exists ltrfl_cad_specs (
  id uuid default gen_random_uuid() primary key,
  concept_id uuid references ltrfl_concepts(id) not null,
  urn_type text not null check (urn_type in ('traditional', 'figurine', 'keepsake')),
  material text not null,
  volume_cu_in decimal default 200,
  height_mm decimal,
  diameter_mm decimal,
  wall_thickness_mm decimal default 3,
  access_method text check (access_method in ('top_lid', 'bottom_loading', 'permanent_seal')),
  lid_type text,
  base_plate_specs jsonb,
  engraving_area jsonb,
  cad_file_url text,
  cad_format text,
  status text default 'pending' check (status in ('pending', 'generating', 'complete', 'failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ltrfl_cad_specs enable row level security;

create policy "ltrfl_cad_specs_authenticated_all"
  on ltrfl_cad_specs
  for all
  to authenticated
  using (true)
  with check (true);
