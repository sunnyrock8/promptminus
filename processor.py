import tiktoken
import spacy

enc = tiktoken.get_encoding("o200k_base")

# To get the tokeniser corresponding to a specific model in the OpenAI API:
enc = tiktoken.encoding_for_model("gpt-4o")

prompt = input()
print("original prompt: " + prompt)

# Encode the text to get the tokens
tokens = enc.encode(prompt)

num_tokens = len(tokens)

print(f"number of tokens used by original prompt: {num_tokens}")

# Load the English language model in spaCy 
nlp = spacy.load('en_core_web_sm') 

stop_words = nlp.Defaults.stop_words

#pre processing 
text=""
for word in prompt.split(): 
  if word in stop_words: 
    continue 
  text += " "+ word 

# Create a Doc object
doc = nlp(text) 

new_prompt = ""

# Lemmatize each token 
for token in doc: 
  #print(token)
  lemma = token.lemma_ 
  #print(token.text, "-->", lemma)
  new_prompt += lemma + " "


tokens = enc.encode(new_prompt)
num_tokens = len(tokens)

print(new_prompt)

print(f"number of tokens used by new prompt: {num_tokens}")