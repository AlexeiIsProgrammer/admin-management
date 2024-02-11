import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { Lock, Trash, Unlock } from 'react-bootstrap-icons';
import { useAppDispatch } from '../../redux/store';
import { UserType, removeUsersFromDB, updateUsersStatus } from '../../firebase';
import { logoutUser } from '../../redux/slices/authSlice';
import CustomSpinner from '../CustomSpinner';

type ToolbarPropsType = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  checkedUsers: UserType[];
  getData: () => void;
};

function Toolbar({
  setIsLoading,
  isLoading,
  checkedUsers,
  getData,
}: ToolbarPropsType) {
  const dispatch = useAppDispatch();

  const removeUsers = async () => {
    setIsLoading(true);
    const isDeleted = await removeUsersFromDB(checkedUsers);

    if (isDeleted) {
      dispatch(logoutUser());
    } else {
      getData();
    }
  };
  const unblockUsers = async () => {
    setIsLoading(true);
    await updateUsersStatus(checkedUsers, 'active');

    getData();
  };

  const blockUsers = async () => {
    setIsLoading(true);
    const isBlocked = await updateUsersStatus(checkedUsers, 'blocked');

    if (isBlocked) {
      dispatch(logoutUser());
    } else {
      getData();
    }
  };

  return (
    <ButtonGroup size="sm" className="mb-2">
      <Button
        title="Block users"
        disabled={isLoading || checkedUsers.length === 0}
        onClick={blockUsers}
        variant="warning"
      >
        {isLoading ? <CustomSpinner /> : <Lock />}
        Block
      </Button>
      <Button
        title="Unblock users"
        disabled={isLoading || checkedUsers.length === 0}
        onClick={unblockUsers}
        variant="primary"
      >
        {isLoading ? <CustomSpinner /> : <Unlock />}
      </Button>
      <Button
        title="Remove users"
        disabled={isLoading || checkedUsers.length === 0}
        onClick={removeUsers}
        variant="danger"
      >
        {isLoading ? <CustomSpinner /> : <Trash />}
      </Button>
    </ButtonGroup>
  );
}

export default Toolbar;
