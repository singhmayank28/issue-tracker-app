/**
 * Integration test script to verify end-to-end functionality
 * This tests the complete user workflow: signup → login → create issue → comment
 */

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

class IntegrationTester {
  private baseUrl: string;
  private testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
  };
  private adminUser = {
    email: `admin-${Date.now()}@example.com`,
    password: "AdminPassword123!",
  };
  private cookies: string[] = [];
  private createdIssueId: string | null = null;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.cookies.length > 0) {
      headers["Cookie"] = this.cookies.join("; ");
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Store cookies from response
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      this.cookies.push(setCookieHeader);
    }

    return response;
  }

  async testUserSignup(): Promise<TestResult> {
    try {
      const response = await this.makeRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(this.testUser),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Signup failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "User signup successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Signup error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testUserLogin(): Promise<TestResult> {
    try {
      // Clear cookies first
      this.cookies = [];

      const response = await this.makeRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(this.testUser),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Login failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "User login successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Login error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testAuthCheck(): Promise<TestResult> {
    try {
      const response = await this.makeRequest("/api/auth/me");

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Auth check failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Auth check successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Auth check error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testCreateIssue(): Promise<TestResult> {
    try {
      const issueData = {
        title: "Test Issue - Integration Test",
        description:
          "This is a test issue created during integration testing to verify the complete workflow.",
      };

      const response = await this.makeRequest("/api/issues", {
        method: "POST",
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Create issue failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      this.createdIssueId = data.id;

      return {
        success: true,
        message: "Issue creation successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Create issue error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testGetIssue(): Promise<TestResult> {
    if (!this.createdIssueId) {
      return {
        success: false,
        message: "No issue ID available for testing",
      };
    }

    try {
      const response = await this.makeRequest(
        `/api/issues/${this.createdIssueId}`
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Get issue failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Get issue successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Get issue error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testCreateComment(): Promise<TestResult> {
    if (!this.createdIssueId) {
      return {
        success: false,
        message: "No issue ID available for testing",
      };
    }

    try {
      const commentData = {
        content: "This is a test comment added during integration testing.",
      };

      const response = await this.makeRequest(
        `/api/issues/${this.createdIssueId}/comments`,
        {
          method: "POST",
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Create comment failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Comment creation successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Create comment error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testUpdateIssue(): Promise<TestResult> {
    if (!this.createdIssueId) {
      return {
        success: false,
        message: "No issue ID available for testing",
      };
    }

    try {
      const updateData = {
        title: "Updated Test Issue - Integration Test",
        description: "This issue has been updated during integration testing.",
      };

      const response = await this.makeRequest(
        `/api/issues/${this.createdIssueId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Update issue failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Issue update successful",
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Update issue error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testGetAllIssues(): Promise<TestResult> {
    try {
      const response = await this.makeRequest("/api/issues");

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Get all issues failed: ${error.message}`,
          details: error,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Get all issues successful",
        details: {
          count: data.length,
          hasTestIssue: data.some(
            (issue: any) => issue.id === this.createdIssueId
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Get all issues error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async testLogout(): Promise<TestResult> {
    try {
      const response = await this.makeRequest("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Logout failed: ${error.message}`,
          details: error,
        };
      }

      // Clear cookies
      this.cookies = [];

      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      return {
        success: false,
        message: `Logout error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async cleanup(): Promise<TestResult> {
    if (!this.createdIssueId) {
      return {
        success: true,
        message: "No cleanup needed",
      };
    }

    try {
      // Login again to delete the test issue
      await this.testUserLogin();

      const response = await this.makeRequest(
        `/api/issues/${this.createdIssueId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Cleanup failed: ${error.message}`,
          details: error,
        };
      }

      return {
        success: true,
        message: "Cleanup successful",
      };
    } catch (error) {
      return {
        success: false,
        message: `Cleanup error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async runFullIntegrationTest(): Promise<void> {
    console.log("🚀 Starting Integration Test Suite...\n");

    const tests = [
      { name: "User Signup", test: () => this.testUserSignup() },
      { name: "User Login", test: () => this.testUserLogin() },
      { name: "Auth Check", test: () => this.testAuthCheck() },
      { name: "Create Issue", test: () => this.testCreateIssue() },
      { name: "Get Issue", test: () => this.testGetIssue() },
      { name: "Create Comment", test: () => this.testCreateComment() },
      { name: "Update Issue", test: () => this.testUpdateIssue() },
      { name: "Get All Issues", test: () => this.testGetAllIssues() },
      { name: "Logout", test: () => this.testLogout() },
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const { name, test } of tests) {
      console.log(`🧪 Testing: ${name}...`);

      try {
        const result = await test();

        if (result.success) {
          console.log(`✅ ${name}: ${result.message}`);
          if (result.details) {
            console.log(
              `   Details: ${JSON.stringify(result.details, null, 2)}`
            );
          }
          passedTests++;
        } else {
          console.log(`❌ ${name}: ${result.message}`);
          if (result.details) {
            console.log(
              `   Details: ${JSON.stringify(result.details, null, 2)}`
            );
          }
          failedTests++;
        }
      } catch (error) {
        console.log(
          `❌ ${name}: Unexpected error - ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        failedTests++;
      }

      console.log(""); // Empty line for readability
    }

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    const cleanupResult = await this.cleanup();
    if (cleanupResult.success) {
      console.log(`✅ Cleanup: ${cleanupResult.message}`);
    } else {
      console.log(`❌ Cleanup: ${cleanupResult.message}`);
    }

    // Summary
    console.log("\n📊 Test Summary:");
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(
      `📈 Success Rate: ${(
        (passedTests / (passedTests + failedTests)) *
        100
      ).toFixed(1)}%`
    );

    if (failedTests === 0) {
      console.log(
        "\n🎉 All integration tests passed! The application is working correctly."
      );
    } else {
      console.log("\n⚠️  Some tests failed. Please review the errors above.");
    }
  }
}

export { IntegrationTester };
