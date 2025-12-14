const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSecurity() {
    console.log('🔒 Testing Backend Security Implementation\n');

    // Test 1: Attempt to access protected route without token
    console.log('Test 1: Accessing protected route without authentication');
    try {
        await axios.get(`${BASE_URL}/api/students`);
        console.log('❌ FAILED: Route is not protected!\n');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASSED: Route is protected (401 Unauthorized)\n');
        } else {
            console.log(`⚠️  Unexpected error: ${error.message}\n`);
        }
    }

    // Test 2: Check for rate limit headers
    console.log('Test 2: Checking for rate limit headers');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'wrongpassword'
        });
    } catch (error) {
        if (error.response && error.response.headers['ratelimit-limit']) {
            console.log(`✅ PASSED: Rate limiting is active (Limit: ${error.response.headers['ratelimit-limit']})\n`);
        } else {
            console.log('⚠️  Rate limit headers not found\n');
        }
    }

    // Test 3: Check for security headers (Helmet)
    console.log('Test 3: Checking for security headers (Helmet)');
    try {
        const response = await axios.get(`${BASE_URL}/`);
        const headers = response.headers;

        if (headers['x-content-type-options'] === 'nosniff') {
            console.log('✅ PASSED: Helmet security headers are present\n');
        } else {
            console.log('❌ FAILED: Helmet headers not found\n');
        }
    } catch (error) {
        console.log(`⚠️  Error checking headers: ${error.message}\n`);
    }

    console.log('🏁 Security tests completed!');
}

testSecurity().catch(console.error);
