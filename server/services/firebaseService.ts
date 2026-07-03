import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { config } from "../config/config";
import { AppError } from "../middleware/errorHandler";

export class FirebaseService {
  private static db: Firestore | null = null;
  private static isInitialized = false;

  private static initialize() {
    if (this.isInitialized) return;

    try {
      if (!config.firebase.projectId) {
        console.warn("[FIREBASE] Firebase Project ID is missing. Firestore operations will run in degraded mode.");
        return;
      }

      const credential = cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      });

      if (getApps().length === 0) {
        initializeApp({
          credential,
        });
      } else {
        getApp();
      }

      this.db = getFirestore();
      this.isInitialized = true;
      console.log("[FIREBASE] Firebase Admin SDK successfully initialized modularly.");
    } catch (error: any) {
      console.error("[FIREBASE] Initialization failed:", error.message);
    }
  }

  public static isAvailable(): boolean {
    return !!(config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey);
  }

  public static getDb(): Firestore {
    this.initialize();
    if (!this.db) {
      throw new AppError(
        "Firebase Firestore is not initialized. Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your secrets panel.",
        503,
        { code: "FIREBASE_NOT_CONFIGURED" }
      );
    }
    return this.db;
  }
}
