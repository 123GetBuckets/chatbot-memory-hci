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

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: req.body.query,
    });

    console.log(response.data.choices[0].text)

    res.status(200).json({text: `${response.data.choices[0].text.trim()}`})
}