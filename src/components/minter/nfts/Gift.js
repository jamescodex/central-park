import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const Gift = ({ giftToken, tokenId }) => {
  const [show, setShow] = useState(false);
  const [receiver, setReceiver] = useState();
  const [message, setMessage] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Button variant="dark" onClick={handleShow}>
        Gift Out
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Gift token to someone else</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Wallet Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="0x123...456"
                onChange={(e) => setReceiver(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>What is the reason for this gift?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => giftToken(receiver, tokenId, message)}
          >
            Gift
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Gift;
