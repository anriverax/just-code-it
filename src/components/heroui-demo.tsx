"use client";

import { Button, Input, Surface } from "@heroui/react";

const HeroUIDemo = (): React.JSX.Element => {
  return (
    <Surface className="w-full max-w-md space-y-4 rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-sm backdrop-blur">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted">HeroUI v3 beta.8</p>
        <h2 className="text-xl font-semibold text-foreground">Integracion activa con Tailwind CSS v4</h2>
      </div>

      <Input aria-label="Buscar ejemplo" placeholder="Buscar ejemplo..." variant="outline" />

      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </Surface>
  );
};

export default HeroUIDemo;
