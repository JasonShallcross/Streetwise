window.GPT = {
  bearer: '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',

  generateText: (prompt, image, callback) => {
    let inut;
    if (image.indexOf('data') > -1) {
      input = [{
        role: "user",
        content: [
          {type: "input_text", text: prompt},
          {type: "input_image", image_url: image}
        ]
      }];
    } else {
      input = prompt;
    }

    let ajax = $.ajax({
      url: 'https://api.openai.com/v1/responses',
      type: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GPT.bearer,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: input,
      })
    });

    ajax.done((data) => {
      const text = data && data.output && data.output[0].content[0].text;

      callback(text);
    });

    ajax.error((xhr) => {
        console(xhr);
        callback(false);
    });
  },

  generateImage: (prompt, callback) => {
    let ajax = $.ajax({
      url: 'https://api.openai.com/v1/images/generations',
      type: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GPT.bearer,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024',
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

    ajax.error((xhr) => {
        console(xhr);
        callback(false);
    });
  }
}
