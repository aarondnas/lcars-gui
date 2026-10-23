"use client"; // Keypad bekommt eine onSubmit-Funktion

import "@lcars-gui/romulus/ui.css";
import "@lcars-gui/romulus/themes/tal-shiar.css";
import {
  AlertBanner,
  Button,
  ButtonGrid,
  DataCascade,
  Divider,
  Gauge,
  Input,
  Keypad,
  LevelBar,
  Panel,
  Readout,
  RomulusRoot,
  Sensor,
  Slider,
  SoundProvider,
  StatusIndicator,
  Tabs,
  Toggle,
} from "@lcars-gui/romulus/react";

const section = { marginBottom: 32 };
const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 } as const;

export default function RomulusPage() {
  return (
    <SoundProvider>
      <RomulusRoot
        theme="warbird"
        style={{
          margin: -40,
          padding: 32,
          minHeight: "100vh",
          background: "var(--rom-colors-background)",
          fontFamily: "var(--rom-font-family)",
        }}
      >
        <Panel
          code="R-7734"
          title="Romulus – React"
          sidebar={
            <>
              <Button align="start">Taktik</Button>
              <Button align="start" color={6}>Navigation</Button>
              <Button align="start" color={4}>Tarnung</Button>
            </>
          }
        >
          <section style={section}>
            <DataCascade columns={8} rows={4} />
            <Divider />
            <div style={row}>
              <Button variant="solid">Solid</Button>
              <Button shape="point-left" color={6}>Zurück</Button>
              <Button shape="point-right" color={6}>Weiter</Button>
              <Toggle color={3} defaultPressed>Schilde</Toggle>
            </div>
          </section>

          <section style={section}>
            <ButtonGrid columns={4}>
              <Button>Disruptor</Button>
              <Button color={6}>Torpedo</Button>
              <Button color={3}>Traktor</Button>
              <Button color={4}>Singularität</Button>
            </ButtonGrid>
          </section>

          <section style={{ ...section, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Kurs" placeholder="Romulus · Remus" />
              <Slider defaultValue={64} />
              <LevelBar value={64} />
              <div style={row}>
                <StatusIndicator status="ok">Tarnung</StatusIndicator>
                <StatusIndicator status="warn">Schilde</StatusIndicator>
                <StatusIndicator status="error" blink>Hülle</StatusIndicator>
              </div>
            </div>
            <Keypad length={4} mask onSubmit={(code) => code === "1701"} />
          </section>

          <section style={section}>
            <Tabs
              items={[
                { id: "ziel", label: "Ziel", content: "Neutrale Zone, Sektor 4." },
                { id: "crew", label: "Crew", color: 6, content: "1.200 Besatzung." },
              ]}
            />
          </section>

          <section style={{ ...section, ...row, gap: 28 }}>
            <Readout
              style={{ minWidth: 260 }}
              items={[
                { label: "Singularität", value: "98.4" },
                { label: "Tarnfeld", value: "Stabil" },
              ]}
            />
            <Gauge value={64} label="Energie" />
            <LevelBar value={40} orientation="vertical" color={4} segments={8} />
          </section>

          <section style={section}>
            <Sensor scan style={{ maxWidth: 560 }} blips={[{ x: 30, y: 40 }, { x: 68, y: 62, color: 4 }]} />
          </section>

          <AlertBanner level="red" />
        </Panel>
      </RomulusRoot>
    </SoundProvider>
  );
}
