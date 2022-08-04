import React, { useState } from "react";
import './Comments.css'
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Rating, TextField } from "@mui/material";

//Gets token from local storage
const token = localStorage.getItem("token");

/* Recipe Comments Page */
function Comments () {

  //React navigation functions
  const navigate = useNavigate();
  const goBack = () => {
		navigate(`/view/recipe/${recipeid}`);
	};

  //Obtains recipeID from URL
  const recipeid = window.location.pathname.split('/')[3];
  
  //Store state variables
  const [comments, setComments] = useState([]);
  
  //Loads Recipe comments from backend
  const loadComments = async () => {
    var headers = {
      "Authorization": `Bearer ${token}`
    }
    const response = await axios.get(`http://localhost:5000/reviews/recipeid=${recipeid}`, {headers:headers});
    setComments(response.data.Comments);
  }
  
  //LoadComments on initial page load
  React.useEffect(() => {
    loadComments();
  }, [])
  
  return <div className="comments">
    <Button variant="contained" className="comment-go-back" onClick={goBack}>← Go Back</Button>
    <CommentBar recipeid={recipeid}/>
    <div>
      {comments.map((comment, key) => (
        <Comment key={key} username={comment.Username} comment={comment.Content}/>
        ))}
    </div>
  </div>
}

export default Comments;

function Comment ({username, comment}) {
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
  
  
  const navigate = useNavigate();
  const submitComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must create an account to comment and rate the recipe.')
      navigate(`/view/recipe/${recipeid}`);
    }
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
      alert("Comment successfully!")
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
    <Button variant="outlined" onClick={submitComment}>Comment</Button>
  </div>
}