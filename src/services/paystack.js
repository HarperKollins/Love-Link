export const initializePayment = (userId, email, amount, duration, callback) => {
  // Load Paystack inline script
  if (!window.PaystackPop) {
    console.error('Paystack script not loaded');
    callback({
      success: false,
      message: 'Payment system not available. Please try again later.'
    });
    return;
  }
  
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_yourtestkeyhere', // Use Vite env variable
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
    currency: 'NGN',
    ref: `lovelink_${userId}_${Date.now()}`,
    metadata: {
      userId,
      duration,
      custom_fields: [
        {
          display_name: "Plan Duration",
          variable_name: "plan_duration",
          value: duration
        }
      ]
    },
    callback: function(response) {
      // Handle successful payment
      callback({
        success: true,
        reference: response.reference,
        duration: duration
      });
    },
    onClose: function() {
      // Handle payment window close
      callback({
        success: false,
        message: 'Payment window closed. Your subscription was not completed.'
      });
    }
  });
  
  handler.openIframe();
};
