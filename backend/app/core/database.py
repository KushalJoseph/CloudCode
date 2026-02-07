"""MongoDB database connection manager using Motor (async driver)."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings


class Database:
    """Database connection manager."""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


# Singleton instance
database = Database()


async def connect_to_mongodb():
    """Connect to MongoDB Atlas."""
    if not settings.MONGODB_URI:
        print("⚠️  MONGODB_URI not set - database features disabled")
        return
    
    try:
        database.client = AsyncIOMotorClient(settings.MONGODB_URI)
        database.db = database.client[settings.DATABASE_NAME]
        
        # Verify connection
        await database.client.admin.command('ping')
        print(f"✅ Connected to MongoDB Atlas database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection."""
    if database.client:
        database.client.close()
        print("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance for dependency injection."""
    if database.db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongodb() first.")
    return database.db
