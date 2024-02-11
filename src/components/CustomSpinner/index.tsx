import React from 'react';
import Spinner from 'react-bootstrap/spinner';

function CustomSpinner() {
  return (
    <Spinner
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
    />
  );
}

export default CustomSpinner;
