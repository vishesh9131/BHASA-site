// Add this to your chat message rendering to show command effect
{message.role === 'user' && message.content.includes('Hindi translation request:') && (
  <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs mb-2">
    Translation requested
  </div>
)} 