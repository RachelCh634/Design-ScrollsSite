const { PubSub } = require('@google-cloud/pubsub');
const fs = require('fs');
const pubSubClient = new PubSub();
const { sendEmailWithPDF } = require('./emailService');

const subscriptionName = 'email-catalog-subscription';

const listenToCatalogRequests = async () => {
    console.log("🚀 מאזינים להודעות מפורסמות");
    
    try {
        const subscription = pubSubClient.subscription(subscriptionName);
        console.log("🔍 בודק חיבור ל-Pub/Sub...");

        const [metadata] = await subscription.getMetadata();
        console.log("✅ Subscription metadata: ", metadata);

        subscription.on('message', async (message) => {
            console.log("📩 הודעה התקבלה!");
            try {
                const messageData = JSON.parse(message.data.toString());
                console.log("📥 נתוני הודעה:", messageData);

                const { email, subject } = messageData;
                
                if (!email) {
                    console.error("❌ כתובת מייל חסרה בהודעה");
                    message.ack();
                    return;
                }

                if (!subject || !subject.toLowerCase().includes('קטלוג')) {
                    console.log("⚠️ המייל אינו בקשת קטלוג, מתעלם.");
                    message.ack();
                    return;
                }

                console.log(`📩 קיבלת בקשה חדשה מקטלוג מכתובת: ${email}`);

                // קריאה לקובץ ה-PDF
                const pdfPath = 'products.pdf';
                if (!fs.existsSync(pdfPath)) {
                    console.error("❌ קובץ PDF לא נמצא!");
                    message.ack();
                    return;
                }

                const pdfData = fs.readFileSync(pdfPath, 'base64');

                await sendEmailWithPDF(email, pdfData);
                console.log("📧 מייל עם קטלוג נשלח בהצלחה!");

                message.ack(); // אישור שקלטנו את ההודעה בהצלחה
            } catch (error) {
                console.error("❌ שגיאה בטיפול בהודעה:", error);
                message.nack(); // מסמן שההודעה לא עובדה כראוי (כך שלא תאבד)
            }
        });

        subscription.on('error', (err) => {
            console.error("❌ שגיאה כללית במנוי Pub/Sub:", err);
        });

    } catch (err) {
        console.error("❌ שגיאה קריטית בחיבור ל-Pub/Sub:", err);
    }
};

listenToCatalogRequests();
