import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      if (response.ok) {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      } else {
        setUserInfo(null);
      }
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      setUserInfo(null);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">nightly.</Link>
      <span className="tagline">"Where midnight thoughts become morning reads."</span>

      <nav>
  {username && (
    <>
      <Link to="/create" className="btn create-btn">Create Post</Link>
      <button className="btn logout-btn" onClick={logout}>
        Logout ({username})
      </button>
    </>
  )}
  {!username && (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  )}
</nav>
    </header>
  );
}