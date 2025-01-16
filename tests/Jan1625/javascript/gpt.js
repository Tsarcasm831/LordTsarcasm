async function call4oMini() {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_OPENAI_API_KEY` // replace with your actual API key
        },
        body: JSON.stringify({
          model: "4o-mini", 
          messages: [
            { role: "user", content: "Hello, 4o-mini! How can I make an API call to you?" }
          ],
          max_tokens: 100,
          temperature: 0.7,
        })
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("4o-mini response:", data);
    } catch (error) {
      console.error("Error calling 4o-mini model:", error);
    }
  }
  
  // Call the function
  call4oMini();
  