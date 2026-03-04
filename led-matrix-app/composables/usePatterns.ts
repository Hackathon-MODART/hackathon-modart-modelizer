import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, where } from "firebase/firestore";
import { useFirebase } from "~/utils/firebase";

export interface LedPattern {
  id?: string;
  name: string;
  fps: number;
  frameCount: number;
  frames: string[][][];
  createdAt?: Date;
}

export const usePatterns = () => {
  const { db } = useFirebase();

  const savePattern = async (name: string, fps: number, frameCount: number, frames: string[][][]) => {
    try {
      const cleanFrames = JSON.parse(JSON.stringify(frames));
      
      const docRef = await addDoc(collection(db, "patterns"), {
        name,
        fps,
        frameCount,
        framesData: JSON.stringify(cleanFrames), // Using framesData explicitly as string
        createdAt: Timestamp.now()
      });
      console.log("Motif enregistré avec l'ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Erreur lors de l'ajout du motif : ", e);
      throw e;
    }
  };

  const getPatterns = async (): Promise<LedPattern[]> => {
    try {
      const q = query(collection(db, "patterns"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const patterns: LedPattern[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let parsedFrames: string[][][] = [];
        try {
          const framesRaw = data.framesData || data.frames;
          if (typeof framesRaw === "string") {
            parsedFrames = JSON.parse(framesRaw);
          } else if (Array.isArray(framesRaw)) {
            parsedFrames = framesRaw; 
          }
        } catch(e) {
          console.error("Error parsing frames JSON", e);
        }

        patterns.push({
          id: doc.id,
          name: data.name,
          fps: data.fps,
          frameCount: data.frameCount,
          frames: parsedFrames,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      return patterns;
    } catch (e) {
      console.error("Erreur lors de la récupération des motifs : ", e);
      throw e;
    }
  };

  const updatePattern = async (id: string, name: string, fps: number, frameCount: number, frames: string[][][]) => {
    try {
      const cleanFrames = JSON.parse(JSON.stringify(frames));
      const patternRef = doc(db, "patterns", id);
      
      await updateDoc(patternRef, {
        name,
        fps,
        frameCount,
        framesData: JSON.stringify(cleanFrames),
        updatedAt: Timestamp.now()
      });
      console.log("Motif mis à jour : ", id);
    } catch (e) {
      console.error("Erreur lors de la mise à jour du motif : ", e);
      throw e;
    }
  };

  const checkPatternExists = async (name: string): Promise<boolean> => {
    try {
      const q = query(collection(db, "patterns"), where("name", "==", name));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (e) {
      console.error("Erreur lors de la vérification du nom : ", e);
      return true; 
    }
  };

  return {
    savePattern,
    getPatterns,
    updatePattern,
    checkPatternExists
  };
};
