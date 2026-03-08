const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, currency = 'gbp', orderID, customerEmail } = req.body;

        if (!amount || amount < 30) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert £ to pence
            currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
                orderID: orderID ?? '',
                customerEmail: customerEmail ?? '',
                source: 'chuffin-ale-app'
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentID: paymentIntent.id
        });

    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
};
