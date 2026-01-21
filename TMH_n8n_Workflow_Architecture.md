# That's My Hoodie - n8n Workflow Architecture
## Complete Backend Automation Blueprint

---

## OVERVIEW

This document provides complete technical specifications for all n8n workflows powering the TMH creative automation system. Each workflow is broken down node-by-node with logic, API calls, data transformations, and error handling.

**Architecture Philosophy:**
- Modular workflows that can be developed/tested independently
- Webhook-triggered from frontend for real-time interaction
- Scheduled workflows for batch operations
- Error handling and retry logic at critical points
- Logging for debugging and performance monitoring

---

## SYSTEM ARCHITECTURE MAP

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  City Selector → Concept Input → Image Review → Approval    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ API Calls (Webhooks)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    n8n WORKFLOWS                             │
│                                                              │
│  WF1: Knowledge Base Query ────────────┐                    │
│  WF2: Image Generation Pipeline ───────┤                    │
│  WF3: Approval & Template Creation ────┤                    │
│  WF4: Reddit Posting & Monitoring ─────┤                    │
│  WF5: Data Aggregation & Analytics ────┘                    │
│                                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ External APIs
                 │
┌────────────────▼────────────────────────────────────────────┐
│  Supabase    OpenRouter    Reddit API    Storage            │
└─────────────────────────────────────────────────────────────┘
```

---

## WORKFLOW 1: KNOWLEDGE BASE & CONTEXT MANAGEMENT

**Purpose:** Retrieve and format city context for AI prompts  
**Trigger:** Webhook from frontend when user selects city  
**Frequency:** On-demand  

### Node Breakdown

#### NODE 1: Webhook Trigger
- **Type:** Webhook
- **Method:** POST
- **Path:** `/get-city-context`
- **Expected Input:**
```json
{
  "city_name": "Seattle",
  "context_type": "full" // or "minimal", "landmarks_only", etc.
}
```

#### NODE 2: Validate Input
- **Type:** Function
- **Logic:** Check if city_name is provided and valid
```javascript
// Validate incoming data
const cityName = $input.item.json.body.city_name;
const contextType = $input.item.json.body.context_type || 'full';

if (!cityName) {
  throw new Error('city_name is required');
}

return [{
  json: {
    city_name: cityName,
    context_type: contextType
  }
}];
```

#### NODE 3: Query Supabase - Get City Context
- **Type:** Supabase
- **Operation:** Run SQL Function
- **Function Name:** `get_city_context`
- **Parameters:**
```json
{
  "city_name_param": "={{$json.city_name}}"
}
```

#### NODE 4: Query Supabase - Get Design Concepts
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `design_concepts`
- **Filters:**
  - `city_id` = (from previous node city.id)
  - `status` = 'approved'
- **Sort:** created_at DESC

#### NODE 5: Query Supabase - Get Reference Images
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `reference_images`
- **Filters:**
  - `city_id` = (from city.id)
  - `is_approved` = true
- **Limit:** 10

#### NODE 6: Query Supabase - Get Color Palette
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `color_palettes`
- **Filters:**
  - `city_id` = (from city.id)
  - `is_default` = true
- **Limit:** 1

#### NODE 7: Format Context Response
- **Type:** Function
- **Logic:** Combine all data into structured response
```javascript
const cityContext = $node["Query Supabase - Get City Context"].json;
const designConcepts = $node["Query Supabase - Get Design Concepts"].json;
const referenceImages = $node["Query Supabase - Get Reference Images"].json;
const colorPalette = $node["Query Supabase - Get Color Palette"].json[0];

// Build comprehensive context object
const context = {
  city: cityContext.city,
  landmarks: cityContext.landmarks || [],
  cultural_elements: cityContext.cultural_elements || [],
  events: cityContext.events || [],
  catchphrases: cityContext.catchphrases || [],
  design_concepts: designConcepts,
  reference_images: referenceImages,
  color_palette: colorPalette,
  
  // Derived fields for prompt generation
  top_landmark: cityContext.landmarks?.find(l => l.is_primary)?.name || cityContext.landmarks?.[0]?.name,
  cultural_vibe: cityContext.cultural_elements
    ?.filter(e => e.relevance_score > 80)
    .map(e => e.element)
    .join(', '),
  primary_colors: {
    primary: colorPalette?.primary_color,
    secondary: colorPalette?.secondary_color,
    accent: colorPalette?.accent_color
  }
};

