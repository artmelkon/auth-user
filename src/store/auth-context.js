import React, {useState, useEffect, useCallback} from 'react';

let logoutTimer;
const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {}
});

const calculatedRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();
  const remainingDuration = adjExpirationTime - currentTime;

  return remainingDuration;
}

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpiratonTime = localStorage.getItem('expirationTime');

  const remainingTime = calculatedRemainingTime(storedExpiratonTime);

  if(remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem('expirationTime');
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime
  }
}

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initalToken;
  if(tokenData) {
    initalToken = tokenData.token
  }
  const [token, setToken] = useState(initalToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('expirationTime')
    setToken(null);

    if(logoutTimer) {
      clearTimeout(logoutTimer)
    }
  }, [])

  const loginHandler = (token, expirationTime) => {
    localStorage.setItem("token", token);
    localStorage.setItem('expirationTime', expirationTime)
    setToken(token);

    const remainingTime = calculatedRemainingTime(expirationTime);

    console.log(remainingTime)
    logoutTimer = setTimeout(logoutHandler, remainingTime)
  };

  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}
export default AuthContext;
