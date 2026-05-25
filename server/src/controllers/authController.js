const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'meditrack_super_secret_key_2025';

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Register User (Patient or Doctor)
exports.register = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email directly taken' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let userData = {
      email,
      password: hashedPassword,
      role: role || 'PATIENT',
      firstName,
      lastName,
    };

    if (userData.role === 'PATIENT') {
      userData.patient = {
        create: {
          dateOfBirth: new Date(), // Defaulting to now, update profile later
        }
      };
    } else if (userData.role === 'DOCTOR') {
      userData.doctor = {
        create: {
          specialization: 'General Practitioner', // Default, update profile later
        }
      };
    } else if (userData.role === 'ADMIN') {
      // Admin/Hospital requires no additional table mapped automatically initially
    }

    const newUser = await prisma.user.create({
      data: userData,
      include: { patient: true, doctor: true }
    });

    // Generate Token manually
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