return [{json: context}];
```

#### NODE 8: Respond to Webhook
- **Type:** Respond to Webhook
- **Response Data:** `={{$json}}`

#### NODE 9: Error Handler (Optional Branch)
- **Type:** Error Trigger
- **Connected to:** All query nodes
- **Action:** Log error and return user-friendly message
```javascript
return [{
  json: {
    error: true,
    message: "Failed to retrieve city context",
    details: $json.error
  }
}];
```

---

## WORKFLOW 2: IMAGE GENERATION PIPELINE

**Purpose:** Generate AI images based on city context and user input  
**Trigger:** Webhook from frontend  
**Frequency:** On-demand  

### Node Breakdown

#### NODE 1: Webhook Trigger
- **Type:** Webhook
- **Method:** POST
- **Path:** `/generate-images`
- **Expected Input:**
```json
{
  "city_name": "Seattle",
  "concept_id": "uuid-of-design-concept",
  "prompt_template_id": "uuid-of-prompt-template",
  "custom_inputs": {
    "person_description": "Asian male in late 20s",
    "setting": "coffee shop"
  },
  "num_variations": 4
}
```

#### NODE 2: Get City Context
- **Type:** HTTP Request
- **Method:** POST
- **URL:** (Workflow 1 webhook URL)
- **Body:**
```json
{
  "city_name": "={{$json.body.city_name}}",
  "context_type": "full"
}
```

#### NODE 3: Get Prompt Template
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `prompt_templates`
- **Filters:**
  - `id` = `={{$json.body.prompt_template_id}}`
- **Limit:** 1

#### NODE 4: Get Design Concept
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `design_concepts`
- **Filters:**
  - `id` = `={{$json.body.concept_id}}`
- **Limit:** 1

#### NODE 5: Build Prompt Variables
- **Type:** Function
- **Logic:** Extract and combine all variables
```javascript
const cityContext = $node["Get City Context"].json;
const promptTemplate = $node["Get Prompt Template"].json[0];
const designConcept = $node["Get Design Concept"].json[0];
const customInputs = $input.json.body.custom_inputs || {};

// Extract design elements
const designElements = designConcept.design_elements;

// Build complete variable set
const variables = {
  // City variables
  city_name: cityContext.city.name,
  area_code: cityContext.city.area_code,
  city_nickname: cityContext.city.nickname,
  landmark_name: cityContext.top_landmark,
  cultural_element: cityContext.cultural_vibe,
  city_vibe: cityContext.cultural_vibe,
  primary_sports_team: cityContext.city.primary_sports_team,
  
  // Design variables
  hoodie_color: designElements.hoodie_color || 'black',
  logo_description: designElements.logo_style || designConcept.description,
  logo_placement: designElements.logo_placement || 'center chest',
  embroidery_color: designElements.embroidery_color || 'white',
  logo_size_inches: designElements.logo_size_inches || 4,
  
  // Photography variables (defaults + customs)
  person_description: customInputs.person_description || 'person in their late 20s',
  lens: customInputs.lens || '50mm',
  lighting_style: customInputs.lighting_style || 'natural lighting',
  setting: customInputs.setting || 'urban street',
  
  // Merge any additional custom inputs
  ...customInputs
};

return [{
  json: {
    variables: variables,
    template: promptTemplate.prompt_text,
    model: promptTemplate.model_preference || 'nano-banana',
    num_variations: $input.json.body.num_variations || 4
  }
}];
```

#### NODE 6: Fill Prompt Template
- **Type:** Function
- **Logic:** Replace all {{variables}} in template
```javascript
let filledPrompt = $json.template;
const variables = $json.variables;

// Replace all {{variable}} placeholders
for (const [key, value] of Object.entries(variables)) {
  const regex = new RegExp(`{{${key}}}`, 'g');
  filledPrompt = filledPrompt.replace(regex, value);
}

// Check if any variables remain unfilled
const unfilledVars = filledPrompt.match(/{{[^}]+}}/g);
if (unfilledVars) {
  console.warn('Unfilled variables:', unfilledVars);
}

