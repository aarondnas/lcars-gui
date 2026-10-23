import {
  AlertBanner,
  Bar,
  Block,
  Button,
  ButtonGrid,
  DataCascade,
  Divider,
  Gauge,
  Input,
  Keypad,
  LcarsRoot,
  LevelBar,
  Readout,
  Sensor,
  Slider,
  SoundProvider,
  SplitFrame,
  StatusIndicator,
  Tabs,
  Toggle,
} from "@lcars-gui/federation/react";

const section = { marginBottom: 40 };

export default function Page() {
  return (
    <SoundProvider>
      <LcarsRoot theme="tng">
        <SplitFrame
          color={1}
          title="UI Library Test"
          header={<DataCascade columns={9} rows={5} />}
          headerSidebar={<Block color={4}>01-4711</Block>}
          upperLabel="02-1701"
          lowerLabel="03-0047"
          lowerBar={
            <>
              <Bar color={2} length="m" />
              <Bar color={6} />
              <Bar color={2} cap="right" length="xs" />
            </>
          }
          style={{ minHeight: "calc(100vh - 80px)" }}
          sidebar={
            <>
              <Toggle color={2} shape="rect" align="bottom-right" defaultPressed>Schilde</Toggle>
              <Toggle color={4} shape="rect" align="bottom-right">Phaser</Toggle>
              <Button color={6} shape="rect" align="bottom-right">Warp</Button>
            </>
          }
        >
          <div style={section}>
            <ButtonGrid columns={4} style={{ maxWidth: 520 }}>
              {["Navigation", "Comms", "Taktik", "Ops", "Holodeck", "Transporter", "Krankenst.", "Logbuch"].map((label, i) => (
                <Button key={label} color={([1, 4, 6, 4, 7, 1, 2, 4] as const)[i]} shape="rect" align="bottom-right">
                  {label}
                </Button>
              ))}
            </ButtonGrid>
          </div>

          <div style={{ ...section, display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Keypad length={6} />
            <Gauge value={60} label="Warp" />
            <Gauge value={85} segments={20} label="Schilde" color={6} />
            <LevelBar value={70} orientation="vertical" color={3} />
          </div>

          <div style={{ ...section, maxWidth: 520 }}>
            <Tabs
              color={6}
              items={[
                { id: "kurs", label: "Kurs", content: <Readout items={[{ label: "Kurs", value: "247.9" }, { label: "Ankunft", value: "3 h" }]} /> },
                { id: "crew", label: "Crew", content: <Readout items={[{ label: "Personen", value: "1.014" }]} /> },
              ]}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Ziel" placeholder="Sternenbasis 74" color={1} />
              <Slider defaultValue={60} color={1} aria-label="Warpleistung" />
              <LevelBar value={60} color={6} />
            </div>
          </div>

          <div style={section}>
            <div style={{ display: "flex", gap: 24 }}>
              <StatusIndicator status="ok">Online</StatusIndicator>
              <StatusIndicator status="warn">Wartung</StatusIndicator>
              <StatusIndicator status="error" blink>Fehler</StatusIndicator>
            </div>
            <Divider />
            <Sensor scan color={6} blips={[{ x: 30, y: 40 }, { x: 72, y: 25, color: 2 }]} style={{ maxWidth: 520 }} />
          </div>

          <AlertBanner level="red" />
        </SplitFrame>
      </LcarsRoot>
    </SoundProvider>
  );
}
