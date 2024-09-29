
import firebase_admin
from firebase_admin import db, credentials
import uuid
 
cred = credentials.Certificate("fb_credentials.json")
firebase_admin.initialize_app(cred, {"databaseURL": "https://prompt-plus-580e5-default-rtdb.firebaseio.com/"})

ref = db.reference('/')
#print(ref.get())

def add_prompt_plus_to_db(prompt):
    ref = db.reference('/plus')
    unique_id = uuid.uuid4().hex + ""
    print(unique_id)
    ref.update({
    'prompt plus'+" "+unique_id: prompt
    })

def add_original_prompt_to_db(prompt):
    ref = db.reference('/original')
    unique_id = uuid.uuid4().hex + ""
    ref.update({
    'original prompt'+" "+ unique_id: prompt
    })


add_prompt_plus_to_db("random")

# def add_original_prompt_to_db(prompt, counter):
#     ref = db.reference('/original')
#     ref.update({
#     'original prompt'+" "+ str(counter): prompt
#     })

def add_gpt_to_db(gpt):
    ref = db.reference('/gptresponse')
    unique_id = uuid.uuid4().hex + ""
    ref.update({
    'gpt '+" "+ unique_id: gpt
    })

def get_prompt_plus_arr_from_db():
    ref = db.reference('/plus')
    arr = ref.get()
    print("the returned prompt values are", arr)
    return arr

# def get_prompt_plus_from_db(prompt, counter):
#     ref = db.reference('/')
#     ref.get({
#     'original prompt'+" "+ str(counter): prompt
#     })


# testing 
# add_original_prompt_to_db("sample og prompt", 1) 