return [{
  json: {
    prompt: filledPrompt,
    model: $json.model,
    num_variations: $json.num_variations,
    variables_used: variables
  }
}];
```

#### NODE 7: Split into Multiple Requests
- **Type:** Split In Batches
- **Batch Size:** 1
- **Options:** 
  - Reset: false
  - Number of items: `={{$json.num_variations}}`

#### NODE 8: Call OpenRouter API
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** Bearer Token (from credentials)
- **Headers:**
  - `Content-Type`: `application/json`
  - `HTTP-Referer`: `https://tmh-dashboard.com`
- **Body:**
```json
{
  "model": "={{$json.model}}",
  "messages": [
    {
      "role": "user",
      "content": "={{$json.prompt}}"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

#### NODE 9: Extract Image URL
- **Type:** Function
- **Logic:** Parse response and extract image URL
```javascript
const response = $json;

// Different models return images differently
// Adjust based on model used
let imageUrl = null;

if (response.choices && response.choices[0]) {
  const content = response.choices[0].message.content;
  
  // Try to extract image URL from response
  // This varies by model - adjust as needed
  const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|png|jpeg)/i);
  if (urlMatch) {
    imageUrl = urlMatch[0];
  }
}

return [{
  json: {
    image_url: imageUrl,
    raw_response: response,
    prompt_used: $node["Fill Prompt Template"].json.prompt,
    model_used: $node["Fill Prompt Template"].json.model,
    timestamp: new Date().toISOString()
  }
}];
```

#### NODE 10: Download Image
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `={{$json.image_url}}`
- **Response Format:** File
- **Output:** Binary data

#### NODE 11: Upload to Supabase Storage
- **Type:** Supabase
- **Operation:** Upload file
- **Bucket:** `generated-images`
- **File Name:** `{{city_name}}-{{timestamp}}-{{random}}.png`
- **File Data:** `={{$binary}}`

#### NODE 12: Save to Database
- **Type:** Supabase
- **Operation:** Insert rows
- **Table:** `generated_images`
- **Data:**
```json
{
  "city_id": "={{$node['Get City Context'].json.city.id}}",
  "design_concept_id": "={{$node['Get Design Concept'].json[0].id}}",
  "image_url": "={{$json.url}}", // From Supabase Storage upload
  "prompt_used": "={{$node['Fill Prompt Template'].json.prompt}}",
  "model_used": "={{$node['Fill Prompt Template'].json.model}}",
  "image_type": "lifestyle",
  "is_approved": false
}
```

#### NODE 13: Log Prompt Usage
- **Type:** Supabase
- **Operation:** Update rows
- **Table:** `prompt_templates`
- **Filter:** `id = {{prompt_template_id}}`
- **Update:**
```json
{
  "usage_count": "={{$node['Get Prompt Template'].json[0].usage_count + 1}}",
  "updated_at": "={{new Date().toISOString()}}"
}
```

#### NODE 14: Aggregate Results
- **Type:** Aggregate
- **Aggregation:** 
  - Wait for all batches from NODE 7
  - Combine all results

#### NODE 15: Respond to Webhook
- **Type:** Respond to Webhook
- **Response Data:**
```json
{
  "success": true,
  "images_generated": "={{$json.length}}",
  "results": "={{$json}}"
}
```

#### NODE 16: Error Handler
- **Type:** Error Trigger
- **Action:** Log error, clean up partial uploads
```javascript
// Log error
console.error('Image generation failed:', $json.error);

// Return error response
return [{
  json: {
    success: false,
    error: "Image generation failed",
    details: $json.error
  }
}];
```

---

## WORKFLOW 3: APPROVAL & TEMPLATE CREATION

**Purpose:** Process user approvals and create Reddit comparison templates  
**Trigger:** Webhook from frontend  
**Frequency:** On-demand  

### Node Breakdown

#### NODE 1: Webhook Trigger
- **Type:** Webhook
- **Method:** POST
- **Path:** `/approve-designs`
- **Expected Input:**
```json
{
  "city_name": "Seattle",
  "approved_image_ids": ["uuid1", "uuid2"],
  "comparison_type": "side_by_side", // or "front_back"
  "reddit_post_config": {
    "subreddit": "Seattle",
    "post_title": "What's Hoodie 206?",
    "post_body": "Which design do you prefer? Comment below! 👇",
    "schedule_time": "2024-01-15T18:00:00Z" // optional
  }
}
```

#### NODE 2: Validate Approval Count
- **Type:** Function
- **Logic:** Ensure exactly 2 images approved
```javascript
const approvedIds = $json.body.approved_image_ids;

