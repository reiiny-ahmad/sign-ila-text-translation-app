from __future__ import annotations

import base64
import os
import pickle
from pathlib import Path
from typing import Any

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_PATH = ROOT_DIR / "model_sign_language.p"
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))).resolve()

try:
    mp_hands = mp.solutions.hands
except AttributeError:
    mp_hands = None

app = FastAPI(title="ASL Inference API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hands = (
    mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    if mp_hands is not None
    else None
)

model: Any = None
scaler: Any = None


class PredictRequest(BaseModel):
    image: str


class PredictResponse(BaseModel):
    letter: str | None = None
    raw_label: str | None = None
    confidence: float | None = None
    error: str | None = None


def _load_model(model_path: Path) -> tuple[Any, Any]:
    with model_path.open("rb") as file:
        loaded = pickle.load(file)

    if isinstance(loaded, dict):
        loaded_model = loaded.get("model")
        loaded_scaler = loaded.get("scaler") or loaded.get("scalar")
    else:
        loaded_model = loaded
        loaded_scaler = None

    if loaded_model is None:
        raise RuntimeError("Le fichier modèle ne contient pas de clé 'model'.")

    return loaded_model, loaded_scaler


def _decode_image(image_payload: str) -> np.ndarray:
    if "," in image_payload:
        _, encoded = image_payload.split(",", 1)
    else:
        encoded = image_payload

    try:
        image_bytes = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Image base64 invalide.") from exc

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Impossible de décoder l'image.")
    return frame


def _extract_features(frame: np.ndarray) -> np.ndarray | None:
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if not results.multi_hand_landmarks:
        return None

    hand_landmarks = results.multi_hand_landmarks[0]
    x_coords = [landmark.x for landmark in hand_landmarks.landmark]
    y_coords = [landmark.y for landmark in hand_landmarks.landmark]
    min_x = min(x_coords)
    min_y = min(y_coords)

    features: list[float] = []
    for landmark in hand_landmarks.landmark:
        features.append(landmark.x - min_x)
        features.append(landmark.y - min_y)

    feature_vector = np.asarray(features, dtype=np.float32).reshape(1, -1)
    if feature_vector.shape[1] != 42:
        raise HTTPException(
            status_code=422,
            detail=f"Nombre de features invalide: {feature_vector.shape[1]} (attendu: 42).",
        )
    return feature_vector


def _to_letter(raw_label: Any) -> str:
    label = str(raw_label).strip()

    if len(label) == 1 and label.isalpha():
        return label.upper()

    if label.isdigit():
        idx = int(label)
        if 0 <= idx <= 25:
            return chr(ord("A") + idx)

    return label.upper()


@app.on_event("startup")
def startup_event() -> None:
    global model, scaler

    if hands is None:
        raise RuntimeError(
            "Unsupported mediapipe package: 'mp.solutions' is missing. "
            "Install a compatible version with: pip install mediapipe==0.10.14"
        )

    if not MODEL_PATH.exists():
        raise RuntimeError(f"Modèle introuvable: {MODEL_PATH}")

    model, scaler = _load_model(MODEL_PATH)


@app.on_event("shutdown")
def shutdown_event() -> None:
    hands.close()


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
    }


@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Le modèle n'est pas chargé.")

    frame = _decode_image(payload.image)
    features = _extract_features(frame)

    if features is None:
        return PredictResponse(error="NO_HAND")

    if scaler is not None and hasattr(scaler, "transform"):
        features = scaler.transform(features)

    prediction = model.predict(features)
    raw_label = prediction[0] if hasattr(prediction, "__len__") else prediction
    letter = _to_letter(raw_label)

    confidence: float | None = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features)[0]
        confidence = float(np.max(proba))

    return PredictResponse(
        letter=letter,
        raw_label=str(raw_label),
        confidence=confidence,
    )
