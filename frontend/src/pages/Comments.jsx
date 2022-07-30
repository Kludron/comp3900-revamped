import React, { useState } from "react";
import './Comments.css'
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Rating, TextField } from "@mui/material";

const token = localStorage.getItem("token");

/* Recipe Comments Page */
function Comments () {

  const navigate = useNavigate();
  const goBack = () => {
		navigate(`/view/recipe/${recipeid}`);
	};

  //Obtains recipeID from URL
  const recipeid = window.location.pathname.split('/')[3];
  const [comments, setComments] = useState([]);
  
  
  //Loads Recipe comments from backend
  const loadComments = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    // TODO : change the path
    const response = await axios.get(`http://localhost:5000/reviews/recipeid=${recipeid}`, {headers:headers});
    setComments(response.data.Comments);
  }
  
  React.useEffect(() => {
    loadComments();
  }, [])
  console.log(comments);
  
  return <div>
    <button className="comment-go-back" onClick={goBack}>←Go Back</button>
    <CommentBar recipeid={recipeid}/>
    <div>
      {comments.map((comment, key) => (
        <Comment key={key} username={comment.Username} comment={comment.Content} rating={comment.Rating}/>
        ))}
    </div>
  </div>
}

export default Comments;

function Comment ({username, comment, rating}) {
  return <div className="comment">
    <div className="comment-user">
      <Avatar className="comment-user-icon"/>
      {username}
    </div>
    <div className="comment-content">
      {/* <Rating value={rating} readOnly/> */}
      {comment} 
    </div>
  </div>
}

function CommentBar ({ recipeid }) {
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState(0);
  
  
  const submitComment = async () => {
    var headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
    var body = {
      comment,
      rating
    };
    axios.post(`http://localhost:5000/contrib/review/recipe=${recipeid}`, body, { headers: headers })
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