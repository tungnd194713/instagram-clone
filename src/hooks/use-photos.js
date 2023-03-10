/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import { useState, useEffect } from "react";
// import { getPhotos } from '../services/firebase';
import { firebase } from "../lib/firebase";
import { getSuggestedPost } from "../services/firebase";

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      // example: [2, 1, 5] <- 2 being raphel
      if (user?.following?.length > 0) {
        // const followedUserPhotos = await getPhotos(user.userId, user.following);
        // sử dụng snapshot để update realtime DB liên tục
        await firebase
          .firestore()
          .collection("photos")
          .where("userId", "in", user.following)
          .onSnapshot((doc) => {
            const data = doc.docs.map((photo) => ({
              ...photo.data(),
              docId: photo.id,
            }))
            // re-arrange array to be newest photos first by dateCreated
            const sortData = data.sort((a, b) => b.dateCreated - a.dateCreated);
            setPhotos(sortData);
          });
      }
      else {
        const data = await getSuggestedPost(user.userId, user.following);
        const sortData = data.sort((b, a) => a.likes.length - b.likes.length);
        setPhotos(sortData);
      }
    }
    if(user){
    getTimelinePhotos();
    }
  }, [user?.userId, user]);

  return { photos };
}
