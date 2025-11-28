window.GPT = {
  generateText: (prompt, image, callback) => {
    let input;
    if (image && image.indexOf('data') > -1) {
      input = [{
        role: "user",
        content: [
          {type: "text", text: prompt},
          {type: "image_url", image_url: {url: image}}
        ]
      }];
    } else {
      input = [{
        role: "user",
        content: prompt
      }];
    }
    
    let ajax = $.ajax({
      url: '/api/chat.php',
      type: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: input,
        max_tokens: 2000
      })
    });

    ajax.done((data) => {
      const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      callback(text);
    });

    ajax.fail((xhr) => {
      console.error(xhr);
      callback(false);
    });
  },

  generateImage: (prompt, callback) => {
    let ajax = $.ajax({
      url: '/api/image.php',
      type: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1024x1024',
        response_format: 'b64_json'
      })
    });

    ajax.done((data) => {
      const img = data && data.data && data.data[0];
      
      if (img && img.b64_json) {
        callback(img.b64_json);
      } else {
        callback(false);
      }
    });

    ajax.fail((xhr) => {
      console.error(xhr);
      callback(false);
    });
  }
}