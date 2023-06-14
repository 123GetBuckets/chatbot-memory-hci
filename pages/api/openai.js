const { Configuration, OpenAIApi } = require("openai");

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {

    console.log('__________________________________-')
    console.log(req.body.query)
    console.log('__________________________________-')

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: req.body.query,
    });

    const response = completion.data.choices[0].message;

    console.log('__________________________________-')
    console.log(response)
    console.log('__________________________________-')

    res.status(200).json({content: `${response.content}`})
}
