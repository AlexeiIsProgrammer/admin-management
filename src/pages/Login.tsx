import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/button';
import Form from 'react-bootstrap/form';
import { logInWithEmailAndPassword } from '../firebase';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { authSelector, setUser } from '../redux/slices/authSlice';
import CustomSpinner from '../components/CustomSpinner';

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector(authSelector);
  const emailRef = useRef<null | HTMLInputElement>(null);
  const passwordRef = useRef<null | HTMLInputElement>(null);

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const authUser = await logInWithEmailAndPassword(
      emailRef?.current?.value || '',
      passwordRef?.current?.value || ''
    );

    setIsLoading(false);
    if (authUser) {
      dispatch(setUser(authUser));
      redirect('/');
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('id')) navigate('/');
  }, [navigate, isAuth]);

  return (
    <Container fluid="sm">
      <Form onSubmit={login}>
        <Form.Text style={{ fontSize: '3rem' }}>Login</Form.Text>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control ref={emailRef} type="email" placeholder="Enter email" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            ref={passwordRef}
            type="password"
            placeholder="Password"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          {isLoading ? <CustomSpinner /> : 'Login'}
        </Button>
      </Form>
    </Container>
  );
}

export default Login;
