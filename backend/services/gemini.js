
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        console.log('Detected labels:', detectedLabels);
        console.log('Detected objects:', detectedObjects);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        
        const prompt = `
Analyze this fashion outfit image with the following detected items:

Labels: ${detectedLabels}
Objects: ${detectedObjects}

For each clothing item in the image:
1. Identify the specific type (e.g., button-down shirt, chino pants)
2. Describe the color, material, and style
3. Suggest two premium/expensive versions of this item (include price range $80–300)
4. Suggest two budget-friendly alternatives (include price range $20–80)

Format the response as a structured JSON object with the following fields:
{
  "detectedItems": [
    { "type": "Shirt", "description": "Light blue linen button-down shirt" }
  ],
  "expensiveOptions": [
    { "type": "Shirt", "brand": "Brooks Brothers", "name": "Premium Linen Shirt", "price": 120, "imageUrl": "placeholder.jpg", "productUrl": "#" }
  ],
  "affordableOptions": [
    { "type": "Shirt", "brand": "H&M", "name": "Linen-Blend Shirt", "price": 35, "imageUrl": "placeholder.jpg", "productUrl": "#" }
  ]
}
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

        return parsedResponse;
    } catch (error) {
        console.error('Gemini API error:', error);

        return {
            detectedItems: [
                { type: 'Shirt', description: 'Could not analyze item' }
            ],
            expensiveOptions: [
                {
                    type: 'Shirt',
                    brand: 'Example Brand',
                    name: 'Premium Item',
                    price: 100,
                    imageUrl: 'https://via.placeholder.com/300x400?text=Example',
                    productUrl: '#'
                }
            ],
            affordableOptions: [
                {
                    type: 'Shirt',
                    brand: 'Example Brand',
                    name: 'Budget Item',
                    price: 30,
                    imageUrl: 'https://via.placeholder.com/300x400?text=Example',
                    productUrl: '#'
                }
            ]
        };
    }
}

module.exports = {
    generateAlternatives
};
