const { Configuration, OpenAIApi } = require("openai");

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {

<<<<<<< HEAD:app/api/openai.js
  console.log('__________________________________-')
  console.log(req.body.query)
  console.log('__________________________________-')

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messageList,
  });

  console.log(response.data.choices[0].text)

  res.status(200).json({ text: `${response.data.choices[0].text.trim()}` })
}
=======
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: req.body.query,
    });

    const response = completion.data.choices[0].message;

    res.status(200).json({text: `${response}`})
}
>>>>>>> fb47b589ce24764be7fe6bbbef312f1e1c16e9ed:pages/api/openai.js
