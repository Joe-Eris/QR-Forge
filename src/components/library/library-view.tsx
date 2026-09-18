import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Search } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteCode, listCodes, mergeGuestCodes, type CodeRow } from "@/lib/codes";
import {
  clearGuestCodes,
  deleteGuestCode,
  guestHasSensitive,
  useGuestCodes,
  type StoredCode,
} from "@/lib/guest-store";
import { svgForHtml } from "@/lib/qr/render";
import { TYPE_META } from "@/lib/qr/payloads";
import { PAYLOAD_TYPES, type PayloadType } from "@/lib/qr/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Item = CodeRow | StoredCode;

function matches(item: Item, q: string, type: string) {
  if (type && type !== "all" && item.payloadType !== type) return false;
  if (!q) return true;
  const hay = `${item.name} ${item.payloadType}`.toLowerCase();
  if (hay.includes(q)) return true;
  if (item.payload.type === "url") return item.payload.url.toLowerCase().includes(q);
  return false;
}

function CodeCard({
  item,
  source,
  onDelete,
}: {
  item: Item;
  source: "cloud" | "device";
  onDelete: (id: string) => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link to="/library/$id" params={{ id: item.id }} className="block aspect-square bg-muted p-4">
        {item.thumbnailSvg ? (
          <div
            className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svgForHtml(item.thumbnailSvg) }}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">No preview</div>
        )}
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link to="/library/$id" params={{ id: item.id }} className="block truncate font-medium hover:underline">
            {item.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline">{TYPE_META[item.payloadType].short}</Badge>
            <Badge variant="secondary">Static</Badge>
            {source === "device" ? <Badge variant="secondary">This device</Badge> : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${item.name}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/library/$id" params={{ id: item.id }}>
                Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm(`Delete “${item.name}”?`)) onDelete(item.id);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export function LibraryView() {
  const { user, isPending } = useCurrentUserState();
  const guest = useGuestCodes();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [merging, setMerging] = useState(false);

  const cloud = useQuery({
    queryKey: ["codes", user?.id, q, type],
    queryFn: () =>
      listCodes({
        data: { q: q || undefined, type: type === "all" ? undefined : type },
      }),
    enabled: Boolean(user),
  });

  const filteredGuest = useMemo(
    () => guest.filter((item) => matches(item, q.toLowerCase(), type)),
    [guest, q, type],
  );

  async function onDelete(id: string) {
    if (user) {
      try {
        await deleteCode({ data: id });
        await queryClient.invalidateQueries({ queryKey: ["codes"] });
        toast.success("Deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete");
      }
    } else {
      deleteGuestCode(id);
      toast.success("Deleted from this device");
    }
  }

  async function onMerge() {
    if (!user || !guest.length) return;
    setMerging(true);
    try {
      const result = await mergeGuestCodes({
        data: {
          items: guest.map((item) => ({
            name: item.name,
            payload: item.payload,
            options: item.options,
            thumbnailSvg: item.thumbnailSvg,
          })),
        },
      });
      clearGuestCodes();
      await queryClient.invalidateQueries({ queryKey: ["codes"] });
      toast.success(`Imported ${result.imported} code${result.imported === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import");
    } finally {
      setMerging(false);
    }
  }

  const emptyCloud = user && !cloud.isLoading && !(cloud.data?.length);
  const emptyGuest = !user && filteredGuest.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Library</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Your codes</h1>
        <p className="max-w-2xl text-muted-foreground">
          {user
            ? "Saved to your account. Re-download any format from the original payload."
            : "Last 20 codes stay on this device. Sign in to keep them across browsers."}
        </p>
      </div>

      {user && guest.length > 0 ? (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <p className="font-medium">
            {guest.length} code{guest.length === 1 ? "" : "s"} on this device
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {guestHasSensitive(guest)
              ? "This list includes Wi-Fi or contact cards. Import only if you trust this browser."
              : "Import them into your account, or leave them local."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void onMerge()} disabled={merging}>
              {merging ? "Importing…" : "Import to library"}
            </Button>
            <Button type="button" variant="outline" onClick={() => clearGuestCodes()}>
              Discard local copies
            </Button>
          </div>
        </div>
      ) : null}

      {!isPending && !user ? (
        <div className="mb-6 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          Guest history never left this device.{" "}
          <Link to="/login" search={{ next: "/library" }} className="font-medium text-primary hover:underline">
            Sign in to sync
          </Link>
          .
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or URL host"
            className="pl-9"
            aria-label="Search codes"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {PAYLOAD_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_META[t as PayloadType].short}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending || (user && cloud.isLoading) ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : emptyCloud || emptyGuest ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-2xl font-medium">Create your first code</p>
          <p className="mt-2 text-sm text-muted-foreground">The workspace encodes in the browser. Download PNG in seconds.</p>
          <Button asChild className="mt-6">
            <Link to="/create" search={{ type: "url" }}>
              Create a QR code
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user
            ? (cloud.data ?? []).map((item) => (
                <CodeCard key={item.id} item={item} source="cloud" onDelete={(id) => void onDelete(id)} />
              ))
            : filteredGuest.map((item) => (
                <CodeCard key={item.id} item={item} source="device" onDelete={(id) => void onDelete(id)} />
              ))}
        </div>
      )}
    </div>
  );
}