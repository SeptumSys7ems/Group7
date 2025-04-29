const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { getJson } = require('serpapi');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SERP_API_KEY = process.env.SERP_API_KEY;

// Helper function to enrich a single option
async function enrichOption(option) {
    if (!option || !option.brand || !option.description) return;

    const query = `${option.brand} ${option.description}`;

    try {
        const json = await new Promise((resolve, reject) => {
            getJson({
                engine: "google_shopping",
                q: query,
                api_key: SERP_API_KEY
            }, (json) => {
                if (json.error) reject(json.error);
                else resolve(json);
            });
        });

        if (json.shopping_results && json.shopping_results.length > 0) {
            const firstResult = json.shopping_results[0];
            option.price = firstResult.price || option.price || 'TBD';
            option.imageUrl = (firstResult.thumbnail && !firstResult.thumbnail.includes('data:image')) 
                ? firstResult.thumbnail
                : `https://via.placeholder.com/400x600/888888/ffffff?text=${encodeURIComponent(option.brand || 'Fashion Item')}`;
            option.productUrl = firstResult.link || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            
        } else {
            option.imageUrl = `https://via.placeholder.com/400x600/888888/ffffff?text=${encodeURIComponent(option.brand || 'Fashion Item')}`;
            option.productUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            option.price = 'TBD';
        }
        option.name = `${option.brand} ${option.description}`;
    } catch (error) {
        console.error('Error enriching option:', error);
    
        const fallbackText = option.brand && option.description 
            ? `${option.brand} ${option.description}` 
            : option.brand || option.description || 'Fashion Item';
    
        option.imageUrl = `https://via.placeholder.com/400x600/888888/ffffff?text=${encodeURIComponent(fallbackText)}`;
        option.productUrl = `https://www.google.com/search?q=${encodeURIComponent(fallbackText)}`;
        option.price = 'Price Unavailable';
    }
}

// Function to send image to gemini and return gemini output
async function generateAlternatives(imageUrl, visionResults) {
    try {
        console.log('Generating alternatives with Gemini');

        const detectedLabels = visionResults.labels
            .map(label => `${label.description} (${Math.round(label.score * 100)}%)`)
            .join(', ');

        const detectedObjects = visionResults.objects
            .map(obj => `${obj.name} (${Math.round(obj.score * 100)}%)`)
            .join(', ');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `
Analyze this fashion outfit image using the following information:

Labels: ${detectedLabels}
Objects: ${detectedObjects}

For each detected clothing item:
- Identify exact product type (e.g., "linen oxford shirt", "chino pants", "Chelsea boots")
- Suggest at least 3-5 premium (expensive) products ($80-300) and 3-5 affordable products ($20-80)
- Provide realistic product names and actual brand names
- Keep the JSON structure simple

Strictly output only valid JSON, matching this format:
{
  "detectedItems": [
    { "type": "Shirt", "description": "Light blue linen oxford shirt" }
  ],
  "expensiveOptions": [
    { "brand": "Brooks Brothers", "description": "Regent Fit Dress Shirt" }
  ],
  "affordableOptions": [
    { "brand": "Uniqlo", "description": "Easy Care Dress Shirt" }
  ]
}
Only Return JSON,Do not add extra commentary.
`;


        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        console.log('Gemini response:', responseText);

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        // Enrich each shopping option
        if (parsedResponse.expensiveOptions) {
            for (const option of parsedResponse.expensiveOptions) {
                await enrichOption(option);
            }
        }
        if (parsedResponse.affordableOptions) {
            for (const option of parsedResponse.affordableOptions) {
                await enrichOption(option);
            }
        }

        return parsedResponse;
    } catch (error) {
        console.error('Gemini API error:', error);
        return {
            detectedItems: [
                { type: 'Shirt', description: 'Could not analyze item' }
            ],
            expensiveOptions: [],
            affordableOptions: []
        };
    }
}

module.exports = {
    generateAlternatives
};
