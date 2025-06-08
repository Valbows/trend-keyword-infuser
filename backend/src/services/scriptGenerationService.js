try {
  if (process.env.NODE_ENV !== 'test') {
    const dotenv = require('dotenv');
    const dotenvResult = dotenv.config();
    if (dotenvResult.error) {
      // Log the error related to .env file parsing/loading but don't necessarily stop the module load here,
      // as the GEMINI_API_KEY check later should catch missing keys.
      // However, this log is crucial for diagnosing .env specific issues.
      console.error('dotenv.config() error in scriptGenerationService (non-critical, will proceed to API key check):', dotenvResult.error);
    }
  }
} catch (e) {
  // This catches critical errors if require('dotenv') fails or dotenv.config() itself throws an unexpected major exception.
  console.error('CRITICAL error during dotenv setup in scriptGenerationService:', e);
  // Throw a new error to ensure the module loading fails clearly if dotenv setup is catastrophic.
  throw new Error(`Failed to initialize dotenv configuration in scriptGenerationService. Module cannot load. Original error: ${e.message}`);
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
    // It's possible for response to be undefined if the model call itself fails severely.
    if (!response) {
        console.error('Gemini API call did not return a response object.');
        throw new Error('Failed to get response from Gemini API.');
    }
    const scriptText = response.text();

    if (typeof scriptText !== 'string' || scriptText.trim() === '') {
      console.error('Gemini API returned an empty or invalid script.');
      throw new Error('Failed to get valid script content from Gemini API response (empty or invalid).');
    }
    return scriptText.trim();
  } catch (error) {
    console.error('Error generating script from Gemini API (raw object):', error);
    let detailMessage = "An unknown error occurred with the AI service.";

    if (error instanceof Error && typeof error.message === 'string' && error.message.trim() !== '') {
        detailMessage = error.message;
    } else if (typeof error === 'string' && error.trim() !== '') {
        detailMessage = error;
    } else {
        // Attempt to get more info if it's a structured error from the API client or a non-standard error object
        let tempDetail = "Failed to extract specific details from complex error object."; // Default for this complex path
        try {
            if (error && error.cause && typeof error.cause.message === 'string') {
              tempDetail = `Cause: ${error.cause.message}`;
            } else if (error && typeof error.statusMessage === 'string') {
              tempDetail = error.statusMessage;
            } else if (error && error.details) {
                try {
                    tempDetail = JSON.stringify(error.details);
                } catch (stringifyDetailsError) {
                    console.error('Failed to stringify error.details:', stringifyDetailsError);
                    tempDetail = "Could not stringify error.details. Check logs for stringifyDetailsError.";
                }
            } else {
                try {
                    // Fallback to stringifying the entire error object
                    const stringifiedError = JSON.stringify(error);
                    // Avoid using '{}' or 'null' as the message if that's what stringify returns for non-informative objects
                    if (stringifiedError && stringifiedError !== '{}' && stringifiedError !== 'null') {
                        tempDetail = stringifiedError;
                    } else {
                        tempDetail = "Complex error object received (non-informative when stringified).";
                    }
                } catch (stringifyError) {
                    console.error('Failed to stringify the entire error object:', stringifyError);
                    tempDetail = "The entire error object could not be stringified. Check logs for stringifyError.";
                }
            }
        } catch (accessError) {
            // This catches errors if accessing error.cause, error.statusMessage, etc., itself fails
            console.error('Error while accessing properties of the original error object:', accessError);
            tempDetail = "Error encountered while trying to access properties of the original error object.";
        }
        detailMessage = tempDetail;
    }
    
    const finalErrorMessage = `Gemini API Error: ${detailMessage}`;
    console.error('Re-throwing error from scriptGenerationService with message:', finalErrorMessage);
    throw new Error(finalErrorMessage);
  }
};

module.exports = {
  generateScript,
};
