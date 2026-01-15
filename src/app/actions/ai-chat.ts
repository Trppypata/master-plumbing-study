'use server';

// AI Chat Server Action
// Uses demo responses since no Gemini API key provided

const DEMO_RESPONSES: Record<string, string> = {
  'vent': 'Vents prevent siphonage and back-pressure in drain systems. They allow air to enter behind flowing water, maintaining proper trap seal depths and enabling smooth drainage.',
  'trap': 'A trap (like a P-trap) holds 2-4 inches of water to create a seal that prevents sewer gases from entering the building. Every fixture needs one!',
  'fall': 'Pipe fall (or slope) is calculated as: Fall = Length × Slope. For example, a 40ft pipe at 1/4" per foot = 40 × 0.25 = 10 inches of fall.',
  'slope': 'Standard drainage slope is 1/4" per foot for pipes 3" or smaller, and 1/8" per foot for pipes over 3". This ensures proper flow without solids settling.',
  'fixture unit': 'Drainage Fixture Units (DFU) measure the probable discharge from fixtures. A lavatory = 1 DFU, toilet = 4 DFU. Used to size drain and vent pipes.',
  'backflow': 'Backflow is the unwanted reversal of water flow. Prevention methods include: air gaps (most reliable), reduced pressure zones, double check valves, and vacuum breakers.',
  'default': 'I can help with plumbing questions about venting, traps, pipe sizing, slope calculations, fixture units, and code requirements. What would you like to know?'
};

export async function getAIResponse(message: string): Promise<{ response: string; isDemo: boolean }> {
  // Check for demo mode (no API key)
  const apiKey = process.env.GEMINI_API_KEY;
  const isDemoMode = !apiKey;

  if (isDemoMode) {
    // Find best matching demo response
    const lowerMessage = message.toLowerCase();
    let response = DEMO_RESPONSES['default'];
    
    for (const [keyword, answer] of Object.entries(DEMO_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        response = answer;
        break;
      }
    }
    
    return { response, isDemo: true };
  }

  // Real Gemini API call would go here
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful Master Plumber tutor. Answer this plumbing question concisely (2-3 sentences max): ${message}`
          }]
        }]
      })
    });

    if (!res.ok) throw new Error('API error');
    
    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    
    return { response, isDemo: false };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { response: 'Sorry, I encountered an error. Please try again.', isDemo: true };
  }
}
