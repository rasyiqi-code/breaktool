import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super_admin
    // Get user data from database to check role
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        activeRole: true,
        primaryRole: true
      }
    });

    const userRole = userData?.activeRole || userData?.role || 'user';

    if (!['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { text, currentFormData } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Map text to form fields using AI
    const mappedData = await mapTextToFormFields(text, currentFormData);

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error in AI map text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function mapTextToFormFields(text: string, currentFormData: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment variables');
    // Fallback to mock mapping if API key is not available
    return generateMockMapping(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are an expert at analyzing test notes and intelligently mapping them to structured form fields. Your job is to be SMART and INTERPRETIVE - fill in missing information based on context and logical inference.

Analyze the following test notes and extract relevant information to map to these form fields:

FORM FIELDS TO MAP TO:
- title: Report title (string)
- summary: Brief summary (string)
- detailedAnalysis: Detailed analysis (string)
- overallScore: Overall score 1-10 (number)
- valueScore: Value score 1-10 (number)
- usageScore: Usage score 1-10 (number)
- integrationScore: Integration score 1-10 (number)
- recommendations: Recommendations (string)
- pros: Array of pros/advantages (string[])
- cons: Array of cons/disadvantages (string[])
- useCases: Array of use cases (string[])
- setupTime: "under-5-minutes", "5-15-minutes", "15-30-minutes", "30-60-minutes", "over-1-hour"
- learningCurve: "very-easy", "easy", "moderate", "difficult", "very-difficult"
- supportQuality: "excellent", "good", "average", "poor", "very-poor"
- documentation: "excellent", "good", "average", "poor", "very-poor"
- performance: "excellent", "good", "average", "poor", "very-poor"
- security: "excellent", "good", "average", "poor", "very-poor"
- scalability: "excellent", "good", "average", "poor", "very-poor"
- costEffectiveness: "excellent", "good", "average", "poor", "very-poor"
- verdict: "highly-recommended", "recommended", "neutral", "not-recommended", "strongly-not-recommended"

INTELLIGENT MAPPING RULES:
1. **SCORES**: If no explicit scores are mentioned, infer them from context:
   - If text is very positive → scores 8-10
   - If text is moderately positive → scores 6-7
   - If text is neutral → scores 5-6
   - If text is negative → scores 3-4
   - If text is very negative → scores 1-2

2. **QUALITATIVE FIELDS**: Infer from context and tone:
   - "Easy to use", "simple", "intuitive" → learningCurve: "easy" or "very-easy"
   - "Quick setup", "fast installation" → setupTime: "under-5-minutes" or "5-15-minutes"
   - "Great support", "helpful team" → supportQuality: "excellent" or "good"
   - "Good docs", "well documented" → documentation: "good" or "excellent"
   - "Fast", "responsive", "smooth" → performance: "excellent" or "good"
   - "Secure", "safe", "reliable" → security: "excellent" or "good"
   - "Scales well", "handles load" → scalability: "excellent" or "good"
   - "Worth the price", "good value" → costEffectiveness: "excellent" or "good"

3. **VERDICT**: Infer from overall tone and scores:
   - Very positive + high scores → "highly-recommended"
   - Positive + good scores → "recommended"
   - Mixed/neutral → "neutral"
   - Negative + low scores → "not-recommended"
   - Very negative + very low scores → "strongly-not-recommended"

4. **ALWAYS FILL**: Try to fill ALL fields based on available context, even if not explicitly mentioned
5. **BE CONSISTENT**: Ensure scores and qualitative assessments align with each other
6. **USE CONTEXT**: If text mentions "tool", "software", "platform", etc., use that context for recommendations and use cases

Return ONLY a JSON object with ALL possible fields filled based on intelligent interpretation. Do not include any other text or explanations.`;

    const result = await model.generateContent(systemPrompt + "\n\nTEST NOTES:\n" + text);
    const response = await result.response;
    const aiText = response.text();

    // Try to parse JSON from the response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the response
        return validateAndCleanMappedData(parsedData);
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', aiText);
    }

    // If JSON parsing fails, fallback to mock mapping
    return generateMockMapping(text);
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to mock mapping on API error
    return generateMockMapping(text);
  }
}

function validateAndCleanMappedData(data: any) {
  const cleaned: any = {};

  // Validate and clean each field
  if (data.title && typeof data.title === 'string') {
    cleaned.title = data.title;
  }

  if (data.summary && typeof data.summary === 'string') {
    cleaned.summary = data.summary;
  }

  if (data.detailedAnalysis && typeof data.detailedAnalysis === 'string') {
    cleaned.detailedAnalysis = data.detailedAnalysis;
  }

  // Validate scores (1-10)
  const scoreFields = ['overallScore', 'valueScore', 'usageScore', 'integrationScore'];
  scoreFields.forEach(field => {
    if (data[field] !== undefined) {
      const score = parseInt(data[field]);
      if (!isNaN(score) && score >= 1 && score <= 10) {
        cleaned[field] = score;
      }
    }
  });

  if (data.recommendations && typeof data.recommendations === 'string') {
    cleaned.recommendations = data.recommendations;
  }

  // Validate arrays
  if (Array.isArray(data.pros)) {
    cleaned.pros = data.pros.filter((pro: any) => typeof pro === 'string' && pro.trim());
  }

  if (Array.isArray(data.cons)) {
    cleaned.cons = data.cons.filter((con: any) => typeof con === 'string' && con.trim());
  }

  if (Array.isArray(data.useCases)) {
    cleaned.useCases = data.useCases.filter((useCase: any) => typeof useCase === 'string' && useCase.trim());
  }

  // Validate dropdown values
  const dropdownFields = {
    setupTime: ['under-5-minutes', '5-15-minutes', '15-30-minutes', '30-60-minutes', 'over-1-hour'],
    learningCurve: ['very-easy', 'easy', 'moderate', 'difficult', 'very-difficult'],
    supportQuality: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    documentation: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    performance: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    security: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    scalability: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    costEffectiveness: ['excellent', 'good', 'average', 'poor', 'very-poor'],
    verdict: ['highly-recommended', 'recommended', 'neutral', 'not-recommended', 'strongly-not-recommended']
  };

  Object.entries(dropdownFields).forEach(([field, validValues]) => {
    if (data[field] && validValues.includes(data[field])) {
      cleaned[field] = data[field];
    }
  });

  return cleaned;
}

function generateMockMapping(text: string) {
  // Intelligent text analysis for mock mapping
  const lowerText = text.toLowerCase();
  
  const mapped: any = {};

  // Determine overall sentiment and tone
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'love', 'perfect', 'awesome', 'wonderful', 'outstanding'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointing', 'poor', 'worst', 'useless', 'broken'];
  const neutralWords = ['okay', 'fine', 'average', 'decent', 'acceptable', 'mediocre'];
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const neutralCount = neutralWords.filter(word => lowerText.includes(word)).length;
  
  // Determine sentiment-based scores
  let baseScore = 5; // neutral
  if (positiveCount > negativeCount && positiveCount > 0) {
    baseScore = Math.min(8, 5 + positiveCount); // positive
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    baseScore = Math.max(2, 5 - negativeCount); // negative
  } else if (neutralCount > 0) {
    baseScore = 5; // neutral
  }

  // Extract explicit scores first, fallback to sentiment-based
  const scoreMatch = lowerText.match(/(\d+)\/10|score[:\s]*(\d+)|rating[:\s]*(\d+)/);
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    if (score >= 1 && score <= 10) {
      mapped.overallScore = score;
      mapped.valueScore = Math.max(1, score - 1);
      mapped.usageScore = Math.min(10, score + 1);
      mapped.integrationScore = score;
    }
  } else {
    // Use sentiment-based scores
    mapped.overallScore = baseScore;
    mapped.valueScore = Math.max(1, baseScore - 1);
    mapped.usageScore = Math.min(10, baseScore + 1);
    mapped.integrationScore = baseScore;
  }

  // Extract pros and cons
  const pros = [];
  const cons = [];

  if (lowerText.includes('easy') || lowerText.includes('simple') || lowerText.includes('intuitive')) {
    pros.push('Easy to use');
  }
  if (lowerText.includes('fast') || lowerText.includes('quick') || lowerText.includes('responsive')) {
    pros.push('Fast performance');
  }
  if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('excellent')) {
    pros.push('Good overall quality');
  }
  if (lowerText.includes('support') && (lowerText.includes('good') || lowerText.includes('great'))) {
    pros.push('Good support');
  }
  if (lowerText.includes('documentation') && (lowerText.includes('good') || lowerText.includes('clear'))) {
    pros.push('Good documentation');
  }
  if (lowerText.includes('secure') || lowerText.includes('safe')) {
    pros.push('Secure');
  }
  if (lowerText.includes('scalable') || lowerText.includes('scales')) {
    pros.push('Scalable');
  }
  if (lowerText.includes('cost') && (lowerText.includes('effective') || lowerText.includes('worth'))) {
    pros.push('Cost effective');
  }

  if (lowerText.includes('bug') || lowerText.includes('issue') || lowerText.includes('problem') || lowerText.includes('glitch')) {
    cons.push('Has some bugs/issues');
  }
  if (lowerText.includes('expensive') || lowerText.includes('costly') || lowerText.includes('pricey')) {
    cons.push('Expensive pricing');
  }
  if (lowerText.includes('difficult') || lowerText.includes('hard') || lowerText.includes('complex')) {
    cons.push('Difficult to use');
  }
  if (lowerText.includes('slow') || lowerText.includes('laggy')) {
    cons.push('Performance issues');
  }
  if (lowerText.includes('limited') || lowerText.includes('restrictive')) {
    cons.push('Limited functionality');
  }

  if (pros.length > 0) mapped.pros = pros;
  if (cons.length > 0) mapped.cons = cons;

  // Extract setup time
  if (lowerText.includes('5 minute') || lowerText.includes('quick setup')) {
    mapped.setupTime = 'under-5-minutes';
  } else if (lowerText.includes('15 minute') || lowerText.includes('10 minute')) {
    mapped.setupTime = '5-15-minutes';
  } else if (lowerText.includes('30 minute')) {
    mapped.setupTime = '15-30-minutes';
  }

  // Extract learning curve
  if (lowerText.includes('very easy') || lowerText.includes('intuitive')) {
    mapped.learningCurve = 'very-easy';
  } else if (lowerText.includes('easy')) {
    mapped.learningCurve = 'easy';
  } else if (lowerText.includes('moderate')) {
    mapped.learningCurve = 'moderate';
  } else if (lowerText.includes('difficult') || lowerText.includes('hard')) {
    mapped.learningCurve = 'difficult';
  }

  // Extract verdict
  if (lowerText.includes('highly recommend') || lowerText.includes('excellent') || baseScore >= 8) {
    mapped.verdict = 'highly-recommended';
  } else if (lowerText.includes('recommend') || lowerText.includes('good') || baseScore >= 6) {
    mapped.verdict = 'recommended';
  } else if (lowerText.includes('not recommend') || lowerText.includes('avoid') || baseScore <= 3) {
    mapped.verdict = 'not-recommended';
  } else if (lowerText.includes('strongly not recommend') || baseScore <= 2) {
    mapped.verdict = 'strongly-not-recommended';
  } else {
    mapped.verdict = 'neutral';
  }

  // Fill in all qualitative fields based on sentiment
  const getQualityLevel = (score: number) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    if (score >= 2) return 'poor';
    return 'very-poor';
  };

  mapped.supportQuality = getQualityLevel(baseScore);
  mapped.documentation = getQualityLevel(baseScore);
  mapped.performance = getQualityLevel(baseScore);
  mapped.security = getQualityLevel(baseScore);
  mapped.scalability = getQualityLevel(baseScore);
  mapped.costEffectiveness = getQualityLevel(baseScore);

  // Generate recommendations based on sentiment
  if (baseScore >= 7) {
    mapped.recommendations = 'This tool shows great potential and is recommended for teams looking for a reliable solution.';
  } else if (baseScore >= 5) {
    mapped.recommendations = 'This tool has some good features but may need improvement in certain areas.';
  } else {
    mapped.recommendations = 'Consider exploring alternatives or addressing the issues mentioned before adoption.';
  }

  // Generate use cases based on context
  const useCases = [];
  if (lowerText.includes('team') || lowerText.includes('collaboration')) {
    useCases.push('Team collaboration');
  }
  if (lowerText.includes('project') || lowerText.includes('management')) {
    useCases.push('Project management');
  }
  if (lowerText.includes('development') || lowerText.includes('coding')) {
    useCases.push('Software development');
  }
  if (lowerText.includes('business') || lowerText.includes('enterprise')) {
    useCases.push('Business operations');
  }
  if (useCases.length === 0) {
    useCases.push('General productivity');
  }
  mapped.useCases = useCases;

  // Generate summary
  if (text.length > 50) {
    mapped.summary = text.substring(0, 200) + (text.length > 200 ? '...' : '');
  }

  return mapped;
}
