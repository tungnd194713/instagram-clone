/* eslint-disable prettier/prettier */
/* eslint-disable react/self-closing-comp */
import { useRef } from 'react';
import PropTypes from 'prop-types';
import Header from './header';
import Image from './image';
import Actions from './actions';
import Footer from './footer';
import Comments from './comments';

export default function Post({ content }) {
  const commentInput = useRef(null);
  const handleFocus = () => commentInput.current.focus(); // anon func so it doesn't get called right away

  // components
  // -> header, image, actions (like & comment icons), footer, comments
  return (
    <div className="rounded col-span-4 border bg-white border-gray-primary mb-12">
      <Header userId={content.userId} />
      <div className='border-b border-gray-primary'></div>
      <Image src={content.imageSrc} caption={content.caption} type={content.fileType} />
      <Actions
        docId={content.docId}
        totalLikes={content.likes.length}
        likedPhoto={content.userLikedPhoto}
        handleFocus={handleFocus}
      />
      <Footer caption={content.caption} username={content.username} />
      <Comments
        docId={content.docId}
        comments={content.comments}
        posted={content.dateCreated}
        commentInput={commentInput}
      />
    </div>
  );
}

Post.propTypes = {
  content: PropTypes.shape({
    username: PropTypes.string,
    imageSrc: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    docId: PropTypes.string.isRequired,
    userLikedPhoto: PropTypes.bool.isRequired,
    likes: PropTypes.array.isRequired,
    comments: PropTypes.array.isRequired,
    dateCreated: PropTypes.number.isRequired,
    fileType: PropTypes.string,
    userId: PropTypes.string
  })
};
