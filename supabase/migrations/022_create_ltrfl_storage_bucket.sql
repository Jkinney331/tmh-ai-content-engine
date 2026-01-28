insert into storage.buckets (id, name, public)
values ('ltrfl-concepts', 'ltrfl-concepts', true)
on conflict (id) do update
  set public = excluded.public,
      name = excluded.name;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ltrfl_concepts_public_read'
  ) then
    create policy "ltrfl_concepts_public_read"
      on storage.objects
      for select
      using (bucket_id = 'ltrfl-concepts');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ltrfl_concepts_authenticated_insert'
  ) then
    create policy "ltrfl_concepts_authenticated_insert"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'ltrfl-concepts');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ltrfl_concepts_authenticated_update'
  ) then
    create policy "ltrfl_concepts_authenticated_update"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'ltrfl-concepts')
      with check (bucket_id = 'ltrfl-concepts');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ltrfl_concepts_authenticated_delete'
  ) then
    create policy "ltrfl_concepts_authenticated_delete"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'ltrfl-concepts');
  end if;
end $$;
