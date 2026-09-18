import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { PAYLOAD_TYPES, type Payload, type PayloadType, type QrOptions } from "@/lib/qr/types";
import { serializePayload } from "@/lib/qr/payloads";
import { encodeOptionsError } from "@/lib/qr/encode";

export type CodeRow = {
  id: string;
  name: string;
  payloadType: PayloadType;
  payload: Payload;
  options: QrOptions;
  thumbnailSvg: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbRow = {
  id: string;
  name: string;
  payload_type: string;
  payload: string;
  options_json: string;
  thumbnail_svg: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function asIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapRow(row: DbRow): CodeRow {
  return {
    id: row.id,
    name: row.name,
    payloadType: row.payload_type as PayloadType,
    payload: JSON.parse(row.payload) as Payload,
    options: JSON.parse(row.options_json) as QrOptions,
    thumbnailSvg: row.thumbnail_svg,
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
  };
}

function assertSavable(input: {
  name: string;
  payload: Payload;
  options: QrOptions;
}) {
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("Name is required");
  const serialized = serializePayload(input.payload);
  if (!serialized.ok) throw new Error(serialized.message);
  const optionError = encodeOptionsError(input.options);
  if (optionError) throw new Error(optionError);
  if (!PAYLOAD_TYPES.includes(input.payload.type)) throw new Error("Unknown payload type");
  return { name, canonical: serialized.canonical };
}

async function persistCode(
  userId: string,
  data: {
    id?: string;
    name: string;
    payload: Payload;
    options: QrOptions;
    thumbnailSvg?: string | null;
  },
  enforceQuota: boolean,
): Promise<CodeRow> {
  const { name } = assertSavable(data);
  const sql = await getSql();
  const id = data.id ?? crypto.randomUUID();
  const existing = await sql<{ id: string }>`
    select id from codes where id = ${id} and user_id = ${userId} limit 1
  `;
  if (!existing[0] && enforceQuota) {
    const monthRows = await sql<{ n: number }>`
      select count(*)::int as n from codes
      where user_id = ${userId}
        and created_at > now() - interval '30 days'
        and deleted_at is null
    `;
    if ((monthRows[0]?.n ?? 0) >= 30) {
      throw new Error("Free plan allows 30 saved codes per month.");
    }
  }

  const payloadJson = JSON.stringify(data.payload);
  const optionsJson = JSON.stringify(data.options);
  const thumb = data.thumbnailSvg ?? null;
  const now = new Date().toISOString();

  if (existing[0]) {
    await sql`
      update codes
      set name = ${name},
          payload_type = ${data.payload.type},
          payload = ${payloadJson},
          options_json = ${optionsJson},
          thumbnail_svg = ${thumb},
          updated_at = ${now},
          deleted_at = null
      where id = ${id} and user_id = ${userId}
    `;
  } else {
    await sql`
      insert into codes (id, user_id, name, payload_type, payload, options_json, thumbnail_svg, created_at, updated_at)
      values (${id}, ${userId}, ${name}, ${data.payload.type}, ${payloadJson}, ${optionsJson}, ${thumb}, ${now}, ${now})
    `;
  }

  const rows = await sql<DbRow>`
    select id, name, payload_type, payload, options_json, thumbnail_svg, created_at, updated_at
    from codes where id = ${id} and user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not save code");
  return mapRow(row);
}

export const listCodes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { q?: string; type?: string } | undefined) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const q = data.q?.trim().toLowerCase() ?? "";
    const type = data.type && PAYLOAD_TYPES.includes(data.type as PayloadType) ? data.type : "";
    const rows = await sql<DbRow>`
      select id, name, payload_type, payload, options_json, thumbnail_svg, created_at, updated_at
      from codes
      where user_id = ${context.userId}
        and deleted_at is null
      order by updated_at desc
      limit 200
    `;
    return rows
      .map(mapRow)
      .filter((row) => {
        if (type && row.payloadType !== type) return false;
        if (!q) return true;
        const hay = `${row.name} ${row.payloadType}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (row.payload.type === "url") return row.payload.url.toLowerCase().includes(q);
        return false;
      });
  });

export const getCode = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<DbRow>`
      select id, name, payload_type, payload, options_json, thumbnail_svg, created_at, updated_at
      from codes
      where id = ${id} and user_id = ${context.userId} and deleted_at is null
      limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("Not found");
    return mapRow(row);
  });

export const saveCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      name: string;
      payload: Payload;
      options: QrOptions;
      thumbnailSvg?: string | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    return persistCode(context.userId, data, true);
  });

export const deleteCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`
      update codes
      set deleted_at = now(), updated_at = now()
      where id = ${id} and user_id = ${context.userId} and deleted_at is null
    `;
    return { ok: true as const };
  });

export const mergeGuestCodes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      items: Array<{
        name: string;
        payload: Payload;
        options: QrOptions;
        thumbnailSvg?: string | null;
      }>;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    let imported = 0;
    let skipped = 0;
    for (const item of data.items.slice(0, 20)) {
      try {
        await persistCode(
          context.userId,
          {
            name: item.name,
            payload: item.payload,
            options: item.options,
            thumbnailSvg: item.thumbnailSvg ?? null,
          },
          true,
        );
        imported += 1;
      } catch {
        skipped += 1;
      }
    }
    return { imported, skipped };
  });

export const deleteAllMyCodes = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update codes set deleted_at = now(), updated_at = now() where user_id = ${context.userId} and deleted_at is null`;
    return { ok: true as const };
  });

export const exportMyCodes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<DbRow>`
      select id, name, payload_type, payload, options_json, thumbnail_svg, created_at, updated_at
      from codes
      where user_id = ${context.userId} and deleted_at is null
      order by updated_at desc
    `;
    return {
      exportedAt: new Date().toISOString(),
      codes: rows.map((row) => {
        const mapped = mapRow(row);
        return {
          id: mapped.id,
          name: mapped.name,
          payloadType: mapped.payloadType,
          payload: mapped.payload,
          options: mapped.options,
          createdAt: mapped.createdAt,
          updatedAt: mapped.updatedAt,
        };
      }),
    };
  });
