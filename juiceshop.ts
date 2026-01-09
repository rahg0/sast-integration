from flask import Flask, request, jsonify
import subprocess
import yaml
import hashlib
from django.http import HttpResponse
import sqlite3
import pickle
import xml.etree.ElementTree as ET
import tempfile

app = Flask(__name__)
app.config['SECRET_KEY'] = 'my-super-secret-and-very-long-key'
app.config['DB_CONN'] = 'postgres://admin:password123@localhost:5432/vulndb'

AWS_ACCESS_KEY_ID = "AKIA1A2B3C4D5E6F7G8H"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
GITHUB_TOKEN = "ghp_s4K8d3g9j1LpQ7vW2mN5cR6bA0fG1eZ3xY7i"
SLACK_TOKEN = "xoxp-915678901234-987654321098-1234567890123-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
PRIVATE_KEY = """
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0jBKnF3TfVSP+e9kZnhy4r/C0aYqG3g2T5dkls5tF3gB6gGg
B7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj
4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq
8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2Xw
Y3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBg
B6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7
D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f
5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6
n2XwY3gZ4X+c9gCAwEAAQKBgQC1cZQc8Z5f6bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6g
GgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0p
Yj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5b
Bq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2
XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9g
BgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gAoGBAN/3bBq8
vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3
gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBgB6
gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gAoGBAO3j8C7f5bBq
8vJ5k8Y6n2XwY3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2Xw
Y3gZ4X+c9gBgB6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9gBg
B6gGgB7g8pP7D0pYj4A7j8C7f5bBq8vJ5k8Y6n2XwY3gZ4X+c9g==
-----END RSA PRIVATE KEY-----
"""
STRIPE_API_KEY_B64 = "c2tfdGVzdF81MUhpb29NQ0c0aTIxU0h3OVVQRHY0d1VSa2dNQzhzN0hpZmhuZFlVc3Q2NTd2R1VTWnJ3ZFo1aGs2V1ZkMzk2bUNzR1ZtMDBRSVlNWVlZWQ=="
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

def insecure_md5(data):
    # Insecure MD5 hash usage
    return hashlib.md5(data.encode()).hexdigest()

@app.route('/')
def index():
    return 'Welcome to the intentionally vulnerable app!'

@app.route('/execute')
def execute():
    cmd = request.args.get('command')
    if not cmd:
        return 'No command provided', 400
    # Command injection vulnerability
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return jsonify({
        'command': cmd,
        'output': result.stdout,
        'error': result.stderr
    })

@app.route('/load_yaml', methods=['POST'])
def load_yaml():
    data = request.data.decode('utf-8')
    # Unsafe yaml.load usage
    loaded = yaml.load(data)
    return jsonify({'loaded': str(loaded)})

@app.route('/dangerous_django_view')
def dangerous_django_view(request):
    cmd = request.GET.get('cmd')
    if not cmd:
        return HttpResponse('No command provided', status=400)
    # Command injection vulnerability (Django)
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return HttpResponse(result.stdout)

@app.route('/sqli')
def sqli():
    user_id = request.args.get('id')
    # SQL Injection vulnerability
    conn = sqlite3.connect('example.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = '{user_id}'")
    user = cursor.fetchone()
    return jsonify({'user': user})

@app.route('/xxe', methods=['POST'])
def xxe():
    xml_data = request.data
    # XXE vulnerability
    tree = ET.fromstring(xml_data)
    return f"Parsed XML: {ET.tostring(tree)}"

@app.route('/pickle', methods=['POST'])
def insecure_deserialization():
    pickled_data = request.data
    # Insecure deserialization with pickle
    loaded_obj = pickle.loads(pickled_data)
    return f"Loaded object: {loaded_obj}"

@app.route('/eval')
def eval_vuln():
    code = request.args.get('code')
    # Use of eval() on user input
    result = eval(code)
    return f"Eval result: {result}"

def insecure_temp_file():
    # Insecure temporary file creation
    temp_path = tempfile.mktemp()
    with open(temp_path, 'w') as f:
        f.write("insecure temp file")
    return temp_path

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 
