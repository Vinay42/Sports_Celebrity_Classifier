# Celebrity Face Recognition

A full-stack machine learning project that classifies a sports celebrity from an uploaded image.

The app detects faces, applies wavelet + raw image features, and predicts one of five classes.

## Live Website

- Live Demo: https://sports-celebrity-classifier.vercel.app/

## Supported Classes

- Lionel Messi
- Maria Sharapova
- Roger Federer
- Serena Williams
- Virat Kohli

## Tech Stack

- Frontend: React + Vite
- Backend API: Python + Flask
- ML/Computer Vision: OpenCV, PyWavelets, scikit-learn, NumPy
- Model artifacts: `server/artifacts/`

## Project Structure

```text
CelebrityFaceRecognition/
├── frontend/                  # React frontend (Vite)
├── server/                    # Flask inference API
├── model/                     # notebooks and training resources
├── images_dataset/            # raw training images
└── google_image_scrapping/    # image collection utilities

```

## How It Works

1. User uploads an image in the React UI.
2. Frontend converts image to base64 and sends it to Flask (`/classify_image`).
3. Backend detects faces and eyes with Haar cascades.
4. For each detected face, backend builds combined raw + wavelet features.
5. Trained scikit-learn model returns class probabilities.
6. UI displays predicted class and full probability breakdown.

## API Contract

- Endpoint: `POST /classify_image`
- Content type: `multipart/form-data`
- Field: `image_data` (base64 image string)
- Response: JSON array of prediction objects

Example response:

```json
[
	{
		"class": "virat_kohli",
		"class_probability": [1.05, 12.67, 22.0, 4.5, 91.56],
		"class_dictionary": {
			"lionel_messi": 0,
			"maria_sharapova": 1,
			"roger_federer": 2,
			"serena_williams": 3,
			"virat_kohli": 4
		}
	}
]
```

## Setup and Run

### 1. Backend (Flask)

From project root:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install flask numpy opencv-python PyWavelets scikit-learn joblib
python server.py
```

### 2. Frontend (React)

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Frontend Environment Variables

`frontend/.env` contains:

```env
VITE_API_URL=
VITE_GITHUB_URL=
```

## Model/Training Resources

- Training notebooks: `model/data_cleaning.ipynb`, `model/sports_celebrity_classification.ipynb`
- Saved model used by backend: `server/artifacts/saved_model.pkl`
- Class mapping: `server/artifacts/class_dictionary.json`

## Notes

- Inference is currently designed for single dominant face images.
- Backend includes a fallback to use the largest detected face if eye detection is weak.
- Keep the Flask server running before using the frontend classifier.