
import firebase_admin
from firebase_admin import db, credentials
import datetime
 
cred = credentials.Certificate("fb_credentials.json")
firebase_admin.initialize_app(cred, {"databaseURL": "https://prompt-plus-580e5-default-rtdb.firebaseio.com/"})

ref = db.reference('/')
print(ref.get())

expiration_timestamp = datetime.datetime.now() + datetime.timedelta(hours=0)

def add_prompt_plus_to_db(prompt, counter):
    ref = db.reference('/plus')
    ref.update({
    'prompt plus'+" "+ str(counter): prompt
    })

def add_original_prompt_to_db(prompt, counter):
    ref = db.reference('/original')
    ref.update({
    'original prompt'+" "+ str(counter): prompt, 
    'expirationTimestamp': expiration_timestamp.timestamp() * 1000
    })

# testing 
# add_original_prompt_to_db("sample og prompt", 1) 