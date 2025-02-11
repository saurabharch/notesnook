/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { useEffect, useState } from "react";
import { isTesting } from "../../../utils/platform";
import { Period, Plan } from "./types";

type PlanMetadata = {
  title: string;
  subtitle: string;
};

export const DEFAULT_PLANS: Plan[] = [
  {
    period: "monthly",
    country: "PK",
    currency: "USD",
    discount: 0,
    id: "648884",
    price: { gross: 4.49, net: 0, tax: 0 }
  },
  {
    period: "yearly",
    country: "PK",
    currency: "USD",
    discount: 0,
    id: "658759",
    price: { gross: 49.99, net: 0, tax: 0 }
  }
];

export const PLAN_METADATA: Record<Period, PlanMetadata> = {
  monthly: { title: "Monthly", subtitle: `Pay once a month.` },
  yearly: { title: "Yearly", subtitle: `Pay once a year.` }
};

let CACHED_PLANS: Plan[];
export async function getPlans(): Promise<Plan[] | null> {
  return DEFAULT_PLANS;
  if (isTesting()) return DEFAULT_PLANS;
  if (CACHED_PLANS) return CACHED_PLANS;

  const url = `https://notesnook.com/api/v1/prices/products/web`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const plans = (await response.json()) as Plan[];
  CACHED_PLANS = plans;
  return plans;
}

export function usePlans() {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [discount, setDiscount] = useState<number>();
  const [country, setCountry] = useState<string>();
  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        const plans = await getPlans();
        if (!plans) return;
        setPlans(plans);
        setDiscount(Math.max(...plans.map((p) => p.discount)));
        setCountry(plans[0].country);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  return { isLoading, plans, discount, country };
}
