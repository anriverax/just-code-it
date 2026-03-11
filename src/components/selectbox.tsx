"use client";

const examples = ["gallery"] as const;

const Selectbox = (): React.JSX.Element => (
  <select
    className="rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
    defaultValue=""
  >
    <option disabled value="">
      Select an example
    </option>
    {examples.map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>
);

export default Selectbox;
