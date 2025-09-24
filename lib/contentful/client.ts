
import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  // Optimize for faster responses
  timeout: 10000, // 10 second timeout
  retryOnError: true,
  logHandler: (level, data) => {
    if (level === 'error') {
      console.error('Contentful error:', data);
    }
  }
});
