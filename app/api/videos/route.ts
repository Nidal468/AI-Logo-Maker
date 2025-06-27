import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const videosRef = collection(db, "videos");
    const snapshot = await getDocs(videosRef);

    const videos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(videos), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch videos" }), {
      status: 500,
    });
  }
}
