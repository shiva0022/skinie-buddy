import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Checking available Gemini models...\n');
console.log('API Key:', apiKey.substring(0, 10) + '...\n');

async function checkModels() {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.data.models) {
      console.log('✅ Available Models:\n');
      response.data.models.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  📌 ${model.name}`);
          console.log(`     Display Name: ${model.displayName}`);
          console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
          console.log('');
        }
      });
    } else {
      console.log('No models found');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkModels();
