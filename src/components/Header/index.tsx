import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Nav, Navbar, NavbarText } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { authSelector, logoutUser } from '../../redux/slices/authSlice';

function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSelector);
  const location = useLocation();
  const navigate = useNavigate();

  const userLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand>Admin management</Navbar.Brand>
        <Nav className="me-auto">
          {location.pathname === '/registration' && (
            <NavLink to="/login">Sign in</NavLink>
          )}
          {location.pathname === '/login' && (
            <NavLink to="/registration">Sign up</NavLink>
          )}
          {!(
            location.pathname === '/login' ||
            location.pathname === '/registration'
          ) && (
            <Button
              style={{ cursor: 'pointer', color: 'white' }}
              onClick={userLogout}
            >
              Logout
            </Button>
          )}
        </Nav>
        {user && (
          <NavbarText className="ps-2 ms-auto">Hello, {user.name}</NavbarText>
        )}
      </Container>
    </Navbar>
  );
}

export default Header;
