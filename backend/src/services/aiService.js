// Lazy-load Anthropic SDK to avoid blocking server startup
let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      const err = new AIServiceError('AI service is not configured.', 503, 'auth');
      throw err;
    }
    const Anthropic = require('@anthropic-ai/sdk');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Custom error class for AI service errors
class AIServiceError extends Error {
  constructor(message, statusCode, type) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.type = type;
  }
}

function parseAnthropicError(err) {
  const status = err.status || err.statusCode || 500;
  const rawMessage = err.error?.message || err.message || '';

  // Check for billing/credit errors
  if (rawMessage.includes('credit balance') || rawMessage.includes('billing')) {
    return new AIServiceError('AI features are temporarily unavailable. Please try again later.', 402, 'billing');
  }

  // Check for rate limit errors
  if (status === 429 || rawMessage.includes('rate_limit') || rawMessage.includes('rate limit')) {
    return new AIServiceError('Too many requests. Please wait a moment.', 429, 'rate_limit');
  }

  // Check for authentication errors
  if (status === 401 || rawMessage.includes('authentication')) {
    return new AIServiceError('AI service is not configured.', 401, 'auth');
  }

  // All other errors
  return new AIServiceError('AI service is temporarily unavailable.', 503, 'unavailable');
}

const CHAT_SYSTEM_PROMPT = `You are a friendly car-buying assistant for GitchaCars, a marketplace where buyers post "Want-Listings" to describe the car they're looking for.

Your PRIMARY job is to:
1. Help the buyer describe what they want through natural conversation
2. Generate a COMPELLING listing title (e.g., "Looking for a 2020-2024 Honda CR-V under $35k")
3. Generate a detailed 2-3 sentence description highlighting their key preferences

GitchaCars specializes in connecting buyers looking for specific types of vehicles:
- **Classic cars** — pre-1970s muscle cars, vintage European, barn finds
- **Luxury/high-end** — BMW, Mercedes, Lexus, Porsche, exotic brands
- **Family vehicles** — reliable SUVs, minivans, safe sedans
- **Daily drivers** — affordable, fuel-efficient, practical commuters
- **Trucks & utility** — work trucks, off-road capable, towing rigs

Ask about these details through conversation (1-2 questions at a time):
- Make and model (e.g., Honda CR-V, Toyota Camry)
- Year range (e.g., 2020–2024, pre-1970 for classics)
- Budget range (e.g., $25,000–$35,000)
- Maximum mileage (e.g., under 50,000 miles)
- Location (zip code) and search radius (e.g., within 50 miles)
- Transmission preference (automatic or manual)
- Drivetrain preference (FWD, RWD, AWD, 4WD)
- Condition (new or used)
- Color preferences (if they have any)
- Must-have features (things they absolutely need — e.g., leather seats, backup camera)
- Nice-to-have features (things they'd prefer but aren't deal-breakers — e.g., sunroof, Apple CarPlay)
- Any other preferences (specific trim levels, history requirements, etc.)

IMPORTANT: If the user doesn't mention color, specific features, or condition preferences, ask a quick follow-up about those. When asking about features, distinguish between "must-haves" (deal-breakers) and "nice-to-haves" (bonuses). This helps sellers match better.

When you have enough info (at minimum: make, model, year range, budget range, zip code, radius, max mileage), present a summary with a catchy title and detailed description. The title should be concise and specific. The description should be 2-3 sentences highlighting what makes this search unique.

Infer vehicleType from make/model/description:
- sedan, suv, truck, classic, exotic, van, coupe, convertible, wagon, electric, other

Keep responses concise (2-4 sentences typically). Be enthusiastic but professional.`;

async function chatForListing(messages) {
  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });
    return response.content[0].text;
  } catch (err) {
    if (err instanceof AIServiceError) throw err;
    console.error('[AI Service] Chat error:', err.status || err.code, err.message);
    throw parseAnthropicError(err);
  }
}