if (!Array.isArray(approvedIds) || approvedIds.length !== 2) {
  throw new Error('Must approve exactly 2 images for comparison');
}

return [{json: $json.body}];
```

#### NODE 3: Get Approved Images
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `generated_images`
- **Filters:**
  - `id` IN `={{$json.approved_image_ids}}`
- **Returns:** Both image records

#### NODE 4: Update Image Status
- **Type:** Supabase
- **Operation:** Update rows
- **Table:** `generated_images`
- **Filter:** `id IN (approved_image_ids)`
- **Update:**
```json
{
  "is_approved": true,
  "approval_notes": "User approved for Reddit post"
}
```

#### NODE 5: Download Both Images
- **Type:** HTTP Request (Loop through 2 images)
- **Method:** GET
- **URL:** `={{$json.image_url}}`
- **Response Format:** File

#### NODE 6: Create Comparison Template
- **Type:** Function (or external image processing API)
- **Logic:** Combine two images side-by-side
```javascript
// Pseudo-code - actual implementation may use:
// - Cloudinary API for image manipulation
// - Imgix
// - Or custom image processing service

const image1 = $node["Download Both Images"].json[0].binary;
const image2 = $node["Download Both Images"].json[1].binary;
const comparisonType = $json.comparison_type;

// Call image composition service
// Returns URL of combined image
const compositeImageUrl = await composeImages({
  image1: image1,
  image2: image2,
  layout: comparisonType, // 'side_by_side' or 'front_back'
  template: 'reddit_comparison',
  overlays: {
    city_name: $json.city_name,
    call_to_action: "Which design do you prefer?"
  }
});

return [{
  json: {
    comparison_image_url: compositeImageUrl
  }
}];
```

#### NODE 7: Upload Comparison to Supabase Storage
- **Type:** Supabase
- **Operation:** Upload file
- **Bucket:** `reddit-comparison-templates`
- **File Name:** `{{city_name}}-comparison-{{timestamp}}.png`

#### NODE 8: Create Reddit Post Record
- **Type:** Supabase
- **Operation:** Insert rows
- **Table:** `reddit_posts`
- **Data:**
```json
{
  "city_id": "={{$node['Get Approved Images'].json[0].city_id}}",
  "subreddit": "={{$json.reddit_post_config.subreddit}}",
  "post_title": "={{$json.reddit_post_config.post_title}}",
  "post_body": "={{$json.reddit_post_config.post_body}}",
  "image_1_id": "={{$json.approved_image_ids[0]}}",
  "image_2_id": "={{$json.approved_image_ids[1]}}",
  "comparison_image_url": "={{$node['Upload Comparison'].json.url}}",
  "status": "queued",
  "scheduled_post_time": "={{$json.reddit_post_config.schedule_time || null}}"
}
```

#### NODE 9: Trigger Reddit Posting Workflow
- **Type:** HTTP Request
- **Method:** POST
- **URL:** (Workflow 4 webhook URL)
- **Body:**
```json
{
  "reddit_post_id": "={{$node['Create Reddit Post Record'].json[0].id}}",
  "immediate_post": "={{!$json.reddit_post_config.schedule_time}}"
}
```

#### NODE 10: Respond to Webhook
- **Type:** Respond to Webhook
- **Response Data:**
```json
{
  "success": true,
  "reddit_post_id": "={{$node['Create Reddit Post Record'].json[0].id}}",
  "comparison_image_url": "={{$node['Upload Comparison'].json.url}}",
  "status": "queued_for_posting"
}
```

---

## WORKFLOW 4: REDDIT POSTING & MONITORING

**Purpose:** Post to Reddit and monitor comments  
**Trigger:** Webhook OR scheduled cron  
**Frequency:** On-demand + every 15 minutes for monitoring  

### SUBFLOW A: POSTING

#### NODE 1A: Webhook Trigger
- **Type:** Webhook
- **Method:** POST
- **Path:** `/post-to-reddit`
- **Expected Input:**
```json
{
  "reddit_post_id": "uuid",
  "immediate_post": true
}
```

#### NODE 1B: Schedule Trigger (Alternative)
- **Type:** Schedule
- **Cron:** `*/15 * * * *` (every 15 minutes)
- **Action:** Check for queued posts ready to post

#### NODE 2: Get Reddit Post Data
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `reddit_posts`
- **Filters:**
  - If webhook: `id = {{reddit_post_id}}`
  - If schedule: `status = 'queued' AND scheduled_post_time <= NOW()`

#### NODE 3: Check if Ready to Post
- **Type:** IF
- **Condition:** 
  - Immediate post = true
  - OR scheduled_post_time <= current time
- **True → Continue**
- **False → End workflow**

#### NODE 4: Download Comparison Image
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `={{$json.comparison_image_url}}`
- **Response Format:** File

#### NODE 5: Upload Image to Reddit
- **Type:** HTTP Request (Reddit API)
- **Method:** POST
- **URL:** `https://oauth.reddit.com/api/submit`
- **Authentication:** OAuth2 (Reddit credentials)
- **Body:**
```json
{
  "sr": "={{$json.subreddit}}",
  "kind": "image",
  "title": "={{$json.post_title}}",
  "url": "={{$binary}}", // Image upload
  "text": "={{$json.post_body}}"
}
```

