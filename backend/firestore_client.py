import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firestore client
def get_firestore_client():
    """Initialize and return Firestore client"""
    if not firebase_admin._apps:
        # Try to use credentials from environment or default
        try:
            # For production, use service account key
            cred = credentials.Certificate(os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'serviceAccountKey.json'))
            firebase_admin.initialize_app(cred)
        except:
            # For development, use default credentials (mock mode)
            # This will allow the app to run without actual Firestore connection
            try:
                firebase_admin.initialize_app()
            except:
                # If all fails, return None and use mock data
                return None
    
    try:
        return firestore.client()
    except:
        # Return None if client cannot be initialized (will use mock data)
        return None

db = get_firestore_client()
