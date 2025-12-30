"use client";

import { useEffect } from "react";
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

export default function DisableDevtools() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      disableReactDevTools();
    }
  }, []);

  return null;
}
