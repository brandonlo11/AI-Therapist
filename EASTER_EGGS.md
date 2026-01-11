# Easter Eggs Guide 🎉

The AI Therapist chatbot includes a fun easter egg system that can display special messages or images when users ask certain questions! There are two types of easter eggs:

1. **Keyword-Based Easter Eggs**: Triggered by specific words or phrases in the user's message
2. **Random Easter Eggs**: Appear randomly every few messages (not based on keywords)

## How It Works

### Keyword-Based Easter Eggs
When a user sends a message, the system checks if it contains any trigger keywords. If a match is found, a beautiful modal popup appears with either a message or an image.

### Random Easter Eggs
Random easter eggs appear automatically every few messages (approximately every 3 messages by default, with some randomness). These provide encouragement and surprise moments without needing specific keywords. They have lower priority than keyword-based easter eggs, so if both conditions are met, the keyword easter egg will be shown instead.

## Current Easter Eggs

### Keyword-Based Easter Eggs
The app comes with several default keyword-based easter eggs:
- **💕 Love**: Triggers on "i love you", "love you", "i love emma", "love emma"
- **💙 Missing You**: Triggers on "i miss you", "miss you", "missing you", "miss emma"
- **🎉 Anniversary**: Triggers on "anniversary", "one year", "two years", etc.
- **✨ First Date**: Triggers on "first date", "first time we met", "when we first met", "first kiss"
- **🎁 Surprise**: Triggers on "surprise", "surprised", "surprise emma", "surprising"

### Random Easter Eggs
The app also includes 5 random easter eggs that appear automatically:
- **💪 Encouragement 1**: "You're doing great! Remember, every relationship has its ups and downs..."
- **🌻 Encouragement 2**: "I'm here for you, Emma! Communication and understanding are the keys..."
- **✨ Encouragement 3**: "Every conversation you have is a step toward deeper understanding..."
- **💖 Encouragement 4**: "Your willingness to work on your relationship shows how much you care..."
- **🌟 Encouragement 5**: "Remember, it's okay to have difficult conversations. They often lead..."

These appear approximately every 3 messages with a 40% probability check.

## Adding Your Own Easter Eggs

To add your own easter eggs, edit the configuration arrays in `components/ChatInterface.tsx`:
- `EASTER_EGGS` array for keyword-based easter eggs
- `RANDOM_EASTER_EGGS` array for random easter eggs

You can also adjust the frequency of random easter eggs by changing:
- `RANDOM_EGG_FREQUENCY`: How often to check (every N messages, default: 3)
- `RANDOM_EGG_PROBABILITY`: Probability of triggering when conditions are met (0-1, default: 0.4)

### Adding a Message Easter Egg

```typescript
{
  id: 'unique-id',                    // Unique identifier
  triggers: ['keyword1', 'keyword2'], // Keywords that trigger this easter egg (case-insensitive)
  type: 'message',                    // Type: 'message' or 'image'
  title: '🎉',                        // Optional title (emoji or text)
  content: 'Your message here!',      // The message to display
  delay: 500,                         // Optional delay in milliseconds before showing
}
```

### Adding an Image Easter Egg

#### Step 1: Convert Image to Data URL

**Option A: Using Browser Console**
1. Open the browser console (F12 or Cmd+Option+I)
2. Use this JavaScript code:
```javascript
// Create a file input temporarily
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    console.log(reader.result); // Copy this data URL
  };
  reader.readAsDataURL(file);
};
input.click();
```

**Option B: Using Online Tool**
- Visit https://base64.guru/converter/encode/image
- Upload your image
- Copy the data URL (starts with `data:image/...`)

#### Step 2: Add to EASTER_EGGS Array

**Option A: Using a file in your repository (Recommended)**
1. Place your image in the `public/images/` folder (e.g., `public/images/memory.jpg`)
2. Reference it with a path starting with `/`:

