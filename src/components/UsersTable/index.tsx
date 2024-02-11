import { useEffect, useState } from 'react';
import { Button, Container, Form, Stack, Table } from 'react-bootstrap';
import { Lock, Trash, Unlock } from 'react-bootstrap-icons';
import { UserType, getUsers, removeUsersFromDB } from '../../firebase';

function UsersTable() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<UserType[]>([]);

  const getData = async () => {
    const usersData = await getUsers();
    if (usersData) setUsers(usersData);
  };

  const removeUsers = async () => {
    await removeUsersFromDB(checkedUsers);
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Container>
      <Stack direction="horizontal" gap={3}>
        <Button variant="warning" className="p-2">
          Block <Lock />
        </Button>
        <Button variant="primary" className="p-2">
          <Unlock />
        </Button>
        <Button onClick={removeUsers} variant="danger" className="p-2">
          <Trash />
        </Button>
      </Stack>
      <Table striped>
        <thead>
          <tr>
            <th>
              <Form.Check type="checkbox" />
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
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.lastLoginDate.toString()}</td>
              <td>{user.registeredDate.toString()}</td>
              <td>{user.status === 'active' ? 'Active' : 'Blocked'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UsersTable;
