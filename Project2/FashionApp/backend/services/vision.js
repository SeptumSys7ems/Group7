const vision = require('@google-cloud/vision');
const path = require('path');
const axios = require('axios');

const credsPath = path.join(__dirname, 'creds.json');

const client = new vision.ImageAnnotatorClient({
    keyFilename: credsPath
});

// Function to send image to vision and return vision output
async function analyzeImage(imageUrl) {
    try {
        console.log(`Analyzing image: ${imageUrl}`);

        // Always download the image, no localhost or file reading
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageContent = Buffer.from(response.data, 'binary');

        const [labelResponse] = await client.labelDetection({
            image: { content: imageContent }
        });
        const [objectResponse] = await client.objectLocalization({
            image: { content: imageContent }
        });

        console.log('Raw Vision API Label Response:', JSON.stringify(labelResponse));
        console.log('Raw Vision API Object Response:', JSON.stringify(objectResponse));

        const labels = labelResponse.labelAnnotations || [];
        const objects = objectResponse.localizedObjectAnnotations || [];

        const clothingKeywords = [
            'clothing', 'shirt', 'pants', 'dress', 'shoe', 'jacket',
            'hat', 'suit', 'tie', 'fashion', 'outfit', 'apparel'
        ];

        const clothingCategories = [
            'Clothing', 'Top', 'Pants', 'Footwear', 'Dress', 'Skirt',
            'Jacket', 'Suit', 'Hat', 'Tie', 'Shirt', 'Shorts'
        ];

        const clothingLabels = labels.filter(label =>
            clothingKeywords.some(keyword =>
                label.description.toLowerCase().includes(keyword)
            )
        );

        const clothingObjects = objects.filter(object =>
            clothingCategories.includes(object.name)
        );

        return {
            labels: clothingLabels,
            objects: clothingObjects
        };
    } catch (error) {
        console.error('Vision API error:', error);
        throw new Error('Failed to analyze image with Vision API');
    }
}

module.exports = {
    analyzeImage
};
