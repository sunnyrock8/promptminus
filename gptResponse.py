import openai

# Set up your OpenAI API key
openai.api_key = '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'  # Replace with your actual API key

def get_gpt_response(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-4",  # You can change to "gpt-3.5-turbo" if needed
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=150,
        temperature=0.7,
    )
    
    return response['choices'][0]['message']['content']

if __name__ == "__main__":
    # Continuously get input from the user and provide GPT output
    print("Welcome to the GPT interaction! (type 'exit' to quit)")
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break
        
        gpt_output = get_gpt_response(user_input)
        print(f"GPT: {gpt_output}\n")
