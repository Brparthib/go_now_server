import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { AuthProvider, IUser, UserRole, UserStatus } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import { envVars } from "../../configs/envConfig";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: IUser) => {
  const { email, role, password, ...rest } = payload;

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist..!");
  }

  if (role === UserRole.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized..!");
  }

  const hashedPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND) | 10
  );

  const authProvider: AuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    role: UserRole.USER,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user || (user && user.isDeleted)) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(userId);
  if (!user || (user && user.isDeleted)) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT_ROUND) || 10
    );
  }

  if (
    payload.status === UserStatus.BLOCKED &&
    decodedToken.role !== UserRole.ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  if (payload.role === UserRole.ADMIN && decodedToken.role !== UserRole.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  if (
    (payload.isSubscribed ||
      payload.hasVerifiedBadge ||
      payload.ratingSummary) &&
    user.role !== UserRole.ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  const isUserExists = await User.findById(userId);
  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exists!!");
  }

  await User.findByIdAndUpdate(userId, { isDeleted: true });

  return null;
};

export const userServices = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