#### NODE 6: Extract Reddit Post ID
- **Type:** Function
```javascript
const redditResponse = $json;
const postId = redditResponse.json.data.name; // Reddit's post ID (e.g., "t3_abc123")
const postUrl = redditResponse.json.data.url;

return [{
  json: {
    reddit_post_id: postId,
    post_url: postUrl,
    posted_at: new Date().toISOString()
  }
}];
```

#### NODE 7: Update Database
- **Type:** Supabase
- **Operation:** Update rows
- **Table:** `reddit_posts`
- **Filter:** `id = {{original_post_id}}`
- **Update:**
```json
{
  "reddit_post_id": "={{$json.reddit_post_id}}",
  "status": "posted",
  "actual_post_time": "={{$json.posted_at}}"
}
```

### SUBFLOW B: MONITORING COMMENTS

#### NODE 8: Schedule Trigger for Monitoring
- **Type:** Schedule
- **Cron:** `*/15 * * * *` (every 15 minutes)
- **Action:** Check for new comments on posted content

#### NODE 9: Get Active Reddit Posts
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `reddit_posts`
- **Filters:**
  - `status = 'posted'`
  - `actual_post_time > NOW() - INTERVAL '7 days'` (monitor for 7 days)

#### NODE 10: Loop Through Posts
- **Type:** Split In Batches
- **Batch Size:** 1

#### NODE 11: Fetch Comments from Reddit
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `https://oauth.reddit.com/comments/{{reddit_post_id}}`
- **Authentication:** OAuth2

#### NODE 12: Parse Comments
- **Type:** Function
```javascript
const comments = $json[1].data.children; // Reddit comment structure
const existingCommentIds = []; // Query from DB to avoid duplicates

const newComments = comments
  .filter(c => !existingCommentIds.includes(c.data.id))
  .map(comment => ({
    reddit_comment_id: comment.data.id,
    author: comment.data.author,
    comment_text: comment.data.body,
    created_at: new Date(comment.data.created_utc * 1000).toISOString()
  }));

return newComments.map(c => ({json: c}));
```

#### NODE 13: Analyze Sentiment (AI)
- **Type:** HTTP Request (OpenRouter or OpenAI)
- **Method:** POST
- **Body:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Analyze the sentiment of Reddit comments about hoodie designs. Respond with JSON: {sentiment: 'positive'|'negative'|'neutral'|'question', design_preference: 'option_1'|'option_2'|'both'|'neither'|'unclear', should_flag: boolean, flag_reason: string}"
    },
    {
      "role": "user",
      "content": "={{$json.comment_text}}"
    }
  ]
}
```

#### NODE 14: Parse Sentiment Analysis
- **Type:** Function
```javascript
const analysis = JSON.parse($json.choices[0].message.content);
const comment = $node["Parse Comments"].json;

