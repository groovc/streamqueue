import { ContinueWatching } from "./components/ContinueWatching";

function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#111", color: "#fff", minHeight: "100vh", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>StreamQueue</h1>
      </header>
      <main>
        <ContinueWatching />
      </main>
    </div>
  );
}

export default App;
