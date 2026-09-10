(async () => {
  try {
    // 1. Submit Custom Request
    const subRes = await fetch('http://localhost:3000/api/custom-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Aarav Mehta',
        customerContact: '+91 9988776655',
        occasion: 'Anniversary',
        budget: '₹5,000 – ₹10,000',
        ribbon: 'Forest Green Velvet',
        message: 'Happy 5th Anniversary My Love!',
        details: 'Custom brass photo frame, artisanal coffee beans, two engraved crystal glasses, hand-poured lavender candle.'
      })
    }).then(r => r.json());
    console.log('1. Customer Submitted Request:', subRes);

    const reqCode = subRes.request.reqCode;
    const reqId = subRes.request.id;

    // 2. Admin Login
    const loginRes = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Aryan gupta', password: 'aryan@surpriszo777' })
    }).then(r => r.json());
    console.log('2. Admin Logged In Success:', loginRes.success);

    // 3. Admin Accepts & Replies
    const updateRes = await fetch(`http://localhost:3000/api/admin/custom-requests/${reqId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginRes.token}`
      },
      body: JSON.stringify({
        status: 'accepted',
        adminReply: 'Approved! We can curate this luxury anniversary edit for ₹6,500 including custom brass engraving and velvet ribbon box. Contact us on WhatsApp (8655239282) to confirm dispatch.'
      })
    }).then(r => r.json());
    console.log('3. Admin Updated Request Status:', updateRes);

    // 4. Customer Lookup Status
    const statusRes = await fetch(`http://localhost:3000/api/custom-requests/status/${reqCode}`).then(r => r.json());
    console.log('4. Customer Lookup Result:', statusRes);
  } catch (err) {
    console.error('Test error:', err);
  }
})();
