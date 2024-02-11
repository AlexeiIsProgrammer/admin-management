import { useEffect } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

type CustomToastType = {
  message: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
};

function CustomToast({ message, setShow, show }: CustomToastType) {
  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, 3000);
  }, [setShow]);

  return (
    <ToastContainer className="p-3" position="top-center" style={{ zIndex: 1 }}>
      <Toast show={show}>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default CustomToast;
