const vision = require('@google-cloud/vision');
const path = require('path');
const url = require('url'); // Add this line
const fs = require('fs').promises; // Check if this is already imported
const axios = require('axios'); // Check if this is already imported

const credsPath = path.join(__dirname, 'creds.json');

const client = new vision.ImageAnnotatorClient({
    keyFilename: credsPath
});

// Function to send image to vision and return vision output
async function analyzeImage(imageUrl) {
    try {
        console.log(`Analyzing image: ${imageUrl}`);

        let imageContent;

        // try {
        //     const axios = require('axios');
        //     await axios.head(imageUrl);
        //     console.log('Image URL is accessible');
        // } catch (err) {
        //     console.error('Image URL is not accessible:', err.message);
        // }

        if (imageUrl.includes('localhost') || imageUrl.startsWith('/')) {
            // For local files, extract the file path and read the file directly
            const parsedUrl = url.parse(imageUrl);
            let filePath;
            console.log('Parsed URL:', parsedUrl);
            console.log('localhost:', imageUrl.includes('localhost'));
            console.log('Starts with /:', imageUrl.startsWith('/'));
            
            if (parsedUrl.path.startsWith('/uploads/')) {
                // Resolve the path relative to the current directory
                filePath = path.join(__dirname, '..', parsedUrl.path);
            } else {
                filePath = path.join(__dirname, '..', 'uploads', parsedUrl.path);
            }
            
            console.log(`Reading local file from: ${filePath}`);
            // Read the file directly
            imageContent = await fs.readFile(filePath);
        } else {
            // For external URLs, download the image
            console.log('Downloading image from external URL');
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageContent = Buffer.from(response.data, 'binary');
        }

        // const [labelResponse] = await client.labelDetection(imageUrl);
        // const [objectResponse] = await client.objectLocalization(imageUrl);

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
