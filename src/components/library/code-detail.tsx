import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteCode, getCode, saveCode } from "@/lib/codes";
import { deleteGuestCode, getGuestCode, upsertGuestCode } from "@/lib/guest-store";
import { canGenerate, encodeQr } from "@/lib/qr/encode";
import { downloadFilename } from "@/lib/qr/filename";
import { renderRasterBlob, renderSvgString, svgToBlob, triggerDownload } from "@/lib/qr/render";
import { TYPE_META } from "@/lib/qr/payloads";
import { QrPreview } from "@/components/generator/qr-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function CodeDetail({ id }: { id: string }) {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string | null>(null);

  const cloud = useQuery({
    queryKey: ["code", id],
    queryFn: () => getCode({ data: id }),
    enabled: Boolean(user) && !isPending,
    retry: false,
  });

  const guest = !user && !isPending ? getGuestCode(id) : undefined;
  const item = cloud.data ?? guest;

  const encoded = useMemo(() => {
    if (!item) return null;
    const valid = canGenerate(item.payload, item.options);
    if (!valid.ok) return null;
    try {
      return encodeQr(valid.canonical, item.options);
    } catch {
      return null;
    }
  }, [item]);

  if (isPending || (user && cloud.isLoading)) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  }

  if (!item) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl font-medium">Code not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or it only existed on another device.</p>
        <Button asChild className="mt-6">
          <Link to="/library">Back to library</Link>
        </Button>
      </div>
    );
  }

  const record = item;
  const label = name ?? record.name;

  async function download(format: "png" | "svg" | "jpeg") {
    if (!encoded) return;
    const filename = downloadFilename(record.payloadType, format === "jpeg" ? "jpg" : format);
    if (format === "svg") {
      triggerDownload(svgToBlob(renderSvgString(encoded, record.options)), filename);
    } else {
      triggerDownload(await renderRasterBlob(encoded, record.options, format), filename);
    }
    toast.success(`Downloaded ${filename}`);
  }

  async function onRename() {
    const next = label.trim();
    if (!next) return;
    if (user) {
      await saveCode({
        data: {
          id: record.id,
          name: next,
          payload: record.payload,
          options: record.options,
          thumbnailSvg: record.thumbnailSvg,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["code", id] });
      await queryClient.invalidateQueries({ queryKey: ["codes"] });
    } else {
      upsertGuestCode({ ...record, name: next, updatedAt: new Date().toISOString() });
    }
    toast.success("Renamed");
  }

  async function onDelete() {
    if (!window.confirm(`Delete “${record.name}”?`)) return;
    if (user) {
      await deleteCode({ data: id });
      await queryClient.invalidateQueries({ queryKey: ["codes"] });
    } else {
      deleteGuestCode(id);
    }
    toast.success("Deleted");
    void navigate({ to: "/library" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <QrPreview
        encoded={encoded}
        options={record.options}
        payloadType={record.payloadType}
        isStale={false}
        hint={null}
      />
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{TYPE_META[record.payloadType].short}</Badge>
          <Badge variant="secondary">Static</Badge>
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="code-name">Name</Label>
          <div className="flex gap-2">
            <Input id="code-name" value={label} onChange={(e) => setName(e.target.value)} />
            <Button type="button" variant="outline" onClick={() => void onRename()}>
              Save name
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground tabular-nums">
          Updated {new Date(record.updatedAt).toLocaleString()}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" disabled={!encoded} onClick={() => void download("png")}>
            <Download />
            Download PNG
          </Button>
          <Button type="button" variant="outline" disabled={!encoded} onClick={() => void download("svg")}>
            SVG
          </Button>
          <Button type="button" variant="outline" disabled={!encoded} onClick={() => void download("jpeg")}>
            JPEG
          </Button>
          <Button asChild variant="secondary">
            <Link to="/create" search={{ type: record.payloadType }}>
              Duplicate in workspace
            </Link>
          </Button>
        </div>
        <div className="mt-10 rounded-xl border border-destructive/30 p-4">
          <p className="font-medium text-destructive">Delete this code</p>
          <p className="mt-1 text-sm text-muted-foreground">Removed from the default list. Guest copies cannot be restored.</p>
          <Button type="button" variant="destructive" className="mt-3" onClick={() => void onDelete()}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}