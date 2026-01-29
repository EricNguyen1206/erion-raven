const fs = require('fs');
const https = require('https');

const OLLAMA_API_URL = 'https://ollama.com/api/chat';
const MODEL = 'qwen:32b';

async function callOllamaAPI(messages) {
  const apiKey = process.env.OLLAMA_API_KEY;
  
  if (!apiKey) {
    throw new Error('OLLAMA_API_KEY environment variable is not set');
  }

  const requestBody = JSON.stringify({
    model: MODEL,
    messages: messages,
    stream: false
  });

  return new Promise((resolve, reject) => {
    const url = new URL(OLLAMA_API_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.message && parsed.message.content) {
            resolve(parsed.message.content);
          } else if (parsed.error) {
            reject(new Error(`Ollama API error: ${parsed.error}`));
          } else {
            resolve(data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(requestBody);
    req.end();
  });
}

async function main() {
  try {
    // Read the PR diff
    const diff = fs.readFileSync('pr_diff.txt', 'utf8');
    
    if (!diff.trim()) {
      console.log('## 🔍 AI Code Review\n\n_No changes detected in this PR._');
      return;
    }

    const prTitle = process.env.PR_TITLE || 'Untitled PR';
    const prBody = process.env.PR_BODY || '';

    // Truncate diff if too long (Ollama has context limits)
    const maxDiffLength = 15000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... [diff truncated due to size]'
      : diff;

    const systemPrompt = `You are an expert code reviewer. Review the following Pull Request changes and provide constructive feedback.

Focus on:
1. **Code Quality**: Clean code, readability, maintainability
2. **Potential Bugs**: Logic errors, edge cases, null checks
3. **Security**: Potential security vulnerabilities
4. **Performance**: Inefficient algorithms or patterns
5. **Best Practices**: TypeScript/JavaScript conventions

Format your response in markdown with clear sections. Be concise but thorough.
If the code looks good, acknowledge it briefly.
Always be constructive and helpful.`;

    const userPrompt = `## Pull Request: ${prTitle}

${prBody ? `### Description:\n${prBody}\n\n` : ''}### Code Changes:
\`\`\`diff
${truncatedDiff}
\`\`\`

Please review these changes and provide feedback.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const review = await callOllamaAPI(messages);
    
    // Format output
    const output = `## 🤖 AI Code Review

> Powered by Ollama Cloud (${MODEL})

${review}

---
_This is an automated review. Please use your judgment when applying suggestions._`;

    console.log(output);
    
  } catch (error) {
    console.log(`## ⚠️ AI Code Review

Unable to complete automated review.

**Error:** ${error.message}

_Please review the PR manually._`);
    process.exit(1);
  }
}

main();
