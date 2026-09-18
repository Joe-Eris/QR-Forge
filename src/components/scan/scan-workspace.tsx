import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, Upload, Copy, ExternalLink, Flashlight } from "lucide-react";
import { decodeImageFile, decodeVideoFrame, type DecodeHit } from "@/lib/qr/decode";
import { detectPayloadType } from "@/lib/qr/payloads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TYPE_META } from "@/lib/qr/payloads";

function hostOf(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.host;
  } catch {
    return null;
  }
}

export function ScanWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hits, setHits] = useState<DecodeHit[]>([]);
  const [picked, setPicked] = useState(0);
  const [openSafe, setOpenSafe] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    setTorch(false);
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setCameraOn(true);
      timerRef.current = window.setInterval(() => {
        void tick();
      }, 280);
    } catch {
      setCameraError("Camera permission was denied. Upload a photo instead.");
    }
  }

  async function tick() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    try {
      const found = await decodeVideoFrame(video);
      if (found.length) {
        setHits(found);
        setPicked(0);
        stopCamera();
      }
    } catch {
      /* keep scanning */
    }
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torch } as MediaTrackConstraintSet],
      });
      setTorch(!torch);
    } catch {
      toast.message("Torch is not available on this camera.");
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setHits([]);
    try {
      const found = await decodeImageFile(file);
      setHits(found);
      setPicked(0);
      if (!found.length) {
        toast.error("No QR code found. Try a tighter crop, more light, or less blur.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not decode that image");
    } finally {
      setBusy(false);
    }
  }

  const current = hits[picked];
  const type = current ? detectPayloadType(current.text) : null;
  const urlHost = current ? hostOf(current.text) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Decoder</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Scan a QR code</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Decode happens in this browser. Images are not uploaded. Links never open until you confirm the domain.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={() => (cameraOn ? stopCamera() : void startCamera())}>
            <Camera />
            {cameraOn ? "Stop camera" : "Use camera"}
          </Button>
          <label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <span className="inline-flex">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload />
                  {busy ? "Reading…" : "Upload image"}
                </span>
              </Button>
            </span>
          </label>
          {cameraOn ? (
            <Button type="button" variant="secondary" onClick={() => void toggleTorch()}>
              <Flashlight />
              {torch ? "Torch off" : "Torch"}
            </Button>
          ) : null}
        </div>
        {cameraError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {cameraError}
          </p>
        ) : null}

        <div
          className="mt-6 overflow-hidden rounded-xl border border-border bg-ink"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onFile(e.dataTransfer.files[0]);
          }}
        >
          <video
            ref={videoRef}
            className={cameraOn ? "aspect-[4/3] w-full object-cover" : "hidden"}
            playsInline
            muted
          />
          {!cameraOn ? (
            <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-sm text-primary-foreground/80">
              Drop a JPEG, PNG, WebP, or GIF here — or start the camera.
            </div>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!current ? (
            <p className="text-sm text-muted-foreground">
              Nothing decoded yet. Point the camera at a code or upload a photo of a poster, screen, or print.
            </p>
          ) : (
            <>
              {hits.length > 1 ? (
                <div className="flex flex-wrap gap-2">
                  {hits.map((h, i) => (
                    <Button
                      key={`${h.text}-${i}`}
                      type="button"
                      size="sm"
                      variant={i === picked ? "default" : "outline"}
                      onClick={() => setPicked(i)}
                    >
                      Code {i + 1}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {type ? <Badge>{TYPE_META[type].short}</Badge> : null}
                {urlHost ? <Badge variant="outline">{urlHost}</Badge> : null}
              </div>
              {urlHost ? (
                <p className="text-sm">
                  This code opens <span className="font-medium">{urlHost}</span>. Confirm before leaving QRForge.
                </p>
              ) : null}
              <pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-all">
                {current.text}
              </pre>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(current.text);
                    toast.success("Copied payload");
                  }}
                >
                  <Copy />
                  Copy
                </Button>
                {urlHost ? (
                  <Button type="button" onClick={() => setOpenSafe(true)}>
                    <ExternalLink />
                    Safe Open
                  </Button>
                ) : null}
                {type ? (
                  <Button asChild variant="secondary">
                    <Link to="/create" search={{ type }}>
                      Make a new code
                    </Link>
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={openSafe} onOpenChange={setOpenSafe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open this link?</DialogTitle>
            <DialogDescription>
              You are leaving QRForge for {urlHost}. We do not verify the destination.
            </DialogDescription>
          </DialogHeader>
          <p className="break-all font-mono text-xs text-muted-foreground">{current?.text}</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpenSafe(false)}>
              Stay here
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (current) window.open(current.text, "_blank", "noopener,noreferrer");
                setOpenSafe(false);
              }}
            >
              Open {urlHost}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}