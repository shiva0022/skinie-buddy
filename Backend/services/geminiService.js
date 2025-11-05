import axios from 'axios';

/**
 * Get AI response from Google Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The AI generated response
 */
export const getGeminiResponse = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      throw new Error('Gemini API key not configured');
    }

    // Using v1beta API with gemini-2.5-flash (latest stable model)
    // Alternative models: gemini-2.5-pro (more powerful), gemini-2.0-flash (older)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased to handle longer JSON responses
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Check if response was complete
    const finishReason = response.data?.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Response was truncated due to token limit');
      throw new Error('Response too long. Please try with fewer products.');
    } else if (finishReason === 'SAFETY') {
      throw new Error('Response blocked by safety filters');
    } else if (finishReason !== 'STOP' && finishReason) {
      console.warn(`⚠️ Unexpected finish reason: ${finishReason}`);
    }

    // Extract text from response
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('❌ Gemini API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid Gemini API key');
    } else if (error.response?.status === 403) {
      throw new Error('Gemini API access forbidden. Check your API key permissions.');
    } else if (error.message && error.message.startsWith('Response')) {
      // Pass through our custom error messages (truncation, etc.)
      throw error;
    } else {
      // Re-throw the original error to preserve the error message
      throw error;
    }
  }
};

/**
 * Generate skincare routine using Gemini AI
 * @param {Object} params - Parameters for routine generation
 * @param {Array} params.products - User's products
 * @param {string} params.type - Routine type (morning/night)
 * @param {string} params.skinType - User's skin type
 * @param {Array} params.skinConcerns - User's skin concerns
 * @returns {Promise<Object>} - Generated routine data
 */
export const generateSkincareRoutine = async ({ products, type, skinType, skinConcerns }) => {
  try {
    // Build detailed product information
    const productDetails = products.map(p => ({
      name: p.name,
      brand: p.brand,
      type: p.type,
      ingredients: p.keyIngredients?.map(i => i.name).join(', ') || 'Not specified',
      usage: p.usage
    }));

    // Create comprehensive prompt
    const prompt = `You are an expert skincare advisor. Generate a personalized ${type} skincare routine.

**User Information:**
- Skin Type: ${skinType || 'Not specified'}
- Skin Concerns: ${skinConcerns?.join(', ') || 'Not specified'}
- Routine Type: ${type.toUpperCase()}

**Available Products:**
${productDetails.map((p, i) => 
  `${i + 1}. ${p.name} by ${p.brand} (${p.type})
     - Ingredients: ${p.ingredients}
     - Usage: ${p.usage}`
).join('\n')}

**Instructions:**
1. Select 3-6 appropriate products for this ${type} routine
2. Arrange in correct order (Cleanser → Toner → Serum → Moisturizer → Sunscreen for morning)
3. For each step provide: stepNumber, productName, instruction (1 sentence), waitTime (0-2 minutes)
4. Include any compatibility warnings
5. Keep tips array to maximum 3 short tips

**CRITICAL: Respond with COMPLETE, VALID JSON ONLY. Ensure the JSON is not truncated.**

Response Format:
{
  "steps": [
    {
      "stepNumber": 1,
      "productName": "Product Name",
      "instruction": "Brief application instruction",
      "waitTime": 0
    }
  ],
  "compatibilityWarnings": [],
  "estimatedDuration": 10,
  "tips": ["tip1", "tip2", "tip3"]
}

Generate complete JSON response now:`;

    const aiResponse = await getGeminiResponse(prompt);
    
    // Parse AI response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      
      // Remove ```json and ``` markers
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
      
      // Try to extract JSON from response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        
        // Check if JSON appears to be truncated (incomplete)
        if (!jsonString.trim().endsWith('}')) {
          console.warn('⚠️ AI response appears to be truncated');
          console.log('Truncated response:', jsonString.substring(0, 500));
          throw new Error('AI response was truncated. Please try again.');
        }
        
        parsedResponse = JSON.parse(jsonString);
      } else {
        parsedResponse = JSON.parse(cleanedResponse);
      }
      
      // Validate response structure
      if (!parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
        throw new Error('Invalid response structure: missing or invalid steps array');
      }
      
      // Ensure required fields exist
      if (!parsedResponse.compatibilityWarnings) {
        parsedResponse.compatibilityWarnings = [];
      }
      if (!parsedResponse.estimatedDuration) {
        parsedResponse.estimatedDuration = 19;
      }
      if (!parsedResponse.tips) {
        parsedResponse.tips = [];
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse.substring(0, 1000));
      console.error('Parse error:', parseError.message);
      throw new Error(`AI generated invalid response format: ${parseError.message}`);
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error generating skincare routine:', error.message);
    throw error;
  }
};

export default {
  getGeminiResponse,
  generateSkincareRoutine
};
