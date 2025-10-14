import { useEffect, useState } from 'react';
import { getString } from '../api/users';

export default function Dashboard() {
  const [userId, setUserId] = useState('...');

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getString();
      setUserId(result.userId);
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Bienvenido</h1>
      <p>Tu ID es: {userId}</p>
    </div>
  );
}
