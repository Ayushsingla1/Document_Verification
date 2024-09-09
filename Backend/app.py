from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import pytesseract
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from PIL import Image
from deepface import DeepFace  
import tempfile
import base64
import json
from flask import Flask, request, jsonify
from web3 import Web3
import hashlib
from pymongo import MongoClient
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

form_recognizer_endpoint = os.getenv('RECOGNIZER_ENDPOINT')
form_recognizer_key = os.getenv('RECOGNIZER_KEY')
document_analysis_client = DocumentAnalysisClient(
    endpoint=form_recognizer_endpoint,
    credential=AzureKeyCredential(form_recognizer_key)
)

keys_of_interest = ["NAME OF STUDENT", "Father Name", "Aadhaar No", "ROLL NO.", "Date of Birth", "Gender", "Pan No"]
sp_extracted_entities = {key: None for key in keys_of_interest}

def extract_text_student_profile(sp_image_path):
    with open(sp_image_path, "rb") as document:
        poller = document_analysis_client.begin_analyze_document("prebuilt-document", document)
        result = poller.result()
        extracted_data = {}
        fields_of_interest = ["NAME OF STUDENT", "Father Name", "Aadhaar No", "ROLL NO.", "Date of Birth", "Gender", "Pan No", "Name of"]
        for kv_pair in result.key_value_pairs:
            if kv_pair.key and kv_pair.value:
                key = kv_pair.key.content.lower()
                value = kv_pair.value.content
                for field in fields_of_interest:
                    if field.lower() in key.lower():
                        extracted_data[field] = value
                        break
        if 'NAME OF STUDENT' not in extracted_data or not extracted_data['NAME OF STUDENT']:
            extracted_data['NAME OF STUDENT'] = extracted_data.get('Name of', '')

        return extracted_data

@app.route('/extract_profile', methods=['POST'])
def extract_profile():
    file = request.files.get('studentProfile')
    if not file:
        return jsonify({"error": "No image file provided"}), 400

    image_path = 'temp_image.jpg'
    file.save(image_path)
    extracted_data = extract_text_student_profile(image_path)
    os.remove(image_path)
    return jsonify(extracted_data)

def verify_aadhar_card(aad_path, student_profile):
    try:
        aad_text = pytesseract.image_to_string(Image.open(aad_path))
        dob_pattern = r'\b\d{2}[-/]\d{2}[-/]\d{4}\b'
        match = re.search(dob_pattern, aad_text)
        aad_dob = match.group() if match else ''
        
        student_profile['Date of Birth'] = re.sub(r'[^a-zA-Z0-9]', '', student_profile.get('Date of Birth', ''))
        aad_dob = re.sub(r'[^a-zA-Z0-9]', '', aad_dob)
        
        search_aad = aad_text.lower()
        search_name = student_profile.get('NAME OF STUDENT', '').lower()
        search_sex = student_profile.get('Gender', '').lower()

        name_ = search_name in search_aad
        sex_ = search_sex in search_aad
        dobb_ = aad_dob == student_profile.get('Date of Birth', '')

        if name_ and sex_ and dobb_:
            return "Name, date of birth and gender are verified from Aadhaar card"
        elif not name_ and sex_ and dobb_:
            return "Name is not matching, date of birth and gender are verified from Aadhaar card"
        elif not name_ and not sex_ and dobb_:
            return "Name and gender are not matching, date of birth is verified from Aadhaar card"
        elif not name_ and sex_ and not dobb_:
            return "Name and date of birth are not matching, gender is verified from Aadhaar card"
        elif name_ and not sex_ and not dobb_:
            return "Gender and date of birth are not matching, name is verified from Aadhaar card"
        elif name_ and not sex_ and dobb_:
            return "Gender is not matching, date of birth and name are verified from Aadhaar card"
        elif name_ and sex_ and not dobb_:
            return "Date of birth is not matching, gender and name are verified from Aadhaar card"
        else:
            return "Name, date of birth and gender are not matching from Aadhaar card"
    except Exception as e:
        print(f"Error verifying Aadhaar card: {e}")
        return "Error occurred during Aadhaar verification"

@app.route('/verify_aadhar', methods=['POST'])
def verify_aadhar():
    if 'aadharCard' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    if 'student_profile' not in request.form:
        return jsonify({"error": "No student profile data provided"}), 400

    file = request.files['aadharCard']
    
    try:
        # Parse the JSON string from form data
        student_profile = json.loads(request.form['student_profile'])
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in student_profile"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpeg') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        verify_status = verify_aadhar_card(temp_file_path, student_profile)
        
        os.remove(temp_file_path)

        return jsonify({'verify_status': verify_status})

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": "Error occurred during Aadhaar verification"}), 500

