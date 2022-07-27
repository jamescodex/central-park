import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import { Button, Form } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import Gift from "./Gift";

const NftCard = ({
  isOwner,
  data,
  sellToken,
  buyToken,
  giftToken,
  defaultAccount,
}) => {
  const {
    id,
    seller,
    price,
    sold,
    name,
    image,
    description,
    attributes,
  } = data;

  return (
    <Col key={id}>
      <Card className="h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={seller} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(seller)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {id} ID
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div style={{ height: "300px" }}>
          <img
            src={image}
            alt={description}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2 mx-5 my-4">
              {attributes.map((attribute, key) => (
                <Col key={key}>
                  <div className="border rounded w-100">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {attribute.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {attribute.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          {isOwner ? (
            <>
              <Button onClick={() => sellToken(id)} variant="success">
                Sell
              </Button>
              <Gift giftToken={giftToken} tokenId={id} />
            </>
          ) : !sold ? (
            <div>
              {defaultAccount == seller ? (
                <div style={{ fontFamily: "cursive" }}>Not purchased yet</div>
              ) : (
                <Button onClick={() => buyToken(id)} variant="danger">
                  Buy
                </Button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", fontFamily: "cursive" }}>
              Not available for sale yet
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
  modPrice: PropTypes.func.isRequired,
};

export default NftCard;
