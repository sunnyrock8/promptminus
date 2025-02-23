import os
import tiktoken
import spacy
import string
import re
import atexit
from flask import Flask, request, jsonify
from flask_cors import CORS 
import time 
from openai import OpenAI
import firebase_admin
from firebase_admin import credentials, db
import uuid

# Initialize tiktoken encoding and spaCy NLP
enc = tiktoken.encoding_for_model("gpt-4")
nlp = spacy.load('en_core_web_sm')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://chatgpt.com"}})

# Initialize OpenAI client
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key='API_KEY')

# Initialize Firebase
cred = credentials.Certificate("fb_credentials.json")
try:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://prompt-plus-ai-default-rtdb.firebaseio.com/'
    })
except ValueError as e:
    if "The default Firebase app already exists" in str(e):
        # Firebase app is already initialized, so we can continue
        pass
    else:
        # If it's a different error, re-raise it
        raise

# Flag to track if the database has been initialized
db_initialized = False

def initialize_db():
    """Initialize the database with empty fields."""
    root = db.reference()
    root.set({
        'plus': {},
        'original': {},
        'gptresponse': {}
    })
    print("Database initialized with empty fields.")

def flush_db():
    """Flush the database by removing all data."""
    root = db.reference()
    root.delete()
    print("Database flushed.")

# Register the flush_db function to be called when the server stops
atexit.register(flush_db)

@app.before_request
def before_request():
    """Initialize the database before the first request if not already initialized."""
    global db_initialized
    if not db_initialized:
        initialize_db()
        db_initialized = True

def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)

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

def is_code_like(prompt, doc):
    code_keyword_count = 0
    code_keywords = {'def', 'class', 'return', 'import', 'if', 'else', 'for', 'while', 'try', 'except'}
    
    if len(re.findall(r'[{}()\[\]=+*/%<>!&|;]', prompt)) > 5:
        return True

    for token in doc:
        if token.text in code_keywords:
            code_keyword_count += 1
    
    if code_keyword_count >= 15:
        return True

    if re.findall(r'[a-z]+(_[a-z]+)+|[a-z]+([A-Z][a-z]+)+', prompt):
        return True

    if re.findall(r'\d+[\+\-\*/]\d+', prompt):
        return True
    
    if re.findall(r'\w+\s?\(.*?\)', prompt):
        return True

    pos_counts = {'NOUN': 0, 'VERB': 0}
    for token in doc:
        if token.pos_ in pos_counts:
            pos_counts[token.pos_] += 1
    if pos_counts['NOUN'] < 2 and pos_counts['VERB'] < 1:
        return True

    return False

def detect_text_type(prompt):
    doc = nlp(prompt)
    
    #code_like = is_code_like(prompt, doc)
    code_like = any(token.pos_ in {'SYM'} for token in doc)
    
    print(f"Code-like: {code_like}")
    
    if code_like:
        print("Code/Math detected")
        simplified_text = shorten_code(prompt)
    else:
        print("Plain text detected")
        simplified_text = lemmatize_text(prompt)

    gpt_response = get_gpt_response(simplified_text)
    add_gpt_to_db(gpt_response)
    
    add_original_prompt_to_db(prompt)
    add_prompt_plus_to_db(simplified_text)
    
    output_file = f"simplified_output_{time.time()}.txt"
    write_to_file(output_file, simplified_text)
    
    calculate_token_reduction(prompt, simplified_text)
    
    return simplified_text

def get_gpt_response(simplified_code):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": simplified_code}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in GPT response: {e}")
        return "Error in processing GPT response"

def get_all_plus_and_gpt_responses():
    plus_ref = db.reference('/plus')
    gpt_ref = db.reference('/gptresponse')
    
    plus_data = plus_ref.get()
    gpt_data = gpt_ref.get()
    
    all_data = []
    if plus_data:
        all_data.extend(plus_data.values())
    if gpt_data:
        all_data.extend(gpt_data.values())
    print(" ".join(all_data))
    return " ".join(all_data)

def contextualize_with_gpt(text):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes and contextualizes information."},
                {"role": "user", "content": f"Please summarize and contextualize the following text, reducing it significantly in length: {text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in GPT contextualization: {e}")
        return "Error in processing GPT contextualization"

def add_prompt_plus_to_db(prompt):
    ref = db.reference('/plus')
    unique_id = uuid.uuid4().hex
    print(unique_id)
    ref.update({
        f'prompt plus {unique_id}': prompt
    })

def add_original_prompt_to_db(prompt):
    ref = db.reference('/original')
    unique_id = uuid.uuid4().hex
    ref.update({
        f'original prompt {unique_id}': prompt
    })

def add_gpt_to_db(gpt):
    ref = db.reference('/gptresponse')
    unique_id = uuid.uuid4().hex
    ref.update({
        f'gpt {unique_id}': gpt
    })

def lemmatize_text(text):
    doc = nlp(text)
    lemmatized_tokens = [token.lemma_ for token in doc if not token.is_punct and not token.is_space]
    lemmatized_text = ' '.join(lemmatized_tokens)
    return lemmatized_text

def shorten_code(code):
    # Remove comments
    code = re.sub(r'#.*', '', code)
    code = re.sub(r'"""[\s\S]*?"""', '', code)
    code = re.sub(r"'''[\s\S]*?'''", '', code)
    
    # Remove empty lines
    code = '\n'.join([line for line in code.split('\n') if line.strip() != ''])
    
    # Shorten variable names
    var_dict = {}
    var_counter = 0
    
    def shorten_var(match):
        nonlocal var_counter
        var = match.group(0)
        if var not in var_dict:
            var_dict[var] = f'v{var_counter}'
            var_counter += 1
        return var_dict[var]
    
    code = re.sub(r'\b[a-zA-Z_]\w*\b', shorten_var, code)
    
    return code

@app.route('/receive_event', methods=['POST'])
def receive_event():
    print(f"HAHAHHHHAAHAHHA DEBUG")
    try:
        data = request.data.decode('utf-8')
        print(f"Received data: {data}")
        
        result = detect_text_type(data)
        
        print('Processing and returning result successfully')
        return result
    except Exception as e:
        print(f"Error in receive_event: {e}")
        return "Error in processing request", 500


@app.route('/contextualize', methods=['POST'])
def contextualize():
    print("contextualize has started")
    try:
        all_data = get_all_plus_and_gpt_responses()
        contextualized_result = contextualize_with_gpt(all_data)
        
        # Print the result to the terminal
        print("\n--- Contextualized Result ---")
        print(contextualized_result)
        print("-----------------------------\n")
        
        return jsonify({
            'success': True,
            'result': contextualized_result
        }), 200
    except Exception as e:
        error_message = f"Error in contextualize: {str(e)}"
        print(error_message)
        return jsonify({
            'success': False,
            'error': error_message
        }), 500


if __name__ == '__main__':
    app.run(debug=True)