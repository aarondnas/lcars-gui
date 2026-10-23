"use client"; // Keypad receives an onSubmit function

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
              <Button align="start">Tactical</Button>
              <Button align="start" color={6}>Navigation</Button>
              <Button align="start" color={4}>Cloak</Button>
            </>
          }
        >
          <section style={section}>
            <DataCascade columns={8} rows={4} />
            <Divider />
            <div style={row}>
              <Button variant="solid">Solid</Button>
              <Button shape="point-left" color={6}>Back</Button>
              <Button shape="point-right" color={6}>Forward</Button>
              <Toggle color={3} defaultPressed>Shields</Toggle>
            </div>
          </section>

          <section style={section}>
            <ButtonGrid columns={4}>
              <Button>Disruptor</Button>
              <Button color={6}>Torpedo</Button>
              <Button color={3}>Tractor</Button>
              <Button color={4}>Singularity</Button>
            </ButtonGrid>
          </section>

          <section style={{ ...section, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Course" placeholder="Romulus · Remus" />
              <Slider defaultValue={64} />
              <LevelBar value={64} />
              <div style={row}>
                <StatusIndicator status="ok">Cloak</StatusIndicator>
                <StatusIndicator status="warn">Shields</StatusIndicator>
                <StatusIndicator status="error" blink>Hull</StatusIndicator>
              </div>
            </div>
            <Keypad length={4} mask onSubmit={(code) => code === "1701"} />
          </section>

          <section style={section}>
            <Tabs
              items={[
                { id: "target", label: "Target", content: "Neutral Zone, sector 4." },
                { id: "crew", label: "Crew", color: 6, content: "1,200 crew." },
              ]}
            />
          </section>

          <section style={{ ...section, ...row, gap: 28 }}>
            <Readout
              style={{ minWidth: 260 }}
              items={[
                { label: "Singularity", value: "98.4" },
                { label: "Cloaking field", value: "Stable" },
              ]}
            />
            <Gauge value={64} label="Power" />
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
