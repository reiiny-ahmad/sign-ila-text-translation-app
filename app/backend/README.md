# Backend ASL (FastAPI)

Ce backend charge `model_sign_language.p` et expose l'endpoint d'inférence:

- `POST /api/predict`

## 1) Installation

Depuis la racine du projet:

```powershell
cd app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Si `mediapipe` etait deja installe, force la version:

```powershell
pip install --upgrade --force-reinstall mediapipe==0.10.14
```

## 2) Lancer l'API

Depuis `app\backend`:

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Par défaut, le backend lit le modèle ici:

`..\..\model_sign_language.p`

Tu peux changer ce chemin via la variable d'environnement `MODEL_PATH`.

Exemple:

```powershell
$env:MODEL_PATH="C:\path\to\model_sign_language.p"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 3) Vérification rapide

```powershell
Invoke-WebRequest http://127.0.0.1:8000/api/health
```

Le frontend Vite est déjà configuré pour proxyfier `/api` vers `http://localhost:8000`.
