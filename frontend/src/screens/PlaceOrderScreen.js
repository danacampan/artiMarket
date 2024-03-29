import Axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckOutSteps';
import LoadingBox from '../components/LoadingBox';

const initialState = {
  loading: false,
  cart: {
    orderItems: [],
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false, cart: action.payload.cart };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    case 'CART_APPLY_PROMO':
      return {
        ...state,
        loading: false,
        cart: {
          ...state.cart,
          totalPrice: state.cart
            ? state.cart.itemsPrice - action.payload.discountAmount
            : 0,
        },
      };

    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const [promoCode, setPromoCode] = useState('');
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 200 ? round2(0) : round2(15);
  cart.taxPrice = round2(0.015 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const applyPromotionHandler = async () => {
    try {
      console.log('Sending promo code:', promoCode);
      console.log('Cart before applying promo:', cart);
      const { data } = await Axios.post(
        '/api/promotions/validate',
        { promoCode },

        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        }
      );
      const promoCodeValidation = await Axios.post(
        '/api/promotions/validate',
        { promoCode },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
          withCredentials: true,
        }
      );

      if (data.valid) {
        const discountAmount =
          (cart.totalPrice * data.promotion.discount) / 100;
        console.log('Discount Amount:', discountAmount);

        dispatch({
          type: 'CART_APPLY_PROMO',
          payload: {
            discountAmount,
          },
        });
        console.log('Cart after applying promo:', cart);
        if (data.success) {
          toast.success('Cod aplicat cu succes!');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data: orderData } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      const emailData = {
        recipient: userInfo.emailData,
        /*subject: 'Order Confirmation',
        text: `Thank you for placing your order.`, */
      };

      await Axios.post('/api/send-email', emailData);

      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({
        type: 'CREATE_SUCCESS',
        payload: {
          cart: {
            orderItems: [],
            itemsPrice: 0,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: 0,
          },
        },
      });
      localStorage.removeItem('cartItems');
      toast.success(
        'Comanda a fost plasata cu succes. Un email de confirmare a fost trimis.'
      );
      navigate(`/order/${orderData.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Previzualizare comandă</title>
      </Helmet>
      <h1 className="my-3">Previzualizare comandă</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Livrare</Card.Title>
              <Card.Text>
                <strong>Nume:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Adresă: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Plată</Card.Title>
              <Card.Text>
                <strong>Metodă de plată:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Produse</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price} lei</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Sumar comandă</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Produse</Col>
                    <Col>{cart.itemsPrice.toFixed(2)} lei</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Livrare</Col>
                    <Col>{cart.shippingPrice.toFixed(2)} lei</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Taxe</Col>
                    <Col>{cart.taxPrice.toFixed(2)} lei</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <label htmlFor="promoCode">Cod promoțional:</label>
                      <input
                        type="text"
                        id="promoCode"
                        name="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                    </Col>
                    <Button
                      variant="outline-success"
                      onClick={applyPromotionHandler}
                    >
                      Aplică
                    </Button>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Total comandă</strong>
                    </Col>
                    <Col>
                      <strong>{state.cart.totalPrice.toFixed(2)} lei</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Plasează comandă
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
