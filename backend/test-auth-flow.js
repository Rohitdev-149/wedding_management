const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api/v1";

// Test data
const testData = {
  fullName: "Test User " + Date.now(),
  email: `testuser${Date.now()}@example.com`,
  phone: "9876543210",
  password: "password123",
};

let authToken = null;

async function testRegistration() {
  console.log("\n📝 Testing Registration...");
  console.log("─".repeat(50));
  console.log("Sending registration data:", {
    fullName: testData.fullName,
    email: testData.email,
    phone: testData.phone,
    password: "***",
  });

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      fullName: testData.fullName,
      email: testData.email,
      phone: testData.phone,
      password: testData.password,
    });

    console.log("\n✅ Registration Successful!");
    console.log("Response Status:", response.status);
    console.log("User Created:", {
      id: response.data.data.user._id,
      name: response.data.data.user.fullName,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
    });
    console.log("Token Received:", response.data.data.token ? "Yes ✓" : "No ✗");

    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.log("\n❌ Registration Failed!");
    if (error.response?.data?.errors) {
      console.log("Validation Errors:", error.response.data.errors);
    } else if (error.response?.data?.message) {
      console.log("Error Message:", error.response.data.message);
    } else {
      console.log("Error:", error.message);
    }
    return false;
  }
}

async function testLogin() {
  console.log("\n🔐 Testing Login...");
  console.log("─".repeat(50));
  console.log("Sending login credentials:", {
    email: testData.email,
    password: "***",
  });

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testData.email,
      password: testData.password,
    });

    console.log("\n✅ Login Successful!");
    console.log("Response Status:", response.status);
    console.log("User Logged In:", {
      id: response.data.data.user._id,
      name: response.data.data.user.fullName,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
    });
    console.log("Token Received:", response.data.data.token ? "Yes ✓" : "No ✗");

    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.log("\n❌ Login Failed!");
    if (error.response?.data?.errors) {
      console.log("Validation Errors:", error.response.data.errors);
    } else if (error.response?.data?.message) {
      console.log("Error Message:", error.response.data.message);
    } else {
      console.log("Error:", error.message);
    }
    return false;
  }
}

async function testGetProfile() {
  console.log("\n👤 Testing Get Profile (Protected Route)...");
  console.log("─".repeat(50));
  console.log(
    "Using Token:",
    authToken ? authToken.substring(0, 20) + "..." : "Not Available",
  );

  if (!authToken) {
    console.log("\n❌ No token available. Skipping protected route test.");
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("\n✅ Get Profile Successful!");
    console.log("Response Status:", response.status);
    console.log("User Profile:", {
      id: response.data.data._id,
      name: response.data.data.fullName,
      email: response.data.data.email,
      role: response.data.data.role,
      lastLogin: response.data.data.lastLogin,
    });
    return true;
  } catch (error) {
    console.log("\n❌ Get Profile Failed!");
    if (error.response?.data?.errors) {
      console.log("Validation Errors:", error.response.data.errors);
    } else if (error.response?.data?.message) {
      console.log("Error Message:", error.response.data.message);
    } else {
      console.log("Error:", error.message);
    }
    return false;
  }
}

async function testInvalidLogin() {
  console.log("\n🔓 Testing Login with Invalid Credentials...");
  console.log("─".repeat(50));
  console.log("Sending invalid password");

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testData.email,
      password: "wrongpassword",
    });

    console.log("\n❌ Unexpected Success - This should have failed!");
    return false;
  } catch (error) {
    console.log("\n✅ Correctly Rejected Invalid Credentials");
    console.log("Response Status:", error.response?.status);
    if (error.response?.data?.message) {
      console.log("Error Message:", error.response.data.message);
    }
    return true;
  }
}

async function runAllTests() {
  console.log("\n");
  console.log("╔" + "═".repeat(48) + "╗");
  console.log("║" + "  Authentication Flow Integration Tests".padEnd(48) + "║");
  console.log("╚" + "═".repeat(48) + "╝");
  console.log("Backend URL:", API_BASE_URL);
  console.log("Test Email:", testData.email);

  const results = [];

  // Test 1: Registration
  results.push({
    name: "Registration",
    passed: await testRegistration(),
  });

  // Test 2: Login
  results.push({
    name: "Login",
    passed: await testLogin(),
  });

  // Test 3: Get Profile
  results.push({
    name: "Get Profile (Protected)",
    passed: await testGetProfile(),
  });

  // Test 4: Invalid Login
  results.push({
    name: "Invalid Login Rejection",
    passed: await testInvalidLogin(),
  });

  // Summary
  console.log("\n");
  console.log("╔" + "═".repeat(48) + "╗");
  console.log("║" + "  Test Summary".padEnd(48) + "║");
  console.log("╠" + "═".repeat(48) + "╣");

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`║ ${result.name.padEnd(35)} ${status.padEnd(12)} ║`);
  });

  console.log("╠" + "═".repeat(48) + "╣");
  const totalPassed = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const passRate = ((totalPassed / totalTests) * 100).toFixed(0);
  console.log(
    `║ Total: ${totalPassed}/${totalTests} Tests Passed (${passRate}%)`.padEnd(
      49,
    ) + "║",
  );
  console.log("╚" + "═".repeat(48) + "╝\n");

  process.exit(totalPassed === totalTests ? 0 : 1);
}

// Run tests
runAllTests();
