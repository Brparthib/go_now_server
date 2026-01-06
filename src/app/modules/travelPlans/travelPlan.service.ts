/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { UserRole, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { ITravelPlan, PlanVisibility } from "./travelPlan.interface";
import { TravelPlan } from "./travelPlan.model";

const assertValidDateRange = (start: Date, end: Date) => {
  if (start && end && start > end) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start date cannot be greater than end date."
    );
  }
};

const assertUserCanMutate = (hostId: string, decoded: JwtPayload) => {
  const isAdmin = decoded.role === UserRole.ADMIN;
  const isOwner = decoded.userId === hostId;
  if (!isAdmin && !isOwner) {
    throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized!!");
  }
};

const assertUserActive = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked!!");
  }
  return user;
};

const normalizeCsv = (value?: string) => {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const intersectionCount = (a: string[] = [], b: string[] = []) => {
  const setB = new Set(b.map((x) => x.toLowerCase()));
  let count = 0;
  for (const item of a) {
    if (setB.has(String(item).toLowerCase())) count++;
  }
  return count;
};

const calcOverlapDays = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
) => {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  // convert to days, rounded down
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// create travel plan
const createTravelPlan = async (
  payload: Partial<ITravelPlan>,
  decoded: JwtPayload
) => {
  await assertUserActive(decoded.userId);

  if (
    !payload.destination ||
    !payload.startDate ||
    !payload.endDate ||
    !payload.travelType
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing required travel plan fields."
    );
  }

  assertValidDateRange(payload.startDate as Date, payload.endDate as Date);

  const created = await TravelPlan.create({
    ...payload,
    hostId: decoded.userId,
    isDeleted: false,
  });

  return created;
};

