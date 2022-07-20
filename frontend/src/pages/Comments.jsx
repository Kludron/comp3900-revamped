import React from "react";
import comments from '../comments/comments.json'
import './Comments.css'
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { Rating, TextField } from "@mui/material";

function Comments () {
  return <div>
    <CommentBar/>
    <div>
      {comments.map((post) => (
        <Comment commenter={post.commenter} comment={post.comment} rating={post.rating}/>
      ))}
    </div>
  </div>
}

export default Comments;

function Comment ({commenter, comment, rating}) {
  return <div className="comment">
    <div className="comment-user">
      <Avatar className="comment-user-icon"/>
      {commenter}
    </div>
    <div className="comment-content">
      <Rating value={rating} readOnly/>
      {comment} 
    </div>
  </div>
}

function CommentBar () {
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState(0);


  const submitComment = async () => {
    let headers = {
        "Content-Type": "application/json",
    };
    var body = {
      comment,
      rating
    };
    axios.post("http://localhost:5000/comment", body, headers)
    .then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
      alert(error)
    });
  }

  return <div>
    <TextField
      className="CommentBar"
      variant="filled"
      label="Comment here"
      onChange={e => setComment(e.target.value)}
    />
    <Rating
      name="simple-controlled"
      value={rating}
      onChange={e => setRating(e.target.value)}
    />
    <button onClick={submitComment}>Comment</button>
  </div>
}