import http from "http";
import fs from "fs";

console.log("Pinging http://127.0.0.1:5000/ ...");

const req = http.request({
    hostname: "127.0.0.1",
    port: 5000,
    path: "/",
    method: "GET"
}, (res) => {
    let body = "";
    res.on("data", (chunk) => {
        body += chunk;
    });
    res.on("end", () => {
        const result = `STATUS: ${res.statusCode}\nHEADERS: ${JSON.stringify(res.headers, null, 2)}\nBODY: ${body}`;
        fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\server_ping.txt", result);
        console.log("Ping finished! Check server_ping.txt");
        process.exit(0);
    });
});

req.on("error", (e) => {
    fs.writeFileSync("c:\\Users\\goswa\\OneDrive\\Desktop\\Fast RMS\\Fast RMS\\server_ping.txt", "PING_FAILED: " + e.message);
    console.error("Ping error:", e);
    process.exit(1);
});

req.end();
