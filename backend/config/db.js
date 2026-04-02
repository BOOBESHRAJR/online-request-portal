const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
    try {
        if(!process.env.MONGO_URI) {
            console.error("❌ CRITICAL: MONGO_URI is not defined in .env file.");
            return;
        }

        console.log("⏳ Initializing MongoDB Connection Protocol...");
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Updated options for modern Mongoose 8.x
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Secured: ${conn.connection.host}`);

        // Ensure default admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                phoneNumber: '123456789',
                password: 'admin123',
                role: 'admin'
            });
            console.log("🔐 Default Admin Synchronized");
        } else {
            console.log("ℹ️ Admin Node Verified");
        }
    } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ MONGODB CONNECTION ALERT");
        console.error(`Message: ${error.message}`);
        
        if (error.message.includes('tlsv1 alert internal error') || error.message.includes('ssl3_read_bytes')) {
            console.error("💡 DIAGNOSTIC: SSL/TLS Incompatibility Detected.");
            console.error("   Node.js is running with OpenSSL 3.0 which may conflict with some Atlas clusters.");
            console.error("   Solution: The project is now configured to use --openssl-legacy-provider.");
            console.error("   Ensure you are starting the server using 'npm run start' or 'npm run dev'.");
        }

        if (error.message.includes('ENOTFOUND')) {
             console.error("💡 DIAGNOSTIC: DNS Resolution Failed. Check your internet or MONGO_URI format.");
        }

        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Instead of process.exit(1), we just log the failure. 
        // This prevents the whole process from crashing if we want it to survive.
        console.warn("⚠️ Server running in detached mode: Database connectivity is missing.");
    }
};

module.exports = connectDB;
