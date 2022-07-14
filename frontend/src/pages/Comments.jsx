import React from "react";
import comments from '../comments/comments.json'
import './Comments.css'
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { TextField } from "@mui/material";

function Comments () {
  return <div>
    <ReviewBar/>
    <ul>
      {comments.map((post) => (
        <Review commenter={post.commenter} comment={post.comment} rate={post.rate}/>
      ))}
    </ul>
  </div>
}

export default Comments;

function Review ({commenter, comment, rate}) {
  return <li>
    {commenter} {comment} {rate}
  </li>
}

function ReviewBar () {
  const [comment, setComment] = React.useState('');

  const submitComment = async () => {
    let headers = {
        "Content-Type": "application/json",
    };
    var body = {
      comment
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
      variant="filled"
      onChange={e => setComment(e.target.value)}
    />
    <button onClick={submitComment}>Comment</button>
  </div>
}