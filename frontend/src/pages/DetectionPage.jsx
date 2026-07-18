import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, FileText, AlertTriangle, ScanEye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { detectWaste } from "@/lib/api";

const LABEL_COLORS = {
  plastic: "bg-primary",
  cardboard: "bg-warning",
  paper: "bg-slate-300",
  metal: "bg-violet",
  glass: "bg-secondary",
  trash: "bg-danger",
};

const PRIORITY_VARIANT = { Critical: "danger", High: "warning", Medium: "secondary", Low: "accent" };

export function DetectionPage() {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setAnalyzing(true);
    try {
      const data = await detectWaste(file);
      setResult(data);
    } catch (err) {
      setError("Couldn't reach the detection API. Confirm the backend is running and VITE_API_URL is set.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">AI detection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a photo to run real waste classification and risk scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          className="flex min-h-[380px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/40"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {!image ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload size={26} className="text-primary" />
              </div>
              <p className="mb-1 font-semibold">Drag & drop an image, or click to browse</p>
              <p className="mb-5 text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                <Camera size={15} /> Use camera
              </Button>
            </>
          ) : (
            <img src={image} alt="Uploaded preview" className="max-h-80 max-w-full rounded-xl object-cover" />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection results</CardTitle>
          </CardHeader>
          <CardContent>
            {!image && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <ScanEye size={28} className="text-muted-foreground" />
                <p className="max-w-[220px] text-sm text-muted-foreground">
                  Upload an image to see detected waste type, confidence, and risk level.
                </p>
              </div>
            )}

            {image && analyzing && (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  className="h-10 w-10 rounded-full border-[3px] border-border border-t-primary"
                />
                <p className="text-sm text-muted-foreground">Running computer vision model...</p>
              </div>
            )}

            {image && !analyzing && error && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                <AlertTriangle size={26} className="text-warning" />
                <p className="max-w-[260px] text-sm text-muted-foreground">{error}</p>
              </div>
            )}

            {image && !analyzing && result && (
              <div>
                <div className="mb-5 flex gap-2">
                  <Badge variant="warning">Risk: {result.risk_level}</Badge>
                  <Badge variant="danger">Priority: {result.cleanup_priority}</Badge>
                </div>
                <div className="space-y-3.5">
                  {result.predictions.map((p) => (
                    <div key={p.label}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-semibold capitalize">{p.label}</span>
                        <span className="text-muted-foreground">{p.confidence}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.confidence}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${LABEL_COLORS[p.label?.toLowerCase()] || "bg-primary"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mb-4 mt-3 text-xs text-muted-foreground">
                  {result.model} · inference {result.inference_ms}ms · saved to database
                </p>
                <Button className="w-full">
                  <FileText size={15} /> Generate AI report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
