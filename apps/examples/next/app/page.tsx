import { Button, type ButtonColor } from "@lcars/react";

const colors: ButtonColor[] = [1, 2, 3, 4, 5, 6, 7];

export default function Page() {
  return (
    <main>
      <h1>UI Library Test</h1>
      <h2>Button Standard Colors</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {colors.map((color) => (
          <Button key={color} color={color} size="l" length="m">
            Button {color}
          </Button>
        ))}
      </div>
    </main>
  );
}
