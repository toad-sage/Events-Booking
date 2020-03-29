
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import AuthContext from '../../context/auth-context'
import './MainNavigation.css';


function MainNavigation() {
  const loginContext = useContext(AuthContext);
  console.log(loginContext.token)
   return (
    <header className="main-navigation">
      <div className="main-navigation__logo">
        <h1>EasyEvent</h1>
      </div>
      <nav className="main-navigation__items">
        <ul>
          { !loginContext.token && (<li>
            <NavLink to="/auth">Authenticate</NavLink>
          </li>)}
          <li>
            <NavLink to="/events">Events</NavLink>
          </li>
          { loginContext.token && (
            <React.Fragment>
              <li>
              <NavLink to="/bookings">Bookings</NavLink>
              </li>
              <li>
                <button onClick={loginContext.logout}>Logout</button>
              </li>
            </React.Fragment>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;