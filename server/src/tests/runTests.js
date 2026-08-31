const { connectDB, disconnectDB } = require('../config/db');
const authService = require('../services/authService');
const { encryptToken, decryptToken } = require('../services/tokenService');
const aiService = require('../services/aiService');
const gmailService = require('../services/gmailService');
const { logActivity, getActivities } = require('../services/activityService');
const { createNotification, getNotifications } = require('../services/notificationService');

const runAllTests = async () => {
  console.log('🧪 Starting MailPilot_AI Automated Backend Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Database connection test
    console.log('1️⃣ Testing Database Connection...');
    await connectDB();
    assert(true, 'Database connected successfully');

    // 2. Encryption test
    console.log('\n2️⃣ Testing AES-256 Credential Encryption & Decryption...');
    const originalSecret = 'ya29.a0AfH6SMD_google_oauth_test_refresh_token_xyz_12345';
    const encrypted = encryptToken(originalSecret);
    assert(encrypted && encrypted.includes(':'), 'Token encrypted with IV & AuthTag');
    const decrypted = decryptToken(encrypted);
    assert(decrypted === originalSecret, 'Decrypted token matches original secret exactly');

    // 3. User Auth & Password Hashing test
    console.log('\n3️⃣ Testing User Registration & Authentication...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regResult = await authService.register({
      name: 'Test Pilot',
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert(regResult.user.email === testEmail, 'User registered with hashed password');
    assert(regResult.token && regResult.token.length > 20, 'JWT token generated');

    const loginResult = await authService.login({
      email: testEmail,
      password: 'SecurePassword123!'
    });
    assert(loginResult.user.id.toString() === regResult.user.id.toString(), 'User login successful with JWT');

    // 4. AI Cascade & Fallback Engine
    console.log('\n4️⃣ Testing AI Engine & Multi-Tier Cascade...');
    const sampleEmail = `Hi Alex,
Could we please schedule our quarterly strategy review for next Thursday at 3:00 PM EST?
Please review the attached budget allocations before the call.

Best,
Sarah`;

    const summaryRes = await aiService.summarize(regResult.user.id, sampleEmail, { subject: 'Strategy Review' });
    assert(summaryRes.data && summaryRes.data.summary, `AI Summarization generated (Provider: ${summaryRes.provider})`);

    const replyRes = await aiService.generateReply(regResult.user.id, sampleEmail, { tone: 'professional', sender: 'Sarah' });
    assert(replyRes.data && replyRes.data.length > 20, `AI Professional Reply generated (Provider: ${replyRes.provider})`);

    const actionItemsRes = await aiService.extractActionItems(regResult.user.id, sampleEmail);
    assert(Array.isArray(actionItemsRes.data) && actionItemsRes.data.length > 0, 'AI Action Items extracted');

    const datesRes = await aiService.extractDates(regResult.user.id, sampleEmail);
    assert(Array.isArray(datesRes.data) && datesRes.data.length > 0, 'AI Dates and Deadlines extracted');

    const explainRes = await aiService.explain(regResult.user.id, sampleEmail);
    assert(explainRes.data && explainRes.data.whatSenderWants, 'AI Explain feature generated');

    const rewriteRes = await aiService.rewrite(regResult.user.id, 'need budget quick', 'professional');
    assert(rewriteRes.data && rewriteRes.data.length > 15, 'AI Email Rewrite generated');

    const subjectRes = await aiService.generateSubject(regResult.user.id, sampleEmail);
    assert(Array.isArray(subjectRes.data) && subjectRes.data.length > 0, 'AI Subject suggestions generated');

    // 5. Activity Logging & Notifications
    console.log('\n5️⃣ Testing Activity Logging & Notifications...');
    await logActivity({
      owner: regResult.user.id,
      action: 'EMAIL_VIEWED',
      metadata: { test: true }
    });
    const activities = await getActivities(regResult.user.id);
    assert(activities.total > 0, 'Activity history logged and retrieved');

    await createNotification({
      owner: regResult.user.id,
      type: 'SYSTEM_INFO',
      title: 'Welcome to MailPilot',
      message: 'System test notification'
    });
    const notifs = await getNotifications(regResult.user.id);
    assert(notifs.length > 0, 'Notification created and retrieved');

    // 6. Gmail Service Sandbox / Mock Inbox
    console.log('\n6️⃣ Testing Gmail Service Sandbox & Thread Fetching...');
    const inbox = await gmailService.getMessages(regResult.user.id, { folder: 'INBOX' });
    assert(inbox.messages && inbox.messages.length > 0, 'Inbox messages retrieved');

    const thread = await gmailService.getThread(regResult.user.id, inbox.messages[0].threadId);
    assert(thread && thread.messages && thread.messages.length > 0, 'Email thread retrieved');

  } catch (err) {
    console.error('❌ Test Exception:', err);
    failed++;
  } finally {
    await disconnectDB();
    console.log('\n======================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

runAllTests();
