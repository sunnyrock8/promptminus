import openai

# Set up your OpenAI API key
openai.api_key = ''  # Replace with your actual API key


def get_gpt_response(simplified_code):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": simplified_code}
        ]
    )
    return response["choices"][0]["message"]["content"]
