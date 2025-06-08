# Rich Text Editor

A modern, feature-rich text editor component for React applications. Built with TypeScript and Tailwind CSS, this editor is perfect for content management systems, email templates, and document editing applications.

## Features

### ✨ Core Features
- **Complete Text Formatting**: Bold, italic, underline, strikethrough
- **Headings**: H1-H6 support with easy dropdown selection
- **Lists**: Bullet points and numbered lists
- **Text Alignment**: Left, center, right, and justify
- **Colors**: Text and background color pickers with preset colors
- **Links**: Easy link insertion and management
- **Images**: Upload, paste, and resize images with drag handles
- **Tables**: Full table creation and editing with row/column management
- **Code Blocks**: Syntax highlighting for code snippets
- **Blockquotes**: Beautiful quote formatting
- **Horizontal Rules**: Visual content separation

### 🎯 Advanced Features
- **HTML Source Mode**: Toggle between WYSIWYG and HTML editing
- **Active State Management**: Toolbar buttons reflect current selection
- **Image Resizing**: Click and drag to resize images
- **Clean HTML Output**: Sanitized, semantic markup
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark Mode Support**: Automatic theme detection
- **Undo/Redo**: Full history management
- **Paste Handling**: Smart paste for text and images

## Installation

\`\`\`bash
npm install @tolipovjs/rich-text
# or
yarn add @tolipovjs/rich-text
\`\`\`

## Quick Start

\`\`\`tsx
import React, { useState } from 'react';
import { RichTextEditor } from '@tolipovjs/rich-text';

function MyComponent() {
  const [content, setContent] = useState('<p>Hello world!</p>');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The HTML content of the editor |
| `onChange` | `(html: string) => void` | - | Callback fired when content changes |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the editor is disabled |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme preference |

## Styling

The editor uses Tailwind CSS classes and includes built-in dark mode support. Make sure your project has Tailwind CSS configured.

### Custom Styling

You can override the default styles by targeting the editor classes:

\`\`\`css
.rich-text-editor {
  /* Custom editor styles */
}

.rich-text-editor .toolbar {
  /* Custom toolbar styles */
}
\`\`\`

## Advanced Usage

### Image Upload Handling

By default, images are converted to base64. For production use, you'll want to handle uploads to your server:

\`\`\`tsx
// Custom image handler (extend ImageHandler component)
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  return url;
};
\`\`\`

### Content Sanitization

The editor automatically sanitizes HTML output, but you can customize the sanitization:

\`\`\`tsx
import { HTMLSanitizer } from '@tolipovjs/rich-text';

const customSanitize = (html: string) => {
  return HTMLSanitizer.sanitize(html);
};
\`\`\`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Your Name]

## Roadmap

- [ ] Plugin system for custom tools
- [ ] Collaborative editing support
- [ ] More table editing features
- [ ] Custom emoji picker
- [ ] Math equation support
- [ ] Export to PDF/Word
