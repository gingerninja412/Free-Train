import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { BiSolidLike } from "react-icons/bi";
import { BiLike } from "react-icons/bi";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

import axios from "axios";
import auth from "../auth/auth";

function SpotExpanded() {
  //functional hooks
  let params = useParams()

  //global states
  const user = useSelector(state => state.user)

  //local states
  const [parkourSpot, setSpot] = useState({})
  const [imagePaths, setImagePaths] = useState([])
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [challengeText, setChallengeText] = useState("")
  const [challenges, setChallenges] = useState([])
  const [stateChange, setStateChange] = useState(false)


  useEffect(() => {
    //authenticates a the user then gets the specific spot from the database
    auth(user.value)
    const requests = []
    axios.get(`http://localhost:3000/spot/getSpot/${params.spotName}`, {
      withCredentials: true
    }).then(res => {
      setSpot(res.data)
      setImagePaths(res.data.imagePaths)
      setLikes(res.data.likedBy.length)
      axios.get(`http://localhost:3000/challenge/getChallengeBySpot/${res.data.name}`, {
        withCredentials: true
      }).then(res => {
        setChallenges(res.data)
      }).catch(error => {
        console.log(error)
      })
      if(res.data.likedBy.includes(user.value)) {
        setLiked(true)
      }
      setComments(res.data.comments)
    }).catch(error => {
      console.log(error)
    }) 
  }, [])

  function like() {
    axios.post(`http://localhost:3000/spot/like/${parkourSpot.name}`, {user: user.value}, {
      withCredentials: true
    }).then(res => {
      setLikes(likes + 1)
      setLiked(!liked)
    }).catch(error => {
      console.log(error)
    })
  }

  function unLike() {
    axios.post(`http://localhost:3000/spot/unLike/${parkourSpot.name}`, {user: user.value}, {
      withCredentials: true
    }).then(res => {
      setLikes(likes - 1)
      setLiked(!liked)
    }).catch(error => {
      console.log(error)
    })
  }

  function addComment (e) {
    e.preventDefault()
    if(comment == "") {
      return
    }
    let commentObj = new FormData()
    commentObj.append("madeBy", user.value)
    commentObj.append("comment", comment)
    axios.post(`http://localhost:3000/spot/addComment/${parkourSpot.name}`, commentObj, {
      withCredentials: true
    }).then(res =>  {
      setComments([...comments, {madeBy: user.value, comment: comment}])
      setComment("")
    }).catch(error => {
      console.log(error)
    })
  }

  function updateComment (e) {
    setComment(e.target.value)
  }

  function updateChallengeText(e) {
    setChallengeText(e.target.value)
  }

  function createChallenge(e) {
    e.preventDefault()
    const data = new FormData()
    data.append("challenge", challengeText)
    data.append("spotName", parkourSpot.name)
    axios.post("http://localhost:3000/challenge/addChallenge", data, {
      withCredentials: true 
    }).then(res => {
      setChallenges([...challenges, {
        challenge: challengeText,
        spotName: parkourSpot.name,
        completedBy: []
      }])
      setChallengeText("")
    }).catch(error => {
      console.log(error)
    })
  }

  function toggleCompleted (challenge) {
    axios.post(`http://localhost:3000/challenge/toggleCompleted/${challenge.challenge}`, {
      username: user.value
    }, {
      withCredentials: true
    }).then(res => {
      if(challenge.completedBy.includes(user.value) == false) {
        challenge.completedBy.push(user.value)
        setStateChange(true)
      } else {
        challenge.completedBy.splice(challenge.completedBy.indexOf(user.value), 1)
        setStateChange(false)
      }
    }).catch(error => {
      console.log(error)
    })
  }

  return ( 
    <div id="spot-expanded">
      <div id="spot-expanded-body">
        <Link to="/mapScreen">
          <IoArrowBackCircleOutline size="40" color="black"/>
        </Link>
        <h1 className="expanded-item">{parkourSpot.name}</h1>
        <h2 className="expanded-item">Found by {parkourSpot.author}</h2>
        <div className="divider"></div>
        <div className="image-show">
          {imagePaths.map(image => {
            return <img key={image} src={`http://localhost:3000/spot/getImage/${parkourSpot.name}/${image}`} width="200px"/>
          })}
        </div>
        <p className="description"><span>{parkourSpot.author}</span><br />{` ${parkourSpot.description}`}</p>
        <div className="divider expanded-item"></div>
        <div className="likes">
          <h1>{likes}</h1>
          {liked ? <BiSolidLike size="80" onClick={unLike}/> : <BiLike size="80" onClick={like}/>}
        </div>
        < div className="comments">
          <form onSubmit={addComment}>
            <textarea cols="50" rows="3" value={comment} onChange={updateComment} className="create-comment"></textarea>
            <button type="submit" className="add-comment">Add Comment</button>
          </form>
          <div className="comment-display">
            {comments.map(comment => {
              return (<div className="comment">
                <p>{`${comment.madeBy} - ${comment.comment}`}</p>
              </div>)
            })}
          </div>
        </div>
        <div className="challenges">
          <form onSubmit={createChallenge}>
            <textarea cols="50" rows="3" value={challengeText} onChange={updateChallengeText} className="create-comment"></textarea>
            <button type="submit" className="add-comment">Add Challenge</button>
          </form>
          <div className="challenges-display">
            {challenges.map(challenge => {
              return (
                <div className="challenge">
                  <h4>{challenge.challenge}</h4>
                  {challenge.completedBy.includes(user.value) ? <FaStar size="20" onClick={() => toggleCompleted(challenge)}/> : <FaRegStar size="20" onClick={() => toggleCompleted(challenge)}/>}
                </div>
              )
            }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpotExpanded;