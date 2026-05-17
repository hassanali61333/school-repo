import { db } from "./firebaseAdmin";

export const checkEmailExists = async (email) => {
  const collections = ["users","parents","students","SchoolStaff", "Teacher"];
  
  for (let i = 0; i < collections.length; i++) {
    const collectionName = collections[i];
    const snapshot = await db.collection(collectionName)
      .where("email", "==", email.trim().toLowerCase())
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const userData = doc.data();
      
      return {
        exists: true,
        collection: collectionName,
        role: userData.role || collectionName,
        message: `Email ${email} already exists in ${collectionName} collection${userData.role ? ` as ${userData.role}` : ''}. Please use a different email address.`
      };
    }
  }
  
  return {
    exists: false,
    message: null
  };
};