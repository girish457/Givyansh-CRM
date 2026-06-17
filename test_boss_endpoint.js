import fetch from "node-fetch";

async function test() {
  try {
    const res = await fetch("http://localhost:5000/api/boss/team-monitoring", {
      headers: {
        // We need to bypass auth or see if it throws unauthorized.
        // Wait, if we can run it against the server, let's see.
      }
    });
    console.log("Status:", res.status);
    console.log("JSON:", await res.json());
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
