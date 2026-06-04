from flask import Flask, request, jsonify
import util
import os
from dotenv import load_dotenv

print("Loading saved artifacts...")
util.load_saved_artifacts()

load_dotenv()
allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
app.config['MAX_FORM_MEMORY_SIZE'] = 20 * 1024 * 1024


def add_cors_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        response.headers.add("Access-Control-Allow-Origin", origin)
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


@app.after_request
def after_request(response):
    return add_cors_headers(response)


@app.route('/', methods=['GET'])
def index():
    # simple sanity page so visiting the backend URL shows it's running
    return "<html><body><h2>Server is running.</h2></body></html>", 200


@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    image_data = request.form['image_data']

    response = jsonify(util.classify_image(image_data))
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Sports Celebrity Image Classification")
    app.run(host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", 5000)))