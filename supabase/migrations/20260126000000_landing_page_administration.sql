
-- Tabela para a Seção Hero
create table if not exists landing_hero (
  id uuid primary key default uuid_generate_v4(),
  bg_image_url text, -- URL da imagem de fundo
  badge_text text, -- Texto do badge
  heading_text text, -- Título principal
  subtitle_text text, -- Subtítulo
  button_primary_text text,
  button_primary_link text,
  button_secondary_text text,
  button_secondary_link text,
  stats_years text,
  stats_clients text,
  stats_products text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Configuração da Seção de Coleção
create table if not exists landing_collection_config (
  id uuid primary key default uuid_generate_v4(),
  section_title text,
  section_subtitle text,
  description text,
  collection_name text,
  collection_cta_text text,
  collection_cta_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Itens da Coleção
create table if not exists landing_collection_items (
  id uuid primary key default uuid_generate_v4(),
  title text,
  category text,
  image_url text,
  product_reference text,
  public boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Catálogos (PDFs)
create table if not exists landing_catalogs (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  cover_image_url text,
  pdf_url text,
  link_url text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Configuração do Instagram
create table if not exists landing_instagram_config (
  id uuid primary key default uuid_generate_v4(),
  username text,
  title text,
  subtitle text,
  manual_posts jsonb,
  use_api boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table landing_hero enable row level security;
alter table landing_collection_config enable row level security;
alter table landing_collection_items enable row level security;
alter table landing_catalogs enable row level security;
alter table landing_instagram_config enable row level security;

-- Public Read
drop policy if exists "Public Read Hero" on landing_hero;
create policy "Public Read Hero" on landing_hero for select using (true);
drop policy if exists "Public Read Collection Config" on landing_collection_config;
create policy "Public Read Collection Config" on landing_collection_config for select using (true);
drop policy if exists "Public Read Collection Items" on landing_collection_items;
create policy "Public Read Collection Items" on landing_collection_items for select using (true);
drop policy if exists "Public Read Catalogs" on landing_catalogs;
create policy "Public Read Catalogs" on landing_catalogs for select using (true);
drop policy if exists "Public Read Instagram" on landing_instagram_config;
create policy "Public Read Instagram" on landing_instagram_config for select using (true);

-- Admin Write (Authenticated)
drop policy if exists "Admin Update Hero" on landing_hero;
create policy "Admin Update Hero" on landing_hero for all using (auth.role() = 'authenticated');
drop policy if exists "Admin Update Collection Config" on landing_collection_config;
create policy "Admin Update Collection Config" on landing_collection_config for all using (auth.role() = 'authenticated');
drop policy if exists "Admin Update Collection Items" on landing_collection_items;
create policy "Admin Update Collection Items" on landing_collection_items for all using (auth.role() = 'authenticated');
drop policy if exists "Admin Update Catalogs" on landing_catalogs;
create policy "Admin Update Catalogs" on landing_catalogs for all using (auth.role() = 'authenticated');
drop policy if exists "Admin Update Instagram" on landing_instagram_config;
create policy "Admin Update Instagram" on landing_instagram_config for all using (auth.role() = 'authenticated');

-- Cleanup duplicates
delete from landing_hero where id not in (select id from landing_hero order by created_at desc limit 1);
delete from landing_collection_config where id not in (select id from landing_collection_config order by created_at desc limit 1);
delete from landing_instagram_config where id not in (select id from landing_instagram_config order by created_at desc limit 1);

-- Seed Data (conditional)
insert into landing_hero (bg_image_url, badge_text, heading_text, subtitle_text, button_primary_text, button_primary_link, button_secondary_text, button_secondary_link, stats_years, stats_clients, stats_products)
select '/assets/hero-bg.jpg', 'Nova Coleção Outono Inverno 2026', 'Elegância que Atravessa Gerações', 'Há mais de 30 anos trazendo o melhor da moda internacional para o Brasil. Descubra peças exclusivas que definem seu estilo.', 'Ver Coleção OI26', '/colecao', 'Área do Cliente', '/login', '30+', '500+', '1000+'
where not exists (select 1 from landing_hero);

insert into landing_collection_config (section_title, section_subtitle, description, collection_name)
select 'Nova Coleção', 'Outono Inverno 2026', 'Peças exclusivas que combinam elegância atemporal com tendências contemporâneas. Descubra o que preparamos para esta temporada.', 'Outono Inverno 2026'
where not exists (select 1 from landing_collection_config);

-- Storage setup
insert into storage.buckets (id, name, public) 
values ('landing-page-assets', 'landing-page-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'landing-page-assets' );
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'landing-page-assets' and auth.role() = 'authenticated' );
drop policy if exists "Authenticated Update" on storage.objects;
create policy "Authenticated Update" on storage.objects for update using ( bucket_id = 'landing-page-assets' and auth.role() = 'authenticated' ) with check ( bucket_id = 'landing-page-assets' and auth.role() = 'authenticated' );
drop policy if exists "Authenticated Delete" on storage.objects;
create policy "Authenticated Delete" on storage.objects for delete using ( bucket_id = 'landing-page-assets' and auth.role() = 'authenticated' );