const EXTRACT_SYSTEM_PROMPT = `You are a data extraction assistant. Given a conversation between a user and a car-buying assistant, extract structured want listing data from the conversation.

Return ONLY a valid JSON object with these fields (all optional — only include fields that were discussed or can be inferred):
- title (string): A short, descriptive listing title. Generate one if not explicitly stated (e.g., "Looking for a 2020-2024 Honda CR-V")
- make (string): Vehicle make (e.g., "Honda")
- model (string): Vehicle model (e.g., "CR-V")
- yearMin (number): Minimum year
- yearMax (number): Maximum year
- budgetMin (number): Minimum budget in dollars (number only, no $ or commas)
- budgetMax (number): Maximum budget in dollars (number only, no $ or commas)
- zipCode (string): 5-digit zip code
- radius (number): Search radius in miles
- mileageMax (number): Maximum mileage
- description (string): A summary of what the user is looking for. Generate one if not explicitly stated.
- transmission (string): "automatic" or "manual" (lowercase)
- drivetrain (string): "fwd", "rwd", "awd", or "4wd" (lowercase)
- condition (string): "new" or "used" (lowercase)
- features (array of strings): All desired features combined (for backward compat)
- featuresMustHave (array of strings): Features the buyer absolutely needs (keywords: "must have", "need", "require", "essential", "deal-breaker")
- featuresNiceToHave (array of strings): Features the buyer would prefer but doesn't require (keywords: "would like", "prefer", "bonus", "nice to have", or ambiguous)
- vehicleType (string): One of: sedan, suv, truck, classic, exotic, van, coupe, convertible, wagon, electric, other

Infer vehicleType from the make/model if not explicitly stated:
- sedan: Honda Civic, Toyota Camry, etc.
- suv: Honda CR-V, Toyota RAV4, Ford Explorer, etc.
- truck: Ford F-150, Chevy Silverado, RAM 1500, etc.
- classic: cars before 1990 or described as classic/vintage
- exotic: Lamborghini, Ferrari, McLaren, Porsche 911, etc.
- van: Honda Odyssey, Toyota Sienna, etc.
- coupe: 2-door sporty cars
- convertible: convertibles/roadsters
- wagon: station wagons, Subaru Outback, etc.
- electric: Tesla, Rivian, Nissan Leaf, any EV
- other: anything else

Return ONLY the JSON object, no markdown fences, no explanation.`;

async function extractListingFromChat(messages) {
  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: EXTRACT_SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].text.trim();
    // Try to parse JSON, handling potential markdown fences
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }
    return JSON.parse(jsonStr);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {};
    }
    if (err instanceof AIServiceError) throw err;
    throw parseAnthropicError(err);
  }
}

const FILTER_EXTRACT_SYSTEM_PROMPT = `You are a data extraction assistant for GitchaCars. A seller is describing the vehicle they have to sell. Extract structured filter data so the marketplace can find matching buyer want listings.

Return ONLY a valid JSON object with these fields (only include fields that were mentioned or can be reasonably inferred):
- make (string): Vehicle make (e.g., "Toyota", "Ford", "Honda"). Capitalize first letter.
- model (string): Vehicle model (e.g., "Camry", "F150", "CR-V")
- yearMin (number): The year of the vehicle (use as both min and max if a single year is given)
- yearMax (number): Same as yearMin for a single year
- vehicleType (string): One of: Sedan, SUV, Truck, Coupe, Convertible, Van, Wagon. Capitalize first letter. Infer from make/model.
- drivetrain (string): "fwd", "rwd", "awd", or "4wd" (lowercase). Infer from make/model if possible.
- mileageMax (string): Maximum mileage as a string number (e.g., "50000", "100000"). Round to nearest standard option: 50000, 75000, 100000, 150000, 200000.
- transmission (string): "automatic" or "manual" (lowercase). Default to "" if unknown.

IMPORTANT:
- Only include fields you can determine from the user's description
- If the user just says a make (e.g., "Honda"), return only { "make": "Honda" }
- For common models, infer vehicleType: CR-V/RAV4/Explorer = SUV, Civic/Camry/Accord = Sedan, F150/Silverado = Truck
- Return ONLY the JSON object, no markdown fences, no explanation.`;

async function extractFiltersFromVehicle(message) {
  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: FILTER_EXTRACT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });

    const text = response.content[0].text.trim();
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }
    return JSON.parse(jsonStr);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {};
    }
    if (err instanceof AIServiceError) throw err;
    console.error('[AI Service] Filter extraction error:', err.status || err.code, err.message);
    throw parseAnthropicError(err);
  }
}

module.exports = { chatForListing, extractListingFromChat, extractFiltersFromVehicle, AIServiceError };
