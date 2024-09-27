import tiktoken
import spacy
import string

enc = tiktoken.get_encoding("o200k_base")

# To get the tokeniser corresponding to a specific model in the OpenAI API:
enc = tiktoken.encoding_for_model("gpt-4o")

prompt = input()
#print("original prompt: " + prompt)

# Encode the text to get the tokens
tokens = enc.encode(prompt)
num_tokens = len(tokens)
orig_num_tokens = num_tokens

print(f"number of tokens used by original prompt: {num_tokens}")

# Load the English language model in spaCy 
nlp = spacy.load('en_core_web_sm') 

stop_words = nlp.Defaults.stop_words

#pre processing 
text_arr = [] 
for word in prompt.split(): 
  if word in stop_words or word.strip() == '': 
    continue 
  word = word.translate(str.maketrans('', '', string.punctuation))
  text_arr.append(word)

prompt = ' '.join(text_arr)

# Create a Doc object
doc = nlp(prompt) 

new_prompt = []

# Lemmatize each token 
for token in doc: 
  lemma = token.lemma_ 
  new_prompt.append(lemma) 

new_prompt_str = ' '.join(new_prompt) 
tokens = enc.encode(new_prompt_str)
num_tokens = len(tokens)

#print(new_prompt_str)

new_num_tokens = num_tokens

print(f"number of tokens used by new prompt: {num_tokens}")

perc = (orig_num_tokens - new_num_tokens) / orig_num_tokens * 100

print(f"percentage reduction in number of tokens used: {perc}%")