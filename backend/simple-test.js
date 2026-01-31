const http = require("http");

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

(async () => {
  try {
    console.log("Testing GET /api/health...");
    const res1 = await makeRequest("/api/health");
    console.log(`Status: ${res1.status}`);
    console.log(`Data: ${res1.data.substring(0, 100)}`);

    console.log("\nTesting GET /...");
    const res2 = await makeRequest("/");
    console.log(`Status: ${res2.status}`);
    console.log(`Data: ${res2.data.substring(0, 100)}`);

    console.log("\n✓ All tests passed");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
