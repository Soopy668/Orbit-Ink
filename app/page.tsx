const handleSend = async () => {
  // ... existing code ...
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Ensure you are sending "message" as a string
    body: JSON.stringify({ message: inputState }) 
  });

  const data = await response.json();
  
  if (response.ok) {
    // Make sure you use data.text or data.content (whatever we defined in the backend)
    setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
  } else {
    console.error("Error from API:", data.error);
  }
};
