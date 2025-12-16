interface EmotionState {
  vuln: number;
  conf: number;
  trust: number;
  adm: number;
  grief: number;
  hap: number;
  fear: number;
  cour: number;
}

interface SolaceLog {
  id: number;
  created_at: string;
  user_txt: string | null;
  ai_response: string | null;
  emotion_state: EmotionState;
  trust_score: number | null;
}

const emotionLabels: Record<keyof EmotionState, string> = {
  vuln: 'Vulnerability',
  conf: 'Confusion',
  trust: 'Trust',
  adm: 'Admiration',
  grief: 'Grief',
  hap: 'Happiness',
  fear: 'Fear',
  cour: 'Courage',
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateMarkdown = (
  title: string,
  logs: SolaceLog[],
  includeEmotions: boolean = true
): string => {
  const now = new Date();
  const exportDate = now.toISOString().split('T')[0];
  
  let markdown = `# ${title}\n\n`;
  markdown += `**Exported:** ${formatDate(now.toISOString())}\n\n`;
  markdown += `---\n\n`;
  markdown += `## Conversation\n\n`;

  logs.forEach((log, index) => {
    if (log.user_txt) {
      markdown += `**User** (${formatTime(log.created_at)})\n`;
      markdown += `> ${log.user_txt.replace(/\n/g, '\n> ')}\n\n`;
    }
    
    if (log.ai_response) {
      markdown += `**Solace** (${formatTime(log.created_at)})\n`;
      markdown += `${log.ai_response}\n\n`;
    }

    if (includeEmotions && log.emotion_state) {
      markdown += `📊 **Emotion State:**\n`;
      Object.entries(log.emotion_state).forEach(([key, value]) => {
        const label = emotionLabels[key as keyof EmotionState] || key;
        markdown += `- ${label}: ${(value as number).toFixed(3)}\n`;
      });
      markdown += `\n`;
      
      if (log.trust_score !== null) {
        markdown += `🎯 **Trust Score:** ${log.trust_score.toFixed(3)}\n\n`;
      }
    }

    if (index < logs.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
};

export const downloadMarkdown = (
  title: string,
  logs: SolaceLog[],
  includeEmotions: boolean = true
): void => {
  const markdown = generateMarkdown(title, logs, includeEmotions);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const filename = `${sanitizedTitle}-${date}.md`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
