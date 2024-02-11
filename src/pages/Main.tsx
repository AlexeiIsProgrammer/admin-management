import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAppSelector } from '../redux/store';
import { authSelector } from '../redux/slices/authSlice';
import UsersTable from '../components/UsersTable';

function Main() {
  const { isAuth } = useAppSelector(authSelector);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('id')) navigate('/login');
  }, [navigate, isAuth]);

  return (
    <Container className="mt-2">
      <UsersTable />
    </Container>
  );
}

export default Main;
