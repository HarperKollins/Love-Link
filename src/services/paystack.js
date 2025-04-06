export const initializePayment = (userId, email, amount, duration, callback) => {
  // Check if Paystack is available
  if (!window.PaystackPop) {
    console.error('Paystack script not loaded');
    callback({
      success: false,
      message: 'Payment system not available. Please try again later.'
    });
    return;
  }

  // Validate inputs
  if (!userId || !email || !amount || !duration) {
    console.error('Missing required payment parameters:', { userId, email, amount, duration });
    callback({
      success: false,
      message: 'Invalid payment parameters. Please try again.'
    });
    return;
  }

  try {
    console.log('Setting up Paystack payment with:', {
      userId,
      email,
      amount,
      duration
    });
    
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
        console.log('Paystack payment callback:', response);
        // Handle successful payment
        callback({
          success: true,
          reference: response.reference,
          duration: duration
        });
      },
      onClose: function() {
        console.log('Paystack payment window closed');
        // Handle payment window close
        callback({
          success: false,
          message: 'Payment window closed. Your subscription was not completed.'
        });
      }
    });
    
    console.log('Opening Paystack payment window');
    handler.openIframe();
  } catch (error) {
    console.error('Error setting up Paystack payment:', error);
    callback({
      success: false,
      message: 'Failed to initialize payment. Please try again later.'
    });
  }
};
