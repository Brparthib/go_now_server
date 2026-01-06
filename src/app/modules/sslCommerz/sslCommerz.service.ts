/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import axios from "axios";
import { envVars } from "../../configs/envConfig"; // adjust if your path differs
import { ISSLCommerzInit } from "./sslCommerz.interface";
import { Payment } from "../payment/payment.model";

const sslPaymentInit = async (payload: ISSLCommerzInit) => {
  try {
    const successUrl = `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}`;
    const failUrl = `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}`;
    const cancelUrl = `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}`;

    const body = new URLSearchParams({
      store_id: envVars.SSL.SSL_STORE_ID,
      store_passwd: envVars.SSL.SSL_STORE_PASS,

      total_amount: String(payload.amount),
      currency: "BDT",
      tran_id: payload.transactionId,

      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: envVars.SSL.SSL_IPN_URL,

      shipping_method: "N/A",
      product_name: payload.productName,
      product_category: "Service",
      product_profile: "general",

      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address,
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phoneNumber,
      cus_fax: "N/A",

      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: "N/A",
      ship_country: "N/A",
    });

    const response = await axios.post(envVars.SSL.SSL_PAYMENT_API, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error?.response?.data || error);
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const validatePayment = async (payload: any) => {
  try {
    // SSLCommerz validation requires val_id
    const url = `${envVars.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${envVars.SSL.SSL_STORE_ID}&store_passwd=${envVars.SSL.SSL_STORE_PASS}&v=1&format=json`;

    const response = await axios.get(url);

    await Payment.updateOne(
      { transactionId: payload.tran_id },
      { paymentGateWayData: response.data },
      { runValidators: true }
    );

    return response.data;
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment Validation Error: ${error.message}`
    );
  }
};

export const sslService = {
  sslPaymentInit,
  validatePayment,
};
