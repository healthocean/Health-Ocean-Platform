import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_DIR = "./data"
DB_DIR = "./chroma_db"

def ingest_data():
    print(f"Checking for PDFs in {DATA_DIR}...")
    
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print("Created /data directory. Please put your PDF files there and run this script again.")
        return

    docs = []
    # 1. Load all PDFs, Text, and CSV files recursively
    from langchain_community.document_loaders import TextLoader, CSVLoader
    
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            print(f"Processing {file} in {os.path.relpath(root, DATA_DIR)}...")
            try:
                if file.endswith(".pdf"):
                    loader = PyPDFLoader(file_path)
                    docs.extend(loader.load())
                elif file.endswith(".text") or file.endswith(".txt"):
                    loader = TextLoader(file_path)
                    docs.extend(loader.load())
                elif file.endswith(".csv"):
                    # Use CSVLoader to turn each row into a distinct document chunk
                    loader = CSVLoader(file_path)
                    docs.extend(loader.load())
            except Exception as e:
                print(f"Error loading {file}: {str(e)}")
    
    if not docs:
        print("No documents found to process. Please add some files to the data folder.")
        return
    
    print(f"Loaded {len(docs)} documents/pages.")

    # 2. Split documents into smaller semantic chunks (1000 characters per chunk)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = text_splitter.split_documents(docs)

    print(f"Split pages into {len(split_docs)} semantic chunks.")

    # 3. Create Vector Embeddings using totally free local HuggingFace models
    print("Generating vector embeddings locally (this might take a moment)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # 4. Save into ChromaDB
    print("Saving to local ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=split_docs, 
        embedding=embeddings, 
        persist_directory=DB_DIR
    )

    print("✅ Ingestion Complete! Your bot is ready to be asked questions about these documents.")

if __name__ == "__main__":
    ingest_data()