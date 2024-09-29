import os
import tiktoken
import spacy
import string
from flask import Flask, request
from flask_cors import CORS 
import time 
# from backend_services import add_prompt_plus_to_db
# from backend_services import add_original_prompt_to_db

from text import lemmatize_text
from code_compressor_v1 import shorten_code

# Initialize tiktoken encoding and spaCy NLP
enc = tiktoken.get_encoding("o200k_base")
enc = tiktoken.encoding_for_model("gpt-4o")
nlp = spacy.load('en_core_web_sm')

app = Flask(__name__)
CORS(app, resources={r"/receive_event": {"origins": "https://chatgpt.com"}})

counter = 0

# Function to write content to a file
def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)

# Function to calculate token usage and reduction percentage
def calculate_token_reduction(original, simplified):
    orig_tokens = enc.encode(original)
    new_tokens = enc.encode(simplified)
    orig_token_count = len(orig_tokens)
    new_token_count = len(new_tokens)
    print(f"Original token count: {orig_token_count}")
    print(f"Simplified token count: {new_token_count}")
    reduction = (orig_token_count - new_token_count) / orig_token_count * 100
    print(f"Percentage reduction in token count: {reduction:.2f}%")
    return reduction

# Function to detect text type (code vs plain text) and process it accordingly
import re

def detect_text_type(prompt):
    global counter  # Ensure we modify the counter globally
    doc = nlp(prompt)
    
    # Initialize flags and counters for detection
    code_like = False
    code_keyword_count = 0  # Counter for code keywords
    
    # 1. Special symbols and frequent punctuation
    special_symbols = re.findall(r'[{}()\[\]=+*/%<>!&|;]', prompt)
    if len(special_symbols) > 5:  # Threshold for frequent symbols, adjust as needed
        code_like = True

    # 2. Keywords often found in code
    code_keywords = {'def', 'class', 'return', 'import', 'if', 'else', 'for', 'while', 'try', 'except'}
    for token in doc:
        if token.text in code_keywords:
            code_keyword_count += 1  # Increment counter when a code keyword is found
    
    # Set a threshold for the keyword count (e.g., if 3 or more code-related keywords are found)
    if code_keyword_count >= 15:
        code_like = True

    # 3. Variable names in snake_case or camelCase
    variable_pattern = re.findall(r'[a-z]+(_[a-z]+)+|[a-z]+([A-Z][a-z]+)+', prompt)
    if variable_pattern:
        code_like = True

    # 4. Numeric constants combined with symbols (e.g., 5 + 3)
    numeric_pattern = re.findall(r'\d+[\+\-\*/]\d+', prompt)
    if numeric_pattern:
        code_like = True
    
    # 5. Function-like patterns with parentheses and commas (e.g., func(x, y))
    function_pattern = re.findall(r'\w+\s?\(.*?\)', prompt)
    if function_pattern:
        code_like = True

    # 6. Lack of typical sentence structures (low noun/verb count, short tokens)
    pos_counts = {'NOUN': 0, 'VERB': 0}
    for token in doc:
        if token.pos_ in pos_counts:
            pos_counts[token.pos_] += 1
    # If there are very few nouns and verbs, likely to be code
    if pos_counts['NOUN'] < 3 and pos_counts['VERB'] < 3:
        code_like = True
    
    # Log and print the results of keyword counting
    print(f"Code keyword count: {code_keyword_count}")
    
    # Decision based on the heuristics above
    if code_like:
        print("Code/Math detected")
        # Simplify the code using the shorten_code function
        simplified_code = shorten_code(prompt)
    else:
        print("Plain text detected")
        # Lemmatize the text using the lemmatize_text function
        simplified_code = lemmatize_text(prompt)
    
    # Increment the counter
    counter += 1
    
    # (Optional) Uncomment to store the data in the database
    # add_original_prompt_to_db(prompt, counter)
    # add_prompt_plus_to_db(simplified_code, counter)
    
    # Write the simplified version to a file
    output_file = f"simplified_output_{counter}.txt"
    write_to_file(output_file, simplified_code)
    
    # Calculate token reduction
    calculate_token_reduction(prompt, simplified_code)
    
    return simplified_code



# Flask route to receive data from POST requests
@app.route('/receive_event', methods=['POST'])
def receive_event():
    # Get data from the request
    data = request.data.decode('utf-8')  # Read the raw data as a string
    print(f"Received data: {data}")  # Print the received string to the console
    
    # Process the text using detect_text_type
    result = detect_text_type(data)
    
    # Respond with the simplified result
    print('Processing and returning result successfully')  # Log success
    return result  # Return the processed result as a response
    
if __name__ == '__main__':
    app.run(debug=True)

