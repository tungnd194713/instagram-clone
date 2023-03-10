/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-return-assign */
/* eslint-disable prefer-const */
/* eslint-disable object-shorthand */
/* eslint-disable quotes */
import { firebase, FieldValue } from "../lib/firebase";

export async function doesUsernameExist(username) {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", username)
    .get();

  return result.docs.map((user) => user.data().length > 0);
}

export async function getUserByUsername(username) {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", username)
    .get();

  return result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));
}

export async function getAllOtherUsers(userId) {
  const result = await firebase
  .firestore()
  .collection("users")
  .where("userId", "!=", userId)
  .get();

return result.docs.map((item) => ({
  ...item.data(),
  docId: item.id,
}));
}

// get user from the firestore where userId === userId (passed from the auth)
export async function getUserByUserId(userId) {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("userId", "==", userId)
    .get();
  const resultArr = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));

  return resultArr;
}
export async function getUsersByUserId(userIdList) {
  if(Array.isArray(userIdList) &&userIdList.length > 0){
    const result = await firebase
    .firestore()
    .collection("users")
    .where("userId", "in", userIdList)
    .get();
    const resultArr = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
    }));
    return resultArr;
  }

  return null;
}
export async function getSuggestedProfiles(userId, following) {
  if(following.length < 5) {
    const result = await firebase.firestore().collection("users").limit(20).get();
    const resultList =  result.docs.map((user) => ({ ...user.data(), docId: user.id }));
    let randomList = []
    while(randomList.length < 10) {
      let i = Math.floor(Math.random() * 19);
      if(!randomList.includes(resultList[i]) && !following.includes(resultList[i]) && resultList[i]?.userId !== userId) {
        randomList.push(resultList[i]);
      }
    }
    return randomList;
  }
  if(following.length >= 5) {
    let sameFollowId = [];

      let followList = await getUsersByUserId(following);
      followList.map((fl) => 
      sameFollowId = sameFollowId.concat(fl.following.filter((Id) =>Id !== userId && !sameFollowId.includes(Id)  && !following.includes(Id))
      ))
     
    const UserSuggestList = await getUsersByUserId(sameFollowId);
    return UserSuggestList;

  }
}

export async function getSuggestedPost(userId, following) {
  if(following.length === 0) {
    const result = await firebase.firestore().collection("photos").limit(20).get();
    const resultList =  result.docs.map((post) => ({ ...post.data(), docId: post.id }));
    let randomList = []
    while(randomList.length < 10) {
      let i = Math.floor(Math.random() * 19);
      if(!randomList.includes(resultList[i]) && !following.includes(resultList[i])) {
        randomList.push(resultList[i]);
      }
    }
    return randomList;
  }
}

export async function updateLoggedInUserFollowing(
  loggedInUserDocId, // currently logged in user document id
  profileId, // the user that requests to follow
  isFollowingProfile // true/false (am i currently following this person?)
) {
  return firebase
    .firestore()
    .collection("users")
    .doc(loggedInUserDocId)
    .update({
      following: isFollowingProfile
        ? FieldValue.arrayRemove(profileId)
        : FieldValue.arrayUnion(profileId),
    });
}

export async function updateLoggedInUserAvatar(
  loggedInUserDocId, // currently logged in user document id (karl's profile)
  imageSrc // the user avatar updated
) {
  return firebase
    .firestore()
    .collection("users")
    .doc(loggedInUserDocId)
    .update({
      imageSrc: imageSrc,
    });
}

export async function updateFollowedUserFollowers(
  profileDocId, // currently logged in user document id (karl's profile)
  loggedInUserDocId, // the user that karl requests to follow
  isFollowingProfile // true/false (am i currently following this person?)
) {
  return firebase
    .firestore()
    .collection("users")
    .doc(profileDocId)
    .update({
      followers: isFollowingProfile
        ? FieldValue.arrayRemove(loggedInUserDocId)
        : FieldValue.arrayUnion(loggedInUserDocId),
    });
}

export async function getPhotos(userId, following) {
  // [5,4,2] => following
  const result = await firebase
    .firestore()
    .collection("photos")
    .where("userId", "in", following)
    .get();

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
  }));

  const photosWithUserDetails = await Promise.all(
    userFollowedPhotos.map(async (photo) => {
      let userLikedPhoto = false;
      if (photo.likes.includes(userId)) {
        userLikedPhoto = true;
      }
      // photo.userId = 2
      const user = await getUserByUserId(photo.userId);
      // raphael
      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return photosWithUserDetails;
}

export async function getUserPhotosByUsername(username) {
  const [user] = await getUserByUsername(username);
  const result = await firebase
    .firestore()
    .collection("photos")
    .where("userId", "==", user.userId)
    .get();

  return result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));
}

export async function isUserFollowingProfile(
  loggedInUserUsername,
  profileUserId
) {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", loggedInUserUsername) // karl (active logged in user)
    .where("following", "array-contains", profileUserId)
    .get();

  const [response = {}] = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));

  return response.userId;
}

export async function toggleFollow(
  isFollowingProfile,
  activeUserDocId,
  profileDocId,
  profileUserId,
  followingUserId
) {
  // 1st param: karl's doc id
  // 2nd param: raphael's user id
  // 3rd param: is the user following this profile? e.g. does karl follow raphael? (true/false)
  await updateLoggedInUserFollowing(
    activeUserDocId,
    profileUserId,
    isFollowingProfile
  );

  // 1st param: karl's user id
  // 2nd param: raphael's doc id
  // 3rd param: is the user following this profile? e.g. does karl follow raphael? (true/false)
  await updateFollowedUserFollowers(
    profileDocId,
    followingUserId,
    isFollowingProfile
  );
}
