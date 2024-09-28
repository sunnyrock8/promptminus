import os
import tiktoken
import spacy
import string

# Set your OpenAI API key securely (for testing only)
os.environ["OPENAI_API_KEY"] = "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"

# Initialize tiktoken encoding and spaCy NLP
enc = tiktoken.get_encoding("o200k_base")
enc = tiktoken.encoding_for_model("gpt-4o")
nlp = spacy.load('en_core_web_sm')

prompt = "As the late afternoon sun began its slow descent toward the horizon, the entire landscape seemed to come alive in a radiant display of light and shadow. The sky, once a brilliant blue, started to shift into a palette of warm, inviting colors—fiery oranges, deep purples, and soft pinks blending seamlessly as if painted by an artist’s hand. The golden light bathed the surrounding fields in a soft, ethereal glow, illuminating the rolling hills and casting long, exaggerated shadows across the ground. A gentle breeze meandered through the tall grass, causing it to sway rhythmically as though dancing to a melody only the wind could hear. In the distance, a small flock of birds soared effortlessly across the sky, their silhouettes dark against the brightening colors of the setting sun. Every now and then, a bird’s song could be heard, mingling with the quiet rustle of the leaves, the distant hum of insects, and the occasional creak of branches as they swayed gently in the breeze. Along a narrow, winding path that cut through the meadow, a few wildflowers stubbornly stood tall, their delicate petals fluttering gently in the wind as if reaching for the last remnants of daylight. The sweet fragrance of lavender and jasmine filled the air, carried by the breeze in soft, fragrant waves, giving the evening an almost dreamlike quality. As the sun continued its descent, the sky shifted once again, this time to darker hues, with hints of twilight beginning to emerge, the first stars faintly twinkling in the distance. The world seemed to hold its breath in anticipation of the approaching night, with every leaf, every blade of grass, every bird and creature falling into a peaceful stillness. The moment stretched on, timeless and perfect, as if the very earth itself had slowed, savoring the last golden rays of the day before surrendering to the cool embrace of the night. The calm, tranquil atmosphere was broken only by the occasional distant call of an owl, heralding the beginning of the nocturnal symphony that would soon fill the air. The day, in its final moments, seemed to exude a deep sense of peace, as though nature itself was pausing to reflect on the simple beauty of existence before allowing the night to fully settle in."

# Encode the text to get the tokens
tokens = enc.encode(prompt)
num_tokens = len(tokens)
orig_num_tokens = num_tokens

def lemmatize_text(prompt):
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
  return new_prompt_str


#simplified_code = lemmatize_text(prompt)



