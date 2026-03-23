from huggingface_hub import HfApi
import os

token = os.getenv("HF_TOKEN")
repo_id = "tejas0041/Sanmare-Assist"
repo_type = "space"

api = HfApi()

print(f"Uploading app.py to {repo_id}...")
api.upload_file(
    path_or_fileobj="Sanmare-Assist/app.py",
    path_in_repo="app.py",
    repo_id=repo_id,
    repo_type=repo_type,
    token=token
)

print(f"Uploading requirements.txt to {repo_id}...")
api.upload_file(
    path_or_fileobj="Sanmare-Assist/requirements.txt",
    path_in_repo="requirements.txt",
    repo_id=repo_id,
    repo_type=repo_type,
    token=token
)

print(f"Uploading README.md to {repo_id}...")
api.upload_file(
    path_or_fileobj="Sanmare-Assist/README.md",
    path_in_repo="README.md",
    repo_id=repo_id,
    repo_type=repo_type,
    token=token
)

print("Deployment complete!")
