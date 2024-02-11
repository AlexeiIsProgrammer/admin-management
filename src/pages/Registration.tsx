import { FormEvent, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/button';
import Form from 'react-bootstrap/form';
import { registerWithEmailAndPassword } from '../firebase';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { authSelector, setUser } from '../redux/slices/authSlice';

function Registration() {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector(authSelector);
  const navigate = useNavigate();

  const nameRef = useRef<null | HTMLInputElement>(null);
  const passwordRef = useRef<null | HTMLInputElement>(null);
  const emailRef = useRef<null | HTMLInputElement>(null);

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = await registerWithEmailAndPassword(
      nameRef?.current?.value || '',
      emailRef?.current?.value || '',
      passwordRef?.current?.value || ''
    );

    if (user) {
      dispatch(setUser(user));
      navigate('/');
    }
  };

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Container>
      <Form onSubmit={register}>
        <Form.Text style={{ fontSize: '3rem' }}>Registration</Form.Text>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Name</Form.Label>
          <Form.Control
            ref={nameRef}
            type="text"
            required
            placeholder="Enter email"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            ref={emailRef}
            type="email"
            required
            placeholder="Enter email"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            ref={passwordRef}
            type="password"
            required
            placeholder="Password"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Sign up
        </Button>
      </Form>
    </Container>
  );
}

export default Registration;
