import dotenv from 'dotenv';
import { getGeminiResponse, generateSkincareRoutine } from '../services/geminiService.js';

// Load environment variables
dotenv.config();

// Test 1: Simple Gemini Response
async function testSimpleResponse() {
  console.log('\n🧪 Test 1: Simple Gemini Response');
  console.log('═'.repeat(50));
  
  try {
    const prompt = "In one sentence, what is the correct order for applying skincare products?";
    console.log('📤 Sending prompt:', prompt);
    
    const response = await getGeminiResponse(prompt);
    console.log('✅ Response received:');
    console.log(response);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 2: Routine Generation
async function testRoutineGeneration() {
  console.log('\n🧪 Test 2: Skincare Routine Generation');
  console.log('═'.repeat(50));
  
  try {
    // Mock products
    const mockProducts = [
      {
        name: 'Hydrating Cleanser',
        brand: 'CeraVe',
        type: 'Cleanser',
        keyIngredients: [{ name: 'Hyaluronic Acid' }, { name: 'Ceramides' }],
        usage: 'both'
      },
      {
        name: 'Vitamin C Serum',
        brand: 'The Ordinary',
        type: 'Serum',
        keyIngredients: [{ name: 'L-Ascorbic Acid' }, { name: 'Vitamin E' }],
        usage: 'morning'
      },
      {
        name: 'Moisturizing Cream',
        brand: 'Cetaphil',
        type: 'Moisturizer',
        keyIngredients: [{ name: 'Glycerin' }, { name: 'Niacinamide' }],
        usage: 'both'
      },
      {
        name: 'SPF 50 Sunscreen',
        brand: 'La Roche-Posay',
        type: 'Sunscreen',
        keyIngredients: [{ name: 'Zinc Oxide' }, { name: 'Titanium Dioxide' }],
        usage: 'morning'
      }
    ];

    console.log('📤 Generating morning routine with mock products...');
    console.log(`   Products: ${mockProducts.length}`);
    
    const routine = await generateSkincareRoutine({
      products: mockProducts,
      type: 'morning',
      skinType: 'combination',
      skinConcerns: ['acne', 'dark-spots']
    });

    console.log('✅ Routine generated successfully!');
    console.log('\n📋 Generated Routine:');
    console.log(JSON.stringify(routine, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 3: API Key Validation
async function testAPIKey() {
  console.log('\n🧪 Test 3: API Key Validation');
  console.log('═'.repeat(50));
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('💡 Add GEMINI_API_KEY to your .env file');
    return false;
  }

  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️  API key format looks incorrect (should start with "AIza")');
  }

  console.log('✅ API key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Gemini AI Integration Tests');
  console.log('═'.repeat(50));
  
  const results = {
    apiKey: false,
    simpleResponse: false,
    routineGeneration: false
  };

  // Test 3 first (API key validation)
  results.apiKey = await testAPIKey();
  
  if (!results.apiKey) {
    console.log('\n❌ Cannot proceed without API key');
    console.log('📚 See GEMINI_AI_SETUP.md for setup instructions');
    process.exit(1);
  }

  // Test 1
  results.simpleResponse = await testSimpleResponse();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between requests

  // Test 2
  results.routineGeneration = await testRoutineGeneration();

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('═'.repeat(50));
  console.log(`API Key Validation:      ${results.apiKey ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Simple Response:         ${results.simpleResponse ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Routine Generation:      ${results.routineGeneration ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Gemini AI is ready to use.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('📚 See GEMINI_AI_SETUP.md for troubleshooting.');
  }
  
  console.log('═'.repeat(50) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