```typescript
{
  id: 'custom-image',
  triggers: ['our photo', 'remember this', 'special moment'],
  type: 'image',
  title: '📸 A Special Memory',
  content: '/images/memory.jpg', // Path relative to public folder
  delay: 500,
}
```

**Option B: Using a data URL**
```typescript
{
  id: 'custom-image',
  triggers: ['our photo', 'remember this', 'special moment'],
  type: 'image',
  title: '📸 A Special Memory',
  content: 'data:image/png;base64,iVBORw0KGgoAAAANS...', // Paste your data URL here
  delay: 500,
}
```

**Option C: Using an external URL**
```typescript
{
  id: 'custom-image',
  triggers: ['our photo', 'remember this', 'special moment'],
  type: 'image',
  title: '📸 A Special Memory',
  content: 'https://example.com/path/to/image.jpg', // External URL
  delay: 500,
}
```

### Adding Random Easter Eggs

Random easter eggs don't need triggers - they appear automatically based on message count:

```typescript
const RANDOM_EASTER_EGGS: EasterEgg[] = [
  // Existing random easter eggs...
  
  // New random message easter egg
  {
    id: 'random-quote-1',
    type: 'message',
    title: '💫',
    content: 'Your relationship is unique and beautiful in its own way!',
    isRandom: true,
    delay: 800,
  },
  
  // New random image easter egg
  {
    id: 'random-image-1',
    type: 'image',
    title: '🎨',
    content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...', // Your image data URL
    isRandom: true,
    delay: 800,
  },
];
```

**Important**: Random easter eggs must have `isRandom: true` and should NOT have a `triggers` property.

### Example: Complete Easter Egg Configuration

```typescript
// Keyword-based easter eggs
const EASTER_EGGS: EasterEgg[] = [
  // Existing easter eggs...
  
  // New message easter egg
  {
    id: 'good-morning',
    triggers: ['good morning', 'morning emma', 'wake up'],
    type: 'message',
    title: '☀️',
    content: 'Good morning! I hope you have a wonderful day filled with love and happiness! ☀️',
    delay: 300,
  },
  
  // New image easter egg
  {
    id: 'special-photo',
    triggers: ['our memory', 'that photo', 'remember that'],
    type: 'image',
    title: '📷',
    content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...', // Your image data URL
    delay: 500,
  },
];

// Random easter eggs (appear every few messages)
const RANDOM_EASTER_EGGS: EasterEgg[] = [
  {
    id: 'random-motivation',
    type: 'message',
    title: '💪',
    content: 'Keep going! Every step forward in your relationship is progress!',
    isRandom: true,
    delay: 800,
  },
];
```

## Tips

### Keyword-Based Easter Eggs
1. **Trigger Keywords**: Make them specific but not too common. You don't want easter eggs to trigger on every message!
2. **Case Insensitive**: All triggers are checked case-insensitively, so "I Love You" will match "i love you"
3. **Delay**: Use delay to make the easter egg appear after the message is sent (gives a nice surprise effect)
4. **Image Size**: Keep images under 2MB for best performance. Larger images may cause slow loading.
5. **Uniqueness**: Each easter egg should have a unique `id`

### Random Easter Eggs
1. **No Triggers Needed**: Random easter eggs don't need triggers - they appear based on message count
2. **Frequency Control**: Adjust `RANDOM_EGG_FREQUENCY` (default: 3) to change how often they check
3. **Probability Control**: Adjust `RANDOM_EGG_PROBABILITY` (default: 0.4) to make them more/less frequent
4. **Keep It Varied**: Add multiple random easter eggs so users see different ones each time
5. **Encouragement Focus**: Random easter eggs work great for general encouragement and motivation
6. **Set isRandom: true**: Always include `isRandom: true` for random easter eggs

## Troubleshooting

- **Easter egg not appearing**: Check that your trigger keywords are spelled correctly and match what the user types
- **Image not loading**: Verify your data URL is complete and starts with `data:image/...`
- **Multiple easter eggs**: If multiple triggers match, only the first one found will be displayed

Enjoy adding your personal touches to make the chatbot even more special! 💕

