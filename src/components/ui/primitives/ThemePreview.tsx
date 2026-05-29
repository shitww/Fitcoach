"use client";

import { Surface } from "./Surface";
import { Card } from "./Card";
import { Text } from "./Text";
import { Divider } from "./Divider";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { IconContainer } from "./IconContainer";
import { Section } from "./Section";

export function ThemePreview() {
  return (
    <div className="space-y-6 p-6">
      <Section title="Surfaces">
        <div className="flex flex-wrap gap-3">
          <Surface variant="default" className="p-4 rounded-xl">Background</Surface>
          <Surface variant="card" className="p-4 rounded-xl">Card</Surface>
          <Surface variant="elevated" className="p-4 rounded-xl">Elevated</Surface>
          <Surface variant="muted" className="p-4 rounded-xl">Muted</Surface>
          <Surface variant="secondary" className="p-4 rounded-xl">Secondary</Surface>
        </div>
      </Section>

      <Section title="Text Hierarchy">
        <div className="space-y-2">
          <Text size="hero">Hero Text</Text>
          <Text size="section">Section Text</Text>
          <Text variant="primary">Primary Text</Text>
          <Text variant="secondary">Secondary Text</Text>
          <Text variant="muted">Muted Text</Text>
          <Text size="caption">Caption Text</Text>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="muted">Muted</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </Section>

      <Section title="Inputs & Icons">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Type here..." className="w-48" />
          <IconContainer><span className="text-lg">★</span></IconContainer>
          <IconContainer variant="primary"><span className="text-lg">★</span></IconContainer>
          <IconContainer variant="accent"><span className="text-lg">★</span></IconContainer>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">Default Card</Card>
          <Card variant="secondary" className="p-4">Secondary Card</Card>
          <Card variant="muted" className="p-4">Muted Card</Card>
          <Card variant="glass" className="p-4">Glass Card</Card>
        </div>
      </Section>

      <Divider />
      <Text size="caption">All primitives use semantic tokens and adapt to both themes automatically.</Text>
    </div>
  );
}
