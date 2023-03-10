/* eslint-disable prettier/prettier */
import { useContext } from 'react';
import User from './user';
import Suggestions from './suggestions';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Sidebar() {
  const { user: { docId = '', userId, following, username, fullName, imageSrc } = {} } = useContext(
    LoggedInUserContext
  );

  return (
    <div className="hidden md:block p-4">
      <User username={username} fullName={fullName} imageSrc={imageSrc}/>
      <Suggestions userId={userId} following={following} loggedInUserDocId={docId} />
    </div>
  );
}
