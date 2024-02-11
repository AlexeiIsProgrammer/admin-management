import { useCallback, useEffect, useState } from 'react';
import { Alert, Container, Form, Stack, Table } from 'react-bootstrap';

import { UserType, getUsers } from '../../firebase';
import Toolbar from '../Toolbar';
import { logoutUser, setUser } from '../../redux/slices/authSlice';
import { useAppDispatch } from '../../redux/store';

function UsersTable() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<UserType[]>([]);

  const getData = useCallback(async () => {
    const usersData = await getUsers();

    if (usersData === true) {
      dispatch(logoutUser());
      return;
    }

    if (usersData) {
      const getSessionId = sessionStorage.getItem('id');
      const getCurrentUser = usersData.find(({ id }) => id === getSessionId);
      if (getCurrentUser) dispatch(setUser(getCurrentUser));

      setUsers(usersData);
    }
    setCheckedUsers([]);
    setIsLoading(false);
  }, [dispatch]);

  const allChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedUsers([...users]);
    } else {
      setCheckedUsers([]);
    }
  };

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
      <Stack direction="vertical">
        <Toolbar
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          checkedUsers={checkedUsers}
          getData={getData}
        />
        {users.length === 0 ? (
          <Alert variant="danger">You do not have any users now :(</Alert>
        ) : (
          <Table className="mt-2" striped responsive>
            <thead>
              <tr>
                <th>
                  <Form.Check type="checkbox" onChange={allChangeHandle} />
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Last login</th>
                <th>Registered at</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={Boolean(
                        checkedUsers.find(({ id }) => id === user.id)
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedUsers([...checkedUsers, user]);
                        } else {
                          setCheckedUsers(
                            checkedUsers.filter(({ id }) => id !== user.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td>{user.id.slice(0, 5)}...</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.lastLoginDate}</td>
                  <td>{user.registeredDate}</td>
                  <td>{user.status === 'active' ? 'Active' : 'Blocked'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Stack>
    </Container>
  );
}

export default UsersTable;
