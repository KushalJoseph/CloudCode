from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import infrastructure

app = FastAPI(
    title="Prompt to Infrastructure API",
    version="1.0.0"
)

# CORS
# Allowing all origins for development simplicity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(
    infrastructure.router,
    prefix="/api/infrastructure",
    tags=["infrastructure"]
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