def verify_pan_card(pan_path, student_profile):
    try:
        pan_text = pytesseract.image_to_string(Image.open(pan_path))
        search_pan = pan_text.lower()
        search_name = student_profile.get('NAME OF STUDENT', '').lower()
        father_name = student_profile.get('Father Name', '')
        pan_number = student_profile.get('Pan No', '')

        name_ = search_name in search_pan
        father_name_ = father_name in pan_text
        pan_ = pan_number in pan_text

        if name_ and pan_ and father_name_:
            return "Name, father's name, and PAN card number are verified from PAN card"
        elif not name_ and pan_ and father_name_:
            return "Name is not matching, father's name and PAN card number are verified from PAN card"
        elif not name_ and not pan_ and father_name_:
            return "Name and PAN card number are not matching, father's name is verified from PAN card"
        elif not name_ and pan_ and not father_name_:
            return "Name and father's name are not matching, PAN card number is verified from PAN card"
        elif name_ and not pan_ and not father_name_:
            return "PAN card number and father's name are not matching, name is verified from PAN card"
        elif name_ and not pan_ and father_name_:
            return "PAN card number is not matching, father's name and name are verified from PAN card"
        elif name_ and pan_ and not father_name_:
            return "Father's name is not matching, PAN card number and name are verified from PAN card"
        else:
            return "Name, father's name, and PAN card number are not matching from PAN card"
    except Exception as e:
        print(f"Error verifying PAN card: {e}")
        return "Error occurred during PAN verification"

@app.route('/verify_pan', methods=['POST'])
def verify_pan():
    if 'panCard' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    if 'student_profile' not in request.form:
        return jsonify({"error": "No student profile data provided"}), 400

    file = request.files['panCard']
    
    try:
        student_profile = json.loads(request.form['student_profile'])
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in student_profile"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        verify_status = verify_pan_card(temp_file_path, student_profile)
        
        os.remove(temp_file_path)

        return jsonify({'verify_status': verify_status})

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": "Error occurred during PAN verification"}), 500


def marksheet12_verify(mark12_path, student_profile):
    mark12_text = pytesseract.image_to_string(Image.open(mark12_path))
    search_mark12 = mark12_text.lower()
    search_name = student_profile.get('NAME OF STUDENT', '').lower()
    father_name = student_profile.get('Father Name', '').lower()
    name_ = search_name in search_mark12
    father_ = father_name in mark12_text.lower()

    if name_ and father_:
        verify_status = "Name and father's name are matching from 12th marksheet"
    elif name_ and not father_:
        verify_status = "Name is matching, father's name is not matching from 12th marksheet"
    elif not name_ and father_:
        verify_status = "Name is not matching and father's name is matching from 12th marksheet"
    else:
        verify_status = "Name and father's name are not matching from 12th marksheet"

    return verify_status

@app.route('/verify_marksheet12', methods=['POST'])
def verify_marksheet12():
    try:
        student_profile = request.form.get('student_profile')
        if not student_profile:
            student_profile = request.json.get('student_profile')
        
        if not student_profile:
            return jsonify({"error": "No student profile data provided"}), 400
        
        try:
            student_profile = json.loads(student_profile) if isinstance(student_profile, str) else student_profile
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON in student_profile"}), 400

        if 'marksheet' in request.files:
            file = request.files['marksheet']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
        
        elif request.json and 'marksheet' in request.json:
            image_data = base64.b64decode(request.json['marksheet'])
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_data)
                temp_file_path = temp_file.name
        
        else:
            return jsonify({"error": "No marksheet data provided"}), 400

        verify_status = marksheet12_verify(temp_file_path, student_profile)
        
        os.remove(temp_file_path)

        return jsonify({'verify_status': verify_status})

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": f"Error occurred during marksheet verification: {str(e)}"}), 500


def compare_faces(profile_image_path, document_image_path):
    try:
        result = DeepFace.verify(profile_image_path, document_image_path)
        return result["verified"]
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False

