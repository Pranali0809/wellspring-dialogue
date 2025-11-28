import os
import firebase_admin
from firebase_admin import credentials, firestore

DATABASE_ID = "vaidyaai"  # your custom Firestore DB

def get_firestore_client():
    """Initialize Firestore with correct credentials."""
    if not firebase_admin._apps:

        service_account = "serviceAccountKey.json"
        if service_account:
            try:
                cred = credentials.Certificate(service_account)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print("❌ Failed to load service account JSON:", e)
                return None
        else:
            print("❌ No GOOGLE_APPLICATION_CREDENTIALS environment variable found.")
            return None

    try:
        client = firestore.client(database_id=DATABASE_ID)
        return client
    except Exception as e:
        print("❌ Could not create Firestore client:", e)
        return None


# IMPORTANT: Initialize AFTER defining get_firestore_client
db = get_firestore_client()
