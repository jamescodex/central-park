import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const Cover = ({ name, coverImg, connect }) => {
  if (name) {
    return (
      <div
        className="d-flex justify-content-center flex-column text-center "
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://wallpaperaccess.com/full/1826326.jpg')",
          height: "100vh",          
        }}
      >
        <div className="mt-auto text-light mb-5">
          <div
            className=" ratio ratio-1x1 mx-auto mb-2"
            style={{ maxWidth: "320px" }}
          >
            <img src={coverImg} alt="" style={{ borderRadius: "50%"}} />
          </div>
          <h1>{name}</h1>
          <p>Please connect your wallet to continue exploring.</p>
          <Button
            onClick={() => connect().catch((e) => console.log(e))}
            variant="outline-light"
            className="rounded-pill px-3 mt-3"
            style={{
              backgroundColor: "#093d09",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </Button>
        </div>

        <p className="mt-auto text-secondary">
          Powered by Celo. Inspired by <a href="https://dacade.org">Dacade</a>{" "}
        </p>
      </div>
    );
  }

  return null;
};

Cover.propTypes = {
  name: PropTypes.string,
};

Cover.defaultProps = {
  name: "",
};

export default Cover;