@app.route('/compare_faces', methods=['POST'])
def compare_faces_route():
    file1 = request.files.get('profile_image')
    file2 = request.files.get('aadhaar_image')

    if not file1 or not file2:
        return jsonify({"error": "Both images must be provided"}), 400

    profile_image_path = 'temp_profile_image.jpg'
    aadhaar_image_path = 'temp_aadhaar_image.jpg'
    file1.save(profile_image_path)
    file2.save(aadhaar_image_path)
    
    are_faces_same = compare_faces(profile_image_path, aadhaar_image_path)
    os.remove(profile_image_path)
    os.remove(aadhaar_image_path)

    if are_faces_same:
        return jsonify({'comparison_status': True})
    else:
        return jsonify({'comparison_status': False})


def compare_pan_faces(profile_image_path, pan_image_path):
    try:
        result = DeepFace.verify(profile_image_path, pan_image_path)
        return result["verified"]
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False

@app.route('/compare_pan', methods=['POST'])
def compare_pan():
    file1 = request.files.get('profile_image')
    file2 = request.files.get('pan_image')

    if not file1 or not file2:
        return jsonify({"error": "Both images must be provided"}), 400

    profile_image_path = 'temp_profile_image.jpg'
    pan_image_path = 'temp_pan_image.jpg'
    file1.save(profile_image_path)
    file2.save(pan_image_path)

    are_faces_same = compare_pan_faces(profile_image_path, pan_image_path)
    os.remove(profile_image_path)
    os.remove(pan_image_path)

    if are_faces_same:
        return jsonify({'comparison_status': True})
    else:
        return jsonify({'comparison_status': False})


def compare_mark12_faces(profile_image_path, mark12_image_path):
    try:
        result = DeepFace.verify(profile_image_path, mark12_image_path)
        return result["verified"]
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False

@app.route('/compare_mark12', methods=['POST'])
def compare_mark12():
    file1 = request.files.get('profile_image')
    file2 = request.files.get('mark12_image')

    if not file1 or not file2:
        return jsonify({"error": "Both images must be provided"}), 400

    profile_image_path = 'temp_profile_image.jpg'
    mark12_image_path = 'temp_mark12_image.jpg'
    file1.save(profile_image_path)
    file2.save(mark12_image_path)

    are_faces_same = compare_mark12_faces(profile_image_path, mark12_image_path)
    os.remove(profile_image_path)
    os.remove(mark12_image_path)

    if are_faces_same:
        return jsonify({'comparison_status': True})
    else:
        return jsonify({'comparison_status': False})
    

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['Verfication'] 
contact_collection = db['Doc']

@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json()

    if not data or 'name' not in data or 'email' not in data or 'message' not in data:
        return jsonify({'message': 'Missing required fields'}), 400

    contact_id = contact_collection.insert_one({
        'name': data['name'],
        'email': data['email'],
        'message': data['message']
    }).inserted_id

    return jsonify({
        'message': 'Form submitted successfully',
        'contactId': str(contact_id)
    }), 200


WEB3_PROVIDER = os.getenv('WEB3_PROVIDER')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
CONTRACT_ABI = '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"hash","type":"string"}],"name":"HashUploaded","type":"event"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getHash","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_hash","type":"string"}],"name":"uploadHash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]'
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

def hash_data(data_to_hash):
    """Hashes the input data using SHA-256."""
    data_hash = hashlib.sha256(data_to_hash.encode()).hexdigest()
    return data_hash

def deploy_to_blockchain(dictionary_hash):
    """Deploys the hash to the blockchain."""
    try:
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        gas_price = int(w3.eth.gas_price * 1.1)  

        
        try:
            gas_limit = contract.functions.uploadHash(dictionary_hash).estimate_gas({'from': account.address})
        except Exception as e:
            print(f"Gas estimation failed: {e}, using default gas limit.")
            gas_limit = 2000000  

        transaction = contract.functions.uploadHash(dictionary_hash).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': gas_limit,
            'gasPrice': gas_price
        })

        signed_transaction = w3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)

        tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f'Transaction successful with hash: {tx_hash.hex()}')
        return dict(receipt)  

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return {'error': error_message}, 500

@app.route('/upload-hash', methods=['POST'])
def upload_hash():
    data = request.json
    try:
        model_output = data.get('model_output')
        if not model_output:
            return jsonify({'error': 'model_output is required'}), 400
        
       
        dictionary_hash = hash_data(json.dumps(model_output))
        receipt, status_code = deploy_to_blockchain(dictionary_hash)

    
        if 'error' in receipt:
            return jsonify(receipt), status_code
        
        return jsonify({'message': 'Hash uploaded successfully', 'receipt': receipt}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.getenv('PORT'), debug=True)
