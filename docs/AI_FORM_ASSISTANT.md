# AI Text Mapper Feature

## Overview

The AI Text Mapper is a powerful feature designed specifically for administrators to quickly populate test report forms by automatically mapping unstructured text and notes to appropriate form fields. This feature uses Google Gemini 2.0 Flash AI to provide intelligent assistance for form completion.

## Access Control

- **Admin Only**: This feature is exclusively available to users with `admin` or `super_admin` roles
- **Automatic Detection**: The system automatically detects user roles and shows/hides the AI assistant accordingly
- **Secure API**: The backend API endpoint validates admin permissions before processing requests

## Features

### AI Text Mapper
- **Text Input**: Paste any unstructured text about your testing experience
- **Smart Mapping**: AI automatically maps text to appropriate form fields
- **Field Detection**: Identifies scores, pros/cons, recommendations, and assessments
- **Selective Application**: Apply all mapped data or specific fields individually
- **Preview & Review**: See mapped results before applying to form
- **Copy & Clear**: Easy text management with copy and clear functions

## How to Use

### Step 1: Access the Feature
1. Navigate to `/tester/write-a-test-report`
2. The AI Text Mapper card will appear below tool selection (admin only)

### Step 2: Paste Your Test Notes
1. Paste any text about your testing experience in the text area
2. Can include scores, observations, pros/cons, recommendations, etc.

### Step 3: Map Text to Fields
1. Click "Map Text to Form Fields"
2. AI will analyze and map your text to appropriate form fields
3. Review the mapped results

### Step 4: Apply Mapped Data
1. Choose to apply all mapped data or specific fields
2. Mapped data will populate the form fields automatically

## Mapped Content Types

The AI Text Mapper can identify and map:

- **Report Title**: Descriptive title based on tool name
- **Summary**: Executive summary of the tool
- **Detailed Analysis**: Comprehensive technical analysis
- **Scores**: Overall, value, usage, and integration scores (1-10)
- **Pros & Cons**: Lists of advantages and disadvantages
- **Use Cases**: Practical applications of the tool
- **Recommendations**: Improvement suggestions
- **Assessment Fields**: Setup time, learning curve, support quality, etc.
- **Final Verdict**: Overall recommendation

## Technical Implementation

### Frontend Components
- `AIFormAssistant`: Main component with UI and logic
- Integration with existing form sections
- Role-based visibility control
- Gemini AI branding and status indicators

### Backend API
- `/api/testing/ai-generate-report`: POST endpoint for AI generation
- Role validation and security checks
- **Google Gemini 2.0 Flash integration** for real AI content generation
- Fallback to mock content if API fails

### Security Features
- Admin role verification on both frontend and backend
- Secure API endpoints with proper authentication
- Input validation and error handling

## AI Integration Details

### Google Gemini 2.0 Flash Integration
The system now uses Google Gemini 2.0 Flash for real AI content generation:

```typescript
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const result = await model.generateContent(systemPrompt + "\n\n" + prompt);
const response = await result.response;
const text = response.text();
```

### Environment Configuration
Add to your environment variables:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Fallback System
- Primary: Google Gemini 2.0 Flash API
- Fallback: Mock content generation if API fails
- Error handling with user-friendly messages

### Additional Features
- **Template System**: Pre-defined report templates
- **Batch Generation**: Generate multiple reports at once
- **Export Options**: Export generated content to various formats
- **History**: Save and reuse previous AI generations

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Graceful fallback with user notifications
- **Permission Errors**: Clear messaging for unauthorized access
- **Validation Errors**: Input validation with helpful error messages
- **Loading States**: Visual feedback during AI generation

## Best Practices

1. **Review Generated Content**: Always review AI-generated content before submitting
2. **Customize as Needed**: Use the selective application feature to customize results
3. **Combine with Manual Input**: Use AI as a starting point, then refine manually
4. **Test Different Prompts**: Experiment with custom prompts for better results

## Troubleshooting

### AI Assistant Not Visible
- Verify you have admin or super_admin role
- Check browser console for any errors
- Ensure you're on the correct page (`/tester/write-a-test-report`)

### Generation Fails
- Ensure a tool is selected before generating
- Check network connection
- Verify API endpoint is accessible
- Check server logs for detailed error information

### Content Not Applying
- Ensure form fields are not disabled
- Check for JavaScript errors in browser console
- Verify the generated content format matches expected structure
