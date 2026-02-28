export interface ButtonInfo {
  id: string;
  path: string;
  component: string;
  text: string;
  type: 'button' | 'link' | 'icon' | 'menu-item';
  action: string;
  requiredRole?: string[];
  requiresAuth: boolean;
  apiEndpoint?: string;
  expectedBehavior: string;
  tested: boolean;
  working: boolean;
  notes?: string;
}

export const buttonInventory: Record<string, ButtonInfo> = {};

// Helper to register buttons for testing
export function registerButton(button: ButtonInfo) {
  buttonInventory[button.id] = button;
  return button.id;
}

// Test results storage
export interface TestResult {
  buttonId: string;
  timestamp: string;
  success: boolean;
  error?: string;
  actualBehavior?: string;
  screenSize?: 'mobile' | 'tablet' | 'desktop';
  userRole?: string;
}

export const testResults: TestResult[] = [];

export function recordTestResult(result: TestResult) {
  testResults.push(result);
  if (result.success) {
    console.log(`✅ ${result.buttonId} passed`);
  } else {
    console.error(`❌ ${result.buttonId} failed: ${result.error}`);
  }
}

export function generateTestReport() {
  const total = testResults.length;
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  
  const failedButtons = testResults.filter(r => !r.success).map(r => ({
    buttonId: r.buttonId,
    error: r.error,
    buttonInfo: buttonInventory[r.buttonId]
  }));

  return {
    summary: {
      total,
      passed,
      failed,
      passRate: `${((passed / total) * 100).toFixed(1)}%`
    },
    failedButtons,
    results: testResults
  };
}
