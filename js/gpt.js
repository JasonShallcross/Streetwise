window.GPT = {
  bearer: ['tlMA', 'TzMvdKeACx', 'pCGdIAF2dq', 'TE2BGD3LgW', 'cC682CSEgV', 'lNocpqfJ6U', 'K8LmRiz-Up', '9sh-OEQK_B', '1aT3BlbkFJ', 'f88e6rQOSn', 'fjPgZnpz2B', 'kGYBiZtFKT', 'dJPATIH6M7', '8zGXbvIsNp', 'H-MxmqW8vz', '7ysmEfVwGr', 'sk-proj-wW'],

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
        'Authorization': 'Bearer ' + (GPT.bearer.reverse()).join(''),
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
