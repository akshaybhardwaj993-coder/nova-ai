export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // NEW: Using the updated Hugging Face Router URL
    const response = await fetch("https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2", {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `<s>[INST] You are Nova, a helpful, concise, and friendly AI assistant. Answer briefly: ${message} [/INST]`,
        parameters: { 
          max_new_tokens: 500, 
          return_full_text: false,
          temperature: 0.7 
        }
      }),
    });

    const result = await response.json();

    // Handle "model loading" state
    if (result.error && result.error.includes("loading")) {
      return res.status(503).json({ 
        error: "AI is waking up! Please wait 20 seconds and try again." 
      });
    }

    if (result.error) {
      console.error("HF Error:", result.error);
      return res.status(500).json({ error: result.error });
    }

    // Extract the reply
    const reply = result[0].generated_text.trim();
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
