const mongoose = require('./db');
const User = require('./Models/user');

async function exampleUsers() {
  await User.create([
    {
      userName: 'Alice',
      email: 'alice@example.com',
      birthDate: new Date('1995-06-15'),
      password: 'password123',
    },
    {
      userName: 'Bob',
      email: 'bob@example.com',
      birthDate: new Date('1990-08-20'),
      password: 'securePass456',
    },
  ]);
  console.log('Users seeded!');
  mongoose.connection.close();
}

exampleUsers();