import type { NextApiRequest, NextApiResponse } from "next";
import { coupons } from "@/data/coupons";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, amount } = req.body;

  const coupon = coupons.find(
    (c) => c.code.toLowerCase() === code.toLowerCase()
  );

  if (!coupon) {
    return res.status(400).json({ valid: false, message: "Invalid coupon" });
  }

  if (!coupon.active) {
    return res.status(400).json({ valid: false, message: "Coupon inactive" });
  }

  if (new Date(coupon.expires) < new Date()) {
    return res.status(400).json({ valid: false, message: "Coupon expired" });
  }

  if (coupon.used >= coupon.maxUses) {
    return res.status(400).json({ valid: false, message: "Coupon limit reached" });
  }

  let discountAmount = 0;

  if (coupon.type === "percentage") {
    discountAmount = (coupon.value / 100) * amount;
  } else {
    discountAmount = coupon.value;
  }

  const newTotal = Math.max(amount - discountAmount, 0);

  return res.status(200).json({
    valid: true,
    discountAmount,
    newTotal,
  });
}
