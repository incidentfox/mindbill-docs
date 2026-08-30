"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

const statusCode = `import { useState } from "react";
import { BillStatusSummary } from "@mindbill/react";

export default function App() {
  const [message, setMessage] = useState("");

  return (
    <main style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
      <BillStatusSummary
        status="processed"
        submittedAt="2026-08-12"
        agingDays={13}
        updatedAt="2026-08-25"
        totalCharge={2015}
        totalPaid={0}
        balanceDue={2015}
        appearance={{ preset: "mindbill" }}
        actions={[
          { id: "eor", label: "View EOR", onClick: () => setMessage("Opening EOR") },
          { id: "payment", label: "Post payment", primary: true, onClick: () => setMessage("Payment opened") },
        ]}
      />
      {message && <p style={{ fontFamily: "system-ui", color: "#17666b" }}>{message}</p>}
    </main>
  );
}`;

export function StatusPlayground() {
  return (
    <div className="playground-shell">
      <div className="playground-title"><span>Live example</span><small>Edit the code and see the result</small></div>
      <Sandpack
        template="react"
        theme="auto"
        files={{ "/App.js": statusCode }}
        customSetup={{ dependencies: { "@mindbill/react": "0.15.0" } }}
        options={{
          showNavigator: false,
          showTabs: true,
          showLineNumbers: true,
          editorHeight: 460,
          wrapContent: true,
          closableTabs: false,
        }}
      />
    </div>
  );
}
