import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from 'react-bootstrap/Button';

export default function SigninScreen() {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  return (
    <Container className="small-container">
      <Helmet>
        <title>Autentificare</title>
      </Helmet>
      <h1 className="my-30">Autentificare</h1>
      <Form>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Parola</Form.Label>
          <Form.Control type="password" required />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Autentificare</Button>
        </div>
        <div className="mb-3">
          Client nou?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Creeaza un cont</Link>
        </div>
      </Form>
    </Container>
  );
}
