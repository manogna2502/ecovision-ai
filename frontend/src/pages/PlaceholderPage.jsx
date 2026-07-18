import React from "react";
import { MapPin } from "lucide-react";

export function PlaceholderPage({ title, description }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <MapPin size={24} className="text-primary" />
      </div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
