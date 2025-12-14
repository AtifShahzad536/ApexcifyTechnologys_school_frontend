const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send email notification to admin about new pending approval
const sendNewApprovalNotification = async (userData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"School Management System" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'New User Registration Pending Approval',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                            border-radius: 8px;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 8px 8px;
                        }
                        .info-row {
                            margin: 15px 0;
                            padding: 10px;
                            background-color: #f5f5f5;
                            border-left: 4px solid #4CAF50;
                        }
                        .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .value {
                            color: #333;
                            margin-left: 10px;
                        }
                        .footer {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            text-align: center;
                            color: #777;
                            font-size: 12px;
                        }
                        .action-note {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🔔 New Registration Pending Approval</h2>
                        </div>
                        <div class="content">
                            <p>Hello Admin,</p>
                            <p>A new user has registered and is awaiting your approval to access the School Management System.</p>
                            
                            <div class="info-row">
                                <span class="label">Name:</span>
                                <span class="value">${userData.name}</span>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value">${userData.email}</span>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">Registration Date:</span>
                                <span class="value">${new Date(userData.requestedAt).toLocaleString()}</span>
                            </div>
                            
                            <div class="action-note">
                                <strong>⚠️ Action Required:</strong>
                                <p>Please log in to the admin dashboard to review and approve/reject this registration request.</p>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated notification from School Management System</p>
                                <p>Please do not reply to this email</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
New User Registration Pending Approval

Name: ${userData.name}
Email: ${userData.email}
Registration Date: ${new Date(userData.requestedAt).toLocaleString()}

Please log in to the admin dashboard to review and approve/reject this registration request.

---
This is an automated notification from School Management System
            `.trim(),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: error.message };
    }
};

// Send approval confirmation email to user
const sendApprovalEmail = async (userEmail, userName, role) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"EduManager" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '✅ Your Account Has Been Approved - EduManager',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 8px 8px;
                        }
                        .info-box {
                            background-color: #f3f4f6;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #2563eb;
                        }
                        .info-row {
                            margin: 10px 0;
                        }
                        .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .value {
                            color: #333;
                        }
                        .button {
                            display: inline-block;
                            background-color: #2563eb;
                            color: white;
                            padding: 14px 28px;
                            text-decoration: none;
                            border-radius: 6px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            text-align: center;
                            color: #777;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🎉 Welcome to EduManager!</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${userName}</strong>,</p>
                            <p>Great news! Your account has been approved by our administrator.</p>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0; color: #2563eb;">Account Details</h3>
                                <div class="info-row">
                                    <span class="label">Email:</span>
                                    <span class="value">${userEmail}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Role:</span>
                                    <span class="value">${role}</span>
                                </div>
                            </div>
                            
                            <p>You can now login to the system using your credentials and start using all the features available to you.</p>
                            
                            <div style="text-align: center;">
                                <a href="${'https://apexcify-technologys-school-fronten.vercel.app' || 'http://localhost:5173'}/login" class="button">
                                    Login Now →
                                </a>
                            </div>
                            
                            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                            
                            <div class="footer">
                                <p><strong>EduManager Team</strong></p>
                                <p>This is an automated email. Please do not reply to this message.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Welcome to EduManager!

Dear ${userName},

Great news! Your account has been approved by our administrator.

Account Details:
- Email: ${userEmail}
- Role: ${role}

You can now login to the system using your credentials.

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

If you have any questions, please contact our support team.

Best regards,
EduManager Team

---
This is an automated email. Please do not reply to this message.
            `.trim(),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Approval email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending approval email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendNewApprovalNotification,
    sendApprovalEmail,
};
