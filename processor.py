import os
import tiktoken
import spacy
import string

from flask import Flask, request
from flask_cors import CORS 

import time 
from backend_services import add_prompt_plus_to_db
from backend_services import add_original_prompt_to_db


from text import lemmatize_text
from code_compressor_v1 import shorten_code

def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)

# Initialize tiktoken encoding and spaCy NLP
enc = tiktoken.get_encoding("o200k_base")
enc = tiktoken.encoding_for_model("gpt-4o")
nlp = spacy.load('en_core_web_sm')
#prompt = "As the late afternoon sun began its slow descent toward the horizon, the entire landscape seemed to come alive in a radiant display of light and shadow. The sky, once a brilliant blue, started to shift into a palette of warm, inviting colors—fiery oranges, deep purples, and soft pinks blending seamlessly as if painted by an artist’s hand. The golden light bathed the surrounding fields in a soft, ethereal glow, illuminating the rolling hills and casting long, exaggerated shadows across the ground. A gentle breeze meandered through the tall grass, causing it to sway rhythmically as though dancing to a melody only the wind could hear. In the distance, a small flock of birds soared effortlessly across the sky, their silhouettes dark against the brightening colors of the setting sun. Every now and then, a bird’s song could be heard, mingling with the quiet rustle of the leaves, the distant hum of insects, and the occasional creak of branches as they swayed gently in the breeze. Along a narrow, winding path that cut through the meadow, a few wildflowers stubbornly stood tall, their delicate petals fluttering gently in the wind as if reaching for the last remnants of daylight. The sweet fragrance of lavender and jasmine filled the air, carried by the breeze in soft, fragrant waves, giving the evening an almost dreamlike quality. As the sun continued its descent, the sky shifted once again, this time to darker hues, with hints of twilight beginning to emerge, the first stars faintly twinkling in the distance. The world seemed to hold its breath in anticipation of the approaching night, with every leaf, every blade of grass, every bird and creature falling into a peaceful stillness. The moment stretched on, timeless and perfect, as if the very earth itself had slowed, savoring the last golden rays of the day before surrendering to the cool embrace of the night. The calm, tranquil atmosphere was broken only by the occasional distant call of an owl, heralding the beginning of the nocturnal symphony that would soon fill the air. The day, in its final moments, seemed to exude a deep sense of peace, as though nature itself was pausing to reflect on the simple beauty of existence before allowing the night to fully settle in."

app = Flask(__name__)
CORS(app, resources={r"/receive_event": {"origins": "https://chatgpt.com"}})

def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)


#firebase update 
#add_prompt_to_db(prompt, counter)

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

def detect_text_type(prompt):
  counter = 9
  add_original_prompt_to_db(prompt, counter)
  doc = nlp(prompt)
  # Check for token patterns typically found in code or math
  code_like = any(token.pos_ in {'SYM'} for token in doc)
  if code_like:
      print("Code/Math")
      # Simplify the code
      simplified_code = shorten_code(prompt)
      add_prompt_plus_to_db(simplified_code, counter)
      counter += 1
  #Otherwise, classify it as plain text
  else:
      print("plain text")
      simplified_code = lemmatize_text(prompt)
      add_prompt_plus_to_db(simplified_code, counter)
      counter+=1
  output_file = "simplified_code_ANYAVERSION.txt"
  write_to_file(output_file, simplified_code)
  # # Token usage and reduction calculation
  calculate_token_reduction(prompt, simplified_code)
  return simplified_code


#fetch the data from the extension and pass to algorithm  

@app.route('/receive_event', methods=['POST'])
def receive_event():
    #get data from the content.js file 
    data = request.data.decode('utf-8')  # Read the raw data as a string
    print(f"Received data: {data}")  # Print the received string to the console
    #now we have the required data from the chrome input 
    #detect_text_type(data)
    print('Received successfully')  # Send a plain text response back
    return detect_text_type(data)
    
if __name__ == '__main__':
    app.run(debug=True)