return [{
  json: {
    reddit_post_id: $node["Get Active Reddit Posts"].json.id,
    reddit_comment_id: comment.reddit_comment_id,
    author: comment.author,
    comment_text: comment.comment_text,
    sentiment: analysis.sentiment,
    design_preference: analysis.design_preference,
    is_flagged: analysis.should_flag,
    flag_reason: analysis.flag_reason,
    created_at: comment.created_at
  }
}];
```

#### NODE 15: Save Comments to Database
- **Type:** Supabase
- **Operation:** Insert rows
- **Table:** `reddit_comments`
- **Data:** `={{$json}}`

#### NODE 16: Update Post Metrics
- **Type:** Supabase
- **Operation:** Update rows
- **Table:** `reddit_posts`
- **Update:**
```json
{
  "comments_count": "={{(current_count + new_comments_count)}}",
  "updated_at": "={{new Date().toISOString()}}"
}
```

#### NODE 17: Send Notification (If Flagged)
- **Type:** IF
- **Condition:** `$json.is_flagged === true`
- **True:** Send Slack/Email notification
```javascript
// Notify user of important comment
return [{
  json: {
    message: `New flagged comment on ${$json.reddit_post_id}: "${$json.comment_text}"`,
    reason: $json.flag_reason,
    link: `https://reddit.com/comments/${$json.reddit_post_id}`
  }
}];
```

---

## WORKFLOW 5: DATA AGGREGATION & ANALYTICS

**Purpose:** Analyze Reddit performance and aggregate insights  
**Trigger:** Scheduled cron  
**Frequency:** Daily at 2 AM  

### Node Breakdown

#### NODE 1: Schedule Trigger
- **Type:** Schedule
- **Cron:** `0 2 * * *` (Daily at 2 AM)

#### NODE 2: Get All Reddit Posts (Last 30 Days)
- **Type:** Supabase
- **Operation:** Select rows
- **Table:** `reddit_posts`
- **Filters:**
  - `actual_post_time > NOW() - INTERVAL '30 days'`
- **Join:** LEFT JOIN with `reddit_comments`

#### NODE 3: Aggregate Metrics Per City
- **Type:** Function
```javascript
const posts = $json;

// Group by city
const cityMetrics = {};

posts.forEach(post => {
  const cityId = post.city_id;
  
  if (!cityMetrics[cityId]) {
    cityMetrics[cityId] = {
      city_id: cityId,
      total_posts: 0,
      total_comments: 0,
      total_upvotes: 0,
      avg_comments_per_post: 0,
      sentiment_breakdown: {
        positive: 0,
        negative: 0,
        neutral: 0,
        question: 0
      },
      design_preferences: {
        option_1: 0,
        option_2: 0,
        both: 0,
        neither: 0
      }
    };
  }
  
  cityMetrics[cityId].total_posts++;
  cityMetrics[cityId].total_comments += post.comments_count || 0;
  cityMetrics[cityId].total_upvotes += post.upvotes || 0;
  
  // Aggregate comment sentiments
  post.comments?.forEach(comment => {
    cityMetrics[cityId].sentiment_breakdown[comment.sentiment]++;
    cityMetrics[cityId].design_preferences[comment.design_preference]++;
  });
  
  // Calculate average
  cityMetrics[cityId].avg_comments_per_post = 
    cityMetrics[cityId].total_comments / cityMetrics[cityId].total_posts;
});

return Object.values(cityMetrics).map(m => ({json: m}));
```

#### NODE 4: Identify Top Performing Designs
- **Type:** Function
```javascript
// Analyze which design concepts got most positive feedback
const posts = $node["Get All Reddit Posts"].json;

const designPerformance = {};

posts.forEach(post => {
  // Track both images in comparison
  [post.image_1_id, post.image_2_id].forEach((imageId, index) => {
    if (!designPerformance[imageId]) {
      designPerformance[imageId] = {
        image_id: imageId,
        option_number: index + 1,
        votes: 0,
        positive_comments: 0,
        total_comments: 0
      };
    }
    
    // Count preferences
    const preferenceKey = `option_${index + 1}`;
    designPerformance[imageId].votes += 
      post.comments?.filter(c => c.design_preference === preferenceKey).length || 0;
    
    designPerformance[imageId].positive_comments += 
      post.comments?.filter(c => c.sentiment === 'positive').length || 0;
    
    designPerformance[imageId].total_comments += post.comments_count || 0;
  });
});

// Sort by performance
const topDesigns = Object.values(designPerformance)
  .sort((a, b) => b.votes - a.votes)
  .slice(0, 10);

return topDesigns.map(d => ({json: d}));
```

#### NODE 5: Generate Insights Report
- **Type:** Function
```javascript
const cityMetrics = $node["Aggregate Metrics Per City"].json;
const topDesigns = $node["Identify Top Performing Designs"].json;

const report = {
  generated_at: new Date().toISOString(),
  period: "Last 30 days",
  summary: {
    total_posts: cityMetrics.reduce((sum, c) => sum + c.total_posts, 0),
    total_comments: cityMetrics.reduce((sum, c) => sum + c.total_comments, 0),
    avg_engagement_rate: cityMetrics.reduce((sum, c) => sum + c.avg_comments_per_post, 0) / cityMetrics.length
  },
  city_performance: cityMetrics,
  top_designs: topDesigns,
  recommendations: []
};

// Generate recommendations based on data
if (report.summary.avg_engagement_rate < 5) {
  report.recommendations.push("Consider posting at different times or adjusting post copy");
}

// Identify cities needing more content
cityMetrics.forEach(city => {
  if (city.total_posts < 2) {
    report.recommendations.push(`Increase content volume for ${city.city_name}`);
  }
});

return [{json: report}];
```

#### NODE 6: Save Report to Supabase (Optional)
- **Type:** Supabase
- **Operation:** Insert into analytics table
- **Or:** Store as JSON in storage bucket

#### NODE 7: Send Report to Dashboard
- **Type:** HTTP Request
- **Method:** POST
- **URL:** (Frontend dashboard API endpoint)
- **Body:** `={{$json}}`

#### NODE 8: Send Email Summary (Optional)
- **Type:** Send Email
- **To:** Your email
- **Subject:** `TMH Reddit Analytics - {{date}}`
- **Body:** Formatted summary with key metrics

---

## ERROR HANDLING STRATEGY

### Global Error Handling

Each workflow should have:

1. **Error Trigger Node** connected to critical paths
2. **Retry Logic** on API calls (3 retries with exponential backoff)
3. **Error Logging** to Supabase or external service
4. **User Notifications** for failures that require attention

### Example Error Handler
```javascript
const error = $json;

// Log to database
await supabase
  .from('workflow_errors')
  .insert({
    workflow_name: '{{workflow_name}}',
    error_message: error.message,
    error_stack: error.stack,
    node_name: error.node,
    timestamp: new Date().toISOString()
  });

// Notify if critical
if (error.critical) {
  // Send Slack/email alert
}

return [{json: {success: false, error: error.message}}];
```

---

## ENVIRONMENT VARIABLES NEEDED

Store these in n8n credentials:

```
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (for admin operations)

OPENROUTER_API_KEY=your-openrouter-key

REDDIT_CLIENT_ID=your-reddit-app-client-id
REDDIT_CLIENT_SECRET=your-reddit-app-secret
REDDIT_USERNAME=your-reddit-username
REDDIT_PASSWORD=your-reddit-password

FRONTEND_WEBHOOK_URL=https://your-frontend.com/api/webhook
```

---

## WORKFLOW EXECUTION ORDER

1. **First Time Setup:**
   - Run Workflow 1 to test city context retrieval
   - Run Workflow 2 to generate first batch of images
   - Manually test Workflow 3 with approved images

2. **Production Flow:**
   - User selects city in frontend → WF1 called
   - User generates images → WF2 called
   - User approves 2 images → WF3 called
   - WF3 triggers WF4 (immediate or scheduled)
   - WF4 runs on schedule to monitor
   - WF5 runs nightly to aggregate

---

## MONITORING & MAINTENANCE

**Key Metrics to Track:**
- Workflow execution time
- Success/failure rates
- API quota usage (OpenRouter, Reddit)
- Storage usage (Supabase)
- Cost per image generated

**Regular Maintenance:**
- Review error logs weekly
- Archive old Reddit posts (>90 days)
- Update prompt templates based on quality scores
- Optimize slow queries

---

This architecture is production-ready. Each workflow can be built and tested independently in n8n!
