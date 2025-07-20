const redis = require('../utils/redisClient');
const User = require('../models/User');
const otpGenerator = require('otp-generator')
const sendEmail = require("../controllers/sendEmail")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// bcrypt, jwt, etc.

function capitalizeName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


exports.requestOTP = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const purpose = req.body.purpose;
  const otp = otpGenerator.generate(6,{ lowerCaseAlphabets : false,upperCaseAlphabets: false, specialChars: false });
  const user = await User.findOne({ email });
  if(purpose==='register'){
    if (user) return res.status(400).json({ error: 'Email already in use' });
  }else{
    if(!user) return res.status(400).json({ error: 'Invalid email' });
  }
  await sendEmail(email,otp);
  await redis.set(`otp:${email}`, otp, 'EX', 600); // expires in 10 mins

  res.json({ message: 'OTP sent to email' });
};

exports.verifyOTP = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const otp = req.body.otp;
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // OTP verified: mark it
  await redis.set(`otp-verified:${email}`, 'true', 'EX', 600);
  await redis.del(`otp:${email}`); // delete actual OTP

  res.json({ message: 'OTP verified' });
};


exports.registerUser = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const name = capitalizeName(req.body.name);
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email already in use' });

  const otpVerified = await redis.get(`otp-verified:${email}`);
  if (!otpVerified) return res.status(400).json({ error: 'OTP not verified' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, passwordHash });
  await newUser.save();

  // Optional: remove OTP verified flag after registration
  await redis.del(`otp-verified:${email}`);

  const token = jwt.sign({user_id:newUser._id,email:newUser.email},process.env.JWT_SECRET,{algorithm:"HS256",expiresIn:"7d"})
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7*24*60*60*1000, 
  });

  res.status(201).json({ message: 'User registered successfully' });
};

exports.loginUser = async (req,res) =>{
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await User.findOne({email:email});
  if(!user) return res.status(400).json({ error: 'Email or Password is invalid' });

  const checkPassword = await bcrypt.compare(password,user.passwordHash);

  if(!checkPassword) return res.status(400).json({ error: 'Email or Password is invalid' });
  const token = jwt.sign({user_id:user._id,email:user.email},process.env.JWT_SECRET,{algorithm:"HS256",expiresIn:"7d"})
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7*24*60*60*1000,
  });
  res.status(200).json({message:"User Loggedin Sucessfully!"});
};

exports.resetPass = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  const existingUser = await User.findOne({ email });
  if (!existingUser) return res.status(400).json({ error: 'Invalid Email' });

  const otpVerified = await redis.get(`otp-verified:${email}`);
  if (!otpVerified) return res.status(400).json({ error: 'OTP not verified' });

  const passwordHash = await bcrypt.hash(password, 10);
  existingUser.passwordHash = passwordHash;
  await existingUser.save();

  await redis.del(`otp-verified:${email}`);
  res.status(201).json({ message: 'Password changed successfully' });
};