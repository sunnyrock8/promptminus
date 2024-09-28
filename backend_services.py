
import firebase_admin
from firebase_admin import db, credentials
 
cred = credentials.Certificate("fb_credentials.json")
firebase_admin.initialize_app(cred, {"databaseURL": "https://prompt-plus-580e5-default-rtdb.firebaseio.com/"})

ref = db.reference('/')
print(ref.get())


def add_prompt_plus_to_db(prompt, counter):
    ref = db.reference('/plus')
    ref.set({
    'prompt plus'+" "+ str(counter): prompt
    })


def add_original_prompt_to_db(prompt, counter):
    ref = db.reference('/original')
    ref.set({
    'original prompt'+" "+ str(counter): prompt
    })

#testing
# add_original_prompt_to_db("sample og prompt", 1)