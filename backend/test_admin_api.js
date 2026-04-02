const axios = require('axios');

const testAdmin = async () => {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'password123' // I assume this is the password
        });
        
        const token = loginRes.data.token;
        console.log('Login successful, token acquired.');
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const statsRes = await axios.get('http://localhost:5001/api/admin/stats', config);
        console.log('Stats:', statsRes.data);
        
        const reqRes = await axios.get('http://localhost:5001/api/admin/requests', config);
        console.log('Requests count:', reqRes.data.length);
        
        console.log('TEST PASSED');
    } catch (error) {
        console.error('TEST FAILED');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
    }
};

testAdmin();
