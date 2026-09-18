-- QRForge saved codes (per-user). Guest history lives in the browser.
create table if not exists codes (
  id text primary key,
  user_id text not null,
  name text not null,
  payload_type text not null,
  payload text not null,
  options_json text not null,
  thumbnail_svg text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists codes_user_updated_idx
  on codes (user_id, deleted_at, updated_at desc);
