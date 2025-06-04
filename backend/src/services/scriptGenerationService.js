if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}
const { GoogleGenerativeAI } = require('@google/generative-ai');

const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generates a video script using the Gemini API based on a topic and a list of trends.
 * @param {string} topic - The main topic for the script.
 * @param {Array<Object>} trends - An array of trend objects, each with properties like keyword, snippet, source, pubDate.
 * @returns {Promise<string>} A promise that resolves to the generated script text.
 * @throws {Error} If the API key is not set, or if the API call fails or returns an unexpected response.
 */
const generateScript = async (topic, trends) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    throw new Error('GEMINI_API_KEY is not set.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let trendDetails = trends.map(trend => 
    `- "${trend.keyword}": ${trend.snippet || 'No snippet available.'} (Source: ${trend.source}, Published: ${formatDateYYYYMMDD(new Date(trend.pubDate))})`
  ).join('\n');
  if (!trends || trends.length === 0) {
    trendDetails = "No specific trends provided, focus on the general topic.";
  }

  const prompt = `
Generate a concise and engaging video script (approx. 1-2 minutes, suitable for a platform like Synthesia) about "${topic}".

Incorporate the following current trends and keywords seamlessly into the script:
${trendDetails}

The script should be informative, engaging, and suitable for a general audience. Focus on clarity and a positive or insightful tone.
Provide only the script content itself, without any surrounding text, titles, or introductions like "Here's the script:".
Do not use markdown formatting in the script output (e.g., no ### or **).
Ensure the script flows naturally and is ready for text-to-speech conversion.
Example of desired output format:
"Welcome back to our channel! Today, we're diving deep into ${topic}. Did you know that ${trends.length > 0 ? trends[0].keyword : 'a recent development'} is making waves? Let's explore..."
`;

  console.log(`Generating script with prompt for topic: ${topic}`);
  // console.debug('Full prompt:', prompt); // Uncomment for debugging prompt issues

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const scriptText = response.text();

    if (typeof scriptText !== 'string' || scriptText.trim() === '') {
      console.error('Gemini API returned an empty or invalid script.');
      throw new Error('Failed to get valid script content from Gemini API response.');
    }
    return scriptText.trim();
  } catch (error) {
    console.error('Error generating script from Gemini API:', error);
    throw new Error(`Failed to generate script from Gemini API: ${error.message}`);
  }
};

module.exports = {
  generateScript,
};
