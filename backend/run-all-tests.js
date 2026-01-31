const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function runTests() {
  let token = "";
  let weddingId = "";
  let expenseId = "";

  console.log("\n=== TESTING ALL API ENDPOINTS ===\n");

  try {
    // TEST 1: Health Check
    console.log("TEST 1: Health Check");
    const healthRes = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 5000,
    });
    console.log("✓ Status:", healthRes.status);
    console.log("Response:", JSON.stringify(healthRes.data, null, 2));

    // TEST 2: Root endpoint
    console.log("\nTEST 2: Root Endpoint");
    const rootRes = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
    console.log("✓ Status:", rootRes.status);
    console.log("Response:", JSON.stringify(rootRes.data, null, 2));

    // TEST 3: Register User
    console.log("\nTEST 3: Register User");
    const registerRes = await axios.post(
      `${BASE_URL}/api/v1/auth/register`,
      {
        fullName: "Test Couple",
        email: `test${Date.now()}@example.com`,
        phone: "1234567890",
        password: "Test@123456",
        role: "couple",
      },
      { timeout: 5000 },
    );
    console.log("✓ Status:", registerRes.status);
    token = registerRes.data.token;
    console.log("Response:", JSON.stringify(registerRes.data, null, 2));

    // TEST 4: Get Current User
    console.log("\nTEST 4: Get Current User");
    const meRes = await axios.get(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    console.log("✓ Status:", meRes.status);
    console.log("Response:", JSON.stringify(meRes.data, null, 2));

    // TEST 5: Create Wedding
    console.log("\nTEST 5: Create Wedding");
    const weddingRes = await axios.post(
      `${BASE_URL}/api/v1/weddings`,
      {
        coupleNames: "Test Couple",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        venue: "Test Venue",
        guestCount: 100,
        budget: 500000,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      },
    );
    console.log("✓ Status:", weddingRes.status);
    weddingId = weddingRes.data.data?._id || weddingRes.data._id;
    console.log("Response:", JSON.stringify(weddingRes.data, null, 2));

    // TEST 6: Get All Weddings
    console.log("\nTEST 6: Get All Weddings");
    const allWeddingsRes = await axios.get(`${BASE_URL}/api/v1/weddings`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    console.log("✓ Status:", allWeddingsRes.status);
    console.log("Response:", JSON.stringify(allWeddingsRes.data, null, 2));

    // TEST 7: Get My Weddings
    console.log("\nTEST 7: Get My Weddings");
    const myWeddingsRes = await axios.get(
      `${BASE_URL}/api/v1/weddings/my-weddings`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      },
    );
    console.log("✓ Status:", myWeddingsRes.status);
    console.log("Response:", JSON.stringify(myWeddingsRes.data, null, 2));

    if (weddingId) {
      // TEST 8: Get Wedding by ID
      console.log("\nTEST 8: Get Wedding by ID");
      const weddingByIdRes = await axios.get(
        `${BASE_URL}/api/v1/weddings/${weddingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        },
      );
      console.log("✓ Status:", weddingByIdRes.status);
      console.log("Response:", JSON.stringify(weddingByIdRes.data, null, 2));

      // TEST 9: Get Budget
      console.log("\nTEST 9: Get Budget");
      const budgetRes = await axios.get(
        `${BASE_URL}/api/v1/budgets/wedding/${weddingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        },
      );
      console.log("✓ Status:", budgetRes.status);
      console.log("Response:", JSON.stringify(budgetRes.data, null, 2));

      // TEST 10: Add Expense
      console.log("\nTEST 10: Add Expense");
      const expenseRes = await axios.post(
        `${BASE_URL}/api/v1/budgets/wedding/${weddingId}/expenses`,
        {
          category: "venue",
          description: "Venue Rental",
          budgetAmount: 200000,
          actualAmount: 200000,
          notes: "Grand Ballroom",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        },
      );
      console.log("✓ Status:", expenseRes.status);
      expenseId =
        expenseRes.data.data?.expenses?.[0]?._id || expenseRes.data.data?._id;
      console.log("Response:", JSON.stringify(expenseRes.data, null, 2));

      if (expenseId) {
        // TEST 11: Update Expense
        console.log("\nTEST 11: Update Expense");
        const updateExpenseRes = await axios.put(
          `${BASE_URL}/api/v1/budgets/wedding/${weddingId}/expenses/${expenseId}`,
          {
            actualAmount: 220000,
            notes: "Updated price after negotiation",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          },
        );
        console.log("✓ Status:", updateExpenseRes.status);
        console.log(
          "Response:",
          JSON.stringify(updateExpenseRes.data, null, 2),
        );
      }
    }

    console.log("\n=== ALL TESTS COMPLETED ===\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.code === "ECONNREFUSED") {
      console.error("ERROR: Cannot connect to server at", BASE_URL);
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

runTests();