// get my travel plans
const getMyTravelPlans = async (decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  const plans = await TravelPlan.find({
    hostId: decoded.userId,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return plans;
};

interface TravelPlanQuery {
  country?: string;
  city?: string;
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  page?: string;
  limit?: string;
}

// get public travel plans
const getPublicTravelPlans = async (query: TravelPlanQuery) => {
  const filter: any = { isDeleted: false, visibility: PlanVisibility.PUBLIC };

  if (query.country) {
    filter["destination.country"] = { $regex: query.country, $options: "i" };
  }
  if (query.city) {
    filter["destination.city"] = { $regex: query.city, $options: "i" };
  }
  if (query.type) {
    filter.travelType = query.type;
  }
  if (query.status) {
    filter.status = query.status;
  }

  // date overlap filtering (optional)
  const from = query.from ? new Date(query.from) : undefined;
  const to = query.to ? new Date(query.to) : undefined;

  if (from && to) {
    // overlap condition: start <= to AND end >= from
    filter.startDate = { $lte: to };
    filter.endDate = { $gte: from };
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    TravelPlan.find(filter)
      .populate(
        "hostId",
        "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    TravelPlan.countDocuments(filter),
  ]);

  return {
    meta: { page, limit, total },
    data,
  };
};

// get travel plan by id
const getTravelPlanById = async (planId: string, decoded?: JwtPayload) => {
  const plan = await TravelPlan.findById(planId).populate(
    "hostId",
    "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation"
  );

  if (!plan || plan.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found!!");
  }

  // if private => only owner/admin can view
  if (plan.visibility === PlanVisibility.PRIVATE) {
    if (!decoded) {
      throw new AppError(httpStatus.FORBIDDEN, "This travel plan is private.");
    }
    const hostId = String(plan.hostId?._id || plan.hostId);
    assertUserCanMutate(hostId, decoded);
  }

  return plan;
};

// update travel plan
const updateTravelPlan = async (
  planId: string,
  payload: Partial<ITravelPlan>,
  decoded: JwtPayload
) => {
  await assertUserActive(decoded.userId);

  const plan = await TravelPlan.findById(planId);
  if (!plan || plan.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found!!");
  }

  assertUserCanMutate(String(plan.hostId), decoded);

  const start = payload.startDate ?? plan.startDate;
  const end = payload.endDate ?? plan.endDate;
  assertValidDateRange(start as Date, end as Date);

  const updated = await TravelPlan.findByIdAndUpdate(planId, payload, {
    new: true,
    runValidators: true,
  }).populate(
    "hostId",
    "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation"
  );

  return updated;
};

// delete travel plan
const deleteTravelPlan = async (planId: string, decoded: JwtPayload) => {
  await assertUserActive(decoded.userId);

  const plan = await TravelPlan.findById(planId);
  if (!plan || plan.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Travel plan not found!!");
  }

  assertUserCanMutate(String(plan.hostId), decoded);

  await TravelPlan.findByIdAndUpdate(
    planId,
    { isDeleted: true },
    { new: true }
  );

  return null;
};

interface MatchQuery{
  country?: string;
  city?: string;
  from?: string;
  to?: string;
  type?: string; // travelType
  interests?: string; // "Beach,Food"
  page?: string;
  limit?: string;
  excludeSelf?: string; // "true" | "false"
};

const matchTravelPlans = async (query: MatchQuery, decoded?: JwtPayload) => {
  const filter: any = {
    isDeleted: false,
    visibility: PlanVisibility.PUBLIC,
  };

  // Destination filters (optional)
  if (query.country) {
    filter["destination.country"] = { $regex: query.country, $options: "i" };
  }
  if (query.city) {
    filter["destination.city"] = { $regex: query.city, $options: "i" };
  }

  // Travel type filter (optional)
  if (query.type) {
    filter.travelType = query.type;
  }

  // Date overlap filter (optional)
  const from = query.from ? new Date(query.from) : undefined;
  const to = query.to ? new Date(query.to) : undefined;

  if (from && to) {
    // overlap: start <= to AND end >= from
    filter.startDate = { $lte: to };
    filter.endDate = { $gte: from };
  }

  // Exclude my own plans (default true if logged in)
  const excludeSelf = query.excludeSelf === "false" ? false : true;

  if (excludeSelf && decoded?.userId) {
    filter.hostId = { $ne: decoded.userId };
  }

  // pagination inputs
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  // parse interests
  const wantedInterests = normalizeCsv(query.interests);

  /**
   * MVP approach:
   * - query filtered plans
   * - populate host
   * - compute matchScore in JS
   * - sort + paginate in memory
   *
   * This is fine for MVP. If dataset grows huge, convert to aggregation with $lookup + computed scoring.
   */
  const plans = await TravelPlan.find(filter)
    .populate(
      "hostId",
      "fullName imageUrl ratingSummary hasVerifiedBadge currentLocation travelInterests"
    )
    .sort({ createdAt: -1 });

  // compute score
  const scored = plans.map((p: any) => {
    const host = p.hostId;

    const hostInterests: string[] = host?.travelInterests || [];
    const interestMatch = wantedInterests.length
      ? intersectionCount(hostInterests, wantedInterests)
      : 0;

    const country = String(p.destination?.country || "").toLowerCase();
    const city = String(p.destination?.city || "").toLowerCase();

    const qCountry = String(query.country || "").toLowerCase();
    const qCity = String(query.city || "").toLowerCase();

    // destination closeness bonus
    let destinationBonus = 0;
    if (qCountry && country.includes(qCountry)) destinationBonus += 3;
    if (qCity && city.includes(qCity)) destinationBonus += 5;

    // date overlap bonus
    let overlapDays = 0;
    if (from && to) {
      overlapDays = calcOverlapDays(
        new Date(p.startDate),
        new Date(p.endDate),
        from,
        to
      );
    }

    // Weighted score (tune later)
    const matchScore =
      interestMatch * 6 + destinationBonus + Math.min(overlapDays, 7);

    return {
      ...p.toObject(),
      matchScore,
      matchMeta: {
        interestMatch,
        overlapDays,
      },
    };
  });

  // sort by score desc, then newest
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = scored.length;
  const paged = scored.slice(skip, skip + limit);

  return {
    meta: { page, limit, total },
    data: paged,
  };
};

export const travelPlanServices = {
  createTravelPlan,
  getMyTravelPlans,
  getPublicTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  matchTravelPlans,
};